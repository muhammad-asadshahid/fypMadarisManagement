import { collection, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { applyRoster } from "@/lib/class-roster";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type {
  Class,
  Donation,
  Donor,
  Registration,
  Student,
  Subject,
  Teacher,
  User,
  LessonLog,
  HifzRecord,
  NazraRecord,
  MarksRecord,
  DarsProgressRecord,
  AttendanceRecord,
} from "@/types";

const CLASSES_BASE: Class[] = [
  { id: "cls-1", name: "Hifz Class A", programType: "hifz_ul_quran", studentCount: 0, students: [] },
  { id: "cls-2", name: "Nazra Class B", programType: "nazra_quran", studentCount: 0, students: [] },
  { id: "cls-3", name: "Dars-e-Nizami Year 1", programType: "dars_e_nizami", studentCount: 0, students: [] },
  { id: "cls-4", name: "Asri Taleem", programType: "asri_taleem", studentCount: 0, students: [] },
  { id: "cls-5", name: "Noorani Qaida Beginners", programType: "noorani_qaida", studentCount: 0, students: [] },
];

const ASRI_SUBJECTS: Subject[] = ["English", "Math", "Science", "Computer"].map(
  (name) => ({
    id: `asri-sub-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    programType: "asri_taleem" as const,
  }),
);

const TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    name: "Maulana Abdullah",
    subjects: ["Hifz", "Asri Taleem"],
    contactNumber: "0300111222",
    salary: 30000,
    classIds: ["cls-1", "cls-4"],
  },
];

const USERS: User[] = [
  {
    id: "usr-admin",
    email: "admin@mms.com",
    fullName: "System Administrator",
    role: "admin",
  },
  {
    id: "usr-teacher",
    email: "teacher@mms.com",
    fullName: "Maulana Abdullah",
    role: "teacher",
    teacherId: "tch-1",
  },
  {
    id: "usr-parent",
    email: "parent@mms.com",
    fullName: "Muhammad Ali",
    role: "parent",
    parentStudentIds: ["stu-1"],
  },
];

const USER_PASSWORDS: Record<string, string> = {
  "usr-admin": "admin123",
  "usr-teacher": "teacher123",
  "usr-parent": "parent123",
};

const STUDENTS: Student[] = [
  {
    id: "stu-1",
    name: "Ahmed Ali",
    fatherName: "Muhammad Ali",
    dateOfBirth: "2012-05-15",
    address: "House 12, Street 4, Lahore",
    contactNumber: "03001234567",
    admissionDate: "2024-01-10",
    programType: "hifz_ul_quran",
    classId: "cls-1",
    hostelStatus: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "stu-2",
    name: "Hassan Khan",
    fatherName: "Imran Khan",
    dateOfBirth: "2014-08-22",
    address: "Village Kotli, Rawalpindi",
    contactNumber: "03009876543",
    admissionDate: "2024-03-01",
    programType: "nazra_quran",
    classId: "cls-2",
    hostelStatus: false,
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
  },
  {
    id: "stu-3",
    name: "Usman Raza",
    fatherName: "Tariq Raza",
    dateOfBirth: "2010-11-03",
    address: "Mohalla Islamabad, Faisalabad",
    contactNumber: "03111222333",
    admissionDate: "2023-09-15",
    programType: "dars_e_nizami",
    classId: "cls-3",
    hostelStatus: true,
    createdAt: "2023-09-15T08:00:00Z",
    updatedAt: "2023-09-15T08:00:00Z",
  },
  {
    id: "stu-4",
    name: "Bilal Hassan",
    fatherName: "Hassan Ali",
    dateOfBirth: "2016-02-11",
    address: "Street 7, Lahore",
    contactNumber: "03005556677",
    admissionDate: "2025-04-01",
    programType: "asri_taleem",
    classId: "cls-4",
    hostelStatus: false,
    grade: 1,
    createdAt: "2025-04-01T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
  },
  {
    id: "stu-5",
    name: "Zainab Fatima",
    fatherName: "Ali Raza",
    dateOfBirth: "2015-07-19",
    address: "Block C, Rawalpindi",
    contactNumber: "03009998877",
    admissionDate: "2025-04-01",
    programType: "asri_taleem",
    classId: "cls-4",
    hostelStatus: false,
    grade: 2,
    createdAt: "2025-04-01T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
  },
];

const CLASSES: Class[] = CLASSES_BASE.map((cls) => applyRoster(cls, STUDENTS));

const REGISTRATIONS: Registration[] = [
  {
    id: "reg-1",
    firstName: "Bilal",
    lastName: "Ahmed",
    fatherName: "Rashid Ahmed",
    bFormCnic: "3520212345678",
    guardianMobile: "03211234567",
    guardianEmail: "bilal.ahmed@example.com",
    password: "4321",
    address: "House 5, Gulberg",
    city: "Lahore",
    programType: "hifz_ul_quran",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "reg-2",
    firstName: "Hamza",
    lastName: "Yousaf",
    fatherName: "Yousaf Khan",
    bFormCnic: "3520219876543",
    guardianMobile: "03339876543",
    guardianEmail: "hamza.yousaf@example.com",
    password: "1122",
    address: "Street 9, Model Town",
    city: "Faisalabad",
    programType: "nazra_quran",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DONORS: Donor[] = [
  {
    id: "donor-1",
    name: "Ahsan Khan",
    contactNumber: "03010001122",
    category: "General",
  },
  {
    id: "donor-2",
    name: "Fatima Welfare Trust",
    contactNumber: "03451234567",
    category: "Zakat",
  },
  {
    id: "donor-3",
    name: "Bilal Traders",
    contactNumber: "03219876543",
    category: "Nafal",
  },
];

const DONATIONS: Donation[] = [
  {
    id: "donation-1",
    donorId: "donor-1",
    amount: 15000,
    category: "Zakat",
    month: "Ramadan 2026",
    date: "2026-03-15T10:00:00.000Z",
    note: "Ramadan donation",
  },
  {
    id: "donation-2",
    donorId: "donor-2",
    amount: 50000,
    category: "Fitrana",
    month: "Ramadan 2026",
    date: "2026-03-20T10:00:00.000Z",
    note: "Fitrana for 10 families",
  },
  {
    id: "donation-3",
    donorId: "donor-1",
    amount: 25000,
    category: "Nafal",
    month: "Muharram 2026",
    date: "2026-07-05T10:00:00.000Z",
    note: "Sadaqah",
  },
  {
    id: "donation-4",
    donorId: "donor-3",
    amount: 100000,
    category: "Other",
    month: "General 2026",
    date: "2026-05-01T10:00:00.000Z",
    note: "Building fund",
  },
];

export async function seedIfEmpty(): Promise<void> {
  const firestore = db;
  if (!FIREBASE_CONFIGURED || !firestore) return;

  try {
    // Donations/donors seed independently so a database that is already
    // seeded with classes still gets the financial tables created.
    const donationSnapshot = await getDocs(
      collection(firestore, "donations"),
    );
    if (donationSnapshot.empty) {
      const donationBatch = writeBatch(firestore);
      DONORS.forEach((d) =>
        donationBatch.set(doc(firestore, "donors", d.id), d),
      );
      DONATIONS.forEach((d) =>
        donationBatch.set(doc(firestore, "donations", d.id), d),
      );
      await donationBatch.commit();
    }

    const snapshot = await getDocs(collection(firestore, "classes"));
    if (!snapshot.empty) return;

    const batch = writeBatch(firestore);

    CLASSES.forEach((c) => {
      batch.set(doc(firestore, "classes", c.id), c);
    });

    TEACHERS.forEach((teacher) => {
      batch.set(doc(firestore, "teachers", teacher.id), teacher);
    });

    USERS.forEach((u) => {
      batch.set(doc(firestore, "users", u.id), {
        ...u,
        password: USER_PASSWORDS[u.id] ?? "",
        email: u.email.toLowerCase(),
      });
    });

    STUDENTS.forEach((s) => {
      batch.set(doc(firestore, "students", s.id), s);
    });

    REGISTRATIONS.forEach((r) => {
      batch.set(doc(firestore, "registrations", r.id), r);
    });

    // Default catalog: Hifz grades, Nazra completion, Dars kutub, Asri subjects.
    [
      { id: "kitab-nahw", name: "Nahw", totalChapters: 20 },
      { id: "kitab-sarf", name: "Sarf", totalChapters: 18 },
      { id: "kitab-fiqh", name: "Fiqh", totalChapters: 25 },
      { id: "kitab-tafsir", name: "Tafsir", totalChapters: 15 },
    ].forEach((k) => batch.set(doc(firestore, "kitab", k.id), k));

    ASRI_SUBJECTS.forEach((s) =>
      batch.set(doc(firestore, "subjects", s.id), s),
    );

    // Per-student progress records so every module screens show real data.
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const teacherId = "tch-1";

    const lessonLogDemo: Omit<LessonLog, "id">[] = [
      {
        classId: "cls-1",
        programType: "hifz_ul_quran",
        date: today,
        sabaqJuz: 2,
        sabaqSurah: "Al-Baqarah",
        sabaqAyahStart: 61,
        sabaqAyahEnd: 65,
        sabaqPages: 1,
        sabaqiDate: today,
        sabaqiSurah: "Al-Fatihah",
        sabaqiAyahStart: 1,
        sabaqiAyahEnd: 7,
        sabaqiNotes: "Strong recall",
        manzilJuz: 1,
        manzilSurah: "Al-Baqarah",
        manzilAyahStart: 1,
        manzilAyahEnd: 20,
        teacherId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        classId: "cls-2",
        programType: "nazra_quran",
        date: today,
        sabaqJuz: 1,
        sabaqSurah: "Al-Baqarah",
        sabaqAyahStart: 1,
        sabaqAyahEnd: 5,
        sabaqPages: 1,
        sabaqiDate: today,
        sabaqiSurah: "Al-Fatihah",
        sabaqiAyahStart: 1,
        sabaqiAyahEnd: 7,
        sabaqiNotes: "Needs tajweed practice",
        manzilJuz: 1,
        manzilSurah: "An-Nas",
        manzilAyahStart: 1,
        manzilAyahEnd: 6,
        teacherId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    const hifzDemo: Omit<HifzRecord, "id">[] = [
      {
        studentId: "stu-1",
        classId: "cls-1",
        lessonId: `ll-cls-1-${today}`,
        date: today,
        mistakeCount: 2,
        grade: "jayyid_jiddan",
        teacherId,
        note: "Good pace",
        createdAt: now.toISOString(),
      },
    ];

    const nazraDemo: Omit<NazraRecord, "id">[] = [
      {
        studentId: "stu-2",
        classId: "cls-2",
        lessonId: `ll-cls-2-${today}`,
        date: today,
        pageNumber: 5,
        lessonCompletion: 12,
        fluencyLevel: 78,
        pronunciationErrors: 3,
        remarks: "Clear tajweed",
        teacherId,
        createdAt: now.toISOString(),
      },
    ];

    const marksDemo: Omit<MarksRecord, "id">[] = [
      { studentId: "stu-4", subjectId: "asri-sub-english", marksObtained: 85, teacherId, date: now.toISOString(), updatedAt: now.toISOString() },
      { studentId: "stu-4", subjectId: "asri-sub-computer", marksObtained: 78, teacherId, date: now.toISOString(), updatedAt: now.toISOString() },
      { studentId: "stu-4", subjectId: "asri-sub-math", marksObtained: 92, teacherId, date: now.toISOString(), updatedAt: now.toISOString() },
      { studentId: "stu-4", subjectId: "asri-sub-science", marksObtained: 88, teacherId, date: now.toISOString(), updatedAt: now.toISOString() },
      { studentId: "stu-5", subjectId: "asri-sub-english", marksObtained: 74, teacherId, date: now.toISOString(), updatedAt: now.toISOString() },
    ];

    const darsDemo: Omit<DarsProgressRecord, "id">[] = [
      {
        studentId: "stu-3",
        kitabId: "kitab-nahw",
        date: today,
        chaptersCompleted: 3,
        pagesCovered: 40,
        takrarAttendance: true,
        note: "On track",
        teacherId,
        createdAt: now.toISOString(),
      },
    ];

    lessonLogDemo.forEach((r) =>
      batch.set(doc(firestore, "lessonLogs", `ll-${r.classId}-${r.date}`), r),
    );
    hifzDemo.forEach((r) =>
      batch.set(doc(firestore, "hifzRecords", `hifz-${r.studentId}-${r.date}`), r),
    );
    nazraDemo.forEach((r) =>
      batch.set(doc(firestore, "nazraRecords", `nazra-${r.studentId}-${r.date}`), r),
    );
    marksDemo.forEach((r) =>
      batch.set(
        doc(firestore, "marksRecords", `marks-${r.studentId}-${r.subjectId}`),
        r,
      ),
    );
    darsDemo.forEach((r, i) =>
      batch.set(
        doc(firestore, "darsProgressRecords", `dars-seed-${i + 1}`),
        r,
      ),
    );

    // Attendance for today.
    const attendanceDemo: Omit<AttendanceRecord, "id">[] = [
      { studentId: "stu-1", classId: "cls-1", date: today, status: "present", teacherId, markedAt: now.toISOString() },
      { studentId: "stu-2", classId: "cls-2", date: today, status: "present", teacherId, markedAt: now.toISOString() },
      { studentId: "stu-3", classId: "cls-3", date: today, status: "absent", teacherId, markedAt: now.toISOString() },
    ];
    attendanceDemo.forEach((r, i) =>
      batch.set(doc(firestore, "attendance", `att-seed-${i + 1}`), r),
    );

    await batch.commit();
  } catch {
    // Seeding is best-effort; the app still works without it.
  }
}
