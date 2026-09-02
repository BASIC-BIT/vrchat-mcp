import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const GalleryImageUploadInputSchema = z
  .object({
    imagePath: z
      .string()
      .min(1)
      .describe(
        'Absolute path to a static PNG inside uploads.allowedRoots. The image must be 65-2048 pixels per side and no larger than 10 MiB.'
      ),
  })
  .strict();

export const GalleryImageUploadOutputSchema = z.object({
  fileId: schemas.FileID,
  ownerId: schemas.UserID.optional(),
  name: z.string().optional(),
  mimeType: z.string().optional(),
  extension: z.string().optional(),
  version: z.number().int().optional(),
  image: z.object({
    fileName: z.string(),
    byteSize: z.number().int().positive(),
    width: z.number().int().min(65).max(2048),
    height: z.number().int().min(65).max(2048),
  }),
});

export type GalleryImageUploadInput = z.infer<typeof GalleryImageUploadInputSchema>;
