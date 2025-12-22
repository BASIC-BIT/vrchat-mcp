import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';
import { loadEvalConfig } from '../helpers/eval-config.js';
import { gradeWithOpenAI } from '../helpers/llm-grader.js';

const SPEC_PATH = fileURLToPath(new URL('../fixtures/spec.yaml', import.meta.url));
const EVAL_TIMEOUT_MS = 120_000;

const evalConfig = loadEvalConfig();
const describeEval = evalConfig ? describe : describe.skip;

interface EvalCase {
  name: string;
  tool: string;
  args: Record<string, unknown>;
  expectedFacts: string[];
  expectPass: boolean;
}

const evalCases: EvalCase[] = [
  {
    name: 'current user profile returns TestUser',
    tool: 'vrchat_me',
    args: {},
    expectedFacts: [
      'data.id is "usr_test_1".',
      'data.displayName is "TestUser".',
    ],
    expectPass: true,
  },
  {
    name: 'config returns mock api key',
    tool: 'vrchat_config_get',
    args: {},
    expectedFacts: ['data.clientApiKey is "mock-key".'],
    expectPass: true,
  },
  {
    name: 'system time returns mock timestamp',
    tool: 'vrchat_system_time',
    args: {},
    expectedFacts: ['data.time is "2025-12-22T00:00:00Z".'],
    expectPass: true,
  },
  {
    name: 'friends search finds Nakk',
    tool: 'vrchat_friends_search',
    args: { query: 'Nak' },
    expectedFacts: [
      'The result includes at least one match with displayName "Nakk".',
      'totalFriends is 2.',
    ],
    expectPass: true,
  },
  {
    name: 'friend location details include Mock World',
    tool: 'vrchat_friend_location_details',
    args: { name: 'Nakk' },
    expectedFacts: [
      'friend.displayName is "Nakk".',
      'world.name is "Mock World".',
      'location.type is "instance".',
    ],
    expectPass: true,
  },
  {
    name: 'world get returns Mock World',
    tool: 'vrchat_worlds_get',
    args: { worldId: 'wrld_mock' },
    expectedFacts: ['data.name is "Mock World".'],
    expectPass: true,
  },
  {
    name: 'favorites list includes mock world',
    tool: 'vrchat_favorites_list',
    args: {},
    expectedFacts: ['At least one item has favoriteId "wrld_mock".'],
    expectPass: true,
  },
  {
    name: 'groups get returns Mock Group',
    tool: 'vrchat_groups_get',
    args: { groupId: 'grp_1' },
    expectedFacts: ['data.name is "Mock Group".'],
    expectPass: true,
  },
  {
    name: 'calendar events list includes Public Event',
    tool: 'vrchat_calendar_events_list',
    args: {},
    expectedFacts: ['At least one item has title "Public Event".'],
    expectPass: true,
  },
  {
    name: 'bogus query should not match Nakk',
    tool: 'vrchat_friends_search',
    args: { query: 'slkdjf' },
    expectedFacts: ['The result includes a match with displayName "Nakk".'],
    expectPass: false,
  },
];

describeEval('llm evals (mock)', () => {
  let server: MockServer | null = null;
  let harness: McpHarness | null = null;

  beforeAll(async () => {
    server = await createMockServer();
    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_API_BASE: server.baseUrl,
        VRCHAT_MCP_SPEC_URL: SPEC_PATH,
        VRCHAT_MCP_COOKIE_STORE: 'memory',
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-evals',
        VRCHAT_MCP_ALLOW_WRITES: 'false',
      },
      logStderr: evalConfig?.debug ?? false,
    });
  }, EVAL_TIMEOUT_MS);

  afterAll(async () => {
    if (harness) await harness.close();
    if (server) await server.close();
  }, EVAL_TIMEOUT_MS);

  for (const testCase of evalCases) {
    it(
      testCase.name,
      async () => {
        const res = await harness!.client.callTool({
          name: testCase.tool,
          arguments: testCase.args,
        });
        const toolOutput = res.structuredContent ?? res.content ?? res;
        const result = await gradeWithOpenAI(evalConfig!, {
          toolName: testCase.tool,
          toolInput: testCase.args,
          toolOutput,
          expectedFacts: testCase.expectedFacts,
        });
        if (evalConfig?.debug) {
          console.error(`[eval] ${testCase.name}:`, result);
        }
        expect(result.pass).toBe(testCase.expectPass);
      },
      EVAL_TIMEOUT_MS,
    );
  }
});
