import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
