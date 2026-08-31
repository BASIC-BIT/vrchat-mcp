import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  InstanceCreateOutputSchema,
  InstanceCreateSchema,
  InstanceLinkEventOutputSchema,
  InstanceLinkEventSchema,
} from '../../models/instances.js';
import {
  createInstance,
  linkInstanceToCalendarEvent,
  prepareInstanceCreate,
} from '../../services/instances/index.js';
import { writeToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedInstanceTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.instance.create'),
    {
      description: 'Create a new instance.',
      inputSchema: InstanceCreateSchema,
      outputSchema: InstanceCreateOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = InstanceCreateSchema.parse(args);
        const prepared = prepareInstanceCreate(input);
        if (!prepared.ok) {
          return toolError(prepared.reason);
        }
        const instance = await createInstance(prepared.request);
        const payload = {
          status: 'created',
          instance: instance ?? null,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.instance.link_event'),
    {
      description:
        'Link an allowlisted group instance to its group event. No invite or notification.',
      inputSchema: InstanceLinkEventSchema,
      outputSchema: InstanceLinkEventOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = InstanceLinkEventSchema.parse(args);
        const result = await linkInstanceToCalendarEvent(input);
        const payload = {
          status: result.status,
          calendarId: input.calendarId,
          location: `${input.worldId}:${input.instanceId}`,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
