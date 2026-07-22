import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  password: z.string().min(6, 'validation.passwordMin'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
