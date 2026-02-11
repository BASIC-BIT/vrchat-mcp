import { readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { z } from 'zod';
import pkg from '../../package.json' with { type: 'json' };
import defaultsJson from './defaults.json' with { type: 'json' };

const DISABLED_ALLOWLIST_VALUES = new Set(['', '0', 'false', 'no', 'off']);

const ConfigBaseSchema = z
  .object({
    api: z
      .object({
        baseUrl: z.string().min(1),
        userAgent: z.string().min(1),
      })
      .strict(),
    spec: z
      .object({
        url: z.string().min(1),
      })
      .strict(),
    logging: z
      .object({
        level: z.string().min(1),
      })
      .strict(),
    auth: z
      .object({
        cookieStore: z.enum(['memory', 'file', 'keychain']),
        cookieFile: z.string().min(1),
      })
      .strict(),
    writes: z
      .object({
        allow: z.boolean(),
      })
      .strict(),
    cache: z
      .object({
        enabled: z.boolean(),
        ttlSeconds: z
          .object({
            friends: z.number().int().positive(),
            userGroups: z.number().int().positive(),
            groups: z.number().int().positive(),
            notifications: z.number().int().positive(),
          })
          .strict(),
        staleTtlSeconds: z
          .object({
            friends: z.number().int().positive(),
            userGroups: z.number().int().positive(),
            groups: z.number().int().positive(),
            notifications: z.number().int().positive(),
          })
          .strict(),
      })
      .strict(),
    pipeline: z
      .object({
        enabled: z.boolean(),
        url: z.string().min(1),
        reconnectMs: z.number().int().positive(),
        changeBuffer: z.number().int().positive(),
        userAgent: z.string(),
      })
      .strict(),
    groups: z
      .object({
        allowlist: z.array(z.string()),
      })
      .strict(),
    rawTools: z
      .object({
        enabled: z.boolean(),
      })
      .strict(),
    generatedReadTools: z
      .object({
        disable: z.boolean(),
      })
      .strict(),
    generatedWriteTools: z
      .object({
        disable: z.boolean(),
      })
      .strict(),
    vrctl: z
      .object({
        enabled: z.boolean(),
        siteUrl: z.string().min(1),
        apiBaseUrl: z.string().min(1),
        userAgent: z.string(),
        requests: z
          .object({
            minIntervalMs: z.number().int().min(0),
            maxRetries: z.number().int().min(0).max(10),
            initialBackoffMs: z.number().int().min(0),
            maxBackoffMs: z.number().int().min(0),
            denyCooldownMs: z.number().int().min(0),
          })
          .strict(),
        auth: z
          .object({
            cookieStore: z.enum(['memory', 'file', 'keychain']),
            cookieFile: z.string().min(1),
          })
          .strict(),
      })
      .strict(),
    vrcx: z
      .object({
        enabled: z.boolean(),
        databasePath: z.string(),
        worldDbPath: z.string(),
      })
      .strict(),
  })
  .strict();

const ConfigSchema = ConfigBaseSchema.transform((config) => {
  const next = structuredClone(config);
  next.api.userAgent = applyTemplate(next.api.userAgent);
  next.pipeline.userAgent = next.pipeline.userAgent?.trim()
    ? applyTemplate(next.pipeline.userAgent)
    : next.api.userAgent;
  next.auth.cookieFile = expandHome(next.auth.cookieFile);
  next.vrctl.userAgent = next.vrctl.userAgent?.trim()
    ? applyTemplate(next.vrctl.userAgent)
    : next.api.userAgent;
  next.vrctl.auth.cookieFile = expandHome(next.vrctl.auth.cookieFile);
  next.vrcx.databasePath = expandHome(next.vrcx.databasePath);
  next.vrcx.worldDbPath = expandHome(next.vrcx.worldDbPath);
  return next;
});

export type Config = z.output<typeof ConfigSchema>;
type ConfigBase = z.infer<typeof ConfigBaseSchema>;
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[] ? U[] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const defaults: Config = ConfigSchema.parse(defaultsJson);

const EnvString = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  return value.trim();
}, z.string().min(1).optional());

const EnvLowercase = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === undefined) return undefined;
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
  }, schema);

const EnvBoolean = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(trimmed)) return true;
  if (['0', 'false', 'no', 'off'].includes(trimmed)) return false;
  return value;
}, z.boolean().optional());

const EnvPositiveInt = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  return Number(trimmed);
}, z.number().int().positive().optional());

const EnvAllowlist = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (DISABLED_ALLOWLIST_VALUES.has(trimmed.toLowerCase())) return [];
  return trimmed
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}, z.array(z.string()).optional());

const EnvSchema = z
  .object({
    VRCHAT_MCP_API_BASE: EnvString,
    VRCHAT_MCP_USER_AGENT: EnvString,
    VRCHAT_MCP_SPEC_URL: EnvString,
    VRCHAT_MCP_LOG_LEVEL: EnvLowercase(z.enum(['debug', 'info', 'warn', 'error']).optional()),
    VRCHAT_MCP_COOKIE_STORE: EnvLowercase(z.enum(['memory', 'file', 'keychain']).optional()),
    VRCHAT_MCP_COOKIE_FILE: EnvString,

    VRCHAT_MCP_VRCTL_ENABLED: EnvBoolean,
    VRCHAT_MCP_VRCTL_SITE_URL: EnvString,
    VRCHAT_MCP_VRCTL_API_BASE_URL: EnvString,
    VRCHAT_MCP_VRCTL_USER_AGENT: EnvString,
    VRCHAT_MCP_VRCTL_COOKIE_STORE: EnvLowercase(z.enum(['memory', 'file', 'keychain']).optional()),
    VRCHAT_MCP_VRCTL_COOKIE_FILE: EnvString,
    VRCHAT_MCP_ALLOW_WRITES: EnvBoolean,
    VRCHAT_MCP_CACHE_ENABLED: EnvBoolean,
    VRCHAT_MCP_CACHE_TTL_FRIENDS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_STALE_TTL_FRIENDS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_TTL_USER_GROUPS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_STALE_TTL_USER_GROUPS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_TTL_GROUPS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_STALE_TTL_GROUPS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_TTL_NOTIFICATIONS: EnvPositiveInt,
    VRCHAT_MCP_CACHE_STALE_TTL_NOTIFICATIONS: EnvPositiveInt,
    VRCHAT_MCP_PIPELINE_ENABLED: EnvBoolean,
    VRCHAT_MCP_PIPELINE_URL: EnvString,
    VRCHAT_MCP_PIPELINE_RECONNECT_MS: EnvPositiveInt,
    VRCHAT_MCP_PIPELINE_CHANGE_BUFFER: EnvPositiveInt,
    VRCHAT_MCP_GROUP_ALLOWLIST: EnvAllowlist,
    VRCHAT_MCP_ENABLE_RAW_CALL: EnvBoolean,
    VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS: EnvBoolean,
    VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS: EnvBoolean,
  })
  .strict();

type EnvValues = z.infer<typeof EnvSchema>;
const ENV_KEYS = Object.keys(EnvSchema.shape) as (keyof EnvValues)[];

let cachedBase: ConfigBase | null = null;
let cachedConfigPath: string | null = null;

function expandHome(value: string): string {
  if (!value) return value;
  if (value.startsWith('~/') || value === '~') {
    const rest = value.length > 2 ? value.slice(2) : '';
    return path.join(os.homedir(), rest);
  }
  return value;
}

function resolveConfigFilePath(): string | null {
  const raw = process.env.VRCHAT_MCP_CONFIG_FILE;
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
}

function readConfigFile(filePath: string | null): DeepPartial<ConfigBase> {
  if (!filePath) return {};
  try {
    const content = readFileSync(filePath, 'utf8');
    const parsed: unknown = JSON.parse(content);
    if (!isPlainObject(parsed)) {
      throw new Error('Config file must contain a JSON object.');
    }
    return parsed as DeepPartial<ConfigBase>;
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') return {};
    throw err;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeConfig<T>(base: T, override: DeepPartial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override ?? base) as T;
  }
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const existing = (base as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      result[key] = value.slice();
    } else if (isPlainObject(value) && isPlainObject(existing)) {
      result[key] = mergeConfig(existing, value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

function applyTemplate(value: string): string {
  return value.replace('{version}', pkg.version ?? '0.0.0');
}

function applyApiEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_API_BASE) {
    overrides.api = { ...overrides.api, baseUrl: env.VRCHAT_MCP_API_BASE };
  }
  if (env.VRCHAT_MCP_USER_AGENT) {
    overrides.api = { ...overrides.api, userAgent: env.VRCHAT_MCP_USER_AGENT };
  }
}

function applySpecEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_SPEC_URL) {
    overrides.spec = { ...overrides.spec, url: env.VRCHAT_MCP_SPEC_URL };
  }
}

function applyLoggingEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_LOG_LEVEL) {
    overrides.logging = { ...overrides.logging, level: env.VRCHAT_MCP_LOG_LEVEL };
  }
}

function applyAuthEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_COOKIE_STORE) {
    overrides.auth = { ...overrides.auth, cookieStore: env.VRCHAT_MCP_COOKIE_STORE };
  }
  if (env.VRCHAT_MCP_COOKIE_FILE) {
    overrides.auth = { ...overrides.auth, cookieFile: env.VRCHAT_MCP_COOKIE_FILE };
  }
}

function applyVrctlEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_VRCTL_ENABLED !== undefined) {
    overrides.vrctl = { ...overrides.vrctl, enabled: env.VRCHAT_MCP_VRCTL_ENABLED };
  }
  if (env.VRCHAT_MCP_VRCTL_SITE_URL) {
    overrides.vrctl = { ...overrides.vrctl, siteUrl: env.VRCHAT_MCP_VRCTL_SITE_URL };
  }
  if (env.VRCHAT_MCP_VRCTL_API_BASE_URL) {
    overrides.vrctl = { ...overrides.vrctl, apiBaseUrl: env.VRCHAT_MCP_VRCTL_API_BASE_URL };
  }
  if (env.VRCHAT_MCP_VRCTL_USER_AGENT) {
    overrides.vrctl = { ...overrides.vrctl, userAgent: env.VRCHAT_MCP_VRCTL_USER_AGENT };
  }
  if (env.VRCHAT_MCP_VRCTL_COOKIE_STORE) {
    overrides.vrctl = {
      ...overrides.vrctl,
      auth: { ...overrides.vrctl?.auth, cookieStore: env.VRCHAT_MCP_VRCTL_COOKIE_STORE },
    };
  }
  if (env.VRCHAT_MCP_VRCTL_COOKIE_FILE) {
    overrides.vrctl = {
      ...overrides.vrctl,
      auth: { ...overrides.vrctl?.auth, cookieFile: env.VRCHAT_MCP_VRCTL_COOKIE_FILE },
    };
  }
}

function applyWriteEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_ALLOW_WRITES !== undefined) {
    overrides.writes = { allow: env.VRCHAT_MCP_ALLOW_WRITES };
  }
}

function applyCacheEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  const cacheOverrides: Partial<ConfigBase['cache']> = {};
  const ttlOverrides: Partial<ConfigBase['cache']['ttlSeconds']> = {};
  const staleOverrides: Partial<ConfigBase['cache']['staleTtlSeconds']> = {};

  if (env.VRCHAT_MCP_CACHE_ENABLED !== undefined) {
    cacheOverrides.enabled = env.VRCHAT_MCP_CACHE_ENABLED;
  }
  if (env.VRCHAT_MCP_CACHE_TTL_FRIENDS !== undefined)
    ttlOverrides.friends = env.VRCHAT_MCP_CACHE_TTL_FRIENDS;
  if (env.VRCHAT_MCP_CACHE_TTL_USER_GROUPS !== undefined)
    ttlOverrides.userGroups = env.VRCHAT_MCP_CACHE_TTL_USER_GROUPS;
  if (env.VRCHAT_MCP_CACHE_TTL_GROUPS !== undefined)
    ttlOverrides.groups = env.VRCHAT_MCP_CACHE_TTL_GROUPS;
  if (env.VRCHAT_MCP_CACHE_TTL_NOTIFICATIONS !== undefined)
    ttlOverrides.notifications = env.VRCHAT_MCP_CACHE_TTL_NOTIFICATIONS;

  if (env.VRCHAT_MCP_CACHE_STALE_TTL_FRIENDS !== undefined)
    staleOverrides.friends = env.VRCHAT_MCP_CACHE_STALE_TTL_FRIENDS;
  if (env.VRCHAT_MCP_CACHE_STALE_TTL_USER_GROUPS !== undefined)
    staleOverrides.userGroups = env.VRCHAT_MCP_CACHE_STALE_TTL_USER_GROUPS;
  if (env.VRCHAT_MCP_CACHE_STALE_TTL_GROUPS !== undefined)
    staleOverrides.groups = env.VRCHAT_MCP_CACHE_STALE_TTL_GROUPS;
  if (env.VRCHAT_MCP_CACHE_STALE_TTL_NOTIFICATIONS !== undefined)
    staleOverrides.notifications = env.VRCHAT_MCP_CACHE_STALE_TTL_NOTIFICATIONS;

  if (Object.keys(ttlOverrides).length > 0) {
    cacheOverrides.ttlSeconds = ttlOverrides as ConfigBase['cache']['ttlSeconds'];
  }
  if (Object.keys(staleOverrides).length > 0) {
    cacheOverrides.staleTtlSeconds = staleOverrides as ConfigBase['cache']['staleTtlSeconds'];
  }
  if (Object.keys(cacheOverrides).length > 0) {
    overrides.cache = cacheOverrides as ConfigBase['cache'];
  }
}

function applyPipelineEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  const pipelineOverrides: Partial<ConfigBase['pipeline']> = {};
  if (env.VRCHAT_MCP_PIPELINE_ENABLED !== undefined) {
    pipelineOverrides.enabled = env.VRCHAT_MCP_PIPELINE_ENABLED;
  }
  if (env.VRCHAT_MCP_PIPELINE_URL) {
    pipelineOverrides.url = env.VRCHAT_MCP_PIPELINE_URL;
  }
  if (env.VRCHAT_MCP_PIPELINE_RECONNECT_MS !== undefined) {
    pipelineOverrides.reconnectMs = env.VRCHAT_MCP_PIPELINE_RECONNECT_MS;
  }
  if (env.VRCHAT_MCP_PIPELINE_CHANGE_BUFFER !== undefined) {
    pipelineOverrides.changeBuffer = env.VRCHAT_MCP_PIPELINE_CHANGE_BUFFER;
  }
  if (Object.keys(pipelineOverrides).length > 0) {
    overrides.pipeline = pipelineOverrides as ConfigBase['pipeline'];
  }
}

function applyGroupEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_GROUP_ALLOWLIST !== undefined) {
    overrides.groups = { allowlist: env.VRCHAT_MCP_GROUP_ALLOWLIST };
  }
}

function applyToolingEnvOverrides(overrides: DeepPartial<ConfigBase>, env: EnvValues): void {
  if (env.VRCHAT_MCP_ENABLE_RAW_CALL !== undefined) {
    overrides.rawTools = { enabled: env.VRCHAT_MCP_ENABLE_RAW_CALL };
  }

  if (env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS !== undefined) {
    overrides.generatedReadTools = {
      ...overrides.generatedReadTools,
      disable: env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS,
    };
  }

  if (env.VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS !== undefined) {
    overrides.generatedWriteTools = {
      ...overrides.generatedWriteTools,
      disable: env.VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS,
    };
  }
}

function readEnvOverrides(): {
  overrides: DeepPartial<ConfigBase>;
} {
  const envInput: Partial<Record<keyof EnvValues, string | undefined>> = {};
  for (const key of ENV_KEYS) {
    envInput[key] = process.env[key];
  }
  let env: EnvValues;
  try {
    env = EnvSchema.parse(envInput);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues.map((issue) => issue.path.join('.') || 'env');
      throw new Error(`Invalid environment variables: ${issues.join(', ')}`);
    }
    throw err;
  }

  const overrides: DeepPartial<ConfigBase> = {};

  applyApiEnvOverrides(overrides, env);
  applySpecEnvOverrides(overrides, env);
  applyLoggingEnvOverrides(overrides, env);
  applyAuthEnvOverrides(overrides, env);
  applyVrctlEnvOverrides(overrides, env);
  applyWriteEnvOverrides(overrides, env);
  applyCacheEnvOverrides(overrides, env);
  applyPipelineEnvOverrides(overrides, env);
  applyGroupEnvOverrides(overrides, env);
  applyToolingEnvOverrides(overrides, env);

  return {
    overrides,
  };
}

function loadBaseConfig(): ConfigBase {
  const configPath = resolveConfigFilePath();
  if (cachedBase && cachedConfigPath === configPath) return cachedBase;
  const fileConfig = readConfigFile(configPath);
  cachedBase = mergeConfig(defaults, fileConfig);
  cachedConfigPath = configPath;
  return cachedBase;
}

export function getConfig(): Config {
  const base = loadBaseConfig();
  const { overrides } = readEnvOverrides();
  const merged = mergeConfig(base, overrides);
  return ConfigSchema.parse(merged);
}

export function resetConfigCacheForTest(): void {
  cachedBase = null;
  cachedConfigPath = null;
}
