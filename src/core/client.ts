import { authManager } from '../auth/index.js';
import { fetch, Headers, type RequestInit } from 'undici';
import { getSpecIndex, type OperationDef } from './spec.js';
import { getConfig } from '../config/index.js';
import { logger } from '../infra/logger.js';
import { checkGroupAllowed } from '../services/groups/index.js';
import { getBlockedOperationReason } from './operationPolicy.js';

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

export class CallError extends Error {
  status?: number;
  payload?: Record<string, unknown>;
  retryAfter?: string;
  constructor(
    message: string,
    status?: number,
    payload?: Record<string, unknown>,
    retryAfter?: string
  ) {
    super(message);
    this.name = 'CallError';
    this.status = status;
    this.payload = payload;
    this.retryAfter = retryAfter;
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

function extractCreateInstanceGroupId(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  if (body.type !== 'group') return undefined;
  return coerceId(body.groupId) ?? coerceId(body.ownerId);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function extractErrorMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;
  const nestedError = data.error;
  if (isRecord(nestedError)) {
    const nestedMessage = nestedError.message;
    if (typeof nestedMessage === 'string') return nestedMessage;
  } else if (typeof nestedError === 'string') {
    return nestedError;
  }
  const topMessage = data.message;
  if (typeof topMessage === 'string') return topMessage;
  return undefined;
}

function buildErrorPayload(params: {
  status: number;
  url: string;
  data: unknown;
  message?: string;
}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    status: params.status,
    url: params.url,
    error: params.data,
  };
  if (params.message) payload.message = params.message;
  return payload;
}

function getOperationOrThrow(
  index: Awaited<ReturnType<typeof getSpecIndex>>,
  operationId: string
): OperationDef {
  const op = index.operations.get(operationId);
  if (!op) {
    throw new CallError(`Unknown operationId: ${operationId}`);
  }
  return op;
}

function validateOperationParams(op: OperationDef, params: Record<string, unknown>): void {
  const allowed = new Set(op.parameters.map((param) => param.name));
  const unknown = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key]) => key)
    .filter((key) => !allowed.has(key));
  if (unknown.length === 0) return;
  throw new CallError(`Unknown parameter(s) for ${op.operationId}: ${unknown.join(', ')}`);
}

function validateRequiredInputs(
  op: OperationDef,
  params: Record<string, unknown>,
  body: unknown
): void {
  const missingParam = op.parameters.find(
    (param) => param.required && (params[param.name] === undefined || params[param.name] === null)
  );
  if (missingParam) {
    throw new CallError(`Missing required ${missingParam.in} param: ${missingParam.name}`);
  }

  if (op.requestBodyRequired && (body === undefined || body === null)) {
    throw new CallError(`Missing required request body for ${op.operationId}`);
  }
}

function enforceOperationPolicy(
  op: OperationDef,
  params: Record<string, unknown>,
  body: unknown
): void {
  const blockedReason = getBlockedOperationReason(op.operationId);
  if (blockedReason) {
    throw new CallError(`Operation ${op.operationId} is disabled: ${blockedReason}`);
  }

  if (!ALLOW_WRITES && op.method !== 'GET') {
    throw new CallError(
      `Write operations are disabled (blocked ${op.method}). Enable writes in config (writes.allow).`
    );
  }

  if (op.method === 'GET') return;
  const groupId = isGroupOperation(op)
    ? extractGroupId(params, body)
    : op.operationId === 'createInstance'
      ? extractCreateInstanceGroupId(body)
      : undefined;
  if (!groupId) return;
  const allowed = checkGroupAllowed(groupId);
  if (!allowed.ok) {
    throw new CallError(allowed.reason);
  }
}

async function buildRequestInit(
  op: OperationDef,
  url: string,
  params: Record<string, unknown>,
  body: unknown
): Promise<RequestInit> {
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

  return init;
}

function parseResponseText(text: string): unknown {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function headersToRecord(headers: Headers): Record<string, string> {
  const headersRecord: Record<string, string> = {};
  headers.forEach((value, key) => {
    headersRecord[key.toLowerCase()] = value;
  });
  return headersRecord;
}

async function storeCookiesFromResponse(url: string, res: Response): Promise<void> {
  const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
  if (!setCookieHeaders.length) return;
  await authManager.setCookiesFromResponse(url, setCookieHeaders);
}

function buildNonOkCallError(params: {
  status: number;
  url: string;
  data: unknown;
  headers?: Record<string, string>;
  retryAfter?: string;
}): CallError {
  const isClientError = params.status >= 400 && params.status < 500;
  const errorMessage = isClientError ? extractErrorMessage(params.data) : undefined;
  const message = errorMessage
    ? `VRChat API returned ${params.status}: ${errorMessage}`
    : `VRChat API returned ${params.status}`;
  const payload = isClientError
    ? buildErrorPayload({
        status: params.status,
        url: params.url,
        data: params.data,
        message: errorMessage,
      })
    : undefined;
  return new CallError(
    message,
    params.status,
    payload,
    params.retryAfter ?? params.headers?.['retry-after']
  );
}

async function executeRequestWithHandling(input: {
  operationId: string;
  url: string;
  init: RequestInit;
  options?: CallOptions;
}): Promise<CallResult> {
  try {
    const res = await fetch(input.url, input.init);
    const text = await res.text();
    const data = parseResponseText(text);
    const headersRecord = headersToRecord(res.headers);
    await storeCookiesFromResponse(input.url, res);

    if (input.options?.rawResponse) {
      return { url: input.url, status: res.status, headers: headersRecord, data };
    }

    if (!res.ok) {
      throw buildNonOkCallError({
        status: res.status,
        url: input.url,
        data,
        headers: headersRecord,
        retryAfter: res.headers.get('retry-after') ?? undefined,
      });
    }

    return { url: input.url, data };
  } catch (err) {
    logger.error('callOperation failed', {
      operationId: input.operationId,
      message: (err as Error).message,
    });
    if (err instanceof CallError) throw err;
    throw new CallError('Network or fetch error');
  }
}

export async function callOperation(input: CallInput): Promise<CallResult> {
  const { operationId, params = {}, body, options } = input;
  const index = await getSpecIndex();
  const op = getOperationOrThrow(index, operationId);
  validateOperationParams(op, params);
  enforceOperationPolicy(op, params, body);
  validateRequiredInputs(op, params, body);

  const url = buildUrl(op, params);
  if (options?.dryRun) {
    return { url, dryRun: true };
  }

  const init = await buildRequestInit(op, url, params, body);
  return executeRequestWithHandling({ operationId, url, init, options });
}
