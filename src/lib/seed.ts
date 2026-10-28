import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { applyRoster } from "@/lib/class-roster";
import {
  DEMO_CLASSES,
  DEMO_STUDENTS,
  DEMO_TEACHERS,
  DEMO_USER_SEEDS,
} from "@/lib/demo-data";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type { Class } from "@/types";

const CLASSES: Class[] = DEMO_CLASSES.map((cls) =>
  applyRoster(cls, DEMO_STUDENTS),
);

/**
 * Seeds only the admin + teacher logins, classes, students and teachers.
 * Each collection is written only when it is empty, so this bootstraps a fresh
 * database without overwriting existing data.
 */
export async function seedIfEmpty(): Promise<void> {
  const firestore = db;
  if (!FIREBASE_CONFIGURED || !firestore) return;

  try {
    const [classSnap, studentSnap, teacherSnap, userSnap] = await Promise.all([
      getDocs(collection(firestore, "classes")),
      getDocs(collection(firestore, "students")),
      getDocs(collection(firestore, "teachers")),
      getDocs(collection(firestore, "users")),
    ]);

    const batch = writeBatch(firestore);

    if (classSnap.empty) {
      CLASSES.forEach((cls) =>
        batch.set(doc(firestore, "classes", cls.id), cls),
      );
    }

    if (studentSnap.empty) {
      DEMO_STUDENTS.forEach((student) =>
        batch.set(doc(firestore, "students", student.id), student),
      );
    }

    // Admin + teacher login accounts (password 1234 for teachers).
    if (userSnap.empty) {
      DEMO_USER_SEEDS.forEach((user) =>
        batch.set(doc(firestore, "users", user.id), {
          ...user,
          email: user.email.toLowerCase(),
        }),
      );
    }

    if (teacherSnap.empty) {
      DEMO_TEACHERS.forEach((teacher) => {
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

    await batch.commit();
  } catch (error) {
    // Seeding is best-effort, but surface the reason rather than failing silently.
    console.warn("Seed skipped:", error);
  }
}
