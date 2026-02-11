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

describeEval('llm evals (mock writes)', () => {
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
        VRCHAT_MCP_ALLOW_WRITES: 'true',
      },
      logStderr: evalConfig?.debug ?? false,
    });
  }, EVAL_TIMEOUT_MS);

  afterAll(async () => {
    if (harness) await harness.close();
    if (server) await server.close();
  }, EVAL_TIMEOUT_MS);

  it(
    'profile update returns updated bio',
    async () => {
      const res = await harness!.client.callTool({
        name: 'vrchat_profile_update',
        arguments: { bio: 'Mock bio update' },
      });
      const toolOutput = res.structuredContent ?? res.content ?? res;
      const result = await gradeWithOpenAI(evalConfig!, {
        toolName: 'vrchat_profile_update',
        toolInput: { bio: 'Mock bio update' },
        toolOutput,
        expectedFacts: ['user.bio is "Mock bio update".'],
      });
      if (evalConfig?.debug) {
        console.error('[eval] profile update returns updated bio:', result);
      }
      expect(result.pass).toBe(true);
    },
    EVAL_TIMEOUT_MS
  );
});
