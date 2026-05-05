import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const WorldShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const WorldSummarySchema = z.object({
  worldId: schemas.WorldID,
  name: z.string(),
  authorId: schemas.UserID.optional(),
  authorName: z.string().optional(),
  capacity: z.number().int().optional(),
  visits: z.number().int().optional(),
  favorites: z.number().int().optional(),
  heat: z.number().int().optional(),
  popularity: z.number().int().optional(),
  releaseStatus: z.string().optional(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  favoriteGroup: schemas.FavoriteGroupID.optional(),
  favoriteId: schemas.FavoriteID.optional(),
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
  includeTags: z.boolean().optional(),
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
  userId: schemas.UserID.optional(),
  includeTags: z.boolean().optional(),
});

export const WorldProfileInputSchema = WorldShapeSchema.extend({
  worldId: schemas.WorldID.optional(),
  name: z.string().optional(),
});

export const WorldInstancesInputSchema = z.object({
  worldId: schemas.WorldID.optional(),
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
  worldId: schemas.WorldID,
  resolvedBy: z.enum(['id', 'name']),
  stale: z.boolean(),
  world: schemas.World.partial(),
  vrcxMemo: z
    .object({
      editedAt: z.string().nullable(),
      memo: z.string().nullable(),
    })
    .optional(),
});

export const WorldInstancesOverviewOutputSchema = z.object({
  worldId: schemas.WorldID,
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

type WorldSummarySource = Partial<z.infer<typeof schemas.World>> & {
  favoriteGroup?: string;
  favoriteId?: string;
};

function toOptionalInt(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.floor(value);
}

function toOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const tags = value.filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  );
  return tags.length > 0 ? tags : undefined;
}

export function buildWorldSummary(world: WorldSummarySource): WorldSummary | null {
  const worldId = world.id ?? undefined;
  const name = world.name ?? undefined;
  if (!worldId || !name) return null;

  const tags = toOptionalStringArray(world.tags);
  return {
    worldId,
    name,
    authorId: world.authorId ?? undefined,
    authorName: world.authorName ?? undefined,
    capacity: toOptionalInt(world.capacity),
    visits: toOptionalInt(world.visits),
    favorites: toOptionalInt(world.favorites),
    heat: toOptionalInt(world.heat),
    popularity: toOptionalInt(world.popularity),
    releaseStatus: world.releaseStatus ?? undefined,
    updatedAt: world.updated_at ?? undefined,
    tags,
    favoriteGroup: world.favoriteGroup ?? undefined,
    favoriteId: world.favoriteId ?? undefined,
  };
}
