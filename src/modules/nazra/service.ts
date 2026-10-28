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
import type { NazraRecord, NazraUpdateInput } from "@/types";

export interface NazraService {
  recordClass(entries: NazraUpdateInput[], teacherId: string): Promise<void>;
  getByStudent(studentId: string): Promise<NazraRecord[]>;
  getByClassAndDate(classId: string, date: string): Promise<NazraRecord[]>;
  getRecent(date: string): Promise<NazraRecord[]>;
}

function recordId(studentId: string, date: string): string {
  return `nazra-${studentId}-${date}`;
}

function toRecord(input: NazraUpdateInput, teacherId: string): NazraRecord {
  return {
    id: recordId(input.studentId, input.date),
    ...input,
    teacherId,
    createdAt: new Date().toISOString(),
  };
}

class FirestoreNazraService implements NazraService {
  private col() {
    return collection(db!, "nazraRecords");
  }

  async recordClass(
    entries: NazraUpdateInput[],
    teacherId: string,
  ): Promise<void> {
    if (entries.length === 0) return;
    const batch = writeBatch(db!);
    for (const entry of entries) {
      const record = toRecord(entry, teacherId);
      batch.set(doc(db!, "nazraRecords", record.id), record);
    }
    await batch.commit();
  }

  async getByStudent(studentId: string): Promise<NazraRecord[]> {
    const q = query(
      this.col(),
      where("studentId", "==", studentId),
      orderBy("date", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as NazraRecord);
  }

  async getByClassAndDate(
    classId: string,
    date: string,
  ): Promise<NazraRecord[]> {
    const q = query(
      this.col(),
      where("classId", "==", classId),
      where("date", "==", date),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as NazraRecord);
  }

  async getRecent(date: string): Promise<NazraRecord[]> {
    const q = query(this.col(), where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as NazraRecord);
  }
}

class MockNazraService implements NazraService {
  private records: NazraRecord[] = [];

  async recordClass(
    entries: NazraUpdateInput[],
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

  async getByStudent(studentId: string): Promise<NazraRecord[]> {
    return this.records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getByClassAndDate(
    classId: string,
    date: string,
  ): Promise<NazraRecord[]> {
    return this.records.filter((r) => r.classId === classId && r.date === date);
  }

  async getRecent(date: string): Promise<NazraRecord[]> {
    return this.records.filter((r) => r.date === date);
  }
}

export const nazraService: NazraService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreNazraService()
    : new MockNazraService();
