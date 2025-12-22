type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function normalize(value: unknown): JsonValue {
  if (value === null) return null;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalize(entry));
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const out: Record<string, JsonValue> = {};
    for (const key of keys) {
      const normalized = normalize(record[key]);
      out[key] = normalized;
    }
    return out;
  }
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return value.name ? `[function ${value.name}]` : '[function]';
  if (typeof value === 'undefined') return '';
  return '';
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value));
}
