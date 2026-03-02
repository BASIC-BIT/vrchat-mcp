import { z } from 'zod';

export const StatusPageOverviewInputSchema = z.object({
  recentHours: z.number().int().min(1).max(720).optional(),
  maxItems: z.number().int().min(1).max(20).optional(),
  includeGraphs: z.boolean().optional(),
});

export const StatusPageInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  timeZone: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const StatusPageOverallStatusSchema = z.object({
  up: z.boolean(),
  indicator: z.string().optional(),
  description: z.string().optional(),
});

export const StatusPageComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
});

export const StatusPageMetricSchema = z.object({
  key: z.string(),
  title: z.string(),
  unit: z.string(),
  current: z.number().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  samples: z.number().int().min(0),
  windowStart: z.string().optional(),
  windowEnd: z.string().optional(),
  overlayCurrent: z.number().nullable().optional(),
  overlayMin: z.number().nullable().optional(),
  overlayMax: z.number().nullable().optional(),
});

export const StatusPageIncidentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional(),
  impact: z.string().optional(),
  shortlink: z.string().optional(),
  startedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
});

export const StatusPageMaintenanceSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional(),
  impact: z.string().optional(),
  shortlink: z.string().optional(),
  scheduledFor: z.string().optional(),
  scheduledUntil: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const StatusPageOverviewOutputSchema = z.object({
  checkedAt: z.string(),
  recentHours: z.number().int().min(1),
  maxItems: z.number().int().min(1),
  page: StatusPageInfoSchema,
  status: StatusPageOverallStatusSchema,
  components: z.object({
    total: z.number().int().min(0),
    nonOperational: z.number().int().min(0),
    nonOperationalItems: z.array(StatusPageComponentSchema),
  }),
  graphs: z.array(StatusPageMetricSchema),
  incidents: z.object({
    unresolvedCount: z.number().int().min(0),
    unresolved: z.array(StatusPageIncidentSchema),
    recentCount: z.number().int().min(0),
    recent: z.array(StatusPageIncidentSchema),
  }),
  maintenances: z.object({
    activeCount: z.number().int().min(0),
    active: z.array(StatusPageMaintenanceSchema),
    upcomingCount: z.number().int().min(0),
    upcoming: z.array(StatusPageMaintenanceSchema),
  }),
  notes: z.array(z.string()),
});

export type StatusPageOverviewInput = z.infer<typeof StatusPageOverviewInputSchema>;
export type StatusPageOverviewOutput = z.infer<typeof StatusPageOverviewOutputSchema>;
