import { describe, it, expect } from 'vitest';
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

  it('does not block ordinary avatar selection', () => {
    expect(getBlockedOperationReason('selectAvatar')).toBeUndefined();
    expect(getBlockedOperationReason('selectFallbackAvatar')).toBeUndefined();
    expect(GENERATED_WRITE_SKIP_IDS).not.toContain('selectAvatar');
    expect(GENERATED_WRITE_SKIP_IDS).not.toContain('selectFallbackAvatar');
  });
});
