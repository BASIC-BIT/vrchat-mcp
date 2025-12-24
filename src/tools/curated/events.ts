import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CalendarEventCreateSchema,
  CalendarEventDeleteSchema,
  CalendarEventUpdateSchema,
  CalendarEventWriteOutputSchema,
  EventsSearchInputSchema,
  EventsSearchOutputSchema,
  EventsUpcomingInputSchema,
  EventsUpcomingOutputSchema,
} from '../../models/events.js';
import {
  buildCalendarCreateRequest,
  buildCalendarUpdateRequest,
  createCalendarEvent,
  deleteCalendarEvent,
  listUpcomingEvents,
  searchEvents,
  updateCalendarEvent,
} from '../../services/events/curated.js';
import { checkGroupAllowed } from '../../services/groups/index.js';
import {
  destructiveToolAnnotations,
  readOnlyToolAnnotations,
  writeToolAnnotations,
} from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedEventTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.events.upcoming'),
    {
      description: 'List calendar events in the upcoming window (read-only). Defaults to the next 7 days.',
      inputSchema: EventsUpcomingInputSchema,
      outputSchema: EventsUpcomingOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const result = await listUpcomingEvents(args ?? {});
        const payload = {
          from: result.from.toISOString(),
          to: result.to.toISOString(),
          windowHours: result.windowHours,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          maxItems: result.maxItems,
          totalEvents: result.totalEvents,
          truncated: result.truncated,
          segments: result.segments,
          events: result.events,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.events.search'),
    {
      description: 'Search calendar events by term (read-only).',
      inputSchema: EventsSearchInputSchema,
      outputSchema: EventsSearchOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const result = await searchEvents(args ?? {});
        const payload = {
          searchTerm: result.searchTerm,
          utcOffset: result.utcOffset,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalEvents: result.totalEvents,
          truncated: result.truncated,
          page: result.page,
          events: result.events as unknown[],
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.event.create'),
    {
      description: 'Create a group calendar event.',
      inputSchema: CalendarEventCreateSchema,
      outputSchema: CalendarEventWriteOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = CalendarEventCreateSchema.parse(args);
        const allowed = checkGroupAllowed(input.groupId);
        if (!allowed.ok) {
          return toolError(allowed.reason);
        }
        const request = buildCalendarCreateRequest(input);
        const event = await createCalendarEvent(input.groupId, request);
        const payload = {
          status: 'created',
          event: event ?? null,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.event.update'),
    {
      description: 'Update a group calendar event.',
      inputSchema: CalendarEventUpdateSchema,
      outputSchema: CalendarEventWriteOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = CalendarEventUpdateSchema.parse(args);
        const allowed = checkGroupAllowed(input.groupId);
        if (!allowed.ok) {
          return toolError(allowed.reason);
        }
        const request = buildCalendarUpdateRequest(input);
        const event = await updateCalendarEvent(input.groupId, input.calendarId, request);
        const payload = {
          status: 'updated',
          event: event ?? null,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.event.delete'),
    {
      description: 'Delete a group calendar event.',
      inputSchema: CalendarEventDeleteSchema,
      outputSchema: CalendarEventWriteOutputSchema,
      annotations: destructiveToolAnnotations,
    },
    async (args) => {
      try {
        const input = CalendarEventDeleteSchema.parse(args);
        const allowed = checkGroupAllowed(input.groupId);
        if (!allowed.ok) {
          return toolError(allowed.reason);
        }
        const result = await deleteCalendarEvent(input.groupId, input.calendarId);
        const payload = {
          status: 'deleted',
          result: result ?? null,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );
}
