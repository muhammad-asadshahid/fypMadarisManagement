import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { gradeFromMistakes } from "@/lib/hifz-grade";
import type { HifzGrade, HifzRecord, HifzUpdateInput } from "@/types";

export interface HifzService {
  recordClass(entries: HifzUpdateInput[], teacherId: string): Promise<void>;
  getByStudent(studentId: string): Promise<HifzRecord[]>;
  getByClassAndDate(classId: string, date: string): Promise<HifzRecord[]>;
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
    const q = query(
      this.col(),
      where("studentId", "==", studentId),
      orderBy("date", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as HifzRecord);
  }

  async getByClassAndDate(
    classId: string,
    date: string,
  ): Promise<HifzRecord[]> {
    const q = query(
      this.col(),
      where("classId", "==", classId),
      where("date", "==", date),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as HifzRecord);
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

  async getByClassAndDate(
    classId: string,
    date: string,
  ): Promise<HifzRecord[]> {
    return this.records.filter((r) => r.classId === classId && r.date === date);
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
