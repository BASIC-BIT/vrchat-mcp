import { z } from 'zod';

export type JsonPrimitive = string | number | boolean | null;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JsonObject extends Record<string, JsonValue> {}
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return (
    Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null
  );
}

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;
  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return Number.isFinite(value as number) || valueType !== 'number';
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  if (isPlainObject(value)) {
    return Object.values(value).every(isJsonValue);
  }
  return false;
}

export function isJsonObject(value: unknown): value is JsonObject {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every(isJsonValue);
}

export function parseJsonText(value: string): JsonValue | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return isJsonValue(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function toJsonValue(
  value: unknown,
  label?: string,
): JsonValue | null | undefined {
  if (value === undefined || value === null) return value;
  if (isJsonValue(value)) return value;
  const prefix = label ? `${label}: ` : '';
  throw new Error(`${prefix}Expected JSON value.`);
}
