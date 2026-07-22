export type UserRole = "admin" | "teacher" | "parent";

export type ProgramType =
  | "noorani_qaida"
  | "nazra_quran"
  | "hifz_ul_quran"
  | "dars_e_nizami"
  | "asri_taleem";

export type AttendanceStatus = "present" | "absent" | "leave";

export type HifzGrade =
  | "mumtaz"
  | "jayyid_jiddan"
  | "jayyid"
  | "needs_improvement";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  teacherId?: string;
  parentStudentIds?: string[];
}

export interface Class {
  id: string;
  name: string;
  programType: ProgramType;
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  address: string;
  contactNumber: string;
  admissionDate: string;
  programType: ProgramType;
  classId: string;
  hostelStatus: boolean;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  contactNumber: string;
  salary: number;
  classIds?: string[];
}

export interface TeacherFormData {
  name: string;
  subjects?: string[];
  classIds?: string[];
  contactNumber?: string;
  salary?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  createdAt: string;
}

export interface HostelAllocation {
  id: string;
  studentId: string;
  roomId: string;
  assignedAt: string;
}

export interface MealRecord {
  id: string;
  studentId: string;
  roomId: string;
  date: string;
  mealType: string;
  notes?: string;
}

export interface VisitorRecord {
  id: string;
  studentId: string;
  visitorName: string;
  visitDate: string;
  notes?: string;
}

export interface Donor {
  id: string;
  name: string;
  contactNumber?: string;
  category: string;
}

export interface Donation {
  id: string;
  donorId: string;
  amount: number;
  category: string;
  month?: string;
  date: string;
  note?: string;
}

export interface ZakatDistribution {
  id: string;
  donationId: string;
  studentId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SalaryPayment {
  id: string;
  teacherId: string;
  amount: number;
  month: string;
  date: string;
  note?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  paid: boolean;
  date: string;
  note?: string;
}

export interface StudentFormData {
  name: string;
  fatherName: string;
  dateOfBirth: string;
  address: string;
  contactNumber: string;
  admissionDate: string;
  programType: ProgramType;
  classId: string;
  hostelStatus: boolean;
  photoUri?: string;
}

export interface StudentDeletionCheck {
  canDelete: boolean;
  reasons: string[];
}
