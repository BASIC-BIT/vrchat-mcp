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
let previousContent: string;
do {
  previousContent = content;
  content = content.replace(
    /z\.record\((?!z\.string\(\),)([^,\n]+)\)/g,
    'z.record(z.string(), $1)',
  );
} while (content !== previousContent);
content = content.replace(/z\.instanceof\(File\)/g, 'z.any()');
content = content.replace(
  /(const CalendarEvent = z[\s\S]*?\n\s+imageId: )FileID\.optional\(\)(,)/,
  '$1FileID.nullish()$2',
);
content = content.replace(
  /(const UnityPackage = z[\s\S]*?\n\s+assetVersion: z\.number\(\)\.int\(\)\.gte\(0\))(,)/,
  '$1.optional()$2',
);
content = content.replace(
  /(const UnityPackage = z[\s\S]*?\n\s+created_at: z\.string\(\)\.datetime\(\{ offset: true \}\)\.optional\(\))(,)/,
  '$1.nullish()$2',
);
content = content.replace(
  /(const UnityPackage = z[\s\S]*?\n\s+id: UnityPackageID)(,)/,
  '$1.optional()$2',
);
content = content.replace(
  /instances: z\.array\(z\.array\(z\.unknown\(\)\)\.min\(2\)\.max\(2\)\)\.optional\(\),/g,
  'instances: z.array(z.array(z.unknown()).min(2)).optional(),',
);
content = content.replace(
  /(const GroupPost = z[\s\S]*?\n\s+editorId: )UserID(,)/,
  '$1UserID.nullish()$2',
);
content = content.replace(
  /(const GroupPost = z[\s\S]*?\n\s+imageId: )FileID(,)/,
  '$1FileID.nullish()$2',
);

if (content !== original) {
  await writeFile(targetPath, content, 'utf8');
}
