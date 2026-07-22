import type { ProgramType } from '@/types';

export const PROGRAM_TYPES: ProgramType[] = [
  'noorani_qaida',
  'nazra_quran',
  'hifz_ul_quran',
  'dars_e_nizami',
  'asri_taleem',
];

export const PROGRAM_LABEL_KEYS: Record<ProgramType, string> = {
  noorani_qaida: 'programs.nooraniQaida',
  nazra_quran: 'programs.nazraQuran',
  hifz_ul_quran: 'programs.hifzUlQuran',
  dars_e_nizami: 'programs.darsENizami',
  asri_taleem: 'programs.asriTaleem',
};
