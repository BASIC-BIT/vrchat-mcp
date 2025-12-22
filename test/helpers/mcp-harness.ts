import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface McpHarnessOptions {
  env?: Record<string, string | undefined>;
  cwd?: string;
  command?: string;
  args?: string[];
  name?: string;
  logStderr?: boolean;
}

export interface McpHarness {
  client: Client;
  close: () => Promise<void>;
}

function cleanEnv(env: Record<string, string | undefined>): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) next[key] = value;
  }
  return next;
}

export async function createMcpHarness(options: McpHarnessOptions = {}): Promise<McpHarness> {
  const command = options.command ?? 'tsx';
  const args = options.args ?? ['src/index.ts'];
  const cwd = options.cwd ?? process.cwd();

  const mergedEnv: Record<string, string | undefined> = {
    ...process.env,
    ...options.env,
  };

  mergedEnv.VRCHAT_MCP_USER_AGENT ??= 'vrchat-mcp-e2e';
  mergedEnv.VRCHAT_MCP_ALLOW_WRITES ??= 'false';

  const transport = new StdioClientTransport({
    command,
    args,
    env: cleanEnv(mergedEnv),
    cwd,
    stderr: 'pipe',
  });

  if (transport.stderr) {
    transport.stderr.on('data', (chunk) => {
      if (options.logStderr) {
        const safeChunk = chunk as unknown;
        const output =
          typeof safeChunk === 'string' || Buffer.isBuffer(safeChunk)
            ? safeChunk
            : Buffer.from(String(safeChunk));
        process.stderr.write(output);
      }
    });
  }

  const client = new Client({
    name: options.name ?? 'vrchat-mcp-e2e',
    version: '0.1.0',
  });

  await client.connect(transport);

  return {
    client,
    close: async () => {
      await transport.close();
    },
  };
}
