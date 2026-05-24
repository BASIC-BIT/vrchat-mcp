import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';

const E2E_TIMEOUT_MS = 60_000;
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1_000;

const STATUS_INDICATORS = new Set(['none', 'minor', 'major', 'critical']);
const COMPONENT_STATUSES = new Set([
  'operational',
  'degraded_performance',
  'partial_outage',
  'major_outage',
]);

interface StatusPageGraph {
  key?: unknown;
  unit?: unknown;
  current?: unknown;
  min?: unknown;
  max?: unknown;
  samples?: unknown;
}

interface StatusPageOverview {
  status?: {
    up?: unknown;
    indicator?: unknown;
    description?: unknown;
  };
  components?: {
    total?: unknown;
    nonOperational?: unknown;
    nonOperationalItems?: { id?: unknown; name?: unknown; status?: unknown }[];
  };
  graphs?: StatusPageGraph[];
  incidents?: {
    unresolvedCount?: unknown;
    recentCount?: unknown;
  };
  maintenances?: {
    activeCount?: unknown;
    upcomingCount?: unknown;
  };
}

function expectFiniteNumber(value: unknown): asserts value is number {
  expect(typeof value).toBe('number');
  expect(Number.isFinite(value as number)).toBe(true);
}

function expectNullableMetric(value: unknown, options: { min?: number; max?: number } = {}): void {
  if (value === null || value === undefined) return;
  expectFiniteNumber(value);
  if (options.min !== undefined) expect(value).toBeGreaterThanOrEqual(options.min);
  if (options.max !== undefined) expect(value).toBeLessThanOrEqual(options.max);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryTransientStatusPageFailure(check: () => Promise<void>): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt += 1) {
    try {
      await check();
      return;
    } catch (err) {
      lastError = err;
      if (attempt === RETRY_COUNT) break;
      await wait(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

describe('mcp e2e (live status page)', () => {
  let harness: McpHarness | null = null;

  beforeAll(async () => {
    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_COOKIE_STORE: 'memory',
        VRCHAT_MCP_ALLOW_WRITES: 'false',
      },
    });
  }, E2E_TIMEOUT_MS);

  afterAll(async () => {
    await harness?.close();
  }, E2E_TIMEOUT_MS);

  it(
    'returns plausible live VRChat status-page data through MCP',
    async () => {
      await retryTransientStatusPageFailure(async () => {
        const result = await harness!.client.callTool({
          name: 'vrchat_status_page_overview',
          arguments: { recentHours: 24, maxItems: 3, includeGraphs: true },
        });
        expect((result as { isError?: boolean }).isError).not.toBe(true);

        const structured = result.structuredContent as StatusPageOverview;
        expect(typeof structured.status?.up).toBe('boolean');
        expect(STATUS_INDICATORS.has(String(structured.status?.indicator))).toBe(true);
        expect(typeof structured.status?.description).toBe('string');

        expectFiniteNumber(structured.components?.total);
        expectFiniteNumber(structured.components?.nonOperational);
        expect(structured.components?.total).toBeGreaterThan(0);
        expect(structured.components?.nonOperational).toBeGreaterThanOrEqual(0);
        expect(structured.components?.nonOperational).toBeLessThanOrEqual(
          structured.components?.total as number,
        );
        expect(structured.components?.nonOperationalItems?.length ?? 0).toBeLessThanOrEqual(3);
        for (const component of structured.components?.nonOperationalItems ?? []) {
          expect(typeof component.id).toBe('string');
          expect(typeof component.name).toBe('string');
          expect(COMPONENT_STATUSES.has(String(component.status))).toBe(true);
        }

        expectFiniteNumber(structured.incidents?.unresolvedCount);
        expectFiniteNumber(structured.incidents?.recentCount);
        expectFiniteNumber(structured.maintenances?.activeCount);
        expectFiniteNumber(structured.maintenances?.upcomingCount);

        expect(Array.isArray(structured.graphs)).toBe(true);
        expect(structured.graphs?.length ?? 0).toBeGreaterThan(0);
        for (const graph of structured.graphs ?? []) {
          expect(typeof graph.key).toBe('string');
          expectFiniteNumber(graph.samples);
          expect(graph.samples).toBeGreaterThanOrEqual(0);

          const range = graph.unit === 'percent' ? { min: 0, max: 100 } : { min: 0 };
          expectNullableMetric(graph.current, range);
          expectNullableMetric(graph.min, range);
          expectNullableMetric(graph.max, range);
        }
      });
    },
    E2E_TIMEOUT_MS,
  );
});
