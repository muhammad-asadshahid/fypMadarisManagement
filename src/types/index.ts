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

export interface ClassWithStudents extends Class {
  students: Student[];
}

export interface Student {
  id: string;
  /** Full display name. When created from an approved registration, this is
   *  synthesized from firstName + lastName. */
  name: string;
  /** Split name parts (kept in sync with `name` for a common shape with Registration). */
  firstName?: string;
  lastName?: string;
  fatherName: string;
  dateOfBirth: string;
  address: string;
  contactNumber: string;
  admissionDate: string;
  programType: ProgramType;
  classId: string;
  hostelStatus: boolean;
  photoUri?: string;
  email?: string;
  password?: string;
  bFormCnic?: string;
  city?: string;
  guardianEmail?: string;
  guardianMobile?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email?: string;
  password?: string;
  subjects: string[];
  contactNumber: string;
  salary: number;
  classIds?: string[];
}

export interface TeacherFormData {
  name: string;
  email?: string;
  password?: string;
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

export interface MealPlanDay {
  id: string;
  breakfast: string;
  lunch: string;
  dinner: string;
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
  firstName?: string;
  lastName?: string;
  fatherName: string;
  dateOfBirth: string;
  address: string;
  contactNumber: string;
  admissionDate: string;
  programType: ProgramType;
  classId: string;
  hostelStatus: boolean;
  photoUri?: string;
  email?: string;
  password?: string;
  bFormCnic?: string;
  city?: string;
  guardianEmail?: string;
  guardianMobile?: string;
}

export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  bFormCnic: string;
  guardianMobile: string;
  guardianEmail: string;
  password: string;
  address: string;
  city: string;
  programType: ProgramType;
  photoUri?: string;
  hostelStatus?: boolean;
  status: RegistrationStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  bFormCnic: string;
  guardianMobile: string;
  guardianEmail: string;
  password: string;
  address: string;
  city: string;
  programType: ProgramType;
  photoUri?: string;
  hostelStatus?: boolean;
}

export interface StudentDeletionCheck {
  canDelete: boolean;
  reasons: string[];
}

// ===========================================================================
// Attendance (FR #4)
// ===========================================================================

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  teacherId: string;
  note?: string;
  markedAt: string;
}

export interface AttendanceMarkInput {
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

// ===========================================================================
// Hifz (FR #5)
// ===========================================================================

export interface HifzRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  sabaq: string; // new lesson
  sabaqi: string; // revision
  manzil: string; // manzil / recited portion
  mistakeCount: number;
  grade: HifzGrade;
  teacherId: string;
  note?: string;
  createdAt: string;
}

export interface HifzUpdateInput {
  studentId: string;
  date: string;
  sabaq: string;
  sabaqi: string;
  manzil: string;
  mistakeCount: number;
  grade: HifzGrade;
  note?: string;
}

// ===========================================================================
// Nazra (FR #6)
// ===========================================================================

export interface NazraRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  pageFrom: number;
  pageTo: number;
  fluency: number; // 0-100
  remarks?: string;
  completionPercentage: number; // 0-100
  teacherId: string;
  createdAt: string;
}

export interface NazraUpdateInput {
  studentId: string;
  date: string;
  pageFrom: number;
  pageTo: number;
  fluency: number;
  remarks?: string;
  completionPercentage: number;
}

// ===========================================================================
// Dars-e-Nizami (FR #7)
// ===========================================================================

export interface Kitab {
  id: string;
  name: string;
  totalChapters: number;
}

export interface DarsProgressRecord {
  id: string;
  studentId: string;
  kitabId: string;
  date: string; // YYYY-MM-DD
  chaptersCompleted: number;
  pagesCovered: number;
  takrarAttendance: boolean;
  teacherId: string;
  note?: string;
  createdAt: string;
}

export interface DarsUpdateInput {
  studentId: string;
  kitabId: string;
  date: string;
  chaptersCompleted: number;
  pagesCovered: number;
  takrarAttendance: boolean;
  note?: string;
}

// ===========================================================================
// Asri Taleem (FR #8)
// ===========================================================================

export interface Subject {
  id: string;
  name: string;
  programType: ProgramType;
}

export interface MarksRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  examType: string; // mid_term | final
  marksObtained: number;
  totalMarks: number;
  date: string;
  teacherId: string;
  createdAt: string;
}

export interface MarksInput {
  studentId: string;
  subjectId: string;
  classId: string;
  examType: string;
  marksObtained: number;
  totalMarks: number;
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  fromClassId: string;
  toClassId: string;
  promotedAt: string;
  promotedBy: string;
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  percentage: number;
  passed: boolean;
  subjectResults: { subjectName: string; percentage: number }[];
}

// ===========================================================================
// Reports (FR #14)
// ===========================================================================

export interface ReportSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  presentToday: number;
  absentToday: number;
  totalActiveHostelStudents: number;
  totalDonations: number;
  totalFeesCollected: number;
  totalSalariesPaid: number;
}
