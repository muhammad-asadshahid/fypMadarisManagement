import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type { LessonLog, LessonLogInput } from "@/types";

export interface LessonLogService {
  getByClassAndDate(classId: string, date: string): Promise<LessonLog | null>;
  save(input: LessonLogInput, teacherId: string): Promise<LessonLog>;
  getHistory(classId: string): Promise<LessonLog[]>;
}

function lessonId(classId: string, date: string): string {
  return `ll-${classId}-${date}`;
}

class FirestoreLessonLogService implements LessonLogService {
  private col() {
    return collection(db!, "lessonLogs");
  }

  async getByClassAndDate(
    classId: string,
    date: string,
  ): Promise<LessonLog | null> {
    const snap = await getDoc(doc(db!, "lessonLogs", lessonId(classId, date)));
    return snap.exists() ? (snap.data() as LessonLog) : null;
  }

  async save(input: LessonLogInput, teacherId: string): Promise<LessonLog> {
    const id = lessonId(input.classId, input.date);
    const existing = await this.getByClassAndDate(input.classId, input.date);
    const now = new Date().toISOString();
    const record: LessonLog = {
      id,
      ...input,
      teacherId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await setDoc(doc(db!, "lessonLogs", id), record);
    return record;
  }

  async getHistory(classId: string): Promise<LessonLog[]> {
    const q = query(
      this.col(),
      where("classId", "==", classId),
      orderBy("date", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as LessonLog);
  }
}

class MockLessonLogService implements LessonLogService {
  private records: LessonLog[] = [];

  async getByClassAndDate(
    classId: string,
    date: string,
  ): Promise<LessonLog | null> {
    return (
      this.records.find((r) => r.classId === classId && r.date === date) ?? null
    );
  }

  async save(input: LessonLogInput, teacherId: string): Promise<LessonLog> {
    const id = lessonId(input.classId, input.date);
    const existing = await this.getByClassAndDate(input.classId, input.date);
    const now = new Date().toISOString();
    const record: LessonLog = {
      id,
      ...input,
      teacherId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.records = [...this.records.filter((r) => r.id !== id), record];
    return record;
  }

  async getHistory(classId: string): Promise<LessonLog[]> {
    return this.records
      .filter((r) => r.classId === classId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }
}

export const lessonLogService: LessonLogService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreLessonLogService()
    : new MockLessonLogService();
