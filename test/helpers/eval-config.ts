import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const EvalExpectationsSchema = z
  .object({
    friendName: z.string().min(1).optional(),
    worldId: z.string().min(1).optional(),
    worldName: z.string().min(1).optional(),
    groupId: z.string().min(1).optional(),
    groupName: z.string().min(1).optional(),
    groupMemberName: z.string().min(1).optional(),
    avatarId: z.string().min(1).optional(),
    avatarName: z.string().min(1).optional(),
    avatarNameExact: z.string().min(1).optional(),
    favoriteWorldId: z.string().min(1).optional(),
  })
  .optional();

const EvalConfigSchema = z.object({
  openaiApiKey: z.string().min(1).optional(),
  openaiApiKeyEnv: z.string().min(1).optional(),
  model: z.string().min(1),
  apiBaseUrl: z.string().min(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  debug: z.boolean().optional(),
  expectations: EvalExpectationsSchema,
});

export type EvalConfig = z.infer<typeof EvalConfigSchema>;

const EVAL_CONFIG_PATH = new URL('../fixtures/evals.live.json', import.meta.url);

export function loadEvalConfig(): EvalConfig | null {
  const filePath = fileURLToPath(EVAL_CONFIG_PATH);
  if (!existsSync(filePath)) return null;
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  return EvalConfigSchema.parse(raw);
}

export function resolveOpenAIApiKey(config: EvalConfig): string {
  const direct = config.openaiApiKey?.trim();
  if (direct) return direct;
  const envName = config.openaiApiKeyEnv ?? 'OPENAI_API_KEY';
  const envValue = process.env[envName];
  const trimmedEnv = envValue?.trim();
  if (trimmedEnv) return trimmedEnv;
  throw new Error(
    `OpenAI API key missing. Set openaiApiKey in eval config or provide ${envName}.`,
  );
}
