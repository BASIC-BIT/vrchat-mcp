import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { parseServerCliOptions, serverCliUsage } from './cli.js';
import { getConfig } from './config/index.js';
import { logger } from './infra/logger.js';
import {
  createVrchatMcpServer,
  initializeRuntime,
  releaseVrchatMcpServer,
  shutdownRuntime,
} from './server.js';
import { startHttpTransport } from './transports/http.js';

async function main(): Promise<void> {
  const cli = parseServerCliOptions(process.argv.slice(2));
  if (cli.help) {
    process.stderr.write(serverCliUsage());
    return;
  }

  await initializeRuntime();

  if (cli.transport === 'stdio') {
    const server = await createVrchatMcpServer();
    const transport = new StdioServerTransport();
    transport.onclose = () => {
      releaseVrchatMcpServer(server);
      shutdownRuntime();
    };
    await server.connect(transport);
    installShutdownHandler(async () => {
      releaseVrchatMcpServer(server);
      await server.close();
      shutdownRuntime();
    });
    return;
  }

  const config = getConfig();
  const bearerToken = process.env.VRCHAT_MCP_HTTP_BEARER_TOKEN ?? '';
  const handle = await startHttpTransport({
    port: cli.port ?? config.http.port,
    path: cli.path ?? config.http.path,
    bearerToken,
    maxSessions: config.http.maxSessions,
    rateLimitPerMinute: config.http.rateLimitPerMinute,
    sessionIdleTimeoutMs: config.http.sessionIdleTimeoutMs,
    serverFactory: createVrchatMcpServer,
    releaseServer: releaseVrchatMcpServer,
  });
  logger.info('MCP Streamable HTTP server listening.', {
    url: handle.url,
    transport: 'http',
  });
  installShutdownHandler(async () => {
    await handle.close();
    shutdownRuntime();
  });
}

function installShutdownHandler(close: () => Promise<void>): void {
  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    void close()
      .catch((error: unknown) => {
        logger.error('Failed to shut down cleanly.', {
          message: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => {
        process.exit(0);
      });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  logger.error('Fatal error starting server', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
