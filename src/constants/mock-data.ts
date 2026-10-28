import { applyRoster } from "@/lib/class-roster";
import { DEMO_CLASSES, DEMO_STUDENTS, DEMO_USER_SEEDS } from "@/lib/demo-data";
import type { Class, Student, User } from "@/types";

export const MOCK_STUDENTS: Student[] = DEMO_STUDENTS;

export const MOCK_CLASSES: Class[] = DEMO_CLASSES.map((cls) =>
  applyRoster(cls, DEMO_STUDENTS),
);

export const DEMO_USERS: Record<string, { password: string; user: User }> =
  Object.fromEntries(
    DEMO_USER_SEEDS.map((entry) => {
      const { password, ...user } = entry;
      return [entry.email.toLowerCase(), { password, user }];
    }),
  );

// Students with active fee dues or hostel allocation (for delete prevention demo)
export const STUDENTS_WITH_FEE_DUES = new Set(["stu-1"]);
export const STUDENTS_WITH_HOSTEL = new Set(["stu-1", "stu-3"]);
