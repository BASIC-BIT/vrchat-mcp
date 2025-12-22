import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFriendsChangesResource } from '../../src/resources/friendsChanges.js';
import { friendsChangeStore } from '../../src/services/friends/changes.js';

vi.mock('../../src/services/friends/changes.js', () => ({
  friendsChangeStore: {
    snapshot: vi.fn(),
  },
}));

interface ResourceEntry {
  name: string;
  uri: string;
  metadata: unknown;
  read: (
    uri: URL,
    variables: Record<string, unknown>,
  ) => { contents: { text?: string }[] };
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

describe('friends changes resource', () => {
  it('returns change snapshot with query parameters', () => {
    vi.mocked(friendsChangeStore.snapshot).mockReturnValue({
      after: 10,
      nextAfter: 12,
      truncated: false,
      changedIds: ['usr_1'],
      events: [
        {
          sequence: 11,
          receivedAt: '2025-12-22T00:00:00Z',
          type: 'friend-online',
          userId: 'usr_1',
        },
      ],
    });

    const server = new FakeResourceServer();
    registerFriendsChangesResource(server as unknown as McpServer);
    const resource = server.resources[0];
    const uri = new URL('vrchat://friends/changes?after=10&limit=2');
    const result = resource.read(uri, {});
    const payload = JSON.parse(result.contents[0]?.text ?? '{}') as {
      after: number;
      nextAfter: number;
      truncated: boolean;
      changedIds: string[];
    };

    expect(friendsChangeStore.snapshot).toHaveBeenCalledWith(10, 2);
    expect(payload.after).toBe(10);
    expect(payload.nextAfter).toBe(12);
    expect(payload.truncated).toBe(false);
    expect(payload.changedIds).toEqual(['usr_1']);
  });
});
