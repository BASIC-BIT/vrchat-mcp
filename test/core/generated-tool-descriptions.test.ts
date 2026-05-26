import { describe, expect, it } from 'vitest';
import { buildGeneratedToolDescription } from '../../src/core/generatedToolDescriptions.js';

describe('generated tool descriptions', () => {
  it('uses a short first-line summary', () => {
    expect(
      buildGeneratedToolDescription('read', 'getWidget', {
        summary: 'Get Widget\nFull details follow.',
      })
    ).toBe('Read VRChat API: Get Widget.');
  });

  it('falls back to the operation id', () => {
    expect(buildGeneratedToolDescription('write', 'createWidget', {})).toBe(
      'Write VRChat API operation: createWidget.'
    );
  });

  it('truncates long summaries', () => {
    const description = buildGeneratedToolDescription('write', 'createWidget', {
      summary:
        'Create a widget with a very long OpenAPI summary that would otherwise waste tool-list context in clients.',
    });

    expect(description.length).toBeLessThanOrEqual(120);
    expect(description).toBe(
      'Write VRChat API: Create a widget with a very long OpenAPI summary that would otherwise waste tool-list context...'
    );
  });
});
