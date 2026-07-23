export type ServerTransportKind = 'stdio' | 'http';

export interface ServerCliOptions {
  transport: ServerTransportKind;
  port?: number;
  path?: string;
  help: boolean;
}

function parsePort(value: string): number {
  if (!/^\d+$/.test(value)) throw new Error('--port must be an integer from 1 to 65535.');
  const port = Number(value);
  if (port < 1 || port > 65535) {
    throw new Error('--port must be an integer from 1 to 65535.');
  }
  return port;
}

function parseTransport(value: string): ServerTransportKind {
  if (value === 'stdio' || value === 'http') return value;
  throw new Error('--transport must be stdio or http.');
}

function readOptionValue(args: string[], index: number, name: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value.`);
  return value;
}

export function parseServerCliOptions(
  args: string[],
  env: Record<string, string | undefined> = process.env
): ServerCliOptions {
  const envTransport = env.VRCHAT_MCP_TRANSPORT;
  let transport = envTransport ? parseTransport(envTransport.trim().toLowerCase()) : 'stdio';
  let port: number | undefined;
  let path: string | undefined;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') {
      help = true;
      continue;
    }
    if (arg === '--http') {
      transport = 'http';
      continue;
    }
    if (arg === '--transport') {
      transport = parseTransport(readOptionValue(args, index, '--transport'));
      index += 1;
      continue;
    }
    if (arg === '--port') {
      port = parsePort(readOptionValue(args, index, '--port'));
      index += 1;
      continue;
    }
    if (arg === '--path') {
      path = readOptionValue(args, index, '--path');
      if (
        path.length < 2 ||
        path.length > 128 ||
        !/^\/[A-Za-z0-9._~/-]*$/.test(path) ||
        /^\/healthz\/?$/i.test(path)
      ) {
        throw new Error('--path must be a non-reserved URL path using safe characters.');
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  if (transport !== 'http' && (port !== undefined || path !== undefined)) {
    throw new Error('--port and --path require --transport http.');
  }
  return { transport, port, path, help };
}

export function serverCliUsage(): string {
  return `Usage: vrchat-mcp [options]

Options:
  --transport <stdio|http>  Transport mode (default: stdio)
  --http                    Alias for --transport http
  --port <number>           HTTP port (default: 8765)
  --path <path>             HTTP MCP endpoint path (default: /mcp)
  --help                    Show this help

HTTP mode is loopback-only and requires VRCHAT_MCP_HTTP_BEARER_TOKEN.
`;
}
