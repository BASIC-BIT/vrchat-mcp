import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFriendsSnapshotResource } from '../../src/resources/friendsSnapshot.js';
import { fetchFriendsWithMeta } from '../../src/services/friends/fetch.js';

vi.mock('../../src/services/friends/fetch.js', () => ({
  fetchFriendsWithMeta: vi.fn(),
}));

interface ResourceEntry {
  name: string;
  uri: string;
  metadata: unknown;
  read: (uri: URL, variables: Record<string, unknown>) => Promise<{
    contents: { text?: string }[];
  }>;
}

class FakeResourceServer {
  resources: ResourceEntry[] = [];

  registerResource(
    name: string,
    template: { uriTemplate: { toString(): string } },
    metadata: unknown,
    read: ResourceEntry['read'],
  ) {
    this.resources.push({ name, uri: template.uriTemplate.toString(), metadata, read });
  }
}

describe('friends snapshot resource', () => {
  it('reads friends snapshot with query overrides', async () => {
    const server = new FakeResourceServer();
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [{ id: 'u1' }],
      meta: { segments: [], truncated: false, total: 1, stale: false },
    });

    registerFriendsSnapshotResource(server as unknown as McpServer);
    const resource = server.resources[0];
    const uri = new URL(
      'vrchat://friends/snapshot?includeOffline=false&pageSize=50&maxPages=2',
    );
    const result = await resource.read(uri, {});
    const rawPayload: unknown = JSON.parse(result.contents[0]?.text ?? '{}');
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new Error('Invalid payload');
    }
    const payload = rawPayload as {
      includeOffline: boolean;
      pageSize: number;
      maxPages: number;
      totalFriends: number;
    };

    expect(fetchFriendsWithMeta).toHaveBeenCalledWith({
      includeOffline: false,
      pageSize: 50,
      maxPages: 2,
    });
    expect(payload.includeOffline).toBe(false);
    expect(payload.pageSize).toBe(50);
    expect(payload.maxPages).toBe(2);
    expect(payload.totalFriends).toBe(1);
  });
});
