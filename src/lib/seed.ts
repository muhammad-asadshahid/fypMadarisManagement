import { collection, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { applyRoster } from "@/lib/class-roster";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { currentMonthKey } from "@/lib/months";
import type {
  Class,
  Donation,
  Donor,
  Registration,
  Student,
  User,
  HifzRecord,
  NazraRecord,
  DarsProgressRecord,
  AttendanceRecord,
  HostelAllocation,
  MealPlanDay,
  Room,
  Teacher,
  VisitorRecord,
} from "@/types";

const CLASSES_BASE: Class[] = [
  { id: "cls-1", name: "Hifz Class A", programType: "hifz_ul_quran", studentCount: 0, students: [] },
  { id: "cls-2", name: "Nazra Class B", programType: "nazra_quran", studentCount: 0, students: [] },
  { id: "cls-3", name: "Dars-e-Nizami Year 1", programType: "dars_e_nizami", studentCount: 0, students: [] },
  { id: "cls-4", name: "Asri Taleem Grade 5", programType: "asri_taleem", studentCount: 0, students: [] },
  { id: "cls-5", name: "Noorani Qaida Beginners", programType: "noorani_qaida", studentCount: 0, students: [] },
];

const USERS: User[] = [
  {
    id: "usr-admin",
    email: "admin@mms.com",
    fullName: "System Administrator",
    role: "admin",
  },
  {
    id: "usr-tch-1",
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
  "usr-tch-1": "1234",
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

const HOSTEL_ROOMS: Room[] = [
  { id: "room-1", name: "Room A", capacity: 4, createdAt: "2024-01-10T08:00:00Z" },
  { id: "room-2", name: "Room B", capacity: 3, createdAt: "2024-01-10T08:00:00Z" },
];

const HOSTEL_ALLOCATIONS: HostelAllocation[] = [
  { id: "alloc-1", studentId: "stu-1", roomId: "room-1", assignedAt: "2024-01-10T08:00:00Z" },
  { id: "alloc-2", studentId: "stu-3", roomId: "room-2", assignedAt: "2024-01-11T08:00:00Z" },
];

const MEAL_PLAN: MealPlanDay[] = [
  { id: "monday", breakfast: "Paratha, egg, tea", lunch: "Rice, daal, salad", dinner: "Chicken curry, roti" },
  { id: "tuesday", breakfast: "Halwa puri, tea", lunch: "Aloo gosht, rice", dinner: "Vegetable, roti" },
  { id: "wednesday", breakfast: "Omelette, toast, tea", lunch: "Chana pulao, raita", dinner: "Daal, roti" },
  { id: "thursday", breakfast: "Paratha, curd, tea", lunch: "Rice, kadhi, salad", dinner: "Qeema, roti" },
  { id: "friday", breakfast: "Nihari, naan", lunch: "Biryani, raita", dinner: "Vegetable, roti" },
  { id: "saturday", breakfast: "Anda paratha, tea", lunch: "Rice, daal, salad", dinner: "Chicken karahi, roti" },
  { id: "sunday", breakfast: "Halwa puri, tea", lunch: "Pulao, raita", dinner: "Aloo gosht, roti" },
];

const TEACHERS: Teacher[] = [
  { id: "tch-1", name: "Maulana Abdullah", email: "teacher@mms.com", password: "1234", contactNumber: "0300111222", salary: 30000, subjects: ["Hifz"], classIds: ["cls-1"] },
  { id: "tch-2", name: "Qari Bilal", email: "qari@mms.com", password: "5678", contactNumber: "0300222333", salary: 28000, subjects: ["Nazra"], classIds: ["cls-2"] },
];

const DONORS: Donor[] = [
  { id: "donor-1", name: "Ahsan Khan", contactNumber: "03010001122", category: "General" },
  { id: "donor-2", name: "Fatima Welfare Trust", contactNumber: "03451234567", category: "Zakat" },
  { id: "donor-3", name: "Bilal Traders", contactNumber: "03219876543", category: "Nafal" },
];

const DONATIONS: Donation[] = [
  { id: "donation-1", donorId: "donor-1", amount: 15000, category: "Zakat", month: "Ramadan 2026", date: "2026-03-15T10:00:00.000Z", note: "Ramadan donation" },
  { id: "donation-2", donorId: "donor-2", amount: 50000, category: "Fitrana", month: "Ramadan 2026", date: "2026-03-20T10:00:00.000Z", note: "Fitrana for 10 families" },
  { id: "donation-3", donorId: "donor-1", amount: 25000, category: "Nafal", month: "Muharram 2026", date: "2026-07-05T10:00:00.000Z", note: "Sadaqah" },
  { id: "donation-4", donorId: "donor-3", amount: 100000, category: "Other", month: "General 2026", date: "2026-05-01T10:00:00.000Z", note: "Building fund" },
];

export async function seedIfEmpty(): Promise<void> {
  const firestore = db;
  if (!FIREBASE_CONFIGURED || !firestore) return;

  try {
    const [
      coreSnap,
      hostelSnap,
      mealPlanSnap,
      teachersSnap,
      usersSnap,
      salarySnap,
      donationsSnap,
    ] = await Promise.all([
      getDocs(collection(firestore, "classes")),
      getDocs(collection(firestore, "hostelRooms")),
      getDocs(collection(firestore, "mealPlan")),
      getDocs(collection(firestore, "teachers")),
      getDocs(collection(firestore, "users")),
      getDocs(collection(firestore, "salaryPayments")),
      getDocs(collection(firestore, "donations")),
    ]);
    if (
      !coreSnap.empty &&
      !hostelSnap.empty &&
      !mealPlanSnap.empty &&
      !teachersSnap.empty &&
      !salarySnap.empty &&
      !donationsSnap.empty
    )
      return;

    const batch = writeBatch(firestore);

    // Tidy up legacy / duplicate teacher login rows: keep only the canonical
    // `usr-<teacherId>` document for each known teacher and drop the rest
    // (e.g. the old `usr-teacher` prototype account).
    const knownTeacherIds = new Set<string>([
      ...teachersSnap.docs.map((d) => d.id),
      ...TEACHERS.map((t) => t.id),
    ]);
    usersSnap.docs.forEach((userDoc) => {
      const data = userDoc.data();
      const teacherId = data.teacherId;
      if (
        data.role === "teacher" &&
        typeof teacherId === "string" &&
        knownTeacherIds.has(teacherId) &&
        userDoc.id !== `usr-${teacherId}`
      ) {
        batch.delete(userDoc.ref);
      }
    });

    if (coreSnap.empty) {
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
    }

    // Hostel data — seeded independently so it lands even on a DB that already
    // has students/classes.
    if (hostelSnap.empty) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      HOSTEL_ROOMS.forEach((r) =>
        batch.set(doc(firestore, "hostelRooms", r.id), r),
      );
      HOSTEL_ALLOCATIONS.forEach((a) =>
        batch.set(doc(firestore, "hostelAllocations", a.id), a),
      );

      const visitorsDemo: Omit<VisitorRecord, "id">[] = [
        { studentId: "stu-1", visitorName: "Muhammad Ali", visitDate: today, notes: "Father" },
        { studentId: "stu-3", visitorName: "Tariq Raza", visitDate: today, notes: "Father" },
      ];
      visitorsDemo.forEach((v, i) =>
        batch.set(doc(firestore, "visitorRecords", `visitor-seed-${i + 1}`), v),
      );
    }

    // Default weekly meal plan the admin can edit in place.
    if (mealPlanSnap.empty) {
      MEAL_PLAN.forEach((day) =>
        batch.set(doc(firestore, "mealPlan", day.id), day),
      );
    }

    // Teacher records plus their login accounts (users, role teacher).
    if (teachersSnap.empty) {
      TEACHERS.forEach((teacher) => {
        batch.set(doc(firestore, "teachers", teacher.id), teacher);
        batch.set(doc(firestore, "users", `usr-${teacher.id}`), {
          id: `usr-${teacher.id}`,
          email: (teacher.email ?? "").toLowerCase(),
          password: teacher.password ?? "",
          fullName: teacher.name,
          role: "teacher",
          teacherId: teacher.id,
        });
      });
    }

    // One salary already paid for the current month (tch-2 stays unpaid).
    if (salarySnap.empty) {
      const now = new Date();
      batch.set(doc(firestore, "salaryPayments", "salary-seed-1"), {
        id: "salary-seed-1",
        teacherId: "tch-1",
        amount: 30000,
        month: currentMonthKey(now),
        date: now.toISOString(),
        note: "Monthly salary",
      });
    }

    // Donors + donations seed independently too.
    if (donationsSnap.empty) {
      DONORS.forEach((d) => batch.set(doc(firestore, "donors", d.id), d));
      DONATIONS.forEach((d) =>
        batch.set(doc(firestore, "donations", d.id), d),
      );
    }

    await batch.commit();
  } catch {
    // Seeding is best-effort; the app still works without it.
  }
}
