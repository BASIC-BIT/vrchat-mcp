import { z } from 'zod';
import { type EvalConfig, resolveOpenAIApiKey } from './eval-config.js';

export interface EvalFactResult {
  fact: string;
  supported: boolean;
  evidence?: string;
}

export interface EvalResult {
  pass: boolean;
  score: number;
  reason: string;
  facts?: EvalFactResult[];
}

export interface EvalRequest {
  toolName: string;
  toolInput: Record<string, unknown>;
  toolOutput: unknown;
  expectedFacts: string[];
}

const EvalResultSchema = z.object({
  pass: z.boolean(),
  score: z.number().min(0).max(1),
  reason: z.string(),
  facts: z
    .array(
      z.object({
        fact: z.string(),
        supported: z.boolean(),
        evidence: z.string().nullable(),
      }),
    )
    .nullable(),
});

const EvalResultJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pass: { type: 'boolean' },
    score: { type: 'number', minimum: 0, maximum: 1 },
    reason: { type: 'string' },
    facts: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          fact: { type: 'string' },
          supported: { type: 'boolean' },
          evidence: { type: ['string', 'null'] },
        },
        required: ['fact', 'supported', 'evidence'],
      },
    },
  },
  required: ['pass', 'score', 'reason', 'facts'],
};

function normalizeBaseUrl(url: string | undefined): string {
  const trimmed = url?.trim();
  const base = trimmed && trimmed.length > 0 ? trimmed : 'https://api.openai.com/v1';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n...<truncated>`;
}

function formatPromptPayload(request: EvalRequest): string {
  const toolInput = JSON.stringify(request.toolInput, null, 2);
  const toolOutput = JSON.stringify(request.toolOutput, null, 2);
  const expectedFacts = request.expectedFacts
    .map((fact, index) => `${index + 1}. ${fact}`)
    .join('\n');

  return [
    `Tool: ${request.toolName}`,
    `Tool input:\n${truncate(toolInput, 4000)}`,
    `Tool output:\n${truncate(toolOutput, 8000)}`,
    `Expected facts:\n${expectedFacts}`,
  ].join('\n\n');
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === 'string') return record.output_text;

  const output = record.output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const chunk of content) {
      if (!chunk || typeof chunk !== 'object') continue;
      const chunkRecord = chunk as Record<string, unknown>;
      const text = chunkRecord.text;
      const type = chunkRecord.type;
      if ((type === 'output_text' || type === 'text') && typeof text === 'string') {
        return text;
      }
    }
  }
  return null;
}

export async function gradeWithOpenAI(
  config: EvalConfig,
  request: EvalRequest,
): Promise<EvalResult> {
  const apiKey = resolveOpenAIApiKey(config);
  const baseUrl = normalizeBaseUrl(config.apiBaseUrl);
  const payload = formatPromptPayload(request);

  const body = {
    model: config.model,
    input: [
      {
        role: 'system',
        content:
          'You are a strict evaluator. Only use the tool output JSON provided. ' +
          'Mark each expected fact as supported only if it is explicitly present. ' +
          'If any expected fact is not supported, pass must be false. ' +
          'Return JSON only.',
      },
      { role: 'user', content: payload },
    ],
    temperature: config.temperature ?? 0,
    max_output_tokens: config.maxOutputTokens ?? 400,
    text: {
      format: {
        type: 'json_schema',
        strict: true,
        name: 'vrchat_eval_result',
        schema: EvalResultJsonSchema,
      },
    },
  };

  const response = await fetch(`${baseUrl}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI response error (${response.status}): ${errorText.slice(0, 2000)}`,
    );
  }

  const raw: unknown = await response.json();
  const outputText = extractOutputText(raw);
  if (!outputText) {
    throw new Error('OpenAI response missing output text.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown JSON parse error';
    throw new Error(`Failed to parse OpenAI JSON output: ${message}`);
  }

  return EvalResultSchema.parse(parsed);
}
