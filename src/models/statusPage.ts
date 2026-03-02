import { z } from 'zod';

export const StatusPageInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  timeZone: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const StatusPageOverallStatusSchema = z.object({
  indicator: z.string().optional(),
  description: z.string().optional(),
});

export const StatusPageComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  group: z.boolean().optional(),
  groupId: z.string().optional(),
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

export const StatusPageSummaryOutputSchema = z.object({
  page: StatusPageInfoSchema,
  status: StatusPageOverallStatusSchema,
  components: z.object({
    total: z.number().int().min(0),
    nonOperational: z.number().int().min(0),
    nonOperationalItems: z.array(StatusPageComponentSchema),
  }),
  incidents: z.object({
    open: z.number().int().min(0),
    items: z.array(StatusPageIncidentSchema),
  }),
  maintenances: z.object({
    active: z.number().int().min(0),
    items: z.array(StatusPageMaintenanceSchema),
  }),
});

export const StatusPageIncidentsOutputSchema = z.object({
  page: StatusPageInfoSchema,
  totalOpenIncidents: z.number().int().min(0),
  incidents: z.array(StatusPageIncidentSchema),
});

export const StatusPageMaintenancesOutputSchema = z.object({
  page: StatusPageInfoSchema,
  totalActiveMaintenances: z.number().int().min(0),
  maintenances: z.array(StatusPageMaintenanceSchema),
});

export type StatusPageSummaryOutput = z.infer<typeof StatusPageSummaryOutputSchema>;
export type StatusPageIncidentsOutput = z.infer<typeof StatusPageIncidentsOutputSchema>;
export type StatusPageMaintenancesOutput = z.infer<typeof StatusPageMaintenancesOutputSchema>;
