import { z } from 'zod';
import { assertWritesAllowed, callOperation, CallError } from '../../core/client.js';
import { GalleryImageDeleteInputSchema } from '../../models/gallery.js';
import type { GalleryImageSummarySchema } from '../../models/gallery.js';

// Read only the fields this feature uses, without importing unrelated spec constraints.
const GalleryFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  ownerId: z.string().optional(),
  tags: z.array(z.string()),
  versions: z
    .array(
      z.object({
        version: z.number().int(),
        deleted: z.boolean().optional(),
        file: z.object({ url: z.string(), status: z.string().optional() }).optional(),
      })
    )
    .optional(),
});

export async function deleteGalleryImage(input: { fileId: string }) {
  assertWritesAllowed('DELETE');
  const { fileId } = GalleryImageDeleteInputSchema.parse(input);
  const current = await callOperation({ operationId: 'getCurrentUser', params: {} });
  const user = z.object({ id: z.string().min(1) }).parse(current.data);
  const result = await callOperation({ operationId: 'getFile', params: { fileId } });
  const file = GalleryFileSchema.parse(result.data);
  if (file.id !== fileId || file.ownerId !== user.id || !file.tags.includes('gallery')) {
    throw new CallError(
      'Deletion refused: file must be the exact requested gallery image owned by the signed-in account.'
    );
  }
  await callOperation({ operationId: 'deleteFile', params: { fileId } });
  return { fileId, status: 'deleted' as const };
}

export async function listGalleryImages() {
  const images = new Map<string, z.infer<typeof GalleryImageSummarySchema>>();
  const pageSize = 100;
  for (let offset = 0; offset < 10_000; offset += pageSize) {
    const result = await callOperation({
      operationId: 'getFiles',
      params: { tag: 'gallery', n: pageSize, offset },
    });
    const files = z.array(GalleryFileSchema).parse(result.data);
    const previousSize = images.size;
    for (const file of files) {
      if (!file.tags.includes('gallery'))
        throw new CallError('VRChat returned a non-gallery file while listing the gallery.');
      const latest = file.versions
        ?.filter((version) => !version.deleted && version.file?.status === 'complete')
        .sort((a, b) => b.version - a.version)[0];
      images.set(file.id, {
        fileId: file.id,
        name: file.name,
        ownerId: file.ownerId,
        imageUrl: latest?.file?.url,
      });
    }
    if (files.length < pageSize) return { images: [...images.values()], total: images.size };
    if (images.size === previousSize)
      throw new CallError(
        'Gallery pagination made no progress. Retry the listing; no complete total is available.'
      );
  }
  throw new CallError('Gallery listing exceeded its safety bound. No complete total is available.');
}
