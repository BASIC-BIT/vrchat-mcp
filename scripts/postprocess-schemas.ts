import { readFile, writeFile } from 'node:fs/promises';

const targetPath = process.argv[2];

if (!targetPath) {
  throw new Error('Usage: tsx scripts/postprocess-schemas.ts <path>');
}

const original = await readFile(targetPath, 'utf8');
let content = original;

content = content.replace(/^\/\/ @ts-nocheck\r?\n/, '');
content = content.replace(
  /z\.record\(z\.string\(\)\)/g,
  'z.record(z.string(), z.string())',
);
content = content.replace(
  /z\.record\(\s*\n(?!\s*z\.string\(\),)/g,
  'z.record(z.string(),\n',
);
content = content.replace(/z\.instanceof\(File\)/g, 'z.any()');

if (content !== original) {
  await writeFile(targetPath, content, 'utf8');
}
