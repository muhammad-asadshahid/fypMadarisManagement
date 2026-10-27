import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email("validation.emailInvalid"),
  password: z.string().regex(/^\d{4}$/, "validation.pin4"),
  contactNumber: z.string().min(7).optional(),
  subjects: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional(),
  salary: z.number().min(0).optional(),
});

export type TeacherSchemaType = z.infer<typeof teacherSchema>;
