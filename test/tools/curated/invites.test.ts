import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedInviteTools } from '../../../src/tools/curated/invites.js';
import { FakeServer } from '../../helpers/fake-server.js';
import {
  inviteUsers,
  inviteUsersToGroup,
  inviteUserToCurrentInstance,
  prepareInviteUser,
  resolveInviteLocation,
  sendBoops,
  sendFriendRequests,
  sendSelfInvite,
  sendUserInvite,
} from '../../../src/services/invites/index.js';

vi.mock('../../../src/services/invites/index.js', () => ({
  inviteUsers: vi.fn(),
  inviteUsersToGroup: vi.fn(),
  inviteUserToCurrentInstance: vi.fn(),
  prepareInviteUser: vi.fn(),
  resolveInviteLocation: vi.fn(),
  sendBoops: vi.fn(),
  sendFriendRequests: vi.fn(),
  sendSelfInvite: vi.fn(),
  sendUserInvite: vi.fn(),
}));

describe('curated invite tools', () => {
  beforeEach(() => {
    vi.mocked(inviteUsers).mockReset();
    vi.mocked(inviteUsersToGroup).mockReset();
    vi.mocked(prepareInviteUser).mockReset();
    vi.mocked(inviteUserToCurrentInstance).mockReset();
    vi.mocked(resolveInviteLocation).mockReset();
    vi.mocked(sendBoops).mockReset();
    vi.mocked(sendFriendRequests).mockReset();
    vi.mocked(sendSelfInvite).mockReset();
    vi.mocked(sendUserInvite).mockReset();
  });

  it('registers unified bulk invite tool', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite');
    expect(tool).toBeTruthy();

    vi.mocked(inviteUsers).mockResolvedValue({
      status: 'completed',
      dryRun: false,
      continueOnError: true,
      totalTargets: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
      destination: { kind: 'here', location: 'wrld_1:inst_1', worldId: 'wrld_1', instanceId: 'inst_1' },
      results: [{ target: 'usr_1', userId: 'usr_1', status: 'sent' }],
    });

    const result = await tool!.handler({ here: true, user: 'usr_1' });

    expect(inviteUsers).toHaveBeenCalledWith({ here: true, user: 'usr_1' });
    expect(result).toMatchObject({ structuredContent: { sent: 1 } });
  });

  it('registers group invite, friend request, and boop bulk tools', () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const names = server.tools.map((entry) => entry.name);

    expect(names).toContain('vrchat_group_invite');
    expect(names).toContain('vrchat_friend_request');
    expect(names).toContain('vrchat_boop');
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
    vi.mocked(sendUserInvite).mockResolvedValue({ id: 'ntf_2' });
    const result = await tool!.handler({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
    });

    expect(prepareInviteUser).toHaveBeenCalledWith({
      userId: 'usr_1',
      location: 'wrld_9:inst_9',
      messageSlot: 2,
    });
    expect(sendUserInvite).toHaveBeenCalledWith('usr_1', { instanceId: 'inst_9', messageSlot: 2 });
    expect(result).toMatchObject({ structuredContent: { status: 'sent', notification: { id: 'ntf_2' } } });
  });

  it('returns tool error when invite preparation fails', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_user');

    vi.mocked(prepareInviteUser).mockReturnValue({ ok: false, reason: 'blocked' });
    const result = await tool!.handler({ userId: 'usr_1', location: 'wrld_1:1' });

    expect(result).toMatchObject({
      isError: true,
    });
    const content = (result as { content: { text?: string }[] }).content;
    expect(content[0]?.text).toContain('blocked');
  });

  it('invites user to current instance with userId only', async () => {
    const server = new FakeServer();
    registerCuratedInviteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_invite_user_to_me');
    expect(tool).toBeTruthy();

    vi.mocked(inviteUserToCurrentInstance).mockResolvedValue({
      status: 'sent',
      userId: 'usr_1',
      worldId: 'wrld_1',
      instanceId: 'inst_1',
      location: 'wrld_1:inst_1',
      notification: { id: 'ntf_4' },
    });
    const result = await tool!.handler({ userId: 'usr_1' });

    expect(inviteUserToCurrentInstance).toHaveBeenCalledWith({ userId: 'usr_1' });
    expect(result).toMatchObject({
      structuredContent: {
        status: 'sent',
        userId: 'usr_1',
        worldId: 'wrld_1',
        instanceId: 'inst_1',
      },
    });
  });
});
