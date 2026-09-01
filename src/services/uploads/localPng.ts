import { constants, type BigIntStats } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { decode } from 'fast-png';

export const MAX_PNG_BYTES = 10 * 1024 * 1024;
export const MIN_PNG_DIMENSION = 65;
export const MAX_PNG_DIMENSION = 2048;
export const MAX_PNG_PIXELS = MAX_PNG_DIMENSION * MAX_PNG_DIMENSION;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const APNG_CHUNKS = new Set(['acTL', 'fcTL', 'fdAT']);
const KNOWN_CRITICAL_CHUNKS = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND']);

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
): Promise<{ lexical: string; canonical: string }[]> {
  if (roots.length === 0) {
    throw new Error(
      'Local image upload is disabled because uploads.allowedRoots is empty. Configure an absolute allowed root or VRCHAT_MCP_UPLOAD_ROOTS.'
    );
  }

  const resolved: { lexical: string; canonical: string }[] = [];
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
    resolved.push({ lexical, canonical });
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
  seenHeader: boolean;
  seenImageData: boolean;
  imageDataEnded: boolean;
  seenEnd: boolean;
}

function readAndValidateDimensions(bytes: Buffer, offset: number): { width: number; height: number } {
  const width = bytes.readUInt32BE(offset + 8);
  const height = bytes.readUInt32BE(offset + 12);
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
  return { width, height };
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
  if (/^[A-Z]/.test(type) && !KNOWN_CRITICAL_CHUNKS.has(type)) {
    throw new Error(`PNG contains an unsupported critical chunk (${type}).`);
  }

  if (type === 'IHDR') {
    if (state.seenHeader || length !== 13) {
      throw new Error('PNG contains an invalid IHDR chunk.');
    }
    state.seenHeader = true;
    const dimensions = readAndValidateDimensions(bytes, offset);
    state.width = dimensions.width;
    state.height = dimensions.height;
    return;
  }
  if (type === 'IDAT') {
    if (state.imageDataEnded) throw new Error('PNG IDAT chunks must be consecutive.');
    state.seenImageData = true;
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
  const state: PngScanState = {
    width: 0,
    height: 0,
    seenHeader: false,
    seenImageData: false,
    imageDataEnded: false,
    seenEnd: false,
  };

  while (offset < bytes.length) {
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
    if (!roots.some((root) => isWithin(root.canonical, canonicalPath))) {
      throw new Error('Image resolves outside uploads.allowedRoots.');
    }
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
