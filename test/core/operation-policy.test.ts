import { describe, it, expect } from 'vitest';
import { getCuratedWriteToolName } from '../../src/core/generatedToolOverrides.js';
import { GENERATED_WRITE_SKIP_IDS } from '../../src/core/generatedToolSkips.js';
import {
  CONTENT_MANAGEMENT_OPERATION_IDS,
  getBlockedOperationReason,
} from '../../src/core/operationPolicy.js';

describe('operation policy', () => {
  it('blocks explicit avatar/world content-management operations and skips generated write tools', () => {
    for (const operationId of CONTENT_MANAGEMENT_OPERATION_IDS) {
      expect(getBlockedOperationReason(operationId)).toContain('avatar/world content-management');
      expect(GENERATED_WRITE_SKIP_IDS).toContain(operationId);
    }
  });

  it('routes updateAvatar through the curated tool instead of hard-blocking it', () => {
    // The curated vrchat_avatar_update tool has to be able to call this, so it must not be in
    // the policy blocklist — but the raw and generated write paths must still refuse it.
    expect(getBlockedOperationReason('updateAvatar')).toBeUndefined();
    expect(getCuratedWriteToolName('updateAvatar')).toBe('vrchat_avatar_update');

    // Creating and deleting avatars stays unreachable by any path.
    expect(getBlockedOperationReason('createAvatar')).toContain('content-management');
    expect(getBlockedOperationReason('deleteAvatar')).toContain('content-management');
  });

  it('does not block ordinary avatar selection', () => {
    expect(getBlockedOperationReason('selectAvatar')).toBeUndefined();
    expect(getBlockedOperationReason('selectFallbackAvatar')).toBeUndefined();
    expect(GENERATED_WRITE_SKIP_IDS).not.toContain('selectAvatar');
    expect(GENERATED_WRITE_SKIP_IDS).not.toContain('selectFallbackAvatar');
  });
});
