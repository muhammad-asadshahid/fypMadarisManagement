// Wipes every Firestore collection, then seeds only:
//   users     — 1 admin + 10 teacher logins
//   classes   — 10 classes (2 per program)
//   students  — 50 students (5 per class)
//   teachers  — 10 teachers (1 per class)
// Usage: node ./scripts/seed-demo.cjs
require("dotenv/config");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, getDocs, writeBatch } = require("firebase/firestore");

const COLLECTIONS = [
  "users",
  "classes",
  "students",
  "teachers",
  "registrations",
  "attendance",
  "hifzRecords",
  "nazraRecords",
  "darsProgressRecords",
  "kitab",
  "subjects",
  "marksRecords",
  "promotions",
  "hostelRooms",
  "hostelAllocations",
  "mealPlan",
  "visitorRecords",
  "donors",
  "donations",
  "zakatDistributions",
  "salaryPayments",
  "feePayments",
];

const PROGRAMS = [
  { programType: "noorani_qaida", label: "Noorani Qaida", subject: "Noorani Qaida" },
  { programType: "nazra_quran", label: "Nazra Quran", subject: "Nazra" },
  { programType: "hifz_ul_quran", label: "Hifz-ul-Quran", subject: "Hifz" },
  { programType: "dars_e_nizami", label: "Dars-e-Nizami", subject: "Dars-e-Nizami" },
  { programType: "asri_taleem", label: "Asri Taleem", subject: "Asri Taleem" },
];

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "ten", "twenty", "thirty", "forty", "fifty"];
const CITIES = ["Lahore", "Rawalpindi", "Faisalabad", "Multan", "Karachi"];

function numberWord(n) {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const tens = TENS[Math.floor(n / 10)];
  const ones = ONES[n % 10];
  return ones ? `${tens} ${ones}` : tens;
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildClasses() {
  return PROGRAMS.flatMap((program, programIndex) =>
    [1, 2].map((n) => ({
      id: `cls-${programIndex * 2 + n}`,
      name: `${program.label} ${n}`,
      programType: program.programType,
      studentCount: 0,
      students: [],
    })),
  );
}

function buildStudents(classes) {
  const result = [];
  classes.forEach((cls) => {
    for (let i = 0; i < 5; i += 1) {
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

function buildTeachers(classes) {
  return classes.map((cls, index) => {
    const word = numberWord(index + 1);
    return {
      id: `tch-${index + 1}`,
      name: `Teacher ${titleCase(word)}`,
      email: `teacher${word.replace(/\s+/g, "")}@mail.com`,
      password: "1234",
      contactNumber: `0310${String(1000000 + index).slice(-7)}`,
      salary: 30000,
      subjects: [PROGRAMS[Math.floor(index / 2)].subject],
      classIds: [cls.id],
    };
  });
}

function buildUsers(teachers, students) {
  return [
    {
      id: "usr-admin",
      email: "admin@mms.com",
      password: "admin123",
      fullName: "Admin",
      role: "admin",
    },
    ...teachers.map((teacher) => ({
      id: `usr-${teacher.id}`,
      email: teacher.email.toLowerCase(),
      password: teacher.password,
      fullName: teacher.name,
      role: "teacher",
      teacherId: teacher.id,
    })),
    ...students.map((student) => ({
      id: `usr-${student.id}`,
      email: student.email.toLowerCase(),
      password: student.password,
      fullName: student.name,
      role: "parent",
      parentStudentIds: [student.id],
    })),
  ];
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env`);
  return value;
}

async function clearAll(db) {
  let total = 0;
  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, name));
    if (snap.empty) continue;
    let batch = writeBatch(db);
    let pending = 0;
    for (const d of snap.docs) {
      batch.delete(d.ref);
      pending += 1;
      if (pending === 450) {
        await batch.commit();
        batch = writeBatch(db);
        pending = 0;
      }
    }
    await batch.commit();
    total += snap.size;
    console.log(`  cleared ${name}: ${snap.size}`);
  }
  return total;
}

async function writeAll(db) {
  const classes = buildClasses();
  const students = buildStudents(classes);
  const teachers = buildTeachers(classes);
  const users = buildUsers(teachers, students);

  const batch = writeBatch(db);
  classes.forEach((c) => batch.set(doc(db, "classes", c.id), c));
  students.forEach((s) => batch.set(doc(db, "students", s.id), s));
  teachers.forEach((t) => batch.set(doc(db, "teachers", t.id), t));
  users.forEach((u) => batch.set(doc(db, "users", u.id), u));
  await batch.commit();

  return { classes: classes.length, students: students.length, teachers: teachers.length, users: users.length };
}

async function main() {
  const app = initializeApp({
    apiKey: requireEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: requireEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
  });
  const db = getFirestore(app);
  console.log(`Project: ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);

  console.log("Clearing all collections...");
  const cleared = await clearAll(db);
  console.log(`  (${cleared} documents removed)`);

  console.log("Seeding...");
  const counts = await writeAll(db);
  console.log(
    `Done. classes=${counts.classes} students=${counts.students} teachers=${counts.teachers} users=${counts.users}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FAILED:", err && err.message ? err.message : err);
    process.exit(1);
  });
