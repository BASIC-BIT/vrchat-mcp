import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';
import { loadEvalConfig } from '../helpers/eval-config.js';
import { gradeWithOpenAI } from '../helpers/llm-grader.js';
import { resolveSpecPath } from '../helpers/spec-path.js';

const SPEC_PATH = resolveSpecPath(import.meta.url);
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
      'user.id is "usr_11111111-1111-1111-1111-111111111111".',
      'user.displayName is "TestUser".',
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
    expectedFacts: ['data is "2025-12-22T00:00:00Z".'],
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
    tool: 'vrchat_friend_details',
    args: { name: 'Nakk' },
    expectedFacts: [
      'friend.displayName is "Nakk".',
      'world.name is "Mock World".',
      'location.type is "instance".',
      'profile.id is "usr_22222222-2222-2222-2222-222222222222".',
    ],
    expectPass: true,
  },
  {
    name: 'world get returns Mock World',
    tool: 'vrchat_world_profile',
    args: { worldId: 'wrld_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    expectedFacts: ['world.name is "Mock World".'],
    expectPass: true,
  },
  {
    name: 'favorites list includes mock world',
    tool: 'vrchat_worlds_favorites',
    args: {},
    expectedFacts: ['At least one item has name "Mock World".'],
    expectPass: true,
  },
  {
    name: 'groups get returns Mock Group',
    tool: 'vrchat_group_profile',
    args: { groupId: 'grp_11111111-1111-1111-1111-111111111111' },
    expectedFacts: ['group.name is "Mock Group".'],
    expectPass: true,
  },
  {
    name: 'calendar events list includes Public Event',
    tool: 'vrchat_events_search',
    args: { searchTerm: 'Public Event' },
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
      EVAL_TIMEOUT_MS
    );
  }
});
