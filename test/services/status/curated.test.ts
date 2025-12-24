import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));
vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));
vi.mock('../../../src/services/users/index.js', () => ({
  resolveUserId: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import { callReadOperation } from '../../../src/core/readTools.js';
import { resolveUserId } from '../../../src/services/users/index.js';
import { getCurrentStatus, updateStatus } from '../../../src/services/status/curated.js';

describe('status curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(resolveUserId).mockReset();
  });

  it('maps current user status fields', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
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

  it('rejects updates without status or color', async () => {
    await expect(updateStatus({} as never)).rejects.toThrow('Provide status or color.');
  });

  it('rejects updates when user resolution fails', async () => {
    vi.mocked(resolveUserId).mockResolvedValue({ ok: false, reason: 'not found' });
    await expect(updateStatus({ status: 'active', userId: 'usr_missing' })).rejects.toThrow(
      'not found',
    );
  });

  it('falls back to requested status and description when response omits fields', async () => {
    vi.mocked(resolveUserId).mockResolvedValue({ ok: true, userId: 'usr_2' });
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'usr_2' } });

    const result = await updateStatus({ status: 'active', description: 'Hello' });
    expect(result).toMatchObject({
      userId: 'usr_2',
      status: 'active',
      statusDescription: 'Hello',
    });
  });
});
