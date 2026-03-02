import { z } from 'zod';

export const VrctlAuthStatusSchema = z.object({
  loggedIn: z.boolean(),
  verified: z.boolean(),
  hasSessionCookie: z.boolean(),
  message: z.string().optional(),
});
