import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type {
  AttendanceRecord,
  AttendanceStatus,
  Student,
} from "@/types";

export interface DailyEntry {
  student: Student;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceService {
  /** Upsert a day's marks for one class (one document per student per day). */
  mark(
    date: string,
    classId: string,
    entries: DailyEntry[],
    teacherId: string,
  ): Promise<void>;
  getByDate(date: string): Promise<AttendanceRecord[]>;
  getByDateAndClass(date: string, classId: string): Promise<AttendanceRecord[]>;
  getByMonth(month: string, classId?: string): Promise<AttendanceRecord[]>;
  getHistory(studentId: string): Promise<AttendanceRecord[]>;
  getMonthlyReport(
    month: string,
    classId?: string,
  ): Promise<Record<string, number>>;
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function monthOf(month: string): { start: string; end: string } {
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const end = new Date(y, m, 0).toISOString().split("T")[0];
  return { start, end };
}

/** Deterministic id so re-saving a day overwrites instead of duplicating. */
function recordId(date: string, studentId: string): string {
  return `att-${date}-${studentId}`;
}

function newId(): string {
  return `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function summarize(records: AttendanceRecord[]): Record<string, number> {
  const counts: Record<string, number> = {
    present: 0,
    absent: 0,
    leave: 0,
    total: 0,
  };
  records.forEach((r) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
    counts.total += 1;
  });
  return counts;
}

class FirestoreAttendanceService implements AttendanceService {
  private col() {
    return collection(db!, "attendance");
  }

  async mark(
    date: string,
    classId: string,
    entries: DailyEntry[],
    teacherId: string,
  ): Promise<void> {
    // Clear the class's existing marks for this day, then write fresh ones so
    // saving twice does not create duplicate records.
    const existing = await this.getByDateAndClass(date, classId);
    const batch = writeBatch(db!);
    existing.forEach((r) => batch.delete(doc(db!, "attendance", r.id)));

    const markedAt = new Date().toISOString();
    entries.forEach((entry) => {
      const id = recordId(date, entry.student.id);
      const record: AttendanceRecord = {
        id,
        studentId: entry.student.id,
        classId,
        date,
        status: entry.status,
        teacherId,
        markedAt,
        // Firestore rejects `undefined` field values, so only include note when set.
        ...(entry.note ? { note: entry.note } : {}),
      };
      batch.set(doc(db!, "attendance", id), record);
    });
    await batch.commit();
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const q = query(this.col(), where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AttendanceRecord);
  }

  async getByDateAndClass(
    date: string,
    classId: string,
  ): Promise<AttendanceRecord[]> {
    const q = query(
      this.col(),
      where("date", "==", date),
      where("classId", "==", classId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AttendanceRecord);
  }

  async getByMonth(month: string, classId?: string): Promise<AttendanceRecord[]> {
    const { start, end } = monthOf(month);
    const q = query(
      this.col(),
      where("date", ">=", start),
      where("date", "<=", end),
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((d) => d.data() as AttendanceRecord);
    // Filter by class in memory to avoid needing a composite index.
    return classId ? records.filter((r) => r.classId === classId) : records;
  }

  async getHistory(studentId: string): Promise<AttendanceRecord[]> {
    const q = query(this.col(), where("studentId", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AttendanceRecord);
  }

  async getMonthlyReport(
    month: string,
    classId?: string,
  ): Promise<Record<string, number>> {
    return summarize(await this.getByMonth(month, classId));
  }
}

class MockAttendanceService implements AttendanceService {
  private records: AttendanceRecord[] = [];

  async mark(
    date: string,
    classId: string,
    entries: DailyEntry[],
    teacherId: string,
  ): Promise<void> {
    const now = new Date().toISOString();
    // Remove any existing entries for the same date + class, then mark fresh.
    this.records = this.records.filter(
      (r) => !(r.date === date && r.classId === classId),
    );
    for (const entry of entries) {
      this.records.push({
        id: newId(),
        studentId: entry.student.id,
        classId,
        date,
        status: entry.status,
        teacherId,
        note: entry.note,
        markedAt: now,
      });
    }
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    return this.records.filter((r) => r.date === date);
  }

  async getByDateAndClass(
    date: string,
    classId: string,
  ): Promise<AttendanceRecord[]> {
    return this.records.filter((r) => r.date === date && r.classId === classId);
  }

  async getByMonth(month: string): Promise<AttendanceRecord[]> {
    const { start, end } = monthOf(month);
    return this.records.filter((r) => r.date >= start && r.date <= end);
  }

  async getHistory(studentId: string): Promise<AttendanceRecord[]> {
    return this.records.filter((r) => r.studentId === studentId);
  }

  async getMonthlyReport(
    month: string,
    classId?: string,
  ): Promise<Record<string, number>> {
    const records = await this.getByMonth(month);
    return summarize(
      classId ? records.filter((r) => r.classId === classId) : records,
    );
  }
}

export const attendanceService: AttendanceService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreAttendanceService()
    : new MockAttendanceService();
