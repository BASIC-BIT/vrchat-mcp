import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { clearSpecCache } from '../../src/core/spec.js';
import { getOperationDetails } from '../../src/core/operationDetails.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

describe('operation details', () => {
  const prevSpec = process.env.VRCHAT_MCP_SPEC_URL;

  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
    clearSpecCache();
  });

  afterEach(() => {
    if (prevSpec === undefined) {
      delete process.env.VRCHAT_MCP_SPEC_URL;
    } else {
      process.env.VRCHAT_MCP_SPEC_URL = prevSpec;
    }
    clearSpecCache();
  });

  it('returns path params and resolved request body schema', async () => {
    const details = await getOperationDetails('updateUser');

    expect(details).toMatchObject({
      operationId: 'updateUser',
      method: 'PUT',
      path: '/users/{userId}',
      generatedToolStatus: 'curated_replacement',
      curatedToolName: 'vrchat_profile_update',
    });
    expect(details.generatedToolName).toBeUndefined();
    expect(details.parameters).toEqual([
      expect.objectContaining({
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      }),
    ]);
    expect(details.requestBody?.required).toBe(true);
    expect(details.requestBody?.contentTypes).toEqual(['application/json']);
    expect(details.requestBody?.schemaRef).toBe('#/components/schemas/UpdateUserRequest');

    const schema = details.requestBody?.schema as
      | { type?: unknown; properties?: Record<string, unknown> }
      | undefined;
    expect(schema?.type).toBe('object');
    expect(schema?.properties?.bio).toEqual({ type: 'string' });
  });

  it('throws for unknown operationIds', async () => {
    await expect(getOperationDetails('nope')).rejects.toThrow('Unknown operationId: nope');
  });

  it('reports generated availability and policy blocks', async () => {
    await expect(getOperationDetails('searchUsers')).resolves.toMatchObject({
      generatedToolStatus: 'available',
      generatedToolName: 'vrchat_read',
    });

    const blocked = await getOperationDetails('getGroupAnnouncements');
    expect(blocked.generatedToolStatus).toBe('blocked_by_policy');
    expect(blocked.blockedReason).toContain('deprecated and unsafe');
  });
});
