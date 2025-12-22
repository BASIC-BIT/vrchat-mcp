import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerResources } from '../../src/resources/index.js';
import { registerFriendsChangesResource } from '../../src/resources/friendsChanges.js';
import { registerFriendsSnapshotResource } from '../../src/resources/friendsSnapshot.js';
import { registerResourceSubscriptions } from '../../src/resources/subscriptions.js';

vi.mock('../../src/resources/friendsChanges.js', () => ({
  registerFriendsChangesResource: vi.fn(),
}));
vi.mock('../../src/resources/friendsSnapshot.js', () => ({
  registerFriendsSnapshotResource: vi.fn(),
}));
vi.mock('../../src/resources/subscriptions.js', () => ({
  registerResourceSubscriptions: vi.fn(),
}));

describe('resources registration', () => {
  it('registers all resource handlers', () => {
    const server = {} as McpServer;
    registerResources(server);

    expect(registerFriendsChangesResource).toHaveBeenCalledWith(server);
    expect(registerFriendsSnapshotResource).toHaveBeenCalledWith(server);
    expect(registerResourceSubscriptions).toHaveBeenCalledWith(server);
  });
});
