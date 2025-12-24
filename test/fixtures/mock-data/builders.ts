import { mock } from 'mock-json-schema';
import { componentSchemas } from './schema.js';

type SchemaMap = typeof componentSchemas;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function mergeDeep<T>(base: T, overrides: Partial<T>): T {
  if (!isRecord(base) || !isRecord(overrides)) {
    return (overrides ?? base) as T;
  }
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    const current = result[key];
    if (isRecord(current) && isRecord(value)) {
      result[key] = mergeDeep(current, value);
      continue;
    }
    result[key] = value;
  }
  return result as T;
}

export function mockSchema<T>(
  name: Extract<keyof SchemaMap, string>,
  overrides: Partial<T> = {},
): T {
  const schema = componentSchemas[name];
  if (!schema) {
    throw new Error(`Missing schema: ${String(name)}`);
  }
  const base = mock(schema) as T;
  return mergeDeep(base, overrides);
}
