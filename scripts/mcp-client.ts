import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';

type Flags = Record<string, string | boolean>;

interface ParsedArgs {
  command?: string;
  flags: Flags;
  positionals: string[];
}

const COMMANDS = new Set(['list-tools', 'login', 'status', 'logout', 'call']);

function parseArgs(args: string[]): ParsedArgs {
  const flags: Flags = {};
  const positionals: string[] = [];
  let command: string | undefined;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!command && !arg.startsWith('--')) {
      command = arg;
      continue;
    }
    if (arg.startsWith('--no-')) {
      flags[arg.slice(5)] = false;
      continue;
    }
    if (arg.startsWith('--')) {
      const name = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[name] = next;
        i += 1;
      } else {
        flags[name] = true;
      }
      continue;
    }
    positionals.push(arg);
  }

  return { command, flags, positionals };
}

function flagString(flags: Flags, name: string): string | undefined {
  const val = flags[name];
  if (val === undefined || typeof val === 'boolean') return undefined;
  return String(val);
}

function flagBoolean(flags: Flags, name: string, defaultValue = false): boolean {
  const val = flags[name];
  if (val === undefined) return defaultValue;
  if (typeof val === 'boolean') return val;
  const normalized = String(val).toLowerCase();
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return true;
}

function parseArgList(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((entry) => String(entry));
    } catch {
      // fall through
    }
  }
  if (trimmed.includes(',')) {
    return trimmed
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return trimmed.split(/\s+/).filter(Boolean);
}

function cleanEnv(env: Record<string, string | undefined>): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) next[key] = value;
  }
  return next;
}

function printJson(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usage() {
  console.error(`Usage: tsx scripts/mcp-client.ts <command> [options]

Commands:
  list-tools
  login
  status
  logout
  call

Options:
  --input <json>          JSON string for call
  --input-file <path>     JSON file for call
  --tool <name>           Tool to call (default: vrchat_call)
  --wait / --no-wait      Wait for login to complete (default true)
  --timeout <seconds>     Wait this long (non-tty friendly)
  --cookie-store <mode>   memory | file | keychain (default file)
  --cookie-file <path>    file path for cookie store
  --user-agent <value>    VRCHAT_MCP_USER_AGENT override
  --server-command <cmd>  override server command (default: tsx)
  --server-args <args>    override server args (default: src/index.ts)
  --cwd <path>            override server working directory
`);
}

function extractLoginUrl(result: unknown): string | undefined {
  const structured = result?.structuredContent as { url?: unknown } | undefined;
  if (structured && typeof structured.url === 'string') return structured.url;
  const content = result?.content as { type: string; text?: string }[] | undefined;
  if (!content) return undefined;
  for (const item of content) {
    if (item.type === 'text' && typeof item.text === 'string') {
      const match = /https?:\/\/\S+/.exec(item.text);
      if (match) return match[0];
    }
  }
  return undefined;
}

async function waitForEnter(timeoutMs?: number): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  return await new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(() => {
        rl.close();
        resolve(false);
      }, timeoutMs);
    }
    rl.question('Press ENTER after you finish logging in...\n', () => {
      if (timer) clearTimeout(timer);
      rl.close();
      resolve(true);
    });
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createClient(flags: Flags) {
  const serverCommand =
    flagString(flags, 'server-command') ??
    process.env.VRCHAT_MCP_SERVER_COMMAND ??
    'tsx';
  const serverArgs = parseArgList(
    flagString(flags, 'server-args') ?? process.env.VRCHAT_MCP_SERVER_ARGS,
    ['src/index.ts'],
  );
  const serverCwd =
    flagString(flags, 'cwd') ?? process.env.VRCHAT_MCP_SERVER_CWD ?? process.cwd();

  const serverEnv = cleanEnv(process.env);

  const cookieStore = flagString(flags, 'cookie-store');
  if (cookieStore) serverEnv.VRCHAT_MCP_COOKIE_STORE = cookieStore;
  if (!serverEnv.VRCHAT_MCP_COOKIE_STORE) serverEnv.VRCHAT_MCP_COOKIE_STORE = 'file';

  const cookieFile = flagString(flags, 'cookie-file');
  if (cookieFile) serverEnv.VRCHAT_MCP_COOKIE_FILE = cookieFile;

  const userAgent = flagString(flags, 'user-agent');
  if (userAgent) serverEnv.VRCHAT_MCP_USER_AGENT = userAgent;
  if (!serverEnv.VRCHAT_MCP_USER_AGENT) {
    serverEnv.VRCHAT_MCP_USER_AGENT = 'vrchat-mcp-harness';
    console.error('VRCHAT_MCP_USER_AGENT not set; using vrchat-mcp-harness.');
  }

  const transport = new StdioClientTransport({
    command: serverCommand,
    args: serverArgs,
    env: serverEnv,
    cwd: serverCwd,
    stderr: 'pipe',
  });

  const stderrStream = transport.stderr;
  if (stderrStream) {
    stderrStream.on('data', (chunk) => {
      process.stderr.write(chunk);
    });
  }

  const client = new Client({ name: 'vrchat-mcp-harness', version: '0.1.0' });
  await client.connect(transport);

  return { client, transport };
}

async function main() {
  const { command, flags, positionals } = parseArgs(process.argv.slice(2));
  if (!command || !COMMANDS.has(command)) {
    usage();
    process.exit(1);
  }

  const { client, transport } = await createClient(flags);

  try {
    if (command === 'list-tools') {
      const res = await client.listTools();
      printJson(res);
      return;
    }

    if (command === 'status') {
      const res = await client.callTool({ name: 'vrchat_auth_status', arguments: {} });
      printJson(res);
      return;
    }

    if (command === 'logout') {
      const res = await client.callTool({ name: 'vrchat_auth_logout', arguments: {} });
      printJson(res);
      return;
    }

    if (command === 'login') {
      const res = await client.callTool({ name: 'vrchat_auth_begin', arguments: {} });
      printJson(res);

      const url = extractLoginUrl(res);
      if (url) console.error(`Open in browser: ${url}`);

      const shouldWait = flagBoolean(flags, 'wait', true);
      const timeoutSeconds = Number(flagString(flags, 'timeout') ?? '0');
      const timeoutMs = Number.isFinite(timeoutSeconds) && timeoutSeconds > 0 ? timeoutSeconds * 1000 : undefined;

      let waited = false;
      if (shouldWait && process.stdin.isTTY) {
        waited = await waitForEnter(timeoutMs);
      } else if (shouldWait && timeoutMs) {
        console.error(`Waiting ${timeoutSeconds}s for login to complete...`);
        await delay(timeoutMs);
        waited = true;
      } else if (shouldWait && !process.stdin.isTTY) {
        console.error('stdin is not a TTY; use --timeout to keep the server alive.');
      }

      if (waited) {
        const status = await client.callTool({ name: 'vrchat_auth_status', arguments: {} });
        printJson(status);
      }
      return;
    }

    if (command === 'call') {
      const inputText =
        flagString(flags, 'input') ??
        (flagString(flags, 'input-file')
          ? await readFile(flagString(flags, 'input-file')!, 'utf8')
          : positionals.join(' '));

      if (!inputText) {
        console.error('Missing input. Use --input, --input-file, or pass JSON as a positional argument.');
        usage();
        process.exit(1);
      }

      let payload: unknown;
      try {
        payload = JSON.parse(inputText);
      } catch (err) {
        console.error('Failed to parse JSON input.', (err as Error).message);
        process.exit(1);
      }

      const toolName = flagString(flags, 'tool') ?? 'vrchat_call';
      const res = await client.callTool({ name: toolName, arguments: payload as any });
      printJson(res);
      return;
    }
  } finally {
    await transport.close();
  }
}

main().catch((err) => {
  console.error('mcp-client error:', (err as Error).message);
  process.exit(1);
});
