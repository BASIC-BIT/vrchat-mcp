export const CONTENT_MANAGEMENT_OPERATION_IDS = [
  'createAvatar',
  'updateAvatar',
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
