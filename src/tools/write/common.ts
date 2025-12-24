import { textContent } from '../../utils/toolResponses.js';

export function writeToolResponse(
  result: { data?: unknown; url?: string; status?: number; headers?: Record<string, string>; dryRun?: boolean },
  includeMeta?: boolean,
) {
  const payload = includeMeta ? result : { data: result.data };
  const text = JSON.stringify(payload, null, 2);
  return {
    content: textContent(text),
    structuredContent: result as unknown as Record<string, unknown>,
  };
}
