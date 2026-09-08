import { z } from 'zod';

export const GalleryImagesInputSchema = z.object({}).strict();
export const GalleryImageDeleteInputSchema = z
  .object({
    fileId: z
      .string()
      .min(1)
      .regex(/^file_[A-Za-z0-9-]+$/)
      .describe(
        'Exact gallery fileId from vrchat_gallery_images. Deletes the underlying file; existing references may be affected.'
      ),
  })
  .strict();
export const GalleryImageDeleteOutputSchema = z.object({
  fileId: z.string(),
  status: z.literal('deleted'),
});
export const GalleryImageSummarySchema = z.object({
  fileId: z.string().min(1),
  name: z.string().optional(),
  ownerId: z.string().optional(),
  imageUrl: z.string().optional(),
});
export const GalleryImagesOutputSchema = z.object({
  images: z.array(GalleryImageSummarySchema),
  total: z.number().int().nonnegative(),
});
