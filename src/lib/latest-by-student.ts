/**
 * Reduces a flat list of dated per-student records down to the most recent
 * record for each student, so screens can show the last recorded progress
 * regardless of which day it belongs to.
 */
export function latestPerStudent<T extends { studentId: string; date: string }>(
  records: T[],
): T[] {
  const byStudent = new Map<string, T>();
  for (const record of records) {
    const current = byStudent.get(record.studentId);
    if (!current || record.date > current.date) {
      byStudent.set(record.studentId, record);
    }
  }
  return Array.from(byStudent.values());
}

/** The most recent date among the given values, or null when there are none. */
export function latestDate(dates: (string | undefined | null)[]): string | null {
  const valid = dates.filter((date): date is string => Boolean(date));
  return valid.length ? valid.reduce((a, b) => (a > b ? a : b)) : null;
}
