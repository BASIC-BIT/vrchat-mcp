import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerCalendarReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.calendar.events.list',
    description: 'List calendar events (read-only).',
    operationId: 'getCalendarEvents',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      date: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.calendar.featured.list',
    description: 'List featured calendar events (read-only).',
    operationId: 'getFeaturedCalendarEvents',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      date: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.calendar.followed.list',
    description: 'List followed calendar events (read-only).',
    operationId: 'getFollowedCalendarEvents',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      date: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.calendar.search',
    description: 'Search calendar events (read-only).',
    operationId: 'searchCalendarEvents',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      searchTerm: z.string(),
      utcOffset: z.number().int().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });
}
