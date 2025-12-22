import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedInviteTools } from '../../../src/tools/curated/invites.js';
import { FakeServer } from '../../helpers/fake-server.js';
import {
  prepareInviteUser,
  resolveInviteLocation,
  sendSelfInvite,
  sendUserInvite,
} from '../../../src/services/invites/index.js';
import { resetConfirmationsForTest } from '../../../src/services/confirmations.js';

vi.mock('../../../src/services/invites/index.js', () => ({
  prepareInviteUser: vi.fn(),
  resolveInviteLocation: vi.fn(),
  sendSelfInvite: vi.fn(),
  sendUserInvite: vi.fn(),
}));

describe('curated invite tools', () => {
  beforeEach(() => {
    vi.mocked(prepareInviteUser).mockReset();
    vi.mocked(resolveInviteLocation).mockReset();
    vi.mocked(sendSelfInvite).mockReset();
    vi.mocked(sendUserInvite).mockReset();
    resetConfirmationsForTest();
  });

  function readConfirmId(result: unknown): string | undefined {
    if (!result || typeof result !== 'object') return undefined;
    const structured = (result as { structuredContent?: unknown }).structuredContent;
    if (!structured || typeof structured !== 'object') return undefined;
    const confirmId = (structured as { confirmId?: unknown }).confirmId;
    return typeof confirmId === 'string' ? confirmId : undefined;
  }

  it('invites self without confirmation using location', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_self');
    expect(tool).toBeTruthy();

    vi.mocked(resolveInviteLocation).mockReturnValue({ worldId: 'wrld_1', instanceId: 'inst_1' });
    vi.mocked(sendSelfInvite).mockResolvedValue({ id: 'ntf_1' });
    const result = await tool!.handler({ location: 'wrld_1:inst_1' });

    expect(resolveInviteLocation).toHaveBeenCalledWith({ location: 'wrld_1:inst_1' });
    expect(sendSelfInvite).toHaveBeenCalledWith({ worldId: 'wrld_1', instanceId: 'inst_1' });
    expect(result).toMatchObject({ structuredContent: { status: 'sent' } });
  });

  it('invites user with confirmation and parses location', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_user');
    expect(tool).toBeTruthy();

    vi.mocked(prepareInviteUser).mockReturnValue({
      ok: true,
      userId: 'usr_1',
      request: { instanceId: 'inst_9', messageSlot: 2 },
    });
    const first = await tool!.handler({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
    });
    const confirmId = readConfirmId(first);
    expect(confirmId).toBeTruthy();

    vi.mocked(sendUserInvite).mockResolvedValue({ id: 'ntf_2' });
    const second = await tool!.handler({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
      confirmId,
    });

    expect(prepareInviteUser).toHaveBeenCalledWith({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
      confirmId,
    });
    expect(sendUserInvite).toHaveBeenCalledWith('usr_1', { instanceId: 'inst_9', messageSlot: 2 });
    expect(second).toMatchObject({ structuredContent: { status: 'sent' } });
  });

  it('returns tool error when invite preparation fails', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_user');

    vi.mocked(prepareInviteUser).mockReturnValue({ ok: false, reason: 'blocked' });
    const result = await tool!.handler({ userId: 'usr_1', location: 'wrld_1:1' });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'blocked' },
    });
  });

  it('returns confirm_failed when confirmation is invalid', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_user');

    vi.mocked(prepareInviteUser).mockReturnValue({
      ok: true,
      userId: 'usr_2',
      request: { instanceId: 'inst_1' },
    });
    const result = await tool!.handler({
      userId: 'usr_2',
      location: 'wrld_1:inst_1',
      confirmId: 'bad-confirm',
    });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { status: 'confirm_failed' },
    });
  });
});
