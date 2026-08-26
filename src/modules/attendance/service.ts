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
  recordId?: string;
}

export interface AttendanceService {
  markToday(classId: string, entries: DailyEntry[], teacherId: string): Promise<void>;
  getByDate(date: string): Promise<AttendanceRecord[]>;
  getHistory(studentId: string): Promise<AttendanceRecord[]>;
  getMonthlyReport(month: string): Promise<Record<string, number>>;
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

function genId(): string {
  return `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

class FirestoreAttendanceService implements AttendanceService {
  private col() {
    return collection(db!, "attendance");
  }

  async markToday(
    classId: string,
    entries: DailyEntry[],
    teacherId: string,
  ): Promise<void> {
    const date = todayStr();
    const batch = writeBatch(db!);

    for (const entry of entries) {
      const id = genId();
      const record: AttendanceRecord = {
        id,
        studentId: entry.student.id,
        classId,
        date,
        status: entry.status,
        teacherId,
        markedAt: new Date().toISOString(),
      };
      batch.set(doc(db!, "attendance", id), record);
    }
    await batch.commit();
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const q = query(this.col(), where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AttendanceRecord);
  }

  async getHistory(studentId: string): Promise<AttendanceRecord[]> {
    const q = query(this.col(), where("studentId", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AttendanceRecord);
  }

  async getMonthlyReport(month: string): Promise<Record<string, number>> {
    const { start, end } = monthOf(month);
    const q = query(
      this.col(),
      where("date", ">=", start),
      where("date", "<=", end),
    );
    const snapshot = await getDocs(q);
    const counts: Record<string, number> = { present: 0, absent: 0, leave: 0 };
    snapshot.docs.forEach((d) => {
      const rec = d.data() as AttendanceRecord;
      counts[rec.status] = (counts[rec.status] ?? 0) + 1;
    });
    return counts;
  }
}

class MockAttendanceService implements AttendanceService {
  private records: AttendanceRecord[] = [];

  async markToday(
    classId: string,
    entries: DailyEntry[],
    teacherId: string,
  ): Promise<void> {
    const date = todayStr();
    const now = new Date().toISOString();
    // Remove any existing entries for the same date + class, then mark fresh.
    this.records = this.records.filter(
      (r) => !(r.date === date && r.classId === classId),
    );
    for (const entry of entries) {
      this.records.push({
        id: genId(),
        studentId: entry.student.id,
        classId,
        date,
        status: entry.status,
        teacherId,
        markedAt: now,
      });
    }
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    return this.records.filter((r) => r.date === date);
  }

  async getHistory(studentId: string): Promise<AttendanceRecord[]> {
    return this.records.filter((r) => r.studentId === studentId);
  }

  async getMonthlyReport(month: string): Promise<Record<string, number>> {
    const { start, end } = monthOf(month);
    const counts: Record<string, number> = { present: 0, absent: 0, leave: 0 };
    this.records
      .filter((r) => r.date >= start && r.date <= end)
      .forEach((r) => {
        counts[r.status] = (counts[r.status] ?? 0) + 1;
      });
    return counts;
  }
}

export const attendanceService: AttendanceService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreAttendanceService()
    : new MockAttendanceService();