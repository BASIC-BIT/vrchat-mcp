import type {
  StatusPageIncidentsOutput,
  StatusPageMaintenancesOutput,
  StatusPageSummaryOutput,
} from '../../models/statusPage.js';
import { fetch } from 'undici';

const STATUS_PAGE_API_BASE = 'https://status.vrchat.com/api/v2';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function mapPage(raw: unknown): StatusPageSummaryOutput['page'] {
  const page = asRecord(raw);
  return {
    id: asString(page?.id),
    name: asString(page?.name),
    url: asString(page?.url),
    timeZone: asString(page?.time_zone),
    updatedAt: asString(page?.updated_at),
  };
}

function mapIncident(raw: unknown): StatusPageSummaryOutput['incidents']['items'][number] | null {
  const incident = asRecord(raw);
  if (!incident) return null;
  const id = asString(incident?.id);
  const name = asString(incident?.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    status: asString(incident.status),
    impact: asString(incident.impact),
    shortlink: asString(incident.shortlink),
    startedAt: asString(incident.started_at),
    updatedAt: asString(incident.updated_at),
    resolvedAt: asString(incident.resolved_at),
  };
}

function mapMaintenance(
  raw: unknown
): StatusPageSummaryOutput['maintenances']['items'][number] | null {
  const maintenance = asRecord(raw);
  if (!maintenance) return null;
  const id = asString(maintenance?.id);
  const name = asString(maintenance?.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    status: asString(maintenance.status),
    impact: asString(maintenance.impact),
    shortlink: asString(maintenance.shortlink),
    scheduledFor: asString(maintenance.scheduled_for),
    scheduledUntil: asString(maintenance.scheduled_until),
    updatedAt: asString(maintenance.updated_at),
  };
}

function mapComponent(
  raw: unknown
): StatusPageSummaryOutput['components']['nonOperationalItems'][number] | null {
  const component = asRecord(raw);
  if (!component) return null;
  const id = asString(component?.id);
  const name = asString(component?.name);
  const status = asString(component?.status);
  if (!id || !name || !status) return null;

  return {
    id,
    name,
    status,
    group: asBoolean(component.group),
    groupId: asString(component.group_id),
  };
}

async function fetchStatusPageJson(path: string): Promise<Record<string, unknown>> {
  const url = `${STATUS_PAGE_API_BASE}/${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `VRChat status page request failed (${response.status} ${response.statusText}) for ${path}.`
    );
  }

  const parsed = await response.json();
  const record = asRecord(parsed);
  if (!record) {
    throw new Error(`VRChat status page response for ${path} was not a JSON object.`);
  }
  return record;
}

export async function getStatusPageSummary(): Promise<StatusPageSummaryOutput> {
  const payload = await fetchStatusPageJson('summary.json');

  const componentsRaw = Array.isArray(payload.components) ? payload.components : [];
  const nonOperationalItems = componentsRaw
    .map(mapComponent)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.status !== 'operational');

  const incidents = (Array.isArray(payload.incidents) ? payload.incidents : [])
    .map(mapIncident)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const maintenances = (
    Array.isArray(payload.scheduled_maintenances) ? payload.scheduled_maintenances : []
  )
    .map(mapMaintenance)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const status = asRecord(payload.status);

  return {
    page: mapPage(payload.page),
    status: {
      indicator: asString(status?.indicator),
      description: asString(status?.description),
    },
    components: {
      total: componentsRaw.length,
      nonOperational: nonOperationalItems.length,
      nonOperationalItems,
    },
    incidents: {
      open: incidents.length,
      items: incidents,
    },
    maintenances: {
      active: maintenances.length,
      items: maintenances,
    },
  };
}

export async function listOpenStatusPageIncidents(): Promise<StatusPageIncidentsOutput> {
  const payload = await fetchStatusPageJson('incidents/unresolved.json');
  const incidents = (Array.isArray(payload.incidents) ? payload.incidents : [])
    .map(mapIncident)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return {
    page: mapPage(payload.page),
    totalOpenIncidents: incidents.length,
    incidents,
  };
}

export async function listActiveStatusPageMaintenances(): Promise<StatusPageMaintenancesOutput> {
  const payload = await fetchStatusPageJson('scheduled-maintenances/active.json');
  const maintenances = (
    Array.isArray(payload.scheduled_maintenances) ? payload.scheduled_maintenances : []
  )
    .map(mapMaintenance)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return {
    page: mapPage(payload.page),
    totalActiveMaintenances: maintenances.length,
    maintenances,
  };
}
