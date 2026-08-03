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
// The vendored spec's GroupPermissions enum lags the live API. GET /groups/{groupId}/permissions
// returns both of these, and without them any role update using them fails input validation
// before it ever reaches VRChat. The spec file is gitignored, so patching it there would not
// survive a fresh clone.
// Each value is guarded independently: if the spec ever adds one but not the other, using the
// first as a proxy would silently skip injecting the second.
for (const permission of [
  'group-instance-announcement-create',
  'group-instance-bypass-avatar-performance',
]) {
  if (content.includes(`'${permission}'`)) continue;
  content = content.replace(
    /(const GroupPermissions = z\.enum\(\[[\s\S]*?\n {2}'group-instance-age-gated-create',\n)/,
    `$1  '${permission}',\n`,
  );
}

// Groups with no pending ownership transfer return `transferTargetId: null`, which the
// generated UserID string schema rejects and takes getGroup down with it.
content = content.replace(
  /(const Group = z[\s\S]*?\n\s+transferTargetId: )UserID(,)/,
  '$1UserID.nullish()$2',
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
