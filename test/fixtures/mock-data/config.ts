import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';

type ConfigSchema = z.infer<typeof schemas.APIConfig>;

export const config: ConfigSchema = mockSchema('APIConfig', {
  clientApiKey: 'mock-key',
});

export const systemTime = '2025-12-22T00:00:00Z';
