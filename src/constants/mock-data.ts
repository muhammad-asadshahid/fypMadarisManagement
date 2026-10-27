import type { Class, Student, User } from '@/types';

export const MOCK_CLASSES: Class[] = [
  { id: 'cls-1', name: 'Hifz Class A', programType: 'hifz_ul_quran' },
  { id: 'cls-2', name: 'Nazra Class B', programType: 'nazra_quran' },
  { id: 'cls-3', name: 'Dars-e-Nizami Year 1', programType: 'dars_e_nizami' },
  { id: 'cls-4', name: 'Asri Taleem Grade 5', programType: 'asri_taleem' },
  { id: 'cls-5', name: 'Noorani Qaida Beginners', programType: 'noorani_qaida' },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    name: 'Ahmed Ali',
    fatherName: 'Muhammad Ali',
    dateOfBirth: '2012-05-15',
    address: 'House 12, Street 4, Lahore',
    contactNumber: '03001234567',
    admissionDate: '2024-01-10',
    programType: 'hifz_ul_quran',
    classId: 'cls-1',
    hostelStatus: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'stu-2',
    name: 'Hassan Khan',
    fatherName: 'Imran Khan',
    dateOfBirth: '2014-08-22',
    address: 'Village Kotli, Rawalpindi',
    contactNumber: '03009876543',
    admissionDate: '2024-03-01',
    programType: 'nazra_quran',
    classId: 'cls-2',
    hostelStatus: false,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z',
  },
  {
    id: 'stu-3',
    name: 'Usman Raza',
    fatherName: 'Tariq Raza',
    dateOfBirth: '2010-11-03',
    address: 'Mohalla Islamabad, Faisalabad',
    contactNumber: '03111222333',
    admissionDate: '2023-09-15',
    programType: 'dars_e_nizami',
    classId: 'cls-3',
    hostelStatus: true,
    createdAt: '2023-09-15T08:00:00Z',
    updatedAt: '2023-09-15T08:00:00Z',
  },
];

export const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@mms.com': {
    password: 'admin123',
    user: {
      id: 'usr-admin',
      email: 'admin@mms.com',
      fullName: 'System Administrator',
      role: 'admin',
    },
  },
  'teacher@mms.com': {
    password: '1234',
    user: {
      id: 'usr-tch-1',
      email: 'teacher@mms.com',
      fullName: 'Maulana Abdullah',
      role: 'teacher',
      teacherId: 'tch-1',
    },
  },
  'parent@mms.com': {
    password: 'parent123',
    user: {
      id: 'usr-parent',
      email: 'parent@mms.com',
      fullName: 'Muhammad Ali',
      role: 'parent',
      parentStudentIds: ['stu-1'],
    },
  },
};

// Students with active fee dues or hostel allocation (for delete prevention demo)
export const STUDENTS_WITH_FEE_DUES = new Set(['stu-1']);
export const STUDENTS_WITH_HOSTEL = new Set(['stu-1', 'stu-3']);
