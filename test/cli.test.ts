import { describe, expect, it } from 'vitest';
import { parseServerCliOptions, serverCliUsage } from '../src/cli.js';

describe('server CLI', () => {
  it('keeps stdio as the default', () => {
    expect(parseServerCliOptions([], {})).toEqual({
      transport: 'stdio',
      help: false,
    });
  });

  it('parses HTTP options and the environment transport selector', () => {
    expect(
      parseServerCliOptions(['--port', '9000', '--path', '/vrchat'], {
        VRCHAT_MCP_TRANSPORT: 'http',
      })
    ).toEqual({
      transport: 'http',
      port: 9000,
      path: '/vrchat',
      help: false,
    });
    expect(parseServerCliOptions(['--http'], {})).toMatchObject({ transport: 'http' });
  });

  it('rejects HTTP-only options in stdio mode and invalid inputs', () => {
    expect(() => parseServerCliOptions(['--port', '9000'], {})).toThrow(/require --transport http/);
    expect(() => parseServerCliOptions(['--transport', 'sse'], {})).toThrow(/stdio or http/);
    expect(() => parseServerCliOptions(['--http', '--path', 'mcp'], {})).toThrow(
      /non-reserved URL path/
    );
    expect(() => parseServerCliOptions(['--http', '--path', '/healthz'], {})).toThrow(
      /non-reserved URL path/
    );
    expect(() => parseServerCliOptions(['--http', '--path', '/HEALTHZ/'], {})).toThrow(
      /non-reserved URL path/
    );
    expect(() => parseServerCliOptions(['--http', '--path', '/'], {})).toThrow(
      /non-reserved URL path/
    );
    expect(() => parseServerCliOptions(['--unknown'], {})).toThrow(/Unknown option/);
  });

  it('documents the required bearer token', () => {
    expect(serverCliUsage()).toContain('VRCHAT_MCP_HTTP_BEARER_TOKEN');
  });
});
