import { getConfig } from '../config/index.js';
import { toolName } from '../utils/toolNames.js';
import { getCuratedReadToolName, getCuratedWriteToolName } from './generatedToolOverrides.js';
import { GENERATED_READ_SKIP_IDS, GENERATED_WRITE_SKIP_IDS } from './generatedToolSkips.js';
import { getBlockedOperationReason } from './operationPolicy.js';
import { getSpecIndex, type OperationDef } from './spec.js';

export type GeneratedOperationKind = 'read' | 'write';

export type GeneratedToolStatus =
  | 'available'
  | 'blocked_by_policy'
  | 'curated_replacement'
  | 'hard_skipped'
  | 'disabled_by_config'
  | 'not_allowlisted';

export interface GeneratedOperationInfo {
  generatedToolStatus: GeneratedToolStatus;
  generatedToolName?: string;
  curatedToolName?: string;
  blockedReason?: string;
}

export interface GeneratedOperationSummary extends GeneratedOperationInfo {
  operationId: string;
  kind: GeneratedOperationKind;
  method: string;
  path: string;
  summary?: string;
  description?: string;
}

export interface GeneratedOperationListInput {
  kind?: GeneratedOperationKind;
  view?: 'available' | 'all';
  query?: string;
  limit?: number;
}

export interface GeneratedOperationListResult {
  operations: GeneratedOperationSummary[];
  total: number;
  truncated: boolean;
}

const DEFAULT_LIMIT = 250;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function generatedOperationKind(op: OperationDef): GeneratedOperationKind {
  return op.method === 'GET' ? 'read' : 'write';
}

export function generatedToolName(kind: GeneratedOperationKind): string {
  return toolName(kind === 'read' ? 'vrchat.read' : 'vrchat.write');
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

export function getGeneratedOperationInfo(op: OperationDef): GeneratedOperationInfo {
  const kind = generatedOperationKind(op);
  const blockedReason = getBlockedOperationReason(op.operationId);
  const curatedToolName =
    kind === 'read'
      ? getCuratedReadToolName(op.operationId)
      : getCuratedWriteToolName(op.operationId);
  const skipIds = kind === 'read' ? GENERATED_READ_SKIP_IDS : GENERATED_WRITE_SKIP_IDS;
  const generatedConfig =
    kind === 'read' ? getConfig().generatedReadTools : getConfig().generatedWriteTools;
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
    generatedToolName: generatedToolName(kind),
  };
}

async function collectGeneratedOperations(): Promise<GeneratedOperationSummary[]> {
  const index = await getSpecIndex();
  const operations: GeneratedOperationSummary[] = [];
  for (const op of index.operations.values()) {
    const rawOp = rawOperation(index.raw, op);
    const info = getGeneratedOperationInfo(op);
    operations.push({
      operationId: op.operationId,
      kind: generatedOperationKind(op),
      method: op.method,
      path: op.path,
      summary: getText(rawOp?.summary),
      description: getText(rawOp?.description),
      ...info,
    });
  }
  return operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

function matchesQuery(operation: GeneratedOperationSummary, query: string | undefined): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  const haystack = [
    operation.operationId,
    operation.method,
    operation.path,
    operation.summary,
    operation.description,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  return haystack.includes(needle);
}

export async function listGeneratedOperations(
  input: GeneratedOperationListInput = {}
): Promise<GeneratedOperationListResult> {
  const view = input.view ?? 'available';
  const limit = Math.max(1, Math.floor(input.limit ?? DEFAULT_LIMIT));
  const filtered = (await collectGeneratedOperations()).filter((operation) => {
    if (input.kind && operation.kind !== input.kind) return false;
    if (view === 'available' && operation.generatedToolStatus !== 'available') return false;
    return matchesQuery(operation, input.query?.trim());
  });

  return {
    operations: filtered.slice(0, limit),
    total: filtered.length,
    truncated: filtered.length > limit,
  };
}

export async function getAvailableGeneratedOperationIds(
  kind: GeneratedOperationKind
): Promise<Set<string>> {
  const operations = await collectGeneratedOperations();
  return new Set(
    operations
      .filter(
        (operation) =>
          operation.kind === kind && operation.generatedToolStatus === 'available'
      )
      .map((operation) => operation.operationId)
  );
}
