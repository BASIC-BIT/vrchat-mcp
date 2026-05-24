import type { StatusPageOverviewInput, StatusPageOverviewOutput } from '../../models/statusPage.js';
import { fetch } from 'undici';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';

const STATUS_PAGE_API_BASE = 'https://status.vrchat.com/api/v2';
const DEFAULT_RECENT_HOURS = 72;
const DEFAULT_MAX_ITEMS = 5;
const FETCH_TIMEOUT_MS = 10_000;
const OVERVIEW_CACHE_TTL_MS = cacheConfig.notificationsTtlMs;

interface GraphDefinition {
  key: string;
  title: string;
  url: string;
  unit: string;
  scale?: number;
  overlayUrl?: string;
}

const GRAPH_DEFINITIONS: GraphDefinition[] = [
  {
    key: 'online_users',
    title: 'Online users',
    url: 'https://d31qqo63tn8lj0.cloudfront.net/visits.json',
    unit: 'count',
  },
  {
    key: 'api_latency',
    title: 'API latency',
    url: 'https://d31qqo63tn8lj0.cloudfront.net/apilatency.json',
    unit: 'seconds',
  },
  {
    key: 'api_requests',
    title: 'API requests',
    url: 'https://d31qqo63tn8lj0.cloudfront.net/apirequests.json',
    unit: 'count',
  },
  {
    key: 'api_error_rate',
    title: 'API error rate',
    url: 'https://d31qqo63tn8lj0.cloudfront.net/apierrors.json',
    unit: 'percent',
    scale: 100,
  },
  {
    key: 'steam_auth_success_rate',
    title: 'Steam auth success rate',
    url: 'https://d31qqo63tn8lj0.cloudfront.net/extauth_steam.json',
    unit: 'percent',
    scale: 100,
    overlayUrl: 'https://d31qqo63tn8lj0.cloudfront.net/extauth_steam_count.json',
  },
  {
    key: 'meta_auth_success_rate',
    title: 'Meta auth success rate',
    url: 'https://d31qqo63tn8lj0.cloudfront.net/extauth_oculus.json',
    unit: 'percent',
    scale: 100,
    overlayUrl: 'https://d31qqo63tn8lj0.cloudfront.net/extauth_oculus_count.json',
  },
];

type Incident = StatusPageOverviewOutput['incidents']['unresolved'][number];
type Maintenance = StatusPageOverviewOutput['maintenances']['active'][number];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function mapPage(raw: unknown): StatusPageOverviewOutput['page'] {
  const page = asRecord(raw);
  return {
    id: asString(page?.id),
    name: asString(page?.name),
    url: asString(page?.url),
    timeZone: asString(page?.time_zone),
    updatedAt: asString(page?.updated_at),
  };
}

function mapUpdate(
  raw: unknown
): NonNullable<StatusPageOverviewOutput['incidents']['unresolved'][number]['latestUpdate']> | null {
  const update = asRecord(raw);
  if (!update) return null;
  const id = asString(update.id);
  if (!id) return null;

  return {
    id,
    status: asString(update.status),
    body: asString(update.body),
    displayAt: asString(update.display_at),
  };
}

function mapIncident(raw: unknown): Incident | null {
  const incident = asRecord(raw);
  if (!incident) return null;
  const id = asString(incident.id);
  const name = asString(incident.name);
  if (!id || !name) return null;

  const updatesRaw = Array.isArray(incident.incident_updates) ? incident.incident_updates : [];
  const updates = updatesRaw
    .map(mapUpdate)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return {
    id,
    name,
    status: asString(incident.status),
    impact: asString(incident.impact),
    shortlink: asString(incident.shortlink),
    startedAt: asString(incident.started_at),
    updatedAt: asString(incident.updated_at),
    resolvedAt: asString(incident.resolved_at),
    latestUpdate: updates[0],
  };
}

function mapMaintenance(raw: unknown): Maintenance | null {
  const maintenance = asRecord(raw);
  if (!maintenance) return null;
  const id = asString(maintenance.id);
  const name = asString(maintenance.name);
  if (!id || !name) return null;

  const updatesRaw = Array.isArray(maintenance.incident_updates)
    ? maintenance.incident_updates
    : [];
  const updates = updatesRaw
    .map(mapUpdate)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return {
    id,
    name,
    status: asString(maintenance.status),
    impact: asString(maintenance.impact),
    shortlink: asString(maintenance.shortlink),
    scheduledFor: asString(maintenance.scheduled_for),
    scheduledUntil: asString(maintenance.scheduled_until),
    updatedAt: asString(maintenance.updated_at),
    latestUpdate: updates[0],
  };
}

function mapComponent(
  raw: unknown
): StatusPageOverviewOutput['components']['nonOperationalItems'][number] | null {
  const component = asRecord(raw);
  if (!component) return null;
  const id = asString(component.id);
  const name = asString(component.name);
  const status = asString(component.status);
  if (!id || !name || !status) return null;
  return {
    id,
    name,
    status,
    description: asString(component.description),
  };
}

function toTimestamp(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function sortByMostRecent(items: Incident[]): Incident[] {
  return items.slice().sort((a, b) => {
    const aTs =
      toTimestamp(a.resolvedAt) ?? toTimestamp(a.updatedAt) ?? toTimestamp(a.startedAt) ?? 0;
    const bTs =
      toTimestamp(b.resolvedAt) ?? toTimestamp(b.updatedAt) ?? toTimestamp(b.startedAt) ?? 0;
    return bTs - aTs;
  });
}

function isIncidentRecent(incident: Incident, thresholdMs: number): boolean {
  const resolvedTs = toTimestamp(incident.resolvedAt);
  if (resolvedTs !== null) return resolvedTs >= thresholdMs;
  const updatedTs = toTimestamp(incident.updatedAt);
  if (updatedTs !== null) return updatedTs >= thresholdMs;
  const startedTs = toTimestamp(incident.startedAt);
  return startedTs !== null && startedTs >= thresholdMs;
}

function isIncidentResolved(incident: Incident): boolean {
  return toTimestamp(incident.resolvedAt) !== null || incident.status === 'resolved';
}

function parseSeries(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  const out: [number, number][] = [];
  for (const point of raw) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const ts = asNumber(point[0]);
    const value = asNumber(point[1]);
    if (ts === null || value === null) continue;
    out.push([ts, value]);
  }
  return out;
}

function summarizeSeries(
  series: [number, number][],
  scale = 1
): {
  current: number | null;
  min: number | null;
  max: number | null;
  samples: number;
  windowStart?: string;
  windowEnd?: string;
} {
  if (series.length === 0) {
    return {
      current: null,
      min: null,
      max: null,
      samples: 0,
    };
  }

  const values = series.map(([, value]) => value * scale);
  const firstTs = series[0]?.[0];
  const lastTs = series[series.length - 1]?.[0];

  return {
    current: values[values.length - 1] ?? null,
    min: values.reduce((acc, value) => Math.min(acc, value), Number.POSITIVE_INFINITY),
    max: values.reduce((acc, value) => Math.max(acc, value), Number.NEGATIVE_INFINITY),
    samples: values.length,
    windowStart: typeof firstTs === 'number' ? new Date(firstTs * 1000).toISOString() : undefined,
    windowEnd: typeof lastTs === 'number' ? new Date(lastTs * 1000).toISOString() : undefined,
  };
}

async function fetchJson(url: string): Promise<Record<string, unknown> | unknown[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Awaited<ReturnType<typeof fetch>>;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms for ${url}.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText}) for ${url}.`);
  }

  const parsed = await response.json();
  if (Array.isArray(parsed)) return parsed as unknown[];
  const record = asRecord(parsed);
  if (record) return record;
  throw new Error(`Response for ${url} was not a JSON object or array.`);
}

async function fetchStatusPageJson(path: string): Promise<Record<string, unknown>> {
  const url = `${STATUS_PAGE_API_BASE}/${path}`;
  const payload = await fetchJson(url);
  if (Array.isArray(payload)) {
    throw new Error(`VRChat status page response for ${path} was not a JSON object.`);
  }
  return payload;
}

async function buildGraphMetric(
  definition: GraphDefinition
): Promise<StatusPageOverviewOutput['graphs'][number]> {
  const primaryPayload = await fetchJson(definition.url);
  const primarySeries = parseSeries(primaryPayload);
  const summary = summarizeSeries(primarySeries, definition.scale ?? 1);

  let overlayCurrent: number | null | undefined;
  let overlayMin: number | null | undefined;
  let overlayMax: number | null | undefined;

  if (definition.overlayUrl) {
    const overlayPayload = await fetchJson(definition.overlayUrl);
    const overlaySeries = parseSeries(overlayPayload);
    const overlaySummary = summarizeSeries(overlaySeries, 1);
    overlayCurrent = overlaySummary.current;
    overlayMin = overlaySummary.min;
    overlayMax = overlaySummary.max;
  }

  return {
    key: definition.key,
    title: definition.title,
    unit: definition.unit,
    current: summary.current,
    min: summary.min,
    max: summary.max,
    samples: summary.samples,
    windowStart: summary.windowStart,
    windowEnd: summary.windowEnd,
    overlayCurrent,
    overlayMin,
    overlayMax,
  };
}

async function buildGraphMetrics(notes: string[]): Promise<StatusPageOverviewOutput['graphs']> {
  const settled = await Promise.allSettled(
    GRAPH_DEFINITIONS.map(async (definition) => buildGraphMetric(definition))
  );

  const metrics: StatusPageOverviewOutput['graphs'] = [];
  for (let i = 0; i < settled.length; i += 1) {
    const result = settled[i];
    const definition = GRAPH_DEFINITIONS[i];
    if (result?.status === 'fulfilled') {
      metrics.push(result.value);
      continue;
    }
    const message = result?.reason instanceof Error ? result.reason.message : 'Unknown error';
    notes.push(`Failed to read graph "${definition?.title ?? 'unknown'}": ${message}`);
  }

  if (metrics.length > 0) {
    notes.push(
      'Graph stats are derived from VRChat status-page chart feeds and use that feed window.'
    );
  }

  return metrics;
}

async function fetchOptionalStatusPageJson(
  path: string,
  notes: string[]
): Promise<Record<string, unknown>> {
  try {
    return await fetchStatusPageJson(path);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    notes.push(`Failed to read ${path}: ${message}`);
    return {};
  }
}

async function buildStatusPageOverview(
  input: StatusPageOverviewInput
): Promise<StatusPageOverviewOutput> {
  const recentHours =
    typeof input.recentHours === 'number' ? Math.floor(input.recentHours) : DEFAULT_RECENT_HOURS;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : DEFAULT_MAX_ITEMS;
  const includeGraphs = input.includeGraphs !== false;

  const notes: string[] = [];
  const checkedAt = new Date().toISOString();
  const recentThresholdMs = Date.now() - recentHours * 60 * 60 * 1000;

  const summaryPayload = await fetchStatusPageJson('summary.json');
  const [unresolvedPayload, allIncidentsPayload, activeMaintPayload, upcomingMaintPayload, graphs] =
    await Promise.all([
      fetchOptionalStatusPageJson('incidents/unresolved.json', notes),
      fetchOptionalStatusPageJson('incidents.json', notes),
      fetchOptionalStatusPageJson('scheduled-maintenances/active.json', notes),
      fetchOptionalStatusPageJson('scheduled-maintenances/upcoming.json', notes),
      includeGraphs ? buildGraphMetrics(notes) : Promise.resolve([]),
    ]);

  if (!includeGraphs) {
    notes.push('Graph stats omitted because includeGraphs=false.');
  }

  const status = asRecord(summaryPayload.status);
  const indicator = asString(status?.indicator);
  const description = asString(status?.description);

  const componentsRaw = Array.isArray(summaryPayload.components) ? summaryPayload.components : [];
  const allMappedComponents = componentsRaw
    .map(mapComponent)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const nonOperationalAll = allMappedComponents.filter((entry) => entry.status !== 'operational');
  const droppedComponentCount = componentsRaw.length - allMappedComponents.length;
  if (droppedComponentCount > 0) {
    notes.push(`Dropped ${droppedComponentCount} malformed components from status payload.`);
  }
  const nonOperationalItems = nonOperationalAll.slice(0, maxItems);
  if (nonOperationalAll.length > nonOperationalItems.length) {
    notes.push(`Showing first ${maxItems} non-operational components.`);
  }

  const unresolvedAll = (
    Array.isArray(unresolvedPayload.incidents) ? unresolvedPayload.incidents : []
  )
    .map(mapIncident)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const unresolved = unresolvedAll.slice(0, maxItems);
  if (unresolvedAll.length > unresolved.length) {
    notes.push(`Showing first ${maxItems} unresolved incidents.`);
  }

  const unresolvedIds = new Set(unresolvedAll.map((incident) => incident.id));
  const allIncidents = (
    Array.isArray(allIncidentsPayload.incidents) ? allIncidentsPayload.incidents : []
  )
    .map(mapIncident)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const recentAll = sortByMostRecent(
    allIncidents.filter(
      (incident) =>
        !unresolvedIds.has(incident.id) &&
        isIncidentResolved(incident) &&
        isIncidentRecent(incident, recentThresholdMs)
    )
  );
  const recent = recentAll.slice(0, maxItems);
  if (recentAll.length > recent.length) {
    notes.push(`Showing first ${maxItems} recent incidents.`);
  }

  const activeMaintAll = (
    Array.isArray(activeMaintPayload.scheduled_maintenances)
      ? activeMaintPayload.scheduled_maintenances
      : []
  )
    .map(mapMaintenance)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const active = activeMaintAll.slice(0, maxItems);
  if (activeMaintAll.length > active.length) {
    notes.push(`Showing first ${maxItems} active maintenance windows.`);
  }

  const upcomingMaintAll = (
    Array.isArray(upcomingMaintPayload.scheduled_maintenances)
      ? upcomingMaintPayload.scheduled_maintenances
      : []
  )
    .map(mapMaintenance)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const upcoming = upcomingMaintAll.slice(0, maxItems);
  if (upcomingMaintAll.length > upcoming.length) {
    notes.push(`Showing first ${maxItems} upcoming maintenance windows.`);
  }

  const up = indicator ? indicator === 'none' : nonOperationalAll.length === 0;

  return {
    checkedAt,
    recentHours,
    maxItems,
    page: mapPage(summaryPayload.page),
    status: {
      up,
      indicator,
      description,
    },
    components: {
      total: allMappedComponents.length,
      nonOperational: nonOperationalAll.length,
      nonOperationalItems,
    },
    graphs,
    incidents: {
      unresolvedCount: unresolvedAll.length,
      unresolved,
      recentCount: recentAll.length,
      recent,
    },
    maintenances: {
      activeCount: activeMaintAll.length,
      active,
      upcomingCount: upcomingMaintAll.length,
      upcoming,
    },
    notes,
  };
}

export async function getStatusPageOverview(
  input: StatusPageOverviewInput
): Promise<StatusPageOverviewOutput> {
  const recentHours =
    typeof input.recentHours === 'number' ? Math.floor(input.recentHours) : DEFAULT_RECENT_HOURS;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : DEFAULT_MAX_ITEMS;
  const includeGraphs = input.includeGraphs !== false;

  const cacheKey = buildCacheKey('status-page:overview', {
    recentHours,
    maxItems,
    includeGraphs,
  });

  return await cacheManager.getOrSet(
    cacheKey,
    OVERVIEW_CACHE_TTL_MS,
    ['status-page', 'status-page:overview'],
    async () => buildStatusPageOverview({ recentHours, maxItems, includeGraphs })
  );
}
