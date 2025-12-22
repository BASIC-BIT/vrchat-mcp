import { z } from 'zod';

export const AuthStatusSchema = z.object({ loggedIn: z.boolean() });
