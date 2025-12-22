import { getConfig } from '../config/index.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configLevel = getConfig().logging.level.toLowerCase();
const currentLevel: LogLevel = ['debug', 'info', 'warn', 'error'].includes(configLevel)
  ? (configLevel as LogLevel)
  : 'info';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (levelOrder[level] < levelOrder[currentLevel]) return;
  const payload = meta ? { message, ...meta } : { message };
  const line = `[${level.toUpperCase()}] ${new Date().toISOString()} ${JSON.stringify(payload)}`;
  // Never write to stdout; MCP uses stdout for protocol.
  console.error(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
