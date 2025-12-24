import {
  isJsonObject,
  parseJsonText,
  type JsonObject,
  type JsonValue,
} from '../../utils/json.js';

export interface PipelineEvent {
  type: string;
  content: JsonValue;
  raw: JsonObject;
  receivedAt: string;
}

export type PipelineMessageData = string | ArrayBuffer | ArrayBufferView | Buffer;

function normalizeMessageData(data: PipelineMessageData): string | null {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8');
  if (Buffer.isBuffer(data)) return data.toString('utf8');
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer as ArrayBuffer).toString('utf8');
  }
  return null;
}

export function parsePipelineMessage(
  data: PipelineMessageData,
): PipelineEvent | null {
  const text = normalizeMessageData(data);
  if (!text) return null;
  const parsed = parseJsonText(text);
  if (!parsed || !isJsonObject(parsed)) return null;
  const type = parsed.type;
  if (typeof type !== 'string') return null;
  let content: JsonValue =
    typeof parsed.content === 'undefined' ? null : parsed.content;
  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed) {
      const parsedContent = parseJsonText(trimmed);
      if (parsedContent !== null) content = parsedContent;
    }
  }
  return {
    type,
    content,
    raw: parsed,
    receivedAt: new Date().toISOString(),
  };
}
