import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type { NazraRecord, NazraUpdateInput } from "@/types";

export interface NazraService {
  record(update: NazraUpdateInput, teacherId: string): Promise<NazraRecord>;
  getByStudent(studentId: string): Promise<NazraRecord[]>;
  getRecent(date: string): Promise<NazraRecord[]>;
}

function genId(): string {
  return `nazra-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

class FirestoreNazraService implements NazraService {
  private col() {
    return collection(db!, "nazraRecords");
  }

  async record(
    update: NazraUpdateInput,
    teacherId: string,
  ): Promise<NazraRecord> {
    const record: NazraRecord = {
      id: genId(),
      ...update,
      teacherId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db!, "nazraRecords", record.id), record);
    return record;
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

  async getRecent(date: string): Promise<NazraRecord[]> {
    const q = query(this.col(), where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as NazraRecord);
  }
}

class MockNazraService implements NazraService {
  private records: NazraRecord[] = [];

  async record(
    update: NazraUpdateInput,
    teacherId: string,
  ): Promise<NazraRecord> {
    const record: NazraRecord = {
      id: genId(),
      ...update,
      teacherId,
      createdAt: new Date().toISOString(),
    };
    this.records = [record, ...this.records];
    return record;
  }

  async getByStudent(studentId: string): Promise<NazraRecord[]> {
    return this.records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getRecent(date: string): Promise<NazraRecord[]> {
    return this.records.filter((r) => r.date === date);
  }
}

export const nazraService: NazraService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreNazraService()
    : new MockNazraService();