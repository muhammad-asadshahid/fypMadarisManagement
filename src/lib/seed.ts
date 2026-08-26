import { collection, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type {
  Class,
  Registration,
  Student,
  User,
  HifzRecord,
  NazraRecord,
  DarsProgressRecord,
  AttendanceRecord,
} from "@/types";

const CLASSES: Class[] = [
  { id: "cls-1", name: "Hifz Class A", programType: "hifz_ul_quran" },
  { id: "cls-2", name: "Nazra Class B", programType: "nazra_quran" },
  { id: "cls-3", name: "Dars-e-Nizami Year 1", programType: "dars_e_nizami" },
  { id: "cls-4", name: "Asri Taleem Grade 5", programType: "asri_taleem" },
  { id: "cls-5", name: "Noorani Qaida Beginners", programType: "noorani_qaida" },
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
];

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

export async function seedIfEmpty(): Promise<void> {
  const firestore = db;
  if (!FIREBASE_CONFIGURED || !firestore) return;

  try {
    const snapshot = await getDocs(collection(firestore, "classes"));
    if (!snapshot.empty) return;

    const batch = writeBatch(firestore);

    CLASSES.forEach((c) => {
      batch.set(doc(firestore, "classes", c.id), c);
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

    [
      { id: "sub-urdu", name: "Urdu", programType: "asri_taleem" },
      { id: "sub-english", name: "English", programType: "asri_taleem" },
      { id: "sub-mathematics", name: "Mathematics", programType: "asri_taleem" },
      { id: "sub-science", name: "Science", programType: "asri_taleem" },
      { id: "sub-islamiyat", name: "Islamiyat", programType: "asri_taleem" },
    ].forEach((s) => batch.set(doc(firestore, "subjects", s.id), s));

    // Per-student progress records so every module screens show real data.
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const teacherId = "tch-1";

    const hifzDemo: Omit<HifzRecord, "id">[] = [
      {
        studentId: "stu-1",
        date: today,
        sabaq: "Surah 2 v61-65",
        sabaqi: "Surah 1",
        manzil: "Manzil 1",
        mistakeCount: 2,
        grade: "jayyid",
        teacherId,
        note: "Good pace",
        createdAt: now.toISOString(),
      },
    ];

    const nazraDemo: Omit<NazraRecord, "id">[] = [
      {
        studentId: "stu-2",
        date: today,
        pageFrom: 4,
        pageTo: 6,
        fluency: 78,
        remarks: "Clear tajweed",
        completionPercentage: 12,
        teacherId,
        createdAt: now.toISOString(),
      },
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

    hifzDemo.forEach((r, i) =>
      batch.set(doc(firestore, "hifzRecords", `hifz-seed-${i + 1}`), r),
    );
    nazraDemo.forEach((r, i) =>
      batch.set(doc(firestore, "nazraRecords", `nazra-seed-${i + 1}`), r),
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
