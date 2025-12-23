import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const WorldShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const WorldSummarySchema = z.object({
  worldId: z.string(),
  name: z.string(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  capacity: z.number().int().optional(),
  visits: z.number().int().optional(),
  favorites: z.number().int().optional(),
  heat: z.number().int().optional(),
  popularity: z.number().int().optional(),
  releaseStatus: z.string().optional(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  favoriteGroup: z.string().optional(),
  favoriteId: z.string().optional(),
});

export const WorldInstancesSummarySchema = z.object({
  totalInstances: z.number().int().min(0),
  totalOccupants: z.number().int().min(0),
  countsByAccess: z.record(z.string(), z.number().int().min(0)),
  countsByRegion: z.record(z.string(), z.number().int().min(0)),
});

export const WorldPageSchema = z.object({
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offsetStart: z.number().int().min(0),
  truncated: z.boolean(),
});

export const WorldSearchInputSchema = z.object({
  query: z.string(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(50).optional(),
  maxItems: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
  tag: z.string().optional(),
  notag: z.string().optional(),
  releaseStatus: z.string().optional(),
  maxUnityVersion: z.string().optional(),
  minUnityVersion: z.string().optional(),
  platform: z.string().optional(),
});

export const WorldFavoritesInputSchema = z.object({
  query: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(50).optional(),
  maxItems: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
  tag: z.string().optional(),
  notag: z.string().optional(),
  releaseStatus: z.string().optional(),
  maxUnityVersion: z.string().optional(),
  minUnityVersion: z.string().optional(),
  platform: z.string().optional(),
  userId: z.string().optional(),
});

export const WorldProfileInputSchema = WorldShapeSchema.extend({
  worldId: z.string().optional(),
  name: z.string().optional(),
});

export const WorldInstancesInputSchema = z.object({
  worldId: z.string().optional(),
  name: z.string().optional(),
});

export const WorldSearchOutputSchema = z.object({
  query: z.string(),
  total: z.number().int().min(0),
  stale: z.boolean(),
  page: WorldPageSchema.optional(),
  worlds: z.array(WorldSummarySchema),
  notes: z.array(z.string()).optional(),
});

export const WorldFavoritesOutputSchema = z.object({
  total: z.number().int().min(0),
  stale: z.boolean(),
  page: WorldPageSchema.optional(),
  worlds: z.array(WorldSummarySchema),
  notes: z.array(z.string()).optional(),
});

export const WorldProfileOutputSchema = z.object({
  worldId: z.string(),
  resolvedBy: z.enum(['id', 'name']),
  stale: z.boolean(),
  world: schemas.World.partial(),
});

export const WorldInstancesOverviewOutputSchema = z.object({
  worldId: z.string(),
  resolvedBy: z.enum(['id', 'name']),
  stale: z.boolean(),
  instances: WorldInstancesSummarySchema,
});

export type WorldShape = z.infer<typeof WorldShapeSchema>;
export type WorldSummary = z.infer<typeof WorldSummarySchema>;
export type WorldInstancesSummary = z.infer<typeof WorldInstancesSummarySchema>;
export type WorldPage = z.infer<typeof WorldPageSchema>;
export type WorldSearchInput = z.infer<typeof WorldSearchInputSchema>;
export type WorldFavoritesInput = z.infer<typeof WorldFavoritesInputSchema>;
export type WorldProfileInput = z.infer<typeof WorldProfileInputSchema>;
export type WorldInstancesInput = z.infer<typeof WorldInstancesInputSchema>;
export type WorldSearchOutput = z.infer<typeof WorldSearchOutputSchema>;
export type WorldFavoritesOutput = z.infer<typeof WorldFavoritesOutputSchema>;
export type WorldProfileOutput = z.infer<typeof WorldProfileOutputSchema>;
export type WorldInstancesOverviewOutput = z.infer<typeof WorldInstancesOverviewOutputSchema>;

export type WorldResolution =
  | { ok: true; worldId: string; resolvedBy: 'id' | 'name' }
  | {
      ok: false;
      reason: string;
      status: 'not_found';
      nextSteps: string[];
    };

export function normalizeWorldName(value: string): string {
  return value.trim().toLowerCase();
}

export function buildWorldSummary(
  world: Record<string, unknown>,
): WorldSummary | null {
  const worldId = typeof world.id === 'string' ? world.id : undefined;
  const name = typeof world.name === 'string' ? world.name : undefined;
  if (!worldId || !name) return null;
  const tags = Array.isArray(world.tags)
    ? world.tags.filter((tag) => typeof tag === 'string')
    : undefined;
  const summary: WorldSummary = {
    worldId,
    name,
    authorId: typeof world.authorId === 'string' ? world.authorId : undefined,
    authorName: typeof world.authorName === 'string' ? world.authorName : undefined,
    capacity: typeof world.capacity === 'number' ? Math.floor(world.capacity) : undefined,
    visits: typeof world.visits === 'number' ? Math.floor(world.visits) : undefined,
    favorites:
      typeof world.favorites === 'number' ? Math.floor(world.favorites) : undefined,
    heat: typeof world.heat === 'number' ? Math.floor(world.heat) : undefined,
    popularity:
      typeof world.popularity === 'number' ? Math.floor(world.popularity) : undefined,
    releaseStatus:
      typeof world.releaseStatus === 'string' ? world.releaseStatus : undefined,
    updatedAt:
      typeof world.updated_at === 'string'
        ? world.updated_at
        : typeof world.updatedAt === 'string'
          ? world.updatedAt
          : undefined,
    tags: tags && tags.length > 0 ? tags : undefined,
    favoriteGroup:
      typeof world.favoriteGroup === 'string' ? world.favoriteGroup : undefined,
    favoriteId: typeof world.favoriteId === 'string' ? world.favoriteId : undefined,
  };
  return summary;
}
