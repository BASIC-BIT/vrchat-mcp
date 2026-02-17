import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const StatusSchema = schemas.UserStatus;
export const StatusColorSchema = z.enum(['blue', 'green', 'orange', 'red']);

export const STATUS_FROM_COLOR: Record<
  z.infer<typeof StatusColorSchema>,
  z.infer<typeof StatusSchema>
> = {
  blue: 'active',
  green: 'join me',
  orange: 'ask me',
  red: 'busy',
};

export const StatusGetOutputSchema = z.object({
  userId: schemas.UserID.optional(),
  status: StatusSchema.optional(),
  statusDescription: z.string().optional(),
});

export const StatusSetInputSchema = z
  .object({
    status: StatusSchema.optional(),
    color: StatusColorSchema.optional(),
    description: z.string().optional(),
    userId: schemas.UserID.optional(),
  })
  .superRefine((input, ctx) => {
    const hasStatus = typeof input.status === 'string';
    const hasColor = typeof input.color === 'string';

    if (!hasStatus && !hasColor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide status or color.',
        path: ['status'],
      });
      return;
    }

    if (input.status && input.color) {
      const mappedStatus = STATUS_FROM_COLOR[input.color];
      if (input.status !== mappedStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Color "${input.color}" maps to status "${mappedStatus}", but status was "${input.status}".`,
          path: ['color'],
        });
      }
    }
  });

export const StatusSetOutputSchema = z.object({
  userId: schemas.UserID,
  status: StatusSchema,
  statusDescription: z.string().optional(),
});

export type StatusValue = z.infer<typeof StatusSchema>;
export type StatusColor = z.infer<typeof StatusColorSchema>;
export type StatusGetOutput = z.infer<typeof StatusGetOutputSchema>;
export type StatusSetInput = z.infer<typeof StatusSetInputSchema>;
export type StatusSetOutput = z.infer<typeof StatusSetOutputSchema>;
