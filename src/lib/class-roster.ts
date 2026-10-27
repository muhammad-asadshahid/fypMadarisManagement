import type { Class, ClassStudent, Student } from "@/types";

/**
 * Recompute a class document's roster from the current student list, so the
 * class record always carries its student count and a light-weight student list
 * (id, name, fatherName).
 */
export function applyRoster(cls: Class, students: Student[]): Class {
  const roster = students
    .filter((student) => student.classId === cls.id)
    .map<ClassStudent>((student) => ({
      id: student.id,
      name: student.name,
      fatherName: student.fatherName,
    }));
  return { ...cls, studentCount: roster.length, students: roster };
}

/** Whether a stored roster already matches a freshly computed one. */
export function rosterMatches(
  stored: ClassStudent[] | undefined,
  next: ClassStudent[],
): boolean {
  if (!stored || stored.length !== next.length) return false;
  const storedById = new Map(stored.map((student) => [student.id, student]));
  return next.every((student) => {
    const previous = storedById.get(student.id);
    return (
      previous?.name === student.name &&
      previous?.fatherName === student.fatherName
    );
  });
}
