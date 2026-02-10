import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pkg from '../package.json' with { type: 'json' };
import { authManager } from './auth/index.js';
import { vrctlAuthManager } from './vrctl/auth.js';
import { getConfig } from './config/index.js';
import { logger } from './infra/logger.js';
import { registerResources } from './resources/index.js';
import { registerPipelineHandlers } from './services/pipeline/index.js';
import { registerAllTools } from './tools/registerAllTools.js';

const server = new McpServer({ name: 'vrchat-mcp', version: pkg.version ?? '0.0.0' });
const config = getConfig();

function validateConfig() {
  const userAgent = config.api.userAgent?.trim();
  if (!userAgent || userAgent.startsWith('vrchat-mcp/')) {
    logger.warn('Using default user-agent. Set a descriptive UA in config (api.userAgent).');
  }
}

async function main() {
  validateConfig();
  await authManager.init();
  await vrctlAuthManager.init();
  registerResources(server);
  await registerAllTools(server);
  registerPipelineHandlers(server);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  logger.error('Fatal error starting server', {
    message: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
