import type { Class, ProgramType, Student, Teacher, User } from "@/types";

// ===========================================================================
// Demo dataset: 10 classes (2 per program), 50 students (5 per class),
// 10 teachers (one per class) and a single admin login.
// ===========================================================================

interface ProgramSeed {
  programType: ProgramType;
  label: string;
}

const PROGRAMS: ProgramSeed[] = [
  { programType: "noorani_qaida", label: "Noorani Qaida" },
  { programType: "nazra_quran", label: "Nazra Quran" },
  { programType: "hifz_ul_quran", label: "Hifz-ul-Quran" },
  { programType: "dars_e_nizami", label: "Dars-e-Nizami" },
  { programType: "asri_taleem", label: "Asri Taleem" },
];

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "ten", "twenty", "thirty", "forty", "fifty"];

function numberWord(n: number): string {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const tens = TENS[Math.floor(n / 10)];
  const ones = ONES[n % 10];
  return ones ? `${tens} ${ones}` : tens;
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const DEMO_CLASSES: Class[] = PROGRAMS.flatMap((program, programIndex) =>
  [1, 2].map((n) => ({
    id: `cls-${programIndex * 2 + n}`,
    name: `${program.label} ${n}`,
    programType: program.programType,
    studentCount: 0,
    students: [],
  })),
);

const CITIES = ["Lahore", "Rawalpindi", "Faisalabad", "Multan", "Karachi"];
const STUDENTS_PER_CLASS = 5;

function buildStudents(): Student[] {
  const result: Student[] = [];

  DEMO_CLASSES.forEach((cls) => {
    for (let i = 0; i < STUDENTS_PER_CLASS; i += 1) {
      const idx = result.length;
      const word = numberWord(idx + 1);
      const label = titleCase(word);
      const year = 2023 + (idx % 3);
      const month = String((idx % 12) + 1).padStart(2, "0");
      const day = String((idx % 27) + 1).padStart(2, "0");
      const admissionDate = `${year}-${month}-${day}`;

      result.push({
        id: `stu-${idx + 1}`,
        name: `Student ${label}`,
        fatherName: `Father ${label}`,
        dateOfBirth: `${2010 + (idx % 6)}-${month}-${day}`,
        address: `House ${idx + 1}, Street ${(idx % 9) + 1}, ${CITIES[idx % CITIES.length]}`,
        contactNumber: `0300${String(1000000 + idx).slice(-7)}`,
        admissionDate,
        programType: cls.programType,
        classId: cls.id,
        hostelStatus: idx % 2 === 0,
        email: `student${word.replace(/\s+/g, "")}@mail.com`,
        password: "1234",
        createdAt: `${admissionDate}T08:00:00Z`,
        updatedAt: `${admissionDate}T08:00:00Z`,
      });
    }
  });

  return result;
}

export const DEMO_STUDENTS: Student[] = buildStudents();

function buildTeachers(): Teacher[] {
  return DEMO_CLASSES.map((cls, index) => {
    const word = numberWord(index + 1);
    return {
      id: `tch-${index + 1}`,
      name: `Teacher ${titleCase(word)}`,
      email: `teacher${word.replace(/\s+/g, "")}@mail.com`,
      password: "1234",
      contactNumber: `0310${String(1000000 + index).slice(-7)}`,
      salary: 30000,
      classIds: [cls.id],
      programType: cls.programType,
      qualification: "M.A.",
      experience: "5 years",
    };
  });
}

export const DEMO_TEACHERS: Teacher[] = buildTeachers();

/** One admin, one login per teacher, and a parent login per student (all 1234). */
export const DEMO_USER_SEEDS: (User & { password: string })[] = [
  {
    id: "usr-admin",
    email: "admin@mms.com",
    password: "admin123",
    fullName: "Admin",
    role: "admin",
  },
  ...DEMO_TEACHERS.map((teacher) => ({
    id: `usr-${teacher.id}`,
    email: teacher.email ?? "",
    password: teacher.password ?? "1234",
    fullName: teacher.name,
    role: "teacher" as const,
    teacherId: teacher.id,
  })),
  ...DEMO_STUDENTS.map((student) => ({
    id: `usr-${student.id}`,
    email: student.email ?? "",
    password: student.password ?? "1234",
    fullName: student.name,
    role: "parent" as const,
    parentStudentIds: [student.id],
  })),
];
