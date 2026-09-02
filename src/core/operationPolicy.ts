// `updateAvatar` is deliberately absent: it is reachable only through the curated
// vrchat_avatar_update tool, which writes metadata and merged content tags and never touches
// assetUrl/unityPackageUrl/unityVersion/version. The raw and generated write paths still refuse
// it via CURATED_WRITE_TOOL_MAP, so arbitrary avatar bodies remain unreachable.
export const CONTENT_MANAGEMENT_OPERATION_IDS = [
  'createAvatar',
  'deleteAvatar',
  'createWorld',
  'updateWorld',
  'deleteWorld',
  'publishWorld',
  'unpublishWorld',
] as const;

const BLOCKED_OPERATION_REASONS = new Map<string, string>([
  [
    'getGroupAnnouncements',
    'group announcement endpoints are deprecated and unsafe.',
  ],
  [
    'createGroupAnnouncement',
    'group announcement endpoints are deprecated and unsafe.',
  ],
  [
    'deleteGroupAnnouncement',
    'group announcement endpoints are deprecated and unsafe.',
  ],
  [
    'uploadGalleryImage',
    'the legacy gallery upload operation is unverified and disabled. Use vrchat_gallery_image_upload, which uses the live image upload endpoint with strict local-file validation.',
  ],
  ...CONTENT_MANAGEMENT_OPERATION_IDS.map(
    (operationId) =>
      [
        operationId,
        'avatar/world content-management endpoints are disabled by policy. Use ordinary view/select/favorite tools instead.',
      ] as const
  ),
]);

export function getBlockedOperationReason(operationId: string): string | undefined {
  return BLOCKED_OPERATION_REASONS.get(operationId);
}

/**
 * Operations that are safe inside a narrow curated wrapper but not with an arbitrary body.
 * CURATED_WRITE_TOOL_MAP only hides an operation from the generated-tool registry; the raw call
 * tool consults this list so those bodies stay unreachable there too.
 */
const CURATED_ONLY_OPERATION_IDS = new Map<string, string>([
  [
    'updateInstance',
    'use vrchat_instance_link_event, which only links an allowlisted group instance to an event owned by that same group.',
  ],
  [
    'updateAvatar',
    'use vrchat_avatar_update, which cannot write assetUrl, unityPackageUrl, unityVersion or version.',
  ],
  [
    'uploadImage',
    'use vrchat_gallery_image_upload, which accepts only validated static PNG files from configured roots and always uploads them with the gallery tag.',
  ],
]);

export function getCuratedOnlyReason(operationId: string): string | undefined {
  const reason = CURATED_ONLY_OPERATION_IDS.get(operationId);
  return reason ? `${operationId} is not available through raw calls: ${reason}` : undefined;
}
