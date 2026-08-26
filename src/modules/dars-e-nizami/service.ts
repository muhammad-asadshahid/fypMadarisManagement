import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type { DarsProgressRecord, DarsUpdateInput, Kitab } from "@/types";

export interface DarsENizamiService {
  getKutub(): Promise<Kitab[]>;
  addKitab(name: string, totalChapters: number): Promise<Kitab>;
  record(update: DarsUpdateInput, teacherId: string): Promise<DarsProgressRecord>;
  getByStudent(studentId: string): Promise<DarsProgressRecord[]>;
}

const DEFAULT_KUTUB: Kitab[] = [
  { id: "kitab-nahw", name: "Nahw", totalChapters: 20 },
  { id: "kitab-sarf", name: "Sarf", totalChapters: 18 },
  { id: "kitab-fiqh", name: "Fiqh", totalChapters: 25 },
  { id: "kitab-tafsir", name: "Tafsir", totalChapters: 15 },
];

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

class FirestoreDarsService implements DarsENizamiService {
  private kutubCol() {
    return collection(db!, "kitab");
  }
  private recordsCol() {
    return collection(db!, "darsProgressRecords");
  }

  async getKutub(): Promise<Kitab[]> {
    const snapshot = await getDocs(this.kutubCol());
    const kutub = snapshot.docs.map((d) => d.data() as Kitab);
    return kutub.length ? kutub : DEFAULT_KUTUB;
  }

  async addKitab(name: string, totalChapters: number): Promise<Kitab> {
    const kitab: Kitab = { id: genId("kitab"), name, totalChapters };
    await setDoc(doc(db!, "kitab", kitab.id), kitab);
    return kitab;
  }

  async record(
    update: DarsUpdateInput,
    teacherId: string,
  ): Promise<DarsProgressRecord> {
    const record: DarsProgressRecord = {
      id: genId("dars"),
      ...update,
      teacherId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db!, "darsProgressRecords", record.id), record);
    return record;
  }

  async getByStudent(studentId: string): Promise<DarsProgressRecord[]> {
    const q = query(
      this.recordsCol(),
      where("studentId", "==", studentId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as DarsProgressRecord);
  }
}

class MockDarsService implements DarsENizamiService {
  private kutub: Kitab[] = [...DEFAULT_KUTUB];
  private records: DarsProgressRecord[] = [];

  async getKutub(): Promise<Kitab[]> {
    return [...this.kutub];
  }

  async addKitab(name: string, totalChapters: number): Promise<Kitab> {
    const kitab: Kitab = { id: genId("kitab"), name, totalChapters };
    this.kutub = [kitab, ...this.kutub];
    return kitab;
  }

  async record(
    update: DarsUpdateInput,
    teacherId: string,
  ): Promise<DarsProgressRecord> {
    const record: DarsProgressRecord = {
      id: genId("dars"),
      ...update,
      teacherId,
      createdAt: new Date().toISOString(),
    };
    this.records = [record, ...this.records];
    return record;
  }

  async getByStudent(studentId: string): Promise<DarsProgressRecord[]> {
    return this.records.filter((r) => r.studentId === studentId);
  }
}

export const darsENizamiService: DarsENizamiService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreDarsService()
    : new MockDarsService();