import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  VrctlEventGetInputSchema,
  VrctlEventGetOutputSchema,
  VrctlEventsCurrentInputSchema,
  VrctlEventsCurrentOutputSchema,
} from '../models/vrctlEvents.js';
import { vrctlEventsService } from '../vrctl/events.js';
import { readOnlyToolAnnotations } from '../utils/toolAnnotations.js';
import { toolName } from '../utils/toolNames.js';
import { textContent, toolError } from '../utils/toolResponses.js';

export function registerVrctlEventTools(server: McpServer): void {
  server.registerTool(
    toolName('vrctl.events.current'),
    {
      description:
        'List vrc.tl events in the current timeline window (read-only). Optionally page more days with daysBack/daysForward.',
      inputSchema: VrctlEventsCurrentInputSchema,
      outputSchema: VrctlEventsCurrentOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrctlEventsCurrentInputSchema.parse(args ?? {});
        const result = await vrctlEventsService.listCurrentEvents(input);
        return {
          content: textContent(JSON.stringify(result, null, 2)),
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrctl.event.get'),
    {
      description: 'Get one vrc.tl event by eventId (read-only).',
      inputSchema: VrctlEventGetInputSchema,
      outputSchema: VrctlEventGetOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrctlEventGetInputSchema.parse(args);
        const result = await vrctlEventsService.getEventById(input.eventId, {
          includeHidden: input.includeHidden,
        });
        return {
          content: textContent(JSON.stringify(result, null, 2)),
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
