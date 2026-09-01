import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const GroupImageUploadInputSchema = z.object({
  groupId: schemas.GroupID.describe('Exact group ID. Provide groupId or shortCode.').optional(),
  shortCode: z
    .string()
    .describe('Exact group short code. Provide groupId or shortCode.')
    .optional(),
  imagePath: z
    .string()
    .min(1)
    .describe(
      'Absolute path to a static PNG inside uploads.allowedRoots. The image must be 65-2048 pixels per side and no larger than 10 MiB.'
    ),
});

export const GroupImageUploadOutputSchema = z.object({
  status: z.literal('uploaded'),
  groupId: schemas.GroupID,
  fileId: schemas.FileID,
  image: z.object({
    fileName: z.string(),
    byteSize: z.number().int().positive(),
    width: z.number().int().min(65).max(2048),
    height: z.number().int().min(65).max(2048),
  }),
  file: z.object({
    id: schemas.FileID,
    name: z.string().optional(),
    mimeType: z.string().optional(),
    extension: z.string().optional(),
    ownerId: schemas.UserID.optional(),
    version: z.number().int().optional(),
  }),
});

export type GroupImageUploadInput = z.infer<typeof GroupImageUploadInputSchema>;

