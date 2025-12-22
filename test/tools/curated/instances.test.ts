import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedInstanceTools } from '../../../src/tools/curated/instances.js';
import { FakeServer } from '../../helpers/fake-server.js';
import { resetConfirmationsForTest } from '../../../src/services/confirmations.js';

vi.mock('../../../src/services/instances/index.js', () => ({
  prepareInstanceCreate: vi.fn(),
  createInstance: vi.fn(),
}));

import { createInstance, prepareInstanceCreate } from '../../../src/services/instances/index.js';

describe('curated instance tools', () => {
  beforeEach(() => {
    vi.mocked(prepareInstanceCreate).mockReset();
    vi.mocked(createInstance).mockReset();
    resetConfirmationsForTest();
  });

  function readConfirmId(result: unknown): string | undefined {
    if (!result || typeof result !== 'object') return undefined;
    const structured = (result as { structuredContent?: unknown }).structuredContent;
    if (!structured || typeof structured !== 'object') return undefined;
    const confirmId = (structured as { confirmId?: unknown }).confirmId;
    return typeof confirmId === 'string' ? confirmId : undefined;
  }

  it('requires confirmation before creating instance', async () => {
    vi.mocked(prepareInstanceCreate).mockReturnValue({
      ok: true,
      request: {
        worldId: 'wrld_1',
        type: 'private',
        region: 'us',
        displayName: 'Test Instance',
      },
    });
    vi.mocked(createInstance).mockResolvedValue({ id: 'inst_1' });

    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_create');
    expect(tool).toBeTruthy();

    const first = await tool!.handler({
      worldId: 'wrld_1',
      type: 'private',
      region: 'us',
      displayName: 'Test Instance',
    });
    const confirmId = readConfirmId(first);
    expect(confirmId).toBeTruthy();

    const second = await tool!.handler({
      worldId: 'wrld_1',
      type: 'private',
      region: 'us',
      displayName: 'Test Instance',
      confirmId,
    });

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        worldId: 'wrld_1',
        type: 'private',
        region: 'us',
        displayName: 'Test Instance',
      }),
    );
    expect(second).toMatchObject({
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

    const first = await tool!.handler({
      worldId: 'wrld_2',
      type: 'group',
      region: 'us',
      groupId: 'grp_1',
      groupAccessType: 'members',
    });
    const confirmId = readConfirmId(first);
    expect(confirmId).toBeTruthy();

    await tool!.handler({
      worldId: 'wrld_2',
      type: 'group',
      region: 'us',
      groupId: 'grp_1',
      groupAccessType: 'members',
      confirmId,
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

  it('returns confirm_failed for invalid confirmation', async () => {
    vi.mocked(prepareInstanceCreate).mockReturnValue({
      ok: true,
      request: {
        worldId: 'wrld_3',
        type: 'private',
        region: 'us',
      },
    });

    const server = new FakeServer();
    registerCuratedInstanceTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_instance_create');

    const result = await tool!.handler({
      worldId: 'wrld_3',
      type: 'private',
      region: 'us',
      confirmId: 'bad-confirm',
    });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { status: 'confirm_failed' },
    });
  });
});
