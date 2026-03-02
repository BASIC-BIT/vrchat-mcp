import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/groups/index.js', () => ({
  searchGroups: vi.fn(),
  resolveGroupId: vi.fn(),
  getGroupProfile: vi.fn(),
  listGroupMembers: vi.fn(),
  listGroupPosts: vi.fn(),
  listGroupEvents: vi.fn(),
  getGroupEvent: vi.fn(),
  listGroupEventsUpcoming: vi.fn(),
  getGroupInstancesOverview: vi.fn(),
}));

vi.mock('../../../src/core/readTools.js', () => ({
  shapeReadData: vi.fn((value: unknown) => value),
}));

import { registerCuratedGroupTools } from '../../../src/tools/curated/groups.js';
import {
  getGroupEvent,
  getGroupInstancesOverview,
  getGroupProfile,
  listGroupEvents,
  listGroupEventsUpcoming,
  listGroupMembers,
  listGroupPosts,
  resolveGroupId,
  searchGroups,
} from '../../../src/services/groups/index.js';

describe('curated group tools', () => {
  it('searches groups by query', async () => {
    vi.mocked(searchGroups).mockResolvedValue({
      groups: [{ groupId: 'grp_1', name: 'Test', shortCode: 'ABC', memberCount: 3 }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
      truncated: false,
      stale: false,
      pageSize: 50,
      maxPages: 10,
      maxItems: 500,
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_groups_search');
    const result = await tool!.handler({ query: 'Test' });

    expect(result).toMatchObject({
      structuredContent: { totalGroups: 1, groups: [{ groupId: 'grp_1' }] },
    });
  });

  it('requires a non-empty search query', async () => {
    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_groups_search');
    const result = await tool!.handler({ query: '   ' });

    expect(result).toMatchObject({ isError: true });
  });

  it('resolves group profile by shortCode', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({
      ok: true,
      groupId: 'grp_1',
      resolvedBy: 'shortCode',
    });
    vi.mocked(getGroupProfile).mockResolvedValue({ group: { id: 'grp_1' }, stale: false });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_profile');
    const result = await tool!.handler({ shortCode: 'ABC' });

    expect(result).toMatchObject({
      structuredContent: { groupId: 'grp_1', group: { id: 'grp_1' } },
    });
  });

  it('returns tool error when group profile cannot resolve', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({
      ok: false,
      reason: 'Not found',
      status: 'not_found',
      nextSteps: ['vrchat_groups_search'],
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_profile');
    const result = await tool!.handler({ groupId: 'grp_missing' });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { status: 'not_found' },
    });
  });

  it('lists recent group posts', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(listGroupPosts).mockResolvedValue({
      posts: [{ id: 'post_1', title: 'Hello' }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
      truncated: false,
      stale: false,
      pageSize: 50,
      maxPages: 10,
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_posts_recent');
    const result = await tool!.handler({ groupId: 'grp_1' });

    expect(result).toMatchObject({
      structuredContent: { totalPosts: 1, posts: [{ id: 'post_1' }] },
    });
  });

  it('lists group events with pagination', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(listGroupEvents).mockResolvedValue({
      events: [{ id: 'evt_1' }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
      truncated: false,
      stale: false,
      pageSize: 50,
      maxPages: 10,
      maxItems: 500,
      date: '2025-12-01',
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_events_list');
    const result = await tool!.handler({ groupId: 'grp_1', date: '2025-12-01' });

    expect(result).toMatchObject({
      structuredContent: { totalEvents: 1 },
    });
  });

  it('gets a single group event', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(getGroupEvent).mockResolvedValue({ event: { id: 'evt_9' }, stale: false });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_event_get');
    const result = await tool!.handler({ groupId: 'grp_1', calendarId: 'evt_9' });

    expect(result).toMatchObject({
      structuredContent: { groupId: 'grp_1', calendarId: 'evt_9' },
    });
  });

  it('filters upcoming group events by window', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(listGroupEventsUpcoming).mockResolvedValue({
      events: [{ id: 'evt_1' }],
      truncated: false,
      stale: false,
      segments: [{ date: '2025-12-01' }],
      from: new Date('2025-12-10T00:00:00Z'),
      to: new Date('2025-12-17T00:00:00Z'),
      windowHours: 168,
      pageSize: 50,
      maxPages: 10,
      maxItems: 500,
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_events_upcoming');
    const result = await tool!.handler({ groupId: 'grp_1' });

    expect(result).toMatchObject({
      structuredContent: { totalEvents: 1 },
    });
  });

  it('summarizes group instances', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(getGroupInstancesOverview).mockResolvedValue({
      instances: [
        {
          instanceId: 'i1',
          location: 'wrld_1:1',
          memberCount: 5,
          worldId: 'wrld_1',
          worldName: 'Test World',
        },
      ],
      stale: false,
      totalMembers: 5,
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_instances_overview');
    const result = await tool!.handler({ groupId: 'grp_1' });

    expect(result).toMatchObject({
      structuredContent: {
        groupId: 'grp_1',
        totalInstances: 1,
        totalMembers: 5,
      },
    });
  });

  it('uses maxInstances override', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(getGroupInstancesOverview).mockResolvedValue({
      instances: [],
      stale: false,
      totalMembers: 0,
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_instances_overview');
    await tool!.handler({ groupId: 'grp_1', maxInstances: 12.9 });

    expect(getGroupInstancesOverview).toHaveBeenCalledWith('grp_1', 12);
  });

  it('returns members list', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(listGroupMembers).mockResolvedValue({
      members: [
        { userId: 'usr_1', displayName: 'Alpha' },
        { userId: 'usr_2', displayName: 'Beta' },
      ],
      page: { pages: 1, items: 2, pageSize: 100, offsetStart: 0, truncated: false },
      truncated: false,
      stale: false,
    });

    const server = new FakeServer();
    registerCuratedGroupTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_members');
    const result = await tool!.handler({ groupId: 'grp_1' });

    expect(result).toMatchObject({
      structuredContent: {
        totalMembers: 2,
        members: [{ userId: 'usr_1' }, { userId: 'usr_2' }],
      },
    });
  });
});
