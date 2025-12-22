export interface PipelineEvent {
  type: string;
  content: unknown;
  raw: unknown;
  receivedAt: string;
}

function normalizeMessageData(data: unknown): string | null {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8');
  if (Buffer.isBuffer(data)) return data.toString('utf8');
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer as ArrayBuffer).toString('utf8');
  }
  return null;
}

export function parsePipelineMessage(data: unknown): PipelineEvent | null {
  const text = normalizeMessageData(data);
  if (!text) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Record<string, unknown>;
  const type = record.type;
  if (typeof type !== 'string') return null;
  let content: unknown = record.content;
  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed) {
      try {
        content = JSON.parse(trimmed);
      } catch {
        // leave content as string
      }
    }
  }
  return {
    type,
    content,
    raw: parsed,
    receivedAt: new Date().toISOString(),
  };
}
