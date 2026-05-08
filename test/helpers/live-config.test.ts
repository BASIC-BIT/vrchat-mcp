import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getDefaultLiveCookieFile, loadLiveConfig } from './live-config.js';

const prevConfigFile = process.env.VRCHAT_MCP_LIVE_CONFIG_FILE;

function writeConfig(content: object): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-live-'));
  const filePath = path.join(dir, 'e2e.live.json');
  writeFileSync(filePath, JSON.stringify(content), 'utf8');
  return filePath;
}

afterEach(() => {
  if (prevConfigFile === undefined) delete process.env.VRCHAT_MCP_LIVE_CONFIG_FILE;
  else process.env.VRCHAT_MCP_LIVE_CONFIG_FILE = prevConfigFile;
});

describe('live config', () => {
  it('loads live config from an external path', () => {
    const filePath = writeConfig({ expectFriend: 'ExampleFriend' });
    process.env.VRCHAT_MCP_LIVE_CONFIG_FILE = filePath;

    expect(loadLiveConfig()?.expectFriend).toBe('ExampleFriend');

    rmSync(path.dirname(filePath), { recursive: true, force: true });
  });

  it('keeps the default live cookie file outside the repository', () => {
    expect(getDefaultLiveCookieFile()).toContain(`vrchat-mcp${path.sep}cookies.json`);
    expect(path.isAbsolute(getDefaultLiveCookieFile())).toBe(true);
  });
});
