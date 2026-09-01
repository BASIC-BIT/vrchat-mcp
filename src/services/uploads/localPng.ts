import { constants, type BigIntStats } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { decode } from 'fast-png';

export const MAX_PNG_BYTES = 10 * 1024 * 1024;
export const MIN_PNG_DIMENSION = 65;
export const MAX_PNG_DIMENSION = 2048;
export const MAX_PNG_PIXELS = MAX_PNG_DIMENSION * MAX_PNG_DIMENSION;
const MAX_PNG_CHUNKS = 4096;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const APNG_CHUNKS = new Set(['acTL', 'fcTL', 'fdAT']);
const KNOWN_CRITICAL_CHUNKS = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND']);
const CHANNELS_BY_COLOR_TYPE = new Map<number, number>([
  [0, 1],
  [2, 3],
  [3, 1],
  [4, 2],
  [6, 4],
]);
const BIT_DEPTHS_BY_COLOR_TYPE = new Map<number, Set<number>>([
  [0, new Set([1, 2, 4, 8, 16])],
  [2, new Set([8, 16])],
  [3, new Set([1, 2, 4, 8])],
  [4, new Set([8, 16])],
  [6, new Set([8, 16])],
]);

interface SecureFileHandle {
  stat(options: { bigint: true }): Promise<BigIntStats>;
  read(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | null
  ): Promise<{ bytesRead: number }>;
  close(): Promise<void>;
}

export interface SecureFileSystemOps {
  lstat(filePath: string): Promise<BigIntStats>;
  stat(filePath: string): Promise<BigIntStats>;
  realpath(filePath: string): Promise<string>;
  open(filePath: string, flags: number): Promise<SecureFileHandle>;
}

const nativeFileSystem: SecureFileSystemOps = {
  lstat: (filePath) => fs.lstat(filePath, { bigint: true }),
  stat: (filePath) => fs.stat(filePath, { bigint: true }),
  realpath: (filePath) => fs.realpath(filePath),
  open: (filePath, flags) => fs.open(filePath, flags),
};

export interface ValidatedPng {
  bytes: Buffer;
  byteSize: number;
  fileName: string;
  width: number;
  height: number;
}

interface CanonicalUploadRoot {
  lexical: string;
  canonical: string;
  identity: BigIntStats;
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
  );
}

function fileSystemMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') {
    return err.code;
  }
  return err instanceof Error ? err.message : 'unknown filesystem error';
}

async function canonicalizeRoots(
  roots: string[],
  fileSystem: SecureFileSystemOps
): Promise<CanonicalUploadRoot[]> {
  if (roots.length === 0) {
    throw new Error(
      'Local image upload is disabled because uploads.allowedRoots is empty. Configure an absolute allowed root or VRCHAT_MCP_UPLOAD_ROOTS.'
    );
  }

  const resolved: CanonicalUploadRoot[] = [];
  for (const configuredRoot of roots) {
    if (!path.isAbsolute(configuredRoot)) {
      throw new Error(`Upload root must be absolute: ${configuredRoot}`);
    }
    const lexical = path.normalize(configuredRoot);
    let rootInfo: BigIntStats;
    try {
      rootInfo = await fileSystem.lstat(lexical);
    } catch (err) {
      throw new Error(`Upload root is unavailable (${fileSystemMessage(err)}): ${lexical}`);
    }
    if (rootInfo.isSymbolicLink()) {
      throw new Error(`Upload root must not be a symbolic link or junction: ${lexical}`);
    }
    if (!rootInfo.isDirectory()) {
      throw new Error(`Upload root is not a directory: ${lexical}`);
    }
    const canonical = path.normalize(await fileSystem.realpath(lexical));
    const canonicalInfo = await fileSystem.stat(canonical);
    if (!canonicalInfo.isDirectory()) {
      throw new Error(`Canonical upload root is not a directory: ${lexical}`);
    }
    if (
      rootInfo.dev === 0n ||
      rootInfo.ino === 0n ||
      canonicalInfo.dev === 0n ||
      canonicalInfo.ino === 0n
    ) {
      throw new Error(`Upload root has no stable filesystem identity: ${lexical}`);
    }
    if (rootInfo.dev !== canonicalInfo.dev || rootInfo.ino !== canonicalInfo.ino) {
      throw new Error(`Upload root changed during canonical resolution: ${lexical}`);
    }
    resolved.push({ lexical, canonical, identity: canonicalInfo });
  }
  return resolved;
}

export function assertSameFileIdentity(opened: BigIntStats, resolved: BigIntStats): void {
  if (opened.dev === 0n || opened.ino === 0n || resolved.dev === 0n || resolved.ino === 0n) {
    throw new Error('The platform did not provide a stable file identity; upload fails closed.');
  }
  if (opened.dev !== resolved.dev || opened.ino !== resolved.ino) {
    throw new Error('The image path changed after it was opened; upload was refused.');
  }
}

function hasSameIdentity(left: BigIntStats, right: BigIntStats): boolean {
  return (
    left.dev !== 0n &&
    left.ino !== 0n &&
    right.dev !== 0n &&
    right.ino !== 0n &&
    left.dev === right.dev &&
    left.ino === right.ino
  );
}

function assertFileUnchanged(before: BigIntStats, after: BigIntStats): void {
  assertSameFileIdentity(before, after);
  if (
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  ) {
    throw new Error('The image file changed while it was being read; upload was refused.');
  }
}

async function assertStableMatchedRoot(
  canonicalPath: string,
  lexicalMatches: CanonicalUploadRoot[],
  fileSystem: SecureFileSystemOps
): Promise<void> {
  const canonicalMatches = lexicalMatches.filter((root) =>
    isWithin(root.canonical, canonicalPath)
  );
  if (canonicalMatches.length === 0) {
    throw new Error('Image resolves outside uploads.allowedRoots.');
  }
  for (const root of canonicalMatches) {
    try {
      const currentRootInfo = await fileSystem.stat(root.canonical);
      if (currentRootInfo.isDirectory() && hasSameIdentity(root.identity, currentRootInfo)) return;
    } catch {
      // A missing or unreadable root cannot authorize the opened file.
    }
  }
  throw new Error('The matched upload root changed before the image was opened; upload was refused.');
}

async function readBoundedFile(handle: SecureFileHandle, expectedSize: bigint): Promise<Buffer> {
  if (expectedSize > BigInt(MAX_PNG_BYTES)) {
    throw new Error(`PNG exceeds the ${MAX_PNG_BYTES}-byte upload limit.`);
  }
  const expected = Number(expectedSize);
  const bytes = Buffer.alloc(expected + 1);
  let offset = 0;
  while (offset < bytes.length) {
    const result = await handle.read(bytes, offset, bytes.length - offset, null);
    if (result.bytesRead === 0) break;
    offset += result.bytesRead;
  }
  if (offset !== expected) {
    throw new Error('The image file size changed while it was being read; upload was refused.');
  }
  return bytes.subarray(0, expected);
}

function chunkType(bytes: Buffer, offset: number): string {
  const type = bytes.toString('ascii', offset, offset + 4);
  if (!/^[A-Za-z]{4}$/.test(type)) {
    throw new Error('PNG contains an invalid chunk type.');
  }
  return type;
}

interface PngScanState {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  interlaceMethod: number;
  seenHeader: boolean;
  seenImageData: boolean;
  imageDataEnded: boolean;
  seenEnd: boolean;
  idatChunks: Buffer[];
}

function readAndValidateHeader(
  bytes: Buffer,
  offset: number
): Pick<PngScanState, 'width' | 'height' | 'bitDepth' | 'colorType' | 'interlaceMethod'> {
  const width = bytes.readUInt32BE(offset + 8);
  const height = bytes.readUInt32BE(offset + 12);
  const bitDepth = bytes[offset + 16];
  const colorType = bytes[offset + 17];
  const compressionMethod = bytes[offset + 18];
  const filterMethod = bytes[offset + 19];
  const interlaceMethod = bytes[offset + 20];
  const outsideDimensionRange =
    width < MIN_PNG_DIMENSION ||
    height < MIN_PNG_DIMENSION ||
    width > MAX_PNG_DIMENSION ||
    height > MAX_PNG_DIMENSION;
  if (outsideDimensionRange || width * height > MAX_PNG_PIXELS) {
    throw new Error(
      `PNG dimensions must be between ${MIN_PNG_DIMENSION}x${MIN_PNG_DIMENSION} and ${MAX_PNG_DIMENSION}x${MAX_PNG_DIMENSION} pixels.`
    );
  }
  if (!CHANNELS_BY_COLOR_TYPE.has(colorType)) {
    throw new Error(`PNG contains an unsupported color type (${colorType}).`);
  }
  if (!BIT_DEPTHS_BY_COLOR_TYPE.get(colorType)?.has(bitDepth)) {
    throw new Error(`PNG bit depth ${bitDepth} is invalid for color type ${colorType}.`);
  }
  if (compressionMethod !== 0 || filterMethod !== 0) {
    throw new Error('PNG uses an unsupported compression or filter method.');
  }
  if (interlaceMethod !== 0 && interlaceMethod !== 1) {
    throw new Error(`PNG contains an unsupported interlace method (${interlaceMethod}).`);
  }
  return { width, height, bitDepth, colorType, interlaceMethod };
}

function scanlineBytes(width: number, bitsPerPixel: number): number {
  return Math.ceil((width * bitsPerPixel) / 8) + 1;
}

function adam7PassSize(
  state: PngScanState,
  xStart: number,
  yStart: number,
  xStep: number,
  yStep: number,
  bitsPerPixel: number
): number {
  const passWidth = state.width <= xStart ? 0 : Math.ceil((state.width - xStart) / xStep);
  const passHeight = state.height <= yStart ? 0 : Math.ceil((state.height - yStart) / yStep);
  return passWidth === 0 || passHeight === 0
    ? 0
    : scanlineBytes(passWidth, bitsPerPixel) * passHeight;
}

function expectedInflatedBytes(state: PngScanState): number {
  const channels = CHANNELS_BY_COLOR_TYPE.get(state.colorType);
  if (!channels) throw new Error('PNG color type was not validated.');
  const bitsPerPixel = channels * state.bitDepth;
  if (state.interlaceMethod === 0) {
    return scanlineBytes(state.width, bitsPerPixel) * state.height;
  }
  const passes = [
    [0, 0, 8, 8],
    [4, 0, 8, 8],
    [0, 4, 4, 8],
    [2, 0, 4, 4],
    [0, 2, 2, 4],
    [1, 0, 2, 2],
    [0, 1, 1, 2],
  ] as const;
  return passes.reduce(
    (total, [xStart, yStart, xStep, yStep]) =>
      total + adam7PassSize(state, xStart, yStart, xStep, yStep, bitsPerPixel),
    0
  );
}

function assertBoundedImageData(state: PngScanState): void {
  const expectedBytes = expectedInflatedBytes(state);
  let inflated: Buffer;
  try {
    inflated = inflateSync(Buffer.concat(state.idatChunks), {
      maxOutputLength: expectedBytes,
    });
  } catch (err) {
    if ((err as { code?: string }).code === 'ERR_BUFFER_TOO_LARGE') {
      throw new Error('PNG decompressed image data exceeds its dimension-derived limit.');
    }
    const message = err instanceof Error ? err.message : 'invalid compressed data';
    throw new Error(`PNG image data could not be decompressed safely: ${message}`);
  }
  if (inflated.length !== expectedBytes) {
    throw new Error(
      `PNG decompressed image data has an unexpected length (${inflated.length} instead of ${expectedBytes}).`
    );
  }
}

function inspectChunk(
  bytes: Buffer,
  offset: number,
  length: number,
  type: string,
  state: PngScanState
): void {
  if (!state.seenHeader && type !== 'IHDR') {
    throw new Error('PNG must begin with an IHDR chunk.');
  }
  if (APNG_CHUNKS.has(type)) {
    throw new Error(`Animated PNG content is not supported (${type}).`);
  }
  if (type === 'iCCP') {
    throw new Error('Compressed PNG color profiles are not supported.');
  }
  if (/^[A-Z]/.test(type) && !KNOWN_CRITICAL_CHUNKS.has(type)) {
    throw new Error(`PNG contains an unsupported critical chunk (${type}).`);
  }

  if (type === 'IHDR') {
    if (state.seenHeader || length !== 13) {
      throw new Error('PNG contains an invalid IHDR chunk.');
    }
    state.seenHeader = true;
    Object.assign(state, readAndValidateHeader(bytes, offset));
    return;
  }
  if (type === 'IDAT') {
    if (state.imageDataEnded) throw new Error('PNG IDAT chunks must be consecutive.');
    state.seenImageData = true;
    state.idatChunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    return;
  }
  if (state.seenImageData) state.imageDataEnded = true;
  if (type === 'IEND') {
    if (length !== 0 || !state.seenImageData) {
      throw new Error('PNG contains an invalid IEND chunk.');
    }
    state.seenEnd = true;
  }
}

export function validateStaticPngBuffer(bytes: Buffer): { width: number; height: number } {
  if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Image is not a PNG file.');
  }

  let offset = PNG_SIGNATURE.length;
  let chunkCount = 0;
  const state: PngScanState = {
    width: 0,
    height: 0,
    bitDepth: 0,
    colorType: -1,
    interlaceMethod: -1,
    seenHeader: false,
    seenImageData: false,
    imageDataEnded: false,
    seenEnd: false,
    idatChunks: [],
  };

  while (offset < bytes.length) {
    chunkCount += 1;
    if (chunkCount > MAX_PNG_CHUNKS) {
      throw new Error(`PNG contains too many chunks (maximum ${MAX_PNG_CHUNKS}).`);
    }
    if (offset + 12 > bytes.length) {
      throw new Error('PNG ends in a truncated chunk.');
    }
    const length = bytes.readUInt32BE(offset);
    const type = chunkType(bytes, offset + 4);
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > bytes.length) {
      throw new Error(`PNG ${type} chunk is truncated.`);
    }
    inspectChunk(bytes, offset, length, type, state);
    if (type === 'IEND') {
      offset = chunkEnd;
      if (offset !== bytes.length) {
        throw new Error('PNG contains trailing data after IEND.');
      }
      break;
    }
    offset = chunkEnd;
  }

  if (!state.seenEnd) {
    throw new Error('PNG is missing its terminal IEND chunk.');
  }

  assertBoundedImageData(state);

  try {
    const decoded = decode(bytes, { checkCrc: true });
    if (decoded.width !== state.width || decoded.height !== state.height) {
      throw new Error('decoded dimensions do not match IHDR');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'decoder rejected the image';
    throw new Error(`PNG decoder rejected the image: ${message}`);
  }

  return { width: state.width, height: state.height };
}

export async function readValidatedStaticPng(
  imagePath: string,
  allowedRoots: string[],
  fileSystem: SecureFileSystemOps = nativeFileSystem
): Promise<ValidatedPng> {
  if (!path.isAbsolute(imagePath)) {
    throw new Error('imagePath must be absolute.');
  }
  const candidate = path.normalize(imagePath);
  const roots = await canonicalizeRoots(allowedRoots, fileSystem);
  const lexicalMatches = roots.filter((root) => isWithin(root.lexical, candidate));
  if (lexicalMatches.length === 0) {
    throw new Error('imagePath is outside uploads.allowedRoots.');
  }

  let linkInfo: BigIntStats;
  try {
    linkInfo = await fileSystem.lstat(candidate);
  } catch (err) {
    throw new Error(`Image file is missing or unreadable (${fileSystemMessage(err)}).`);
  }
  if (linkInfo.isSymbolicLink()) {
    throw new Error('Image file must not be a symbolic link or junction.');
  }
  if (!linkInfo.isFile()) {
    throw new Error('Image path must refer to a regular file.');
  }

  const noFollow = process.platform === 'win32' ? 0 : (constants.O_NOFOLLOW ?? 0);
  const flags = constants.O_RDONLY | (constants.O_NONBLOCK ?? 0) | noFollow;
  let handle: SecureFileHandle;
  try {
    handle = await fileSystem.open(candidate, flags);
  } catch (err) {
    throw new Error(`Image file could not be opened (${fileSystemMessage(err)}).`);
  }

  let bytes: Buffer;
  let canonicalPath: string;
  try {
    const openedInfo = await handle.stat({ bigint: true });
    if (!openedInfo.isFile()) {
      throw new Error('Opened image object is not a regular file.');
    }
    assertSameFileIdentity(linkInfo, openedInfo);
    if (openedInfo.size > BigInt(MAX_PNG_BYTES)) {
      throw new Error(`PNG exceeds the ${MAX_PNG_BYTES}-byte upload limit.`);
    }

    canonicalPath = path.normalize(await fileSystem.realpath(candidate));
    await assertStableMatchedRoot(canonicalPath, lexicalMatches, fileSystem);
    const resolvedInfo = await fileSystem.stat(canonicalPath);
    if (!resolvedInfo.isFile()) {
      throw new Error('Resolved image object is not a regular file.');
    }
    assertSameFileIdentity(openedInfo, resolvedInfo);

    bytes = await readBoundedFile(handle, openedInfo.size);
    const afterReadInfo = await handle.stat({ bigint: true });
    assertFileUnchanged(openedInfo, afterReadInfo);
  } finally {
    await handle.close();
  }

  const dimensions = validateStaticPngBuffer(bytes);
  return {
    bytes,
    byteSize: bytes.length,
    fileName: path.basename(canonicalPath),
    width: dimensions.width,
    height: dimensions.height,
  };
}
