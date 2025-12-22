import { authManager } from '../auth/index.js';
import { fetch, Headers, type RequestInit } from 'undici';
import { getSpecIndex, type OperationDef } from './spec.js';
import { getConfig } from '../config/index.js';
import { logger } from '../infra/logger.js';
import { checkGroupAllowed } from '../services/groups/index.js';

const config = getConfig();
const DEFAULT_BASE_URL = config.api.baseUrl;
const DEFAULT_USER_AGENT = config.api.userAgent;

export interface CallOptions {
  dryRun?: boolean;
  rawResponse?: boolean;
}

export interface CallResult {
  url: string;
  status?: number;
  headers?: Record<string, string>;
  data?: unknown;
  dryRun?: boolean;
}

export interface CallInput {
  operationId: string;
  params?: Record<string, unknown>;
  body?: unknown;
  options?: CallOptions;
}

class CallError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'CallError';
    this.status = status;
  }
}

const ALLOW_WRITES = config.writes.allow;

function stringifyParam(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return `${value}`;
  }
  if (typeof value === 'symbol') return value.toString();
  const json = JSON.stringify(value);
  return json ?? '';
}

function coerceId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return `${value}`;
  }
  return undefined;
}

function extractGroupId(params: Record<string, unknown>, body: unknown): string | undefined {
  const paramGroupId = coerceId(params.groupId);
  if (paramGroupId) return paramGroupId;
  if (body && typeof body === 'object' && 'groupId' in (body as Record<string, unknown>)) {
    const bodyGroupId = coerceId((body as Record<string, unknown>).groupId);
    if (bodyGroupId) return bodyGroupId;
  }
  return undefined;
}

function isGroupOperation(op: OperationDef): boolean {
  if (op.path.includes('{groupId}')) return true;
  return op.parameters.some((param) => param.name === 'groupId');
}

function buildUrl(op: OperationDef, params: Record<string, unknown> = {}): string {
  let path = op.path;
  const pathParams = op.parameters.filter((p) => p.in === 'path');
  for (const p of pathParams) {
    const val = params[p.name];
    if (val === undefined || val === null) {
      if (p.required) {
        throw new CallError(`Missing required path param: ${p.name}`);
      }
      continue;
    }
    path = path.replace(`{${p.name}}`, encodeURIComponent(stringifyParam(val)));
  }

  const base = new URL(DEFAULT_BASE_URL);
  const basePath = base.pathname.replace(/\/+$/, '');
  const opPath = path.replace(/^\/+/, '');
  base.pathname = `${basePath}/${opPath}`.replace(/\/{2,}/g, '/');
  const url = base;
  const queryParams = op.parameters.filter((p) => p.in === 'query');
  for (const p of queryParams) {
    const val = params[p.name];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => url.searchParams.append(p.name, stringifyParam(v)));
    } else {
      url.searchParams.append(p.name, stringifyParam(val));
    }
  }
  return url.toString();
}

function buildHeaders(op: OperationDef, params: Record<string, unknown> = {}): Headers {
  const headers = new Headers();
  headers.set('user-agent', DEFAULT_USER_AGENT);
  const headerParams = op.parameters.filter((p) => p.in === 'header');
  for (const p of headerParams) {
    const val = params[p.name];
    if (val === undefined || val === null) continue;
    headers.set(p.name, stringifyParam(val));
  }
  return headers;
}

export async function callOperation(input: CallInput): Promise<CallResult> {
  const { operationId, params = {}, body, options } = input;
  const index = await getSpecIndex();
  const op = index.operations.get(operationId);
  if (!op) {
    throw new CallError(`Unknown operationId: ${operationId}`);
  }
  if (!ALLOW_WRITES && op.method !== 'GET') {
    throw new CallError(
      `Write operations are disabled (blocked ${op.method}). Enable writes in config (writes.allow).`,
    );
  }
  if (op.method !== 'GET' && isGroupOperation(op)) {
    const groupId = extractGroupId(params, body);
    if (groupId) {
      const allowed = checkGroupAllowed(groupId);
      if (!allowed.ok) {
        throw new CallError(allowed.reason);
      }
    }
  }

  const url = buildUrl(op, params);
  if (options?.dryRun) {
    return { url, dryRun: true };
  }

  const headers = buildHeaders(op, params);
  const cookieHeader = await authManager.getCookieHeader(url);
  if (cookieHeader) headers.set('cookie', cookieHeader);

  const init: RequestInit = {
    method: op.method,
    headers,
  };

  if (op.hasRequestBody || body !== undefined) {
    init.body = body !== undefined ? JSON.stringify(body) : undefined;
    headers.set('content-type', 'application/json');
  }

  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // keep text as-is
    }

    const headersRecord: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headersRecord[key] = value;
    });

    // capture set-cookie
    const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
    if (setCookieHeaders.length) {
      await authManager.setCookiesFromResponse(url, setCookieHeaders);
    }

    if (options?.rawResponse) {
      return { url, status: res.status, headers: headersRecord, data };
    }

    if (!res.ok) {
      throw new CallError(`VRChat API returned ${res.status}`, res.status);
    }

    return { url, data };
  } catch (err) {
    logger.error('callOperation failed', {
      operationId,
      message: (err as Error).message,
    });
    if (err instanceof CallError) throw err;
    throw new CallError('Network or fetch error');
  }
}
