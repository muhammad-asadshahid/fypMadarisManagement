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
import type { HifzGrade, HifzRecord, HifzUpdateInput } from "@/types";

export interface HifzService {
  record(update: HifzUpdateInput, teacherId: string): Promise<HifzRecord>;
  getByStudent(studentId: string): Promise<HifzRecord[]>;
  getRecent(date: string): Promise<HifzRecord[]>;
}

const GRADE_ORDER: HifzGrade[] = [
  "mumtaz",
  "jayyid_jiddan",
  "jayyid",
  "needs_improvement",
];

function genId(): string {
  return `hifz-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

class FirestoreHifzService implements HifzService {
  private col() {
    return collection(db!, "hifzRecords");
  }

  async record(
    update: HifzUpdateInput,
    teacherId: string,
  ): Promise<HifzRecord> {
    const record: HifzRecord = {
      id: genId(),
      ...update,
      teacherId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db!, "hifzRecords", record.id), record);
    return record;
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

  async getRecent(date: string): Promise<HifzRecord[]> {
    const q = query(this.col(), where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as HifzRecord);
  }
}

class MockHifzService implements HifzService {
  private records: HifzRecord[] = [];

  async record(
    update: HifzUpdateInput,
    teacherId: string,
  ): Promise<HifzRecord> {
    const record: HifzRecord = {
      id: genId(),
      ...update,
      teacherId,
      createdAt: new Date().toISOString(),
    };
    this.records = [record, ...this.records];
    return record;
  }

  async getByStudent(studentId: string): Promise<HifzRecord[]> {
    return this.records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
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