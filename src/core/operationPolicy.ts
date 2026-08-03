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
