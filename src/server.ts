import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import pkg from '../package.json' with { type: 'json' };
import { authManager } from './auth/index.js';
import { getConfig } from './config/index.js';
import { logger } from './infra/logger.js';
import { registerResources } from './resources/index.js';
import { unregisterResourceSubscriptions } from './resources/subscriptions.js';
import { registerPipelineHandlers } from './services/pipeline/index.js';
import { pipelineManager } from './services/pipeline/manager.js';
import { registerAllTools } from './tools/registerAllTools.js';

let runtimeInitialization: Promise<void> | null = null;

function validateConfig(): void {
  const config = getConfig();
  const userAgent = config.api.userAgent?.trim();
  if (!userAgent || userAgent.startsWith('vrchat-mcp/')) {
    logger.warn('Using default user-agent. Set a descriptive UA in config (api.userAgent).');
  }
}

export async function initializeRuntime(): Promise<void> {
  runtimeInitialization ??= (async () => {
    validateConfig();
    await authManager.init();
    registerPipelineHandlers();
  })();
  await runtimeInitialization;
}

export async function createVrchatMcpServer(): Promise<McpServer> {
  const server = new McpServer({
    name: 'vrchat-mcp',
    version: pkg.version ?? '0.0.0',
  });
  registerResources(server);
  await registerAllTools(server);
  return server;
}

export function releaseVrchatMcpServer(server: McpServer): void {
  unregisterResourceSubscriptions(server);
}

export function shutdownRuntime(): void {
  pipelineManager.stop();
}
