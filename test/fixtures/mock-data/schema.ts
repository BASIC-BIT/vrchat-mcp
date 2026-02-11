import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { dereference } from '@apidevtools/json-schema-ref-parser';

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

const raw = await loadSpecText();
const parsed: unknown = YAML.parse(raw);
const dereferenced = await dereference(parsed as Record<string, unknown>, {
  dereference: { circular: 'ignore' },
});

export const componentSchemas =
  (dereferenced as { components?: { schemas?: Record<string, unknown> } }).components?.schemas ??
  {};
