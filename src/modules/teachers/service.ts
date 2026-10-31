import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { DEMO_TEACHERS } from "@/lib/demo-data";
import type { Teacher, TeacherFormData } from "@/types";

let teachersDb: Teacher[] = [...DEMO_TEACHERS];

function genId() {
  return `tch-${Date.now()}`;
}

export interface TeacherService {
  getAll(): Promise<Teacher[]>;
  getById(id: string): Promise<Teacher | null>;
  search(query: string): Promise<Teacher[]>;
  create(data: TeacherFormData): Promise<Teacher>;
  update(id: string, data: TeacherFormData): Promise<Teacher>;
  delete(id: string): Promise<void>;
}

class FirestoreTeacherService implements TeacherService {
  private teachersCol() {
    return collection(db!, "teachers");
  }

  // Mirror the teacher into the `users` collection so they can log in
  // (authService.login reads users by email + password).
  private async syncUser(teacher: Teacher): Promise<void> {
    if (!teacher.email) return;
    await setDoc(doc(db!, "users", `usr-${teacher.id}`), {
      id: `usr-${teacher.id}`,
      email: teacher.email.toLowerCase(),
      password: teacher.password ?? "",
      fullName: teacher.name,
      role: "teacher",
      teacherId: teacher.id,
    });
  }

  async getAll(): Promise<Teacher[]> {
    const snapshot = await getDocs(this.teachersCol());
    return snapshot.docs.map((d) => d.data() as Teacher);
  }

  async getById(id: string): Promise<Teacher | null> {
    const snap = await getDoc(doc(db!, "teachers", id));
    if (!snap.exists()) return null;
    return snap.data() as Teacher;
  }

  async search(query: string): Promise<Teacher[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    const all = await this.getAll();
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.contactNumber.toLowerCase().includes(q),
    );
  }

  async create(data: TeacherFormData): Promise<Teacher> {
    const teacher: Teacher = {
      id: genId(),
      name: data.name,
      email: data.email,
      password: data.password,
      contactNumber: data.contactNumber ?? "",
      salary: data.salary ?? 0,
      classIds: data.classIds ?? [],
      qualification: data.qualification,
      experience: data.experience,
      programType: data.programType,
    };
    await setDoc(doc(db!, "teachers", teacher.id), teacher);
    await this.syncUser(teacher);
    return teacher;
  }

  async update(id: string, data: TeacherFormData): Promise<Teacher> {
    const ref = doc(db!, "teachers", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Not found");
    const existing = snap.data() as Teacher;
    const updated: Teacher = {
      ...existing,
      ...data,
      contactNumber: data.contactNumber ?? existing.contactNumber,
      salary: data.salary ?? existing.salary,
      classIds: data.classIds ?? existing.classIds,
      qualification: data.qualification ?? existing.qualification,
      experience: data.experience ?? existing.experience,
      programType: data.programType ?? existing.programType,
      id,
    };
    await updateDoc(ref, { ...updated });
    await this.syncUser(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db!, "teachers", id));
    await deleteDoc(doc(db!, "users", `usr-${id}`));
  }
}

class MockTeacherService implements TeacherService {
  async getAll(): Promise<Teacher[]> {
    return [...teachersDb];
  }

  async getById(id: string): Promise<Teacher | null> {
    return teachersDb.find((t) => t.id === id) ?? null;
  }

  async search(query: string): Promise<Teacher[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    return teachersDb.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.contactNumber.toLowerCase().includes(q) ||
        (t.classIds ?? []).some((classId) => classId.toLowerCase().includes(q)),
    );
  }

  async create(data: TeacherFormData): Promise<Teacher> {
    const teacher: Teacher = {
      id: genId(),
      name: data.name,
      email: data.email,
      password: data.password,
      contactNumber: data.contactNumber ?? "",
      salary: data.salary ?? 0,
      classIds: data.classIds ?? [],
      qualification: data.qualification,
      experience: data.experience,
      programType: data.programType,
    };
    teachersDb = [teacher, ...teachersDb];
    return teacher;
  }

  async update(id: string, data: TeacherFormData): Promise<Teacher> {
    const idx = teachersDb.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Not found");
    teachersDb[idx] = {
      ...teachersDb[idx],
      ...data,
      contactNumber: data.contactNumber ?? teachersDb[idx].contactNumber,
      salary: data.salary ?? teachersDb[idx].salary,
      classIds: data.classIds ?? teachersDb[idx].classIds,
      qualification: data.qualification ?? teachersDb[idx].qualification,
      experience: data.experience ?? teachersDb[idx].experience,
      programType: data.programType ?? teachersDb[idx].programType,
    };
    return teachersDb[idx];
  }

  async delete(id: string): Promise<void> {
    teachersDb = teachersDb.filter((t) => t.id !== id);
  }
}

export const teacherService: TeacherService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreTeacherService()
    : new MockTeacherService();
