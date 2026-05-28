import { getSpecIndex, type OperationDef, type OperationParam } from './spec.js';
import { readToolName, writeToolName } from '../utils/toolNames.js';
import { getConfig } from '../config/index.js';
import { getCuratedReadToolName, getCuratedWriteToolName } from './generatedToolOverrides.js';
import { GENERATED_READ_SKIP_IDS, GENERATED_WRITE_SKIP_IDS } from './generatedToolSkips.js';
import { getBlockedOperationReason } from './operationPolicy.js';

type GeneratedToolStatus =
  | 'available'
  | 'blocked_by_policy'
  | 'curated_replacement'
  | 'hard_skipped'
  | 'disabled_by_config'
  | 'not_allowlisted';

interface SchemaDetails {
  schema?: unknown;
  schemaRef?: string;
}

interface OperationDetailsParameter extends SchemaDetails {
  name: string;
  in: OperationParam['in'];
  required: boolean;
  description?: string;
}

interface OperationDetailsRequestBody extends SchemaDetails {
  required: boolean;
  description?: string;
  contentTypes?: string[];
}

export interface OperationDetails {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  generatedToolStatus: GeneratedToolStatus;
  generatedToolName?: string;
  curatedToolName?: string;
  blockedReason?: string;
  parameters: OperationDetailsParameter[];
  requestBody?: OperationDetailsRequestBody;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function resolveLocalRef(raw: unknown, ref: string): unknown {
  if (!ref.startsWith('#/')) return undefined;
  let current = raw;
  for (const part of ref.slice(2).split('/')) {
    if (!isRecord(current)) return undefined;
    current = current[part.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return current;
}

function schemaDetails(schema: unknown, raw: unknown): SchemaDetails {
  if (!isRecord(schema)) return schema === undefined ? {} : { schema };
  const ref = typeof schema.$ref === 'string' ? schema.$ref : undefined;
  if (!ref) return { schema };
  const resolved = resolveLocalRef(raw, ref);
  return { schema: resolved ?? schema, schemaRef: ref };
}

function rawOperation(raw: unknown, op: OperationDef): Record<string, unknown> | undefined {
  if (!isRecord(raw)) return undefined;
  const paths = raw.paths;
  if (!isRecord(paths)) return undefined;
  const pathItem = paths[op.path];
  if (!isRecord(pathItem)) return undefined;
  const methodEntry = pathItem[op.method.toLowerCase()];
  return isRecord(methodEntry) ? methodEntry : undefined;
}

function resolveRequestBody(
  raw: unknown,
  requestBody: unknown
): Record<string, unknown> | undefined {
  if (!isRecord(requestBody)) return undefined;
  const ref = typeof requestBody.$ref === 'string' ? requestBody.$ref : undefined;
  const resolved = ref ? resolveLocalRef(raw, ref) : requestBody;
  return isRecord(resolved) ? resolved : requestBody;
}

function firstRequestBodySchema(body: Record<string, unknown> | undefined): {
  schema?: unknown;
  contentTypes?: string[];
} {
  const content = body?.content;
  if (!isRecord(content)) return {};
  const contentTypes = Object.keys(content);
  const json = content['application/json'];
  const selected = isRecord(json) ? json : contentTypes.map((type) => content[type]).find(isRecord);
  return {
    contentTypes,
    schema: isRecord(selected) ? selected.schema : undefined,
  };
}

function buildRequestBodyDetails(input: {
  raw: unknown;
  op: OperationDef;
  rawOp?: Record<string, unknown>;
}): OperationDetailsRequestBody | undefined {
  if (!input.op.hasRequestBody) return undefined;
  const body = resolveRequestBody(input.raw, input.rawOp?.requestBody);
  const { contentTypes, schema } = firstRequestBodySchema(body);
  return {
    required: Boolean(input.op.requestBodyRequired),
    description: getText(body?.description) ?? input.op.requestBodyDescription,
    contentTypes,
    ...schemaDetails(schema ?? input.op.requestBodySchema, input.raw),
  };
}

function getGeneratedToolInfo(op: OperationDef): {
  generatedToolStatus: GeneratedToolStatus;
  generatedToolName?: string;
  curatedToolName?: string;
  blockedReason?: string;
} {
  const isRead = op.method === 'GET';
  const blockedReason = getBlockedOperationReason(op.operationId);
  const curatedToolName = isRead
    ? getCuratedReadToolName(op.operationId)
    : getCuratedWriteToolName(op.operationId);
  const skipIds = isRead ? GENERATED_READ_SKIP_IDS : GENERATED_WRITE_SKIP_IDS;
  const generatedConfig = isRead ? getConfig().generatedReadTools : getConfig().generatedWriteTools;
  const allowedIds = new Set(generatedConfig.operationIds);

  if (blockedReason) {
    return { generatedToolStatus: 'blocked_by_policy', curatedToolName, blockedReason };
  }
  if (curatedToolName) {
    return { generatedToolStatus: 'curated_replacement', curatedToolName };
  }
  if (skipIds.includes(op.operationId)) {
    return { generatedToolStatus: 'hard_skipped' };
  }
  if (!generatedConfig.enabled) {
    return { generatedToolStatus: 'disabled_by_config' };
  }
  if (allowedIds.size > 0 && !allowedIds.has(op.operationId)) {
    return { generatedToolStatus: 'not_allowlisted' };
  }

  return {
    generatedToolStatus: 'available',
    generatedToolName: isRead ? readToolName(op.operationId) : writeToolName(op.operationId),
  };
}

export async function getOperationDetails(operationId: string): Promise<OperationDetails> {
  const index = await getSpecIndex();
  const op = index.operations.get(operationId);
  if (!op) throw new Error(`Unknown operationId: ${operationId}`);
  const rawOp = rawOperation(index.raw, op);
  const generatedToolInfo = getGeneratedToolInfo(op);

  return {
    operationId,
    method: op.method,
    path: op.path,
    summary: getText(rawOp?.summary),
    description: getText(rawOp?.description),
    ...generatedToolInfo,
    parameters: op.parameters.map((param) => ({
      name: param.name,
      in: param.in,
      required: param.required,
      description: param.description,
      ...schemaDetails(param.schema, index.raw),
    })),
    requestBody: buildRequestBodyDetails({ raw: index.raw, op, rawOp }),
  };
}
