import { z } from 'zod';

export const StatusSchema = z.enum(['active', 'ask me', 'busy', 'join me', 'offline']);
export const StatusColorSchema = z.enum(['blue', 'green', 'orange', 'red']);

export const StatusGetOutputSchema = z.object({
  userId: z.string().optional(),
  status: StatusSchema.optional(),
  statusDescription: z.string().optional(),
});

export const StatusSetInputSchema = z.object({
  status: StatusSchema.optional(),
  color: StatusColorSchema.optional(),
  description: z.string().optional(),
  userId: z.string().optional(),
});

export const StatusSetOutputSchema = z.object({
  userId: z.string(),
  status: StatusSchema,
  statusDescription: z.string().optional(),
});

export type StatusValue = z.infer<typeof StatusSchema>;
export type StatusColor = z.infer<typeof StatusColorSchema>;
export type StatusGetOutput = z.infer<typeof StatusGetOutputSchema>;
export type StatusSetInput = z.infer<typeof StatusSetInputSchema>;
export type StatusSetOutput = z.infer<typeof StatusSetOutputSchema>;
