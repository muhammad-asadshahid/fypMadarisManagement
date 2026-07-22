import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(2, 'validation.nameMin'),
  fatherName: z.string().min(2, 'validation.fatherNameMin'),
  dateOfBirth: z.string().min(1, 'validation.dateRequired'),
  address: z.string().min(5, 'validation.addressMin'),
  contactNumber: z.string().min(10, 'validation.contactMin'),
  admissionDate: z.string().min(1, 'validation.dateRequired'),
  programType: z.enum([
    'noorani_qaida',
    'nazra_quran',
    'hifz_ul_quran',
    'dars_e_nizami',
    'asri_taleem',
  ]),
  classId: z.string().min(1, 'validation.classRequired'),
  hostelStatus: z.boolean(),
  photoUri: z.string().optional(),
});

export type StudentSchemaType = z.infer<typeof studentSchema>;
