interface GeneratedDescriptionSource {
  summary?: unknown;
  description?: unknown;
}

const MAX_SUMMARY_LENGTH = 96;

function firstTextLine(value: unknown): string {
  return typeof value === 'string' ? value.split('\n')[0].replace(/\s+/g, ' ').trim() : '';
}

function trimSentence(value: string): string {
  return value.replace(/[.?!:;]+$/g, '').trim();
}

function truncate(value: string): string {
  if (value.length <= MAX_SUMMARY_LENGTH) return value;
  const truncated = value.slice(0, MAX_SUMMARY_LENGTH - 1).trimEnd();
  const lastSpace = truncated.lastIndexOf(' ');
  const base = lastSpace >= 40 ? truncated.slice(0, lastSpace) : truncated;
  return `${trimSentence(base)}...`;
}

function sentence(value: string): string {
  return value.endsWith('...') ? value : `${value}.`;
}

export function buildGeneratedToolDescription(
  kind: 'read' | 'write',
  operationId: string,
  op: GeneratedDescriptionSource
): string {
  const prefix = kind === 'read' ? 'Read VRChat API' : 'Write VRChat API';
  const summary = trimSentence(firstTextLine(op.summary) || firstTextLine(op.description));

  if (summary) return `${prefix}: ${sentence(truncate(summary))}`;
  return `${prefix} operation: ${operationId}.`;
}
