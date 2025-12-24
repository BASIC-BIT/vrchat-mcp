import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { cacheConfig, cacheManager } from '../services/cache.js';
import { writeToolAnnotations } from '../utils/toolAnnotations.js';
import { toolName } from '../utils/toolNames.js';
import { textContent, toolError } from '../utils/toolResponses.js';

export function registerCacheTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.cache.invalidate'),
    {
      description: 'Invalidate cached data (local-only).',
      inputSchema: z.object({
        scope: z.enum(['all', 'area', 'key']).optional(),
        area: z.string().optional(),
        key: z.string().optional(),
      }),
      outputSchema: z.object({
        enabled: z.boolean(),
        cleared: z.number().int().min(0),
        scope: z.string(),
        area: z.string().optional(),
        key: z.string().optional(),
      }),
      annotations: writeToolAnnotations,
    },
    (args) => {
      const enabled = cacheConfig.enabled;
      if (!enabled) {
        const payload = { enabled, cleared: 0, scope: 'disabled' };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload,
        };
      }
      const scope = args?.scope ?? 'all';
      if (scope === 'area' && !args?.area) {
        return toolError('area is required when scope=area');
      }
      if (scope === 'key' && !args?.key) {
        return toolError('key is required when scope=key');
      }

      let cleared = 0;
      if (scope === 'all') {
        cleared = cacheManager.invalidateAll();
      } else if (scope === 'area') {
        cleared = cacheManager.invalidateByTag(String(args.area));
      } else {
        cleared = cacheManager.invalidateByKey(String(args.key));
      }

      const payload = {
        enabled,
        cleared,
        scope,
        area: scope === 'area' ? String(args.area) : undefined,
        key: scope === 'key' ? String(args.key) : undefined,
      };
      return {
        content: textContent(JSON.stringify(payload, null, 2)),
        structuredContent: payload,
      };
    }
  );
}
