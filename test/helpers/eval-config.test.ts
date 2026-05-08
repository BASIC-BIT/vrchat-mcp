import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadEvalConfig, resolveOpenAIApiKey } from './eval-config.js';

const prevConfigFile = process.env.VRCHAT_MCP_EVAL_CONFIG_FILE;
const prevOpenAiKey = process.env.OPENAI_API_KEY;

function writeConfig(content: object): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-eval-'));
  const filePath = path.join(dir, 'evals.live.json');
  writeFileSync(filePath, JSON.stringify(content), 'utf8');
  return filePath;
}

afterEach(() => {
  if (prevConfigFile === undefined) delete process.env.VRCHAT_MCP_EVAL_CONFIG_FILE;
  else process.env.VRCHAT_MCP_EVAL_CONFIG_FILE = prevConfigFile;
  if (prevOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = prevOpenAiKey;
});

describe('eval config', () => {
  it('loads eval config from an external path only when the API key env exists', () => {
    const filePath = writeConfig({ openaiApiKeyEnv: 'OPENAI_API_KEY', model: 'gpt-test' });
    process.env.VRCHAT_MCP_EVAL_CONFIG_FILE = filePath;
    delete process.env.OPENAI_API_KEY;

    expect(loadEvalConfig()).toBeNull();

    process.env.OPENAI_API_KEY = 'key-from-env';
    const config = loadEvalConfig();
    expect(config?.model).toBe('gpt-test');
    expect(resolveOpenAIApiKey(config!)).toBe('key-from-env');

    rmSync(path.dirname(filePath), { recursive: true, force: true });
  });
});
