import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email("validation.emailInvalid"),
  password: z.string().regex(/^\d{4}$/, "validation.pin4"),
  contactNumber: z.string().min(7).optional(),
  classIds: z.array(z.string()).optional(),
  salary: z.number().min(0).optional(),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  programType: z.enum([
    "noorani_qaida",
    "nazra_quran",
    "hifz_ul_quran",
    "dars_e_nizami",
    "asri_taleem",
  ]),
});

export type TeacherSchemaType = z.infer<typeof teacherSchema>;
