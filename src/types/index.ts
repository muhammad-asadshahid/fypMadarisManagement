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

export interface ClassStudent {
  id: string;
  name: string;
  fatherName: string;
}

export interface Class {
  id: string;
  name: string;
  programType: ProgramType;
  studentCount: number;
  students: ClassStudent[];
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
  /** Asri Taleem level (1, 2, ...). Students of different levels can share one class. */
  grade?: number;
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

export interface FeePayment {
  id: string;
  studentId: string;
  /** Month the fee belongs to, formatted "YYYY-MM" (e.g. "2026-10"). */
  month: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
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
  grade?: number;
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
// Hifz & Nazra — class-wide lesson log (FR #5, #6)
// ===========================================================================

/** Sabaq/Sabaqi/Manzil are logged once per class per day and shared by every
 *  student of that class. */
export interface LessonLog {
  id: string; // `ll-${classId}-${date}` (deterministic upsert)
  classId: string;
  programType: ProgramType; // hifz_ul_quran | nazra_quran
  date: string; // YYYY-MM-DD
  // Sabaq (new lesson)
  sabaqJuz: number;
  sabaqSurah: string;
  sabaqAyahStart: number;
  sabaqAyahEnd: number;
  sabaqPages: number;
  // Sabaqi (recent revision, last 5-7 days)
  sabaqiDate: string; // YYYY-MM-DD
  sabaqiSurah: string;
  sabaqiAyahStart: number;
  sabaqiAyahEnd: number;
  sabaqiNotes: string;
  // Manzil (old revision)
  manzilJuz: number;
  manzilSurah: string;
  manzilAyahStart: number;
  manzilAyahEnd: number;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonLogInput {
  classId: string;
  programType: ProgramType;
  date: string;
  sabaqJuz: number;
  sabaqSurah: string;
  sabaqAyahStart: number;
  sabaqAyahEnd: number;
  sabaqPages: number;
  sabaqiDate: string;
  sabaqiSurah: string;
  sabaqiAyahStart: number;
  sabaqiAyahEnd: number;
  sabaqiNotes: string;
  manzilJuz: number;
  manzilSurah: string;
  manzilAyahStart: number;
  manzilAyahEnd: number;
}

// ===========================================================================
// Hifz — per-student daily progress (FR #5)
// ===========================================================================

export interface HifzRecord {
  id: string; // `hifz-${studentId}-${date}`
  studentId: string;
  classId: string;
  lessonId: string; // FK -> LessonLog.id
  date: string; // YYYY-MM-DD
  mistakeCount: number;
  grade: HifzGrade; // derived from mistakeCount
  teacherId: string;
  note?: string;
  createdAt: string;
}

export interface HifzUpdateInput {
  studentId: string;
  classId: string;
  lessonId: string;
  date: string;
  mistakeCount: number;
  note?: string;
}

// ===========================================================================
// Nazra — per-student daily progress (FR #6)
// ===========================================================================

export interface NazraRecord {
  id: string; // `nazra-${studentId}-${date}`
  studentId: string;
  classId: string;
  lessonId: string; // FK -> LessonLog.id
  date: string; // YYYY-MM-DD
  pageNumber: number;
  lessonCompletion: number; // 0-100
  fluencyLevel: number; // 0-100
  pronunciationErrors: number;
  remarks: string;
  teacherId: string;
  createdAt: string;
}

export interface NazraUpdateInput {
  studentId: string;
  classId: string;
  lessonId: string;
  date: string;
  pageNumber: number;
  lessonCompletion: number;
  fluencyLevel: number;
  pronunciationErrors: number;
  remarks: string;
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
  id: string; // `marks-${studentId}-${subjectId}`
  studentId: string;
  subjectId: string;
  marksObtained: number; // out of 100
  teacherId: string;
  date: string;
  updatedAt: string;
}

export interface MarksInput {
  studentId: string;
  subjectId: string;
  marksObtained: number;
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
