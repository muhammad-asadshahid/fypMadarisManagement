import { z } from 'zod';

export const registrationSchema = z
  .object({
    firstName: z.string().min(2, 'validation.nameMin'),
    lastName: z.string().min(2, 'validation.nameMin'),
    fatherName: z.string().min(2, 'validation.fatherNameMin'),
    bFormCnic: z.string().min(13, 'validation.bFormMin'),
    guardianMobile: z.string().min(10, 'validation.contactMin'),
    guardianEmail: z.string().email('validation.emailInvalid'),
    password: z.string().regex(/^\d{4}$/, 'validation.pin4'),
    confirmPassword: z.string(),
    address: z.string().min(5, 'validation.addressMin'),
    city: z.string().min(2, 'validation.cityMin'),
    programType: z.enum([
      'noorani_qaida',
      'nazra_quran',
      'hifz_ul_quran',
      'dars_e_nizami',
      'asri_taleem',
    ]),
    photoUri: z.string().optional(),
    hostelStatus: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.pinMismatch',
    path: ['confirmPassword'],
  });

export type RegistrationSchemaType = z.infer<typeof registrationSchema>;
