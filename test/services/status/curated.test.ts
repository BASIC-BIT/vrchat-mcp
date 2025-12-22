import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

vi.mock('../../../src/services/users/index.js', () => ({
  resolveUserId: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import { resolveUserId } from '../../../src/services/users/index.js';
import { getCurrentStatus, updateStatus } from '../../../src/services/status/curated.js';

describe('status curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
    vi.mocked(resolveUserId).mockReset();
  });

  it('maps current user status fields', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'usr_1', status: 'active', statusDescription: 'Hello' },
    });

    await expect(getCurrentStatus()).resolves.toMatchObject({
      userId: 'usr_1',
      status: 'active',
      statusDescription: 'Hello',
    });
  });

  it('updates status using color mapping', async () => {
    vi.mocked(resolveUserId).mockResolvedValue({ ok: true, userId: 'usr_1' });
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'usr_1', status: 'busy', statusDescription: 'Testing' },
    });

    const result = await updateStatus({ color: 'red', description: 'Testing' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'updateUser',
      params: { userId: 'usr_1' },
      body: { status: 'busy', statusDescription: 'Testing' },
    });
    expect(result).toMatchObject({
      userId: 'usr_1',
      status: 'busy',
      statusDescription: 'Testing',
    });
  });
});
