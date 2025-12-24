import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

export const readOnlyToolAnnotations: ToolAnnotations = {
  readOnlyHint: true,
};

export const writeToolAnnotations: ToolAnnotations = {
  readOnlyHint: false,
};

export const destructiveToolAnnotations: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
};

export function annotationsForWriteMethod(method: string): ToolAnnotations {
  const normalized = method.toLowerCase();
  if (normalized === 'delete') return destructiveToolAnnotations;
  return writeToolAnnotations;
}
