import { callOperation } from './client.js';
import { getSpecIndex } from './spec.js';

export interface ReadToolOptions {
  fields?: string[];
  compact?: boolean;
  maxArrayLength?: number;
  includeMeta?: boolean;
  page?: {
    enabled?: boolean;
    size?: number;
    maxPages?: number;
    maxItems?: number;
    offset?: number;
  };
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function pickFields(value: JsonValue, fields: string[]): JsonValue {
  if (Array.isArray(value)) {
    return value.map((entry) => pickFields(entry, fields));
  }
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, JsonValue> = {};
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      out[key] = value[key];
    }
  }
  return out;
}

function pruneArrays(value: JsonValue, maxArrayLength: number, depth = 0): JsonValue {
  if (Array.isArray(value)) {
    const sliced = value.slice(0, maxArrayLength);
    if (depth >= 2) return sliced;
    return sliced.map((entry) => pruneArrays(entry, maxArrayLength, depth + 1));
  }
  if (!value || typeof value !== 'object') return value;
  if (depth >= 3) return value;
  const out: Record<string, JsonValue> = {};
  for (const [key, entry] of Object.entries(value)) {
    out[key] = pruneArrays(entry, maxArrayLength, depth + 1);
  }
  return out;
}

export function shapeReadData(data: unknown, options?: ReadToolOptions): unknown {
  let shaped: JsonValue = data as JsonValue;
  if (options?.fields && options.fields.length > 0) {
    shaped = pickFields(shaped, options.fields);
  }
  if (options?.compact) {
    const candidate = options.maxArrayLength ?? 200;
    const max = candidate > 0 ? Math.floor(candidate) : 200;
    shaped = pruneArrays(shaped, max);
  }
  return shaped;
}

function normalizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const next = { ...params };
  if (next.number !== undefined && next.n === undefined) {
    next.n = next.number;
    delete next.number;
  }
  return next;
}

function getPaginationParams(params: Record<string, unknown>): {
  offset: number;
  pageSize: number;
  maxPages: number;
  maxItems: number;
  baseParams: Record<string, unknown>;
} {
  const baseParams = normalizeParams(params);
  const offset = typeof baseParams.offset === 'number' ? baseParams.offset : 0;
  const pageSize = typeof baseParams.n === 'number' ? baseParams.n : 100;
  const maxPages = 10;
  const maxItems = pageSize * maxPages;
  return { offset, pageSize, maxPages, maxItems, baseParams };
}

async function supportsOffsetPagination(operationId: string): Promise<boolean> {
  const index = await getSpecIndex();
  const op = index.operations.get(operationId);
  if (!op) return false;
  const hasOffset = op.parameters.some((p) => p.in === 'query' && p.name === 'offset');
  const hasN = op.parameters.some((p) => p.in === 'query' && p.name === 'n');
  return hasOffset && hasN;
}

export async function callReadOperation(
  operationId: string,
  params: Record<string, unknown>,
  options?: ReadToolOptions,
): Promise<{ data: unknown; url?: string; page?: { pages: number; items: number; pageSize: number; offsetStart: number; truncated: boolean } }> {
  const page = options?.page;
  const paginate = Boolean(page && page.enabled !== false);
  const normalizedParams = normalizeParams(params);

  if (!paginate) {
    const result = await callOperation({ operationId, params: normalizedParams });
    const data = shapeReadData(result.data, options);
    if (options?.includeMeta) {
      return { data, url: result.url };
    }
    return { data };
  }

  const supported = await supportsOffsetPagination(operationId);
  if (!supported) {
    throw new Error(`Pagination not supported for ${operationId}; requires offset + n query params.`);
  }

  const defaults = getPaginationParams(normalizedParams);
  const pageSize = page?.size ?? defaults.pageSize;
  const maxPages = page?.maxPages ?? defaults.maxPages;
  const maxItems =
    page?.maxItems ?? Math.max(1, Math.floor(pageSize)) * Math.max(1, Math.floor(maxPages));
  const startOffset = page?.offset ?? defaults.offset;

  const collected: JsonValue[] = [];
  let offset = startOffset;
  let pages = 0;
  let truncated = false;
  let firstUrl: string | undefined;
  let lastBatchSize = 0;

  while (pages < maxPages && collected.length < maxItems) {
    const pageParams = { ...defaults.baseParams, offset, n: pageSize };
    const result = await callOperation({ operationId, params: pageParams });
    firstUrl ??= result.url;
    if (!Array.isArray(result.data)) {
      const data = shapeReadData(result.data, options);
      if (options?.includeMeta) {
        return { data, url: result.url };
      }
      return { data };
    }
    const batch = result.data as JsonValue[];
    lastBatchSize = batch.length;
    collected.push(...batch);
    pages += 1;
    if (batch.length < pageSize) {
      break;
    }
    if (pages >= maxPages || collected.length >= maxItems) {
      truncated = true;
      break;
    }
    offset += pageSize;
  }

  if (!truncated && (pages >= maxPages || collected.length >= maxItems) && lastBatchSize >= pageSize) {
    truncated = true;
  }

  const sliced = collected.slice(0, maxItems);
  const data = shapeReadData(sliced, options);
  const pageInfo = {
    pages,
    items: sliced.length,
    pageSize,
    offsetStart: startOffset,
    truncated,
  };
  if (options?.includeMeta) {
    return { data, url: firstUrl, page: pageInfo };
  }
  return { data, page: pageInfo };
}
