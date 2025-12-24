import { fetch } from 'undici';
import YAML from 'yaml';
import { getConfig } from '../config/index.js';
import { readFile } from 'node:fs/promises';

function getSpecUrl(): string {
  return getConfig().spec.url;
}

export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export interface OperationParam {
  name: string;
  in: ParameterLocation;
  required: boolean;
  description?: string;
  schema?: unknown;
}

export interface OperationDef {
  operationId: string;
  method: string;
  path: string;
  parameters: OperationParam[];
  hasRequestBody: boolean;
  requestBodySchema?: unknown;
  requestBodyRequired?: boolean;
  requestBodyDescription?: string;
}

export interface SpecIndex {
  operations: Map<string, OperationDef>;
  raw: any;
}

let cachedIndex: SpecIndex | null = null;

async function fetchSpec(specUrl: string) {
  // Support file paths for tests/offline usage
  const isFilePath = specUrl.startsWith('file:') || /^[A-Za-z]:/.test(specUrl) || specUrl.startsWith('./') || specUrl.startsWith('../') || specUrl.startsWith('/');
  if (isFilePath) {
    const filePath = specUrl.startsWith('file:') ? new URL(specUrl) : specUrl;
    const file = await readFile(filePath as any, 'utf8');
    return YAML.parse(file);
  }

  const res = await fetch(specUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenAPI spec (${res.status}) from ${specUrl}`);
  }
  const text = await res.text();
  return YAML.parse(text);
}

function derefParameter(param: any, componentsParams: Record<string, any> | undefined) {
  if (!param) return null;
  if (param.$ref && componentsParams) {
    const key = String(param.$ref).split('/').pop() ?? '';
    return componentsParams[key] ?? param;
  }
  return param;
}

function extractParamSchema(param: any): unknown {
  if (!param || typeof param !== 'object') return undefined;
  if (param.schema) return param.schema;
  const content = param.content;
  if (content && typeof content === 'object') {
    const json =
      content['application/json'] ??
      Object.values(content as Record<string, unknown>)[0];
    if (json && typeof json === 'object' && 'schema' in json) {
      return (json as { schema?: unknown }).schema;
    }
  }
  return undefined;
}

function collectParameters(op: any, pathItem: any, componentsParams: Record<string, any> | undefined): OperationParam[] {
  const params: OperationParam[] = [];
  const seen = new Set<string>();
  const add = (list?: any[]) => {
    (list ?? []).forEach((p) => {
      const rp = derefParameter(p, componentsParams);
      if (!rp || !rp.name || !rp.in) return;
      const key = `${rp.in}:${rp.name}`;
      if (seen.has(key)) return;
      seen.add(key);
      const required = rp.in === 'path' ? true : Boolean(rp.required);
      params.push({
        name: rp.name,
        in: rp.in,
        required,
        description: typeof rp.description === 'string' ? rp.description : undefined,
        schema: extractParamSchema(rp),
      });
    });
  };
  add(pathItem?.parameters);
  add(op?.parameters);
  return params;
}

function derefRequestBody(
  requestBody: any,
  componentsBodies: Record<string, any> | undefined,
) {
  if (!requestBody) return null;
  if (requestBody.$ref && componentsBodies) {
    const key = String(requestBody.$ref).split('/').pop() ?? '';
    return componentsBodies[key] ?? requestBody;
  }
  return requestBody;
}

function extractRequestBody(
  requestBody: any,
  componentsBodies: Record<string, any> | undefined,
): { schema?: unknown; required: boolean; description?: string } {
  const body = derefRequestBody(requestBody, componentsBodies);
  if (!body || typeof body !== 'object') return { required: false };
  const required = Boolean((body as { required?: unknown }).required);
  const descriptionValue = (body as { description?: unknown }).description;
  const description: string | undefined =
    typeof descriptionValue === 'string' ? descriptionValue : undefined;
  const content = (body as { content?: Record<string, unknown> }).content ?? {};
  const json = content['application/json'] ?? Object.values(content)[0];
  const schema =
    json && typeof json === 'object' && 'schema' in json
      ? (json as { schema?: unknown }).schema
      : undefined;
  return { schema, required, description };
}

function buildIndex(spec: any): SpecIndex {
  const operations = new Map<string, OperationDef>();
  const paths = spec?.paths ?? {};
  const componentsParams = spec?.components?.parameters ?? undefined;
  const componentsBodies = spec?.components?.requestBodies ?? undefined;
  for (const [pathKey, pathItem] of Object.entries<any>(paths)) {
    for (const [method, op] of Object.entries<any>(pathItem)) {
      const m = method.toLowerCase();
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(m)) continue;
      const operationId = typeof op.operationId === 'string' ? op.operationId : undefined;
      if (!operationId) continue;
      const parameters = collectParameters(op, pathItem, componentsParams);
      const requestBody = extractRequestBody(op.requestBody, componentsBodies);
      const hasRequestBody = Boolean(op.requestBody);
      operations.set(operationId, {
        operationId,
        method: m.toUpperCase(),
        path: pathKey,
        parameters,
        hasRequestBody,
        requestBodySchema: requestBody.schema,
        requestBodyRequired: requestBody.required,
        requestBodyDescription: requestBody.description,
      });
    }
  }
  return { operations, raw: spec };
}

export async function getSpecIndex(): Promise<SpecIndex> {
  if (cachedIndex) return cachedIndex;
  const spec = await fetchSpec(getSpecUrl());
  cachedIndex = buildIndex(spec);
  return cachedIndex;
}

export function clearSpecCache() {
  cachedIndex = null;
}
