import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { dereference } from '@apidevtools/json-schema-ref-parser';

const SPEC_URL = new URL('../../../specs/vrchat-openapi.yaml', import.meta.url);

const raw = await readFile(SPEC_URL, 'utf8');
const parsed: unknown = YAML.parse(raw);
const dereferenced = await dereference(parsed as Record<string, unknown>, {
  dereference: { circular: 'ignore' },
});

export const componentSchemas = (dereferenced as { components?: { schemas?: Record<string, unknown> } })
  .components?.schemas ?? {};
