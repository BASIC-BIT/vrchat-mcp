import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getConfig, resetConfigCacheForTest } from '../../src/config/index.js';

const touchedEnvKeys = new Set<string>();

function setEnv(key: string, value?: string) {
  if (!touchedEnvKeys.has(key)) {
    touchedEnvKeys.add(key);
  }
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function resetEnv() {
  for (const key of touchedEnvKeys) {
    delete process.env[key];
  }
  touchedEnvKeys.clear();
}

describe('config loader', () => {
  beforeEach(() => {
    resetConfigCacheForTest();
  });

  afterEach(() => {
    resetConfigCacheForTest();
    resetEnv();
  });

  it('expands home and applies template to user agents', () => {
    setEnv('VRCHAT_MCP_COOKIE_FILE', '~/cookies.json');
    setEnv('VRCHAT_MCP_USER_AGENT', 'custom-agent/{version}');

    const config = getConfig();
    expect(config.auth.cookieFile).toContain(os.homedir());
    expect(config.auth.cookieFile.endsWith('cookies.json')).toBe(true);
    expect(config.api.userAgent).toContain('custom-agent/');
    expect(config.api.userAgent).not.toContain('{version}');
  });

  it('reads config file overrides and replaces arrays', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-config-'));
    const filePath = path.join(tempDir, 'config.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          pipeline: { userAgent: 'pipeline/{version}' },
        },
        null,
        2,
      ),
      'utf8',
    );

    const relativePath = path.relative(process.cwd(), filePath);
    setEnv('VRCHAT_MCP_CONFIG_FILE', relativePath);

    const config = getConfig();
    expect(config.pipeline.userAgent).toContain('pipeline/');
    expect(config.pipeline.userAgent).not.toContain('{version}');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('falls back pipeline user agent when config file sets it blank', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-config-'));
    const filePath = path.join(tempDir, 'config.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          pipeline: { userAgent: '' },
        },
        null,
        2,
      ),
      'utf8',
    );
    const relativePath = path.relative(process.cwd(), filePath);
    setEnv('VRCHAT_MCP_CONFIG_FILE', relativePath);
    setEnv('VRCHAT_MCP_USER_AGENT', 'custom-agent/{version}');

    const config = getConfig();
    expect(config.pipeline.userAgent).toBe(config.api.userAgent);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('parses allowlist env values', () => {
    setEnv('VRCHAT_MCP_GROUP_ALLOWLIST', 'off');
    expect(getConfig().groups.allowlist).toEqual([]);

    resetConfigCacheForTest();
    setEnv('VRCHAT_MCP_GROUP_ALLOWLIST', 'grp_1, grp_2');
    expect(getConfig().groups.allowlist).toEqual(['grp_1', 'grp_2']);
  });

  it('supports boolean env parsing', () => {
    setEnv('VRCHAT_MCP_ALLOW_WRITES', 'yes');
    const config = getConfig();
    expect(config.writes.allow).toBe(true);
  });

  it('throws on invalid env values', () => {
    setEnv('VRCHAT_MCP_CACHE_TTL_FRIENDS', 'nope');
    expect(() => getConfig()).toThrow(/Invalid environment variables/);
  });

  it('ignores missing config files', () => {
    setEnv('VRCHAT_MCP_CONFIG_FILE', 'missing-config.json');
    const config = getConfig();
    expect(config.api.baseUrl).toBe('https://api.vrchat.cloud/api/1');
  });
});
