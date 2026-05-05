export interface TextContent {
  type: 'text';
  text: string;
}

export function textContent(text: string): TextContent[] {
  return [{ type: 'text', text }];
}

export function toolError(message: string, payload?: Record<string, unknown>) {
  const body = payload ?? { error: message };
  const text = payload ? JSON.stringify(body, null, 2) : message;
  return {
    isError: true,
    content: textContent(text),
  };
}
