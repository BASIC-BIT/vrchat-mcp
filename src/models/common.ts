import { z } from 'zod';

// Keep tool output schemas compact when the payload is a raw VRChat API object.
export const ApiObjectSchema = z.record(z.string(), z.unknown());
