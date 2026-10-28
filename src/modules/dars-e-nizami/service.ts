import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type {
  DarsProgressRecord,
  Kitab,
  KitabInput,
  KitabProgressInput,
} from "@/types";

export interface DarsENizamiService {
  getKutub(): Promise<Kitab[]>;
  /** Create a new kitab, or update an existing one (when `id` is given). */
  saveKitab(input: KitabInput): Promise<Kitab>;
  /** Delete a kitab and every class's progress for it. */
  deleteKitab(id: string): Promise<void>;
  getProgress(): Promise<DarsProgressRecord[]>;
  updateProgress(
    classId: string,
    kitabId: string,
    input: KitabProgressInput,
    teacherId: string,
  ): Promise<DarsProgressRecord>;
}

const DEFAULT_KUTUB: Kitab[] = [
  { id: "kitab-hidayat-nahw", name: "Hidayat-un-Nahw", totalPages: 400 },
  { id: "kitab-mishkat", name: "Mishkat", totalPages: 800 },
  { id: "kitab-sarf", name: "Sarf", totalPages: 250 },
  { id: "kitab-fiqh", name: "Fiqh", totalPages: 600 },
];

function progressId(classId: string, kitabId: string): string {
  return `${classId}__${kitabId}`;
}

function genId(): string {
  return `kitab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/** Completion is derived, never entered: pages covered against total pages. */
export function computeCompletion(
  kitab: Pick<Kitab, "totalPages">,
  pagesCovered: number,
): number {
  const base = kitab.totalPages > 0 ? (pagesCovered / kitab.totalPages) * 100 : 0;
  return Math.min(100, Math.max(0, Math.round(base)));
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
    const kutub = snapshot.docs.map((d) => {
      const k = d.data() as Kitab;
      // The document id is the source of truth for `id` (older docs may omit it).
      return { ...k, id: d.id, totalPages: k.totalPages ?? 0 };
    });
    return kutub.length ? kutub : DEFAULT_KUTUB;
  }

  async saveKitab(input: KitabInput): Promise<Kitab> {
    const kitab: Kitab = {
      id: input.id ?? genId(),
      name: input.name,
      totalPages: input.totalPages,
    };
    await setDoc(doc(db!, "kitab", kitab.id), kitab);
    return kitab;
  }

  async deleteKitab(id: string): Promise<void> {
    await deleteDoc(doc(db!, "kitab", id));
    const snap = await getDocs(
      query(this.recordsCol(), where("kitabId", "==", id)),
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }

  async getProgress(): Promise<DarsProgressRecord[]> {
    const snapshot = await getDocs(this.recordsCol());
    return snapshot.docs.map((d) => ({
      ...(d.data() as DarsProgressRecord),
      id: d.id,
    }));
  }

  async updateProgress(
    classId: string,
    kitabId: string,
    input: KitabProgressInput,
    teacherId: string,
  ): Promise<DarsProgressRecord> {
    const snap = await getDoc(doc(db!, "kitab", kitabId));
    const kitab = snap.exists()
      ? (snap.data() as Kitab)
      : // A built-in catalog book that was never saved still has known totals.
        (DEFAULT_KUTUB.find((k) => k.id === kitabId) ?? {
          id: kitabId,
          name: "",
          totalPages: 0,
        });

    const record: DarsProgressRecord = {
      id: progressId(classId, kitabId),
      classId,
      kitabId,
      pagesCovered: input.pagesCovered,
      completionPercentage: computeCompletion(kitab, input.pagesCovered),
      teacherId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db!, "darsProgressRecords", record.id), record);
    return record;
  }
}

class MockDarsService implements DarsENizamiService {
  private kutub: Kitab[] = [...DEFAULT_KUTUB];
  private records: DarsProgressRecord[] = [];

  async getKutub(): Promise<Kitab[]> {
    return [...this.kutub];
  }

  async saveKitab(input: KitabInput): Promise<Kitab> {
    const kitab: Kitab = {
      id: input.id ?? genId(),
      name: input.name,
      totalPages: input.totalPages,
    };
    const idx = this.kutub.findIndex((k) => k.id === kitab.id);
    this.kutub =
      idx === -1
        ? [kitab, ...this.kutub]
        : this.kutub.map((k) => (k.id === kitab.id ? kitab : k));
    return kitab;
  }

  async deleteKitab(id: string): Promise<void> {
    this.kutub = this.kutub.filter((k) => k.id !== id);
    this.records = this.records.filter((r) => r.kitabId !== id);
  }

  async getProgress(): Promise<DarsProgressRecord[]> {
    return [...this.records];
  }

  async updateProgress(
    classId: string,
    kitabId: string,
    input: KitabProgressInput,
    teacherId: string,
  ): Promise<DarsProgressRecord> {
    const kitab =
      this.kutub.find((k) => k.id === kitabId) ?? ({ totalPages: 0 } as Kitab);

    const record: DarsProgressRecord = {
      id: progressId(classId, kitabId),
      classId,
      kitabId,
      pagesCovered: input.pagesCovered,
      completionPercentage: computeCompletion(kitab, input.pagesCovered),
      teacherId,
      updatedAt: new Date().toISOString(),
    };
    this.records = [record, ...this.records.filter((r) => r.id !== record.id)];
    return record;
  }
}

export const darsENizamiService: DarsENizamiService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreDarsService()
    : new MockDarsService();
