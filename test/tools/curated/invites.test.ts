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
  });

  it('invites self using location', async () => {
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

  it('invites user and parses location', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_user');
    expect(tool).toBeTruthy();

    vi.mocked(prepareInviteUser).mockReturnValue({
      ok: true,
      userId: 'usr_1',
      request: { instanceId: 'inst_9', messageSlot: 2 },
    });
    const result = await tool!.handler({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
    });
    vi.mocked(sendUserInvite).mockResolvedValue({ id: 'ntf_2' });

    expect(prepareInviteUser).toHaveBeenCalledWith({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
    });
    expect(sendUserInvite).toHaveBeenCalledWith('usr_1', { instanceId: 'inst_9', messageSlot: 2 });
    expect(result).toMatchObject({ structuredContent: { status: 'sent' } });
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

});
