import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';
import { loadEvalConfig } from '../helpers/eval-config.js';
import { gradeWithOpenAI } from '../helpers/llm-grader.js';
import { loadLiveConfig } from '../helpers/live-config.js';
import { ensureLoggedIn } from '../helpers/live-auth.js';

const EVAL_TIMEOUT_MS = 180_000;

interface EvalCase {
  name: string;
  tool: string;
  args: Record<string, unknown>;
  expectedFacts: string[];
  expectPass: boolean;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

const evalConfig = loadEvalConfig();
const liveConfig = loadLiveConfig();
const liveEvalsEnabled = (() => {
  const value = String(process.env.VRCHAT_MCP_ENABLE_LIVE_EVALS ?? '').toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
})();
const describeLive = evalConfig && liveConfig && liveEvalsEnabled ? describe : describe.skip;

describeLive('llm evals (live)', () => {
  let harness: McpHarness | null = null;
  let currentUser: { id?: string; displayName?: string; username?: string } = {};

  beforeAll(async () => {
    const cookieFile = liveConfig?.cookieFile ?? path.resolve('.vrchat-mcp-cookies.json');

    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_COOKIE_STORE: 'file',
        VRCHAT_MCP_COOKIE_FILE: cookieFile,
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-evals-live',
        VRCHAT_MCP_ALLOW_WRITES: 'false',
      },
      logStderr: liveConfig?.debug ?? false,
    });

    const client = harness.client;
    await ensureLoggedIn(client, liveConfig);
    const me = await client.callTool({ name: 'vrchat_me', arguments: {} });
    const structured = me.structuredContent as { user?: unknown } | undefined;
    const data = asRecord(structured?.user);
    currentUser = {
      id: typeof data.id === 'string' ? data.id : undefined,
      displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
      username: typeof data.username === 'string' ? data.username : undefined,
    };
  }, EVAL_TIMEOUT_MS);

  afterAll(async () => {
    if (harness) await harness.close();
  }, EVAL_TIMEOUT_MS);

  it(
    'runs live eval sweep',
    async () => {
      const cases: EvalCase[] = [];
      const expectations = evalConfig?.expectations;
      const friendName = expectations?.friendName ?? liveConfig?.expectFriend;
      if (currentUser.id && currentUser.displayName) {
        cases.push({
          name: 'current user profile matches expected',
          tool: 'vrchat_me',
          args: {},
          expectedFacts: [`user.displayName is "${currentUser.displayName}".`],
          expectPass: true,
        });
        cases.push({
          name: 'get user by id returns same displayName',
          tool: 'vrchat_user_profile',
          args: { userId: currentUser.id },
          expectedFacts: [`user.displayName is "${currentUser.displayName}".`],
          expectPass: true,
        });
      }

      cases.push({
        name: 'config returns client api key',
        tool: 'vrchat_config_get',
        args: {},
        expectedFacts: ['data.clientApiKey is a non-empty string.'],
        expectPass: true,
      });

      cases.push({
        name: 'system time returns time string',
        tool: 'vrchat_system_time',
        args: {},
        expectedFacts: ['data is a non-empty string.'],
        expectPass: true,
      });

      if (friendName) {
        cases.push({
          name: 'friends search finds expected friend',
          tool: 'vrchat_friends_search',
          args: { query: friendName },
          expectedFacts: [
            `The result includes at least one match with displayName "${friendName}".`,
          ],
          expectPass: true,
        });

        cases.push({
          name: 'friend location details returns friend profile',
          tool: 'vrchat_friend_details',
          args: { name: friendName },
          expectedFacts: [`friend.displayName is "${friendName}".`],
          expectPass: true,
        });
      }

      if (expectations?.worldId) {
        cases.push({
          name: 'world get returns expected world',
          tool: 'vrchat_world_profile',
          args: { worldId: expectations.worldId },
          expectedFacts: expectations.worldName
            ? [`world.name is "${expectations.worldName}".`]
            : [`world.id is "${expectations.worldId}".`],
          expectPass: true,
        });
      }

      if (expectations?.avatarId) {
        const avatarNameExact = expectations.avatarNameExact?.trim();
        const avatarNameContains = expectations.avatarName?.trim();
        cases.push({
          name: 'avatar get returns expected avatar',
          tool: 'vrchat_read_getAvatar',
          args: { avatarId: expectations.avatarId },
          expectedFacts: avatarNameExact
            ? [`data.name is "${avatarNameExact}".`]
            : avatarNameContains
              ? [`data.name contains "${avatarNameContains}".`]
              : [`data.id is "${expectations.avatarId}".`],
          expectPass: true,
        });
      }

      if (expectations?.favoriteWorldId) {
        cases.push({
          name: 'favorites list includes expected world',
          tool: 'vrchat_worlds_favorites',
          args: {},
          expectedFacts: [
            `At least one item has favoriteId "${expectations.favoriteWorldId}".`,
          ],
          expectPass: true,
        });
      }

      if (expectations?.groupId) {
        cases.push({
          name: 'group get returns expected group',
          tool: 'vrchat_group_profile',
          args: { groupId: expectations.groupId },
          expectedFacts: expectations.groupName
            ? [`group.name is "${expectations.groupName}".`]
            : [`group.id is "${expectations.groupId}".`],
          expectPass: true,
        });
      }

      if (expectations?.groupId && expectations.groupMemberName) {
        cases.push({
          name: 'group members list includes expected member',
          tool: 'vrchat_group_members',
          args: { groupId: expectations.groupId },
          expectedFacts: [
            `At least one item has displayName "${expectations.groupMemberName}".`,
          ],
          expectPass: true,
        });
      }

      if (liveConfig?.bogusQuery) {
        cases.push({
          name: 'bogus query should not match expected friend',
          tool: 'vrchat_friends_search',
          args: { query: liveConfig.bogusQuery },
          expectedFacts: [
            friendName
              ? `The result includes a match with displayName "${friendName}".`
              : 'The result includes a match with displayName "definitely_not_a_real_name".',
          ],
          expectPass: false,
        });
      }

      expect(cases.length).toBeGreaterThan(0);

      for (const testCase of cases) {
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
          console.error(`[eval-live] ${testCase.name}:`, result);
        }
        if (result.pass !== testCase.expectPass) {
          throw new Error(
            `Live eval failed: ${testCase.name} expected pass=${testCase.expectPass} got pass=${result.pass}. Result: ${JSON.stringify(result)}`,
          );
        }
      }
    },
    EVAL_TIMEOUT_MS,
  );
});
