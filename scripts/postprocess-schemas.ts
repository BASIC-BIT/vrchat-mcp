import { readFile, writeFile } from 'node:fs/promises';

const targetPath = process.argv[2];
if (!targetPath) throw new Error('Usage: tsx scripts/postprocess-schemas.ts <path>');
const original = await readFile(targetPath, 'utf8');
let content = original;

// Generator/runtime compatibility: openapi-zod-client emits Zod 3 record calls.
content = content.replace(/^\/\/ @ts-nocheck\r?\n/, '');
content = content.replace(/\bz\s+\.record\(/g, 'z.record(');
content = content.replace(/z\.record\(z\.string\(\)\)/g, 'z.record(z.string(), z.string())');
content = content.replace(/z\.record\(\s*\n(?!\s*z\.string\(\),)/g, 'z.record(z.string(),\n');
let previousContent: string;
do {
  previousContent = content;
  content = content.replace(
    /z\.record\((?!z\.string\(\),)([^,\n]+)\)/g,
    'z.record(z.string(), $1)'
  );
} while (content !== previousContent);
content = content.replace(/z\.instanceof\(File\)/g, 'z.any()');

// additionalProperties:false must reject populated objects, not strip them to {}.
// Otherwise this first union branch swallows SentNotification/NotificationV2 payloads.
content = content.replace(
  /const NotificationEmpty = z\.object\(\{\}\)\.partial\(\);/,
  'const NotificationEmpty = z.object({}).strict();'
);

// Upstream declares nullable ID references, but openapi-zod-client 1.18.3 drops
// their nullable siblings. Retain these until generated validators preserve nulls.
content = content.replace(
  /(const CalendarEvent = z[\s\S]*?\n\s+imageId: )FileID\.optional\(\)(,)/,
  '$1FileID.nullish()$2'
);
content = content.replace(
  /(const Instance = z[\s\S]*?\n\s+categoryId: )InstanceCategoryID\.optional\(\)(,)/,
  '$1InstanceCategoryID.nullish()$2'
);
content = content.replace(
  /(const Group = z[\s\S]*?\n\s+transferTargetId: )UserID(,)/,
  '$1UserID.nullish()$2'
);
content = content.replace(
  /(const GroupPost = z[\s\S]*?\n\s+editorId: )UserID(,)/,
  '$1UserID.nullish()$2'
);
content = content.replace(
  /(const GroupPost = z[\s\S]*?\n\s+imageId: )FileID(,)/,
  '$1FileID.nullish()$2'
);

// Live GET /worlds/favorites still returns full packages with created_at:null
// (reproduced 2026-09-08). Search uses LimitedUnityPackage, not this workaround.
content = content.replace(
  /(const UnityPackage = z[\s\S]*?\n\s+created_at: z\.string\(\)\.datetime\(\{ offset: true \}\)\.optional\(\))(,)/,
  '$1.nullish()$2'
);

// Live GET /avatars/{avatarId} returns acknowledgements:null (2026-09-08).
content = content.replace(
  /(const Avatar = z[\s\S]*?\n\s+acknowledgements: )z\.string\(\)\.optional\(\)(,)/,
  '$1z.string().nullish()$2'
);
if (content !== original) await writeFile(targetPath, content, 'utf8');
