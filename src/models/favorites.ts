import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const FavoritePageSchema = z.object({
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offsetStart: z.number().int().min(0),
  truncated: z.boolean(),
});

export const FavoriteSummarySchema = z.object({
  favoriteRecordId: schemas.FavoriteID,
  type: z.string(),
  targetId: z.string(),
  tags: z.array(z.string()).optional(),
});

export const FavoriteGroupSummarySchema = z.object({
  favoriteGroupId: schemas.FavoriteGroupID,
  name: z.string(),
  displayName: z.string().optional(),
  type: z.string().optional(),
  visibility: z.string().optional(),
  ownerId: schemas.UserID.optional(),
});

export const FavoritedAvatarSummarySchema = z.object({
  avatarId: schemas.AvatarID,
  name: z.string(),
  authorId: schemas.UserID.optional(),
  authorName: z.string().optional(),
  releaseStatus: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const FavoritesReadInputSchema = z.object({
  view: z.enum(['favorites', 'groups', 'group', 'limits', 'avatars']).default('favorites'),
  type: schemas.FavoriteType.optional(),
  tag: z.string().optional(),
  favoriteGroupType: schemas.FavoriteType.optional(),
  favoriteGroupName: z.string().optional(),
  userId: schemas.UserID.optional(),
  ownerId: schemas.UserID.optional(),
  query: z.string().optional(),
  featured: z.boolean().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
  notag: z.string().optional(),
  releaseStatus: z.string().optional(),
  maxUnityVersion: z.string().optional(),
  minUnityVersion: z.string().optional(),
  platform: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(50).optional(),
  maxItems: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
});

export const FavoritesReadOutputSchema = z.object({
  view: z.string(),
  total: z.number().int().min(0).optional(),
  page: FavoritePageSchema.optional(),
  favorites: z.array(FavoriteSummarySchema).optional(),
  groups: z.array(FavoriteGroupSummarySchema).optional(),
  group: FavoriteGroupSummarySchema.nullable().optional(),
  limits: schemas.FavoriteLimits.partial().nullable().optional(),
  avatars: z.array(FavoritedAvatarSummarySchema).optional(),
  notes: z.array(z.string()).optional(),
});

export const FavoriteAddInputSchema = z.object({
  type: schemas.FavoriteType,
  targetId: z.string().min(1).describe('User/avatar/world ID to favorite.'),
  tags: z.array(z.string()).min(1).describe('Favorite group tags, e.g. worlds1, avatars1, group_0.'),
});

export const FavoriteRemoveInputSchema = z.object({
  favoriteRecordId: schemas.FavoriteID.describe('Favorite record ID, not the target user/avatar/world ID.'),
});

export const FavoriteWriteOutputSchema = z.object({
  status: z.string(),
  favorite: FavoriteSummarySchema.nullable().optional(),
  result: z.unknown().optional(),
});

export type FavoritesReadInput = z.infer<typeof FavoritesReadInputSchema>;
export type FavoriteAddInput = z.infer<typeof FavoriteAddInputSchema>;
export type FavoriteRemoveInput = z.infer<typeof FavoriteRemoveInputSchema>;
export type FavoriteSummary = z.infer<typeof FavoriteSummarySchema>;
export type FavoriteGroupSummary = z.infer<typeof FavoriteGroupSummarySchema>;
export type FavoritedAvatarSummary = z.infer<typeof FavoritedAvatarSummarySchema>;

type FavoriteRecord = Partial<z.infer<typeof schemas.Favorite>>;
type FavoriteGroupRecord = Partial<z.infer<typeof schemas.FavoriteGroup>>;
type AvatarRecord = Partial<z.infer<typeof schemas.Avatar>>;

export function toFavoriteSummary(favorite: FavoriteRecord): FavoriteSummary | null {
  const favoriteRecordId = favorite.id ?? undefined;
  const targetId = favorite.favoriteId ?? undefined;
  const type = favorite.type ?? undefined;
  if (!favoriteRecordId || !targetId || !type) return null;
  return {
    favoriteRecordId,
    targetId,
    type,
    tags: Array.isArray(favorite.tags) ? favorite.tags : undefined,
  };
}

export function toFavoriteGroupSummary(group: FavoriteGroupRecord): FavoriteGroupSummary | null {
  const favoriteGroupId = group.id ?? undefined;
  const name = group.name ?? undefined;
  if (!favoriteGroupId || !name) return null;
  return {
    favoriteGroupId,
    name,
    displayName: group.displayName ?? undefined,
    type: group.type ?? undefined,
    visibility: group.visibility ?? undefined,
    ownerId: group.ownerId ?? undefined,
  };
}

export function toFavoritedAvatarSummary(avatar: AvatarRecord): FavoritedAvatarSummary | null {
  const avatarId = avatar.id ?? undefined;
  const name = avatar.name ?? undefined;
  if (!avatarId || !name) return null;
  return {
    avatarId,
    name,
    authorId: avatar.authorId ?? undefined,
    authorName: avatar.authorName ?? undefined,
    releaseStatus: avatar.releaseStatus ?? undefined,
    updatedAt: avatar.updated_at ?? undefined,
  };
}
