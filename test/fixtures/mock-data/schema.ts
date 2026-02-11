import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { dereference } from '@apidevtools/json-schema-ref-parser';
import { z } from 'zod';
import { schemas as generatedSchemas } from '../../../src/generated/vrchat-schemas.js';

const LOCAL_SPEC_URL = new URL('../../../specs/vrchat-openapi.yaml', import.meta.url);
const TEST_SPEC_URL = new URL('../spec.yaml', import.meta.url);

async function loadSpecText(): Promise<string> {
  try {
    return await readFile(LOCAL_SPEC_URL, 'utf8');
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') {
      return readFile(TEST_SPEC_URL, 'utf8');
    }
    throw err;
  }
}

function buildGeneratedComponentSchemas(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [name, schema] of Object.entries(generatedSchemas as Record<string, unknown>)) {
    try {
      result[name] = z.toJSONSchema(schema as z.ZodTypeAny);
    } catch {
      // skip non-Zod entries
    }
  }
  return result;
}

const raw = await loadSpecText();
const parsed: unknown = YAML.parse(raw);
const dereferenced = await dereference(parsed as Record<string, unknown>, {
  dereference: { circular: 'ignore' },
});

const specComponentSchemas =
  (dereferenced as { components?: { schemas?: Record<string, unknown> } }).components?.schemas ??
  {};

export const componentSchemas = {
  ...specComponentSchemas,
  ...buildGeneratedComponentSchemas(),
};
