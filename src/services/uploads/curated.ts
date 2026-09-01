import { CallError, uploadGalleryImageMultipart } from '../../core/client.js';
import type { GroupImageUploadInput } from '../../models/uploads.js';
import { readValidatedStaticPng, type ValidatedPng } from './localPng.js';

interface UploadedFileSummary {
  id: string;
  name?: string;
  mimeType?: string;
  extension?: string;
  ownerId?: string;
  version?: number;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  return typeof record[key] === 'string' ? record[key] : undefined;
}

function latestVersion(record: Record<string, unknown>): number | undefined {
  if (typeof record.version === 'number' && Number.isInteger(record.version)) {
    return record.version;
  }
  if (!Array.isArray(record.versions)) return undefined;
  const versions = record.versions
    .map((entry) =>
      entry && typeof entry === 'object' && typeof (entry as Record<string, unknown>).version === 'number'
        ? (entry as Record<string, number>).version
        : undefined
    )
    .filter((value): value is number => value !== undefined && Number.isInteger(value));
  return versions.length > 0 ? Math.max(...versions) : undefined;
}

function summarizeUploadedFile(data: unknown): UploadedFileSummary {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CallError(
      'VRChat accepted the image upload but returned no file object. The upload may have succeeded; do not retry automatically.'
    );
  }
  const record = data as Record<string, unknown>;
  const id = optionalString(record, 'id');
  if (!id) {
    throw new CallError(
      'VRChat accepted the image upload but returned no fileId. The upload may have succeeded; do not retry automatically.'
    );
  }
  return {
    id,
    name: optionalString(record, 'name'),
    mimeType: optionalString(record, 'mimeType'),
    extension: optionalString(record, 'extension'),
    ownerId: optionalString(record, 'ownerId'),
    version: latestVersion(record),
  };
}

export async function uploadGroupImage(
  input: Pick<GroupImageUploadInput, 'imagePath'>,
  allowedRoots: string[]
): Promise<{ image: ValidatedPng; file: UploadedFileSummary }> {
  const image = await readValidatedStaticPng(input.imagePath, allowedRoots);
  const result = await uploadGalleryImageMultipart(image.fileName, image.bytes);
  return { image, file: summarizeUploadedFile(result.data) };
}
