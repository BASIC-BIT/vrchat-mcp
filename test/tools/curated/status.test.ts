import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedStatusTools } from '../../../src/tools/curated/status.js';
import { FakeServer } from '../../helpers/fake-server.js';
import { getCurrentStatus, updateStatus } from '../../../src/services/status/index.js';

vi.mock('../../../src/services/status/index.js', () => ({
  getCurrentStatus: vi.fn(),
  updateStatus: vi.fn(),
}));

describe('curated status tools', () => {
  beforeEach(() => {
    vi.mocked(getCurrentStatus).mockReset();
    vi.mocked(updateStatus).mockReset();
  });

  it('maps status get from current user', async () => {
    vi.mocked(getCurrentStatus).mockResolvedValue({
      userId: 'usr_1',
      status: 'active',
      statusDescription: 'Hello',
    });

    const server = new FakeServer();
    registerCuratedStatusTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_get');
    expect(tool).toBeTruthy();
    const result = await tool!.handler({});
    expect(getCurrentStatus).toHaveBeenCalled();
    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_1',
        status: 'active',
        statusDescription: 'Hello',
      },
    });
  });

  it('maps color to status for status set', async () => {
    vi.mocked(updateStatus).mockResolvedValue({
      userId: 'usr_1',
      status: 'busy',
      statusDescription: 'Testing',
    });
    const server = new FakeServer();
    registerCuratedStatusTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_set');
    expect(tool).toBeTruthy();
    const result = await tool!.handler({ color: 'red', description: 'Testing' });

    expect(updateStatus).toHaveBeenCalledWith({
      color: 'red',
      description: 'Testing',
    });
    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_1',
        status: 'busy',
        statusDescription: 'Testing',
      },
    });
  });

  it('returns tool error when status get fails', async () => {
    vi.mocked(getCurrentStatus).mockRejectedValue(new Error('Boom'));
    const server = new FakeServer();
    registerCuratedStatusTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_get');
    const result = await tool!.handler({});

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'Boom' },
    });
  });

  it('returns tool error when status set fails', async () => {
    vi.mocked(updateStatus).mockRejectedValue(new Error('Nope'));
    const server = new FakeServer();
    registerCuratedStatusTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_set');
    const result = await tool!.handler({ status: 'active' });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'Nope' },
    });
  });

  it('rejects description-only status set at schema level', async () => {
    const server = new FakeServer();
    registerCuratedStatusTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_set');
    const result = (await tool!.handler({ description: '' })) as {
      isError?: boolean;
      structuredContent?: { error?: string };
    };

    expect(result).toMatchObject({
      isError: true,
    });
    expect(result.structuredContent?.error).toContain('Provide status or color.');
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it('rejects conflicting status and color at schema level', async () => {
    const server = new FakeServer();
    registerCuratedStatusTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_set');
    const result = (await tool!.handler({ status: 'active', color: 'red' })) as {
      isError?: boolean;
      structuredContent?: { error?: string };
    };

    expect(result).toMatchObject({
      isError: true,
    });
    expect(result.structuredContent?.error).toContain('maps to status');
    expect(updateStatus).not.toHaveBeenCalled();
  });
});
