import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { gradeFromMistakes } from "@/lib/hifz-grade";
import { latestPerStudent } from "@/lib/latest-by-student";
import type { HifzGrade, HifzRecord, HifzUpdateInput } from "@/types";

export interface HifzService {
  recordClass(entries: HifzUpdateInput[], teacherId: string): Promise<void>;
  getByStudent(studentId: string): Promise<HifzRecord[]>;
  /** Most recent record for each student in the class, whatever the date. */
  getLatestByClass(classId: string): Promise<HifzRecord[]>;
  getRecent(date: string): Promise<HifzRecord[]>;
}

const GRADE_ORDER: HifzGrade[] = [
  "mumtaz",
  "jayyid_jiddan",
  "jayyid",
  "needs_improvement",
];

function recordId(studentId: string, date: string): string {
  return `hifz-${studentId}-${date}`;
}

function toRecord(input: HifzUpdateInput, teacherId: string): HifzRecord {
  return {
    id: recordId(input.studentId, input.date),
    ...input,
    grade: gradeFromMistakes(input.mistakeCount),
    teacherId,
    createdAt: new Date().toISOString(),
  };
}

class FirestoreHifzService implements HifzService {
  private col() {
    return collection(db!, "hifzRecords");
  }

  async recordClass(
    entries: HifzUpdateInput[],
    teacherId: string,
  ): Promise<void> {
    if (entries.length === 0) return;
    const batch = writeBatch(db!);
    for (const entry of entries) {
      const record = toRecord(entry, teacherId);
      batch.set(doc(db!, "hifzRecords", record.id), record);
    }
    await batch.commit();
  }

  async getByStudent(studentId: string): Promise<HifzRecord[]> {
    // Equality-only filter, sorted in memory — avoids needing a composite
    // (studentId, date) index in Firestore.
    const q = query(this.col(), where("studentId", "==", studentId));
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((d) => d.data() as HifzRecord);
    return records.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getLatestByClass(classId: string): Promise<HifzRecord[]> {
    // Equality-only filter, latest-per-student resolved in memory — avoids
    // needing a composite (classId, date) index in Firestore.
    const q = query(this.col(), where("classId", "==", classId));
    const snapshot = await getDocs(q);
    return latestPerStudent(snapshot.docs.map((d) => d.data() as HifzRecord));
  }

  async getRecent(date: string): Promise<HifzRecord[]> {
    const q = query(this.col(), where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as HifzRecord);
  }
}

class MockHifzService implements HifzService {
  private records: HifzRecord[] = [];

  async recordClass(
    entries: HifzUpdateInput[],
    teacherId: string,
  ): Promise<void> {
    for (const entry of entries) {
      const record = toRecord(entry, teacherId);
      this.records = [
        ...this.records.filter((r) => r.id !== record.id),
        record,
      ];
    }
  }

  async getByStudent(studentId: string): Promise<HifzRecord[]> {
    return this.records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getLatestByClass(classId: string): Promise<HifzRecord[]> {
    return latestPerStudent(this.records.filter((r) => r.classId === classId));
  }

  async getRecent(date: string): Promise<HifzRecord[]> {
    return this.records.filter((r) => r.date === date);
  }
}

export const hifzService: HifzService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreHifzService()
    : new MockHifzService();

export { GRADE_ORDER };
