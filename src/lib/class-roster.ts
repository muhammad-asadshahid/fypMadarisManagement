import type { Class, ClassStudent, Student } from "@/types";

export function rosterForClass(
  students: Student[],
  classId: string,
): ClassStudent[] {
  return students
    .filter((student) => student.classId === classId)
    .map((student) => ({
      id: student.id,
      name: student.name,
      fatherName: student.fatherName,
    }));
}

export function applyRoster(cls: Class, students: Student[]): Class {
  const roster = rosterForClass(students, cls.id);
  return { ...cls, students: roster, studentCount: roster.length };
}

export function rosterMatches(
  stored: ClassStudent[] | undefined,
  computed: ClassStudent[],
): boolean {
  if (!stored || stored.length !== computed.length) return false;
  return stored.every(
    (entry, index) =>
      entry.id === computed[index].id &&
      entry.name === computed[index].name &&
      entry.fatherName === computed[index].fatherName,
  );
}
