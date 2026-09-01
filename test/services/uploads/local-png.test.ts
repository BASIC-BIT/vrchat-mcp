import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { encode } from 'fast-png';
import {
  assertSameFileIdentity,
  MAX_PNG_BYTES,
  readValidatedStaticPng,
  type SecureFileSystemOps,
  validateStaticPngBuffer,
} from '../../../src/services/uploads/localPng.js';

const tempDirs: string[] = [];

function makeTempDir(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-upload-'));
  tempDirs.push(directory);
  return directory;
}

function png(width = 65, height = 65): Buffer {
  return Buffer.from(
    encode({ width, height, data: new Uint8Array(width * height * 4).fill(160), channels: 4 })
  );
}

function insertChunkBeforeIdat(bytes: Buffer, type: string): Buffer {
  const idat = bytes.indexOf(Buffer.from('IDAT')) - 4;
  const chunk = Buffer.alloc(12);
  chunk.writeUInt32BE(0, 0);
  chunk.write(type, 4, 'ascii');
  return Buffer.concat([bytes.subarray(0, idat), chunk, bytes.subarray(idat)]);
}

afterEach(() => {
  for (const directory of tempDirs.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('static PNG validation', () => {
  it('accepts a valid static PNG and returns bounded metadata', async () => {
    const root = makeTempDir();
    const imagePath = path.join(root, 'poster.png');
    fs.writeFileSync(imagePath, png(80, 72));

    const result = await readValidatedStaticPng(imagePath, [root]);

    expect(result).toMatchObject({ fileName: 'poster.png', width: 80, height: 72 });
    expect(result.byteSize).toBe(result.bytes.length);
  });

  it.each([
    ['relative path', () => readValidatedStaticPng('poster.png', [])],
    ['empty roots', () => readValidatedStaticPng(path.resolve('poster.png'), [])],
    [
      'outside root',
      () => {
        const root = makeTempDir();
        const outside = makeTempDir();
        return readValidatedStaticPng(path.join(outside, 'poster.png'), [root]);
      },
    ],
  ])('fails closed for %s', async (_name, operation) => {
    await expect(operation()).rejects.toThrow();
  });

  it('rejects a final-component symbolic link when supported', async () => {
    const root = makeTempDir();
    const target = path.join(root, 'target.png');
    const link = path.join(root, 'link.png');
    fs.writeFileSync(target, png());
    try {
      await fsp.symlink(target, link, 'file');
    } catch {
      return;
    }

    await expect(readValidatedStaticPng(link, [root])).rejects.toThrow('symbolic link');
  });

  it('rejects a file substituted between the initial check and handle open', async () => {
    const root = makeTempDir();
    const imagePath = path.join(root, 'poster.png');
    const replacementPath = path.join(root, 'replacement.png');
    fs.writeFileSync(imagePath, png(80, 72));
    fs.writeFileSync(replacementPath, png(81, 73));
    let substituteOnOpen = true;
    const fileSystem: SecureFileSystemOps = {
      lstat: (filePath) => fsp.lstat(filePath, { bigint: true }),
      stat: (filePath) => fsp.stat(filePath, { bigint: true }),
      realpath: (filePath) => fsp.realpath(filePath),
      open: async (filePath, flags) => {
        if (substituteOnOpen) {
          substituteOnOpen = false;
          await fsp.unlink(filePath);
          await fsp.rename(replacementPath, filePath);
        }
        return fsp.open(filePath, flags);
      },
    };

    await expect(readValidatedStaticPng(imagePath, [root], fileSystem)).rejects.toThrow(
      'changed after it was opened'
    );
  });

  it('rejects invalid signatures, APNG chunks, trailing bytes, dimensions, and CRC corruption', () => {
    expect(() => validateStaticPngBuffer(Buffer.from('not png'))).toThrow('not a PNG');
    expect(() => validateStaticPngBuffer(insertChunkBeforeIdat(png(), 'acTL'))).toThrow(
      'Animated PNG'
    );
    expect(() => validateStaticPngBuffer(Buffer.concat([png(), Buffer.from('tail')]))).toThrow(
      'trailing data'
    );
    expect(() => validateStaticPngBuffer(png(64, 65))).toThrow('dimensions');
    const corrupt = png();
    corrupt[corrupt.length - 1] ^= 0xff;
    expect(() => validateStaticPngBuffer(corrupt)).toThrow('decoder rejected');
  });

  it('rejects files larger than the fixed 10 MiB cap before reading', async () => {
    const root = makeTempDir();
    const imagePath = path.join(root, 'too-large.png');
    fs.writeFileSync(imagePath, Buffer.alloc(MAX_PNG_BYTES + 1));
    await expect(readValidatedStaticPng(imagePath, [root])).rejects.toThrow('upload limit');
  });

  it('fails closed when stable file identity is unavailable or changes', () => {
    const stable = fs.statSync(process.execPath, { bigint: true });
    expect(() => assertSameFileIdentity(stable, { ...stable, ino: stable.ino + 1n })).toThrow(
      'changed after it was opened'
    );
    expect(() => assertSameFileIdentity({ ...stable, ino: 0n }, stable)).toThrow(
      'stable file identity'
    );
  });
});
