import { describe, it, expect } from 'vitest';
import { getCuratedWriteToolName } from '../../src/core/generatedToolOverrides.js';
import { GENERATED_WRITE_SKIP_IDS } from '../../src/core/generatedToolSkips.js';
import {
  CONTENT_MANAGEMENT_OPERATION_IDS,
  getBlockedOperationReason,
  getCuratedOnlyReason,
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

  it('keeps updateAvatar out of the raw call tool', () => {
    // The raw tool consults only the blocklist and this list, never CURATED_WRITE_TOOL_MAP, so
    // without it an arbitrary body could still reach assetUrl/unityPackageUrl/version.
    expect(getCuratedOnlyReason('updateAvatar')).toContain('vrchat_avatar_update');
    expect(getCuratedOnlyReason('updateGroupRole')).toBeUndefined();
    expect(getCuratedOnlyReason('selectAvatar')).toBeUndefined();
  });

  it('keeps instance updates behind the narrow event-link tool', () => {
    expect(getBlockedOperationReason('updateInstance')).toBeUndefined();
    expect(getCuratedWriteToolName('updateInstance')).toBe('vrchat_instance_link_event');
    expect(getCuratedOnlyReason('updateInstance')).toContain('vrchat_instance_link_event');
  });

  it('keeps image uploads behind the validated curated tool', () => {
    expect(getCuratedWriteToolName('uploadImage')).toBe('vrchat_group_image_upload');
    expect(getCuratedOnlyReason('uploadImage')).toContain('vrchat_group_image_upload');
    expect(getBlockedOperationReason('uploadGalleryImage')).toContain(
      'vrchat_group_image_upload'
    );
    expect(GENERATED_WRITE_SKIP_IDS).toContain('uploadGalleryImage');
  });

  it('does not block ordinary avatar selection', () => {
    expect(getBlockedOperationReason('selectAvatar')).toBeUndefined();
    expect(getBlockedOperationReason('selectFallbackAvatar')).toBeUndefined();
    expect(GENERATED_WRITE_SKIP_IDS).not.toContain('selectAvatar');
    expect(GENERATED_WRITE_SKIP_IDS).not.toContain('selectFallbackAvatar');
  });
});
