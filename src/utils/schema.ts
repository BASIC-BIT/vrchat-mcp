import type { z } from 'zod';

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  value: unknown,
  label?: string,
): T {
  try {
    return schema.parse(value);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown schema parse error.';
    const prefix = label ? `${label}: ` : '';
    throw new Error(`${prefix}${message}`);
  }
}

export function parseArrayWithSchema<T>(
  schema: z.ZodType<T>,
  value: unknown,
  label?: string,
): T[] {
  return parseWithSchema(schema.array(), value ?? [], label);
}
