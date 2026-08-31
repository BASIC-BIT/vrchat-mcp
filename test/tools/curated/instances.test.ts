import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedInstanceTools } from '../../../src/tools/curated/instances.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/instances/index.js', () => ({
  prepareInstanceCreate: vi.fn(),
  createInstance: vi.fn(),
  linkInstanceToCalendarEvent: vi.fn(),
}));

import {
  createInstance,
  linkInstanceToCalendarEvent,
  prepareInstanceCreate,
} from '../../../src/services/instances/index.js';

describe('curated instance tools', () => {
  beforeEach(() => {
    vi.mocked(prepareInstanceCreate).mockReset();
    vi.mocked(createInstance).mockReset();
    vi.mocked(linkInstanceToCalendarEvent).mockReset();
  });

  it('creates instance', async () => {
    vi.mocked(prepareInstanceCreate).mockReturnValue({
      ok: true,
      request: {
        worldId: 'wrld_1',
        type: 'private',
        region: 'us',
        displayName: 'Test Instance',
        calendarEntryId: 'cal_1',
      },
    });
    vi.mocked(createInstance).mockResolvedValue({ id: 'inst_1' });

    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_create');
    expect(tool).toBeTruthy();

    const result = await tool!.handler({
      worldId: 'wrld_1',
      type: 'private',
      region: 'us',
      displayName: 'Test Instance',
      calendarEntryId: 'cal_1',
    });

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        worldId: 'wrld_1',
        type: 'private',
        region: 'us',
        displayName: 'Test Instance',
        calendarEntryId: 'cal_1',
      }),
    );
    expect(result).toMatchObject({
      structuredContent: { status: 'created' },
    });
  });

  it('returns validation error from prepare step', async () => {
    vi.mocked(prepareInstanceCreate).mockReturnValue({
      ok: false,
      reason: 'groupId is only valid when type=group.',
    });

    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_create');

    const result = await tool!.handler({
      worldId: 'wrld_1',
      type: 'private',
      region: 'us',
      groupId: 'grp_blocked',
    });
    expect(result).toMatchObject({ isError: true });
  });

  it('passes group instance request through', async () => {
    vi.mocked(prepareInstanceCreate).mockReturnValue({
      ok: true,
      request: {
        worldId: 'wrld_2',
        type: 'group',
        region: 'us',
        ownerId: 'grp_1',
        groupAccessType: 'members',
      },
    });
    vi.mocked(createInstance).mockResolvedValue({ id: 'inst_2' });

    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_create');

    await tool!.handler({
      worldId: 'wrld_2',
      type: 'group',
      region: 'us',
      groupId: 'grp_1',
      groupAccessType: 'members',
    });

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        worldId: 'wrld_2',
        type: 'group',
        region: 'us',
        ownerId: 'grp_1',
        groupAccessType: 'members',
      }),
    );
  });

  it('links an instance to a group event', async () => {
    vi.mocked(linkInstanceToCalendarEvent).mockResolvedValue({
      status: 'linked',
      eventTitle: 'VIBE',
      instanceName: 'VIBE Doors Open',
    });

    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_link_event');
    expect(tool).toBeTruthy();

    const args = {
      groupId: 'grp_1',
      calendarId: 'cal_1',
      worldId: 'wrld_1',
      instanceId: '123~group(grp_1)',
    };
    const result = await tool!.handler(args);

    expect(linkInstanceToCalendarEvent).toHaveBeenCalledWith(args);
    expect(result).toMatchObject({
      structuredContent: {
        status: 'linked',
        groupId: 'grp_1',
        calendarId: 'cal_1',
        eventTitle: 'VIBE',
        location: 'wrld_1:123~group(grp_1)',
        instanceName: 'VIBE Doors Open',
      },
    });
  });

  it('rejects a full location passed as instanceId', async () => {
    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_link_event');

    const result = await tool!.handler({
      groupId: 'grp_1',
      calendarId: 'cal_1',
      worldId: 'wrld_1',
      instanceId: 'wrld_1:123',
    });

    expect(result).toMatchObject({ isError: true });
    expect(linkInstanceToCalendarEvent).not.toHaveBeenCalled();
  });
});
