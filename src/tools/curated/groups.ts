import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { shapeReadData } from '../../core/readTools.js';
import {
  GroupEventGetInputSchema,
  GroupEventGetOutputSchema,
  GroupEventsListInputSchema,
  GroupEventsListOutputSchema,
  GroupEventsUpcomingInputSchema,
  GroupEventsUpcomingOutputSchema,
  GroupInstancesOverviewInputSchema,
  GroupInstancesOverviewOutputSchema,
  GroupMembersInputSchema,
  GroupMembersOutputSchema,
  GroupPostsRecentInputSchema,
  GroupPostsRecentOutputSchema,
  GroupProfileInputSchema,
  GroupProfileOutputSchema,
  GroupSearchInputSchema,
  GroupSearchOutputSchema,
} from '../../models/groups.js';
import {
  getGroupEvent,
  getGroupInstancesOverview,
  getGroupProfile,
  listGroupEvents,
  listGroupEventsUpcoming,
  listGroupMembers,
  listGroupPosts,
  resolveGroupId,
  searchGroups,
} from '../../services/groups/index.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

const DEFAULT_GROUP_INSTANCES_MAX = 100;

export function registerCuratedGroupTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.groups.search'),
    {
      description: 'Search groups by name or shortCode (read-only).',
      inputSchema: GroupSearchInputSchema,
      outputSchema: GroupSearchOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const query = String(args?.query ?? '').trim();
        if (!query) return toolError('query is required.');

        const result = await searchGroups({ ...(args ?? {}), query });
        const payload = {
          query,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalGroups: result.groups.length,
          truncated: result.truncated,
          stale: result.stale,
          page: result.page,
          groups: result.groups,
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
    toolName('vrchat.group.profile'),
    {
      description: 'Get a group profile by groupId or shortCode (read-only).',
      inputSchema: GroupProfileInputSchema,
      outputSchema: GroupProfileOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const { group, stale } = await getGroupProfile(resolved.groupId);
        const shaped = shapeReadData(group, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });

        const payload = {
          groupId: resolved.groupId,
          stale,
          group: shaped,
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
    toolName('vrchat.group.members'),
    {
      description: 'List group members by userId + displayName (read-only).',
      inputSchema: GroupMembersInputSchema,
      outputSchema: GroupMembersOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await listGroupMembers(resolved.groupId, args ?? {});
        const payload = {
          groupId: resolved.groupId,
          totalMembers: result.members.length,
          truncated: result.truncated,
          stale: result.stale,
          page: result.page,
          members: result.members,
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
    toolName('vrchat.group.posts.recent'),
    {
      description: 'List recent posts for a group (read-only).',
      inputSchema: GroupPostsRecentInputSchema,
      outputSchema: GroupPostsRecentOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await listGroupPosts(resolved.groupId, args ?? {});
        const payload = {
          groupId: resolved.groupId,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalPosts: result.posts.length,
          truncated: result.truncated,
          stale: result.stale,
          page: result.page,
          posts: result.posts,
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
    toolName('vrchat.group.events.list'),
    {
      description: 'List group calendar events (read-only).',
      inputSchema: GroupEventsListInputSchema,
      outputSchema: GroupEventsListOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await listGroupEvents(resolved.groupId, args ?? {});
        const shapedEvents = shapeReadData(result.events, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });
        const payload = {
          groupId: resolved.groupId,
          date: result.date,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          maxItems: result.maxItems,
          totalEvents: Array.isArray(result.events) ? result.events.length : 0,
          truncated: result.truncated,
          stale: result.stale,
          page: result.page,
          events: shapedEvents as unknown[],
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
    toolName('vrchat.group.event.get'),
    {
      description: 'Get a single group calendar event (read-only).',
      inputSchema: GroupEventGetInputSchema,
      outputSchema: GroupEventGetOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await getGroupEvent(resolved.groupId, args ?? {});
        const event = shapeReadData(result.event, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });
        const payload = {
          groupId: resolved.groupId,
          calendarId: args?.calendarId,
          stale: result.stale,
          event,
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
    toolName('vrchat.group.events.upcoming'),
    {
      description: 'List upcoming group events in a time window (read-only).',
      inputSchema: GroupEventsUpcomingInputSchema,
      outputSchema: GroupEventsUpcomingOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await listGroupEventsUpcoming(resolved.groupId, args ?? {});
        const shapedEvents = shapeReadData(result.events, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });
        const payload = {
          groupId: resolved.groupId,
          from: result.from.toISOString(),
          to: result.to.toISOString(),
          windowHours: result.windowHours,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          maxItems: result.maxItems,
          totalEvents: Array.isArray(result.events) ? result.events.length : 0,
          truncated: result.truncated,
          stale: result.stale,
          segments: result.segments,
          events: shapedEvents as unknown[],
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
    toolName('vrchat.group.instances.overview'),
    {
      description: 'Summarize active group instances (read-only).',
      inputSchema: GroupInstancesOverviewInputSchema,
      outputSchema: GroupInstancesOverviewOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const maxInstances =
          typeof args?.maxInstances === 'number'
            ? Math.floor(args.maxInstances)
            : DEFAULT_GROUP_INSTANCES_MAX;
        const result = await getGroupInstancesOverview(resolved.groupId, maxInstances);
        const payload = {
          groupId: resolved.groupId,
          totalInstances: result.instances.length,
          totalMembers: result.totalMembers,
          stale: result.stale,
          instances: result.instances,
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
