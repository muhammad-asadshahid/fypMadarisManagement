import {
    MOCK_CLASSES,
    MOCK_STUDENTS,
    STUDENTS_WITH_FEE_DUES,
    STUDENTS_WITH_HOSTEL,
} from "@/constants/mock-data";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import type {
    Class,
    ClassWithStudents,
    Student,
    StudentDeletionCheck,
    StudentFormData,
} from "@/types";

export interface StudentService {
  getAll(): Promise<Student[]>;
  getById(id: string): Promise<Student | null>;
  search(query: string): Promise<Student[]>;
  create(data: StudentFormData): Promise<Student>;
  update(id: string, data: StudentFormData): Promise<Student>;
  canDelete(id: string): Promise<StudentDeletionCheck>;
  delete(id: string): Promise<void>;
  getClasses(): Promise<Class[]>;
  getClassesWithStudents(): Promise<ClassWithStudents[]>;
}

let studentsDb = [...MOCK_STUDENTS];

function generateId(): string {
  return `stu-${Date.now()}`;
}

// Registration does not carry a single `name`; it stores firstName/lastName.
// Ensure the student always has a display name and a split name for symmetry.
function normalizeName(data: StudentFormData): StudentFormData {
  const name =
    (data.name ?? "").trim() ||
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  const parts = name.split(/\s+/);
  return {
    ...data,
    name,
    firstName: data.firstName ?? parts[0] ?? "",
    lastName: data.lastName ?? parts.slice(1).join(" ") ?? "",
  };
}

class FirestoreStudentService implements StudentService {
  private studentsCol() {
    return collection(db!, "students");
  }

  async getAll(): Promise<Student[]> {
    const q = query(this.studentsCol(), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as Student);
  }

  async getById(id: string): Promise<Student | null> {
    const snap = await getDoc(doc(db!, "students", id));
    if (!snap.exists()) return null;
    return snap.data() as Student;
  }

  async search(searchQuery: string): Promise<Student[]> {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return this.getAll();
    const all = await this.getAll();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.contactNumber.includes(q),
    );
  }

  async create(data: StudentFormData): Promise<Student> {
    const now = new Date().toISOString();
    const id = generateId();
    const student: Student = {
      id,
      ...normalizeName(data),
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db!, "students", id), student);
    return student;
  }

  async update(id: string, data: StudentFormData): Promise<Student> {
    const ref = doc(db!, "students", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Student not found");
    const updated: Student = {
      ...(snap.data() as Student),
      ...normalizeName(data),
      id,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(ref, { ...updated });
    return updated;
  }

  async canDelete(): Promise<StudentDeletionCheck> {
    return { canDelete: true, reasons: [] };
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db!, "students", id));
  }

  async getClasses(): Promise<Class[]> {
    const snapshot = await getDocs(collection(db!, "classes"));
    return snapshot.docs.map((d) => d.data() as Class);
  }

  async getClassesWithStudents(): Promise<ClassWithStudents[]> {
    const [classes, students] = await Promise.all([
      this.getClasses(),
      this.getAll(),
    ]);
    return classes.map((cls) => ({
      ...cls,
      students: students.filter((student) => student.classId === cls.id),
    }));
  }
}

class MockStudentService implements StudentService {
  async getAll(): Promise<Student[]> {
    return [...studentsDb].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getById(id: string): Promise<Student | null> {
    return studentsDb.find((s) => s.id === id) ?? null;
  }

  async search(query: string): Promise<Student[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    return studentsDb.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.contactNumber.includes(q),
    );
  }

  async create(data: StudentFormData): Promise<Student> {
    const now = new Date().toISOString();
    const student: Student = {
      id: generateId(),
      ...normalizeName(data),
      createdAt: now,
      updatedAt: now,
    };
    studentsDb = [student, ...studentsDb];
    return student;
  }

  async update(id: string, data: StudentFormData): Promise<Student> {
    const index = studentsDb.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Student not found");
    const updated: Student = {
      ...studentsDb[index],
      ...normalizeName(data),
      updatedAt: new Date().toISOString(),
    };
    studentsDb[index] = updated;
    return updated;
  }

  async canDelete(id: string): Promise<StudentDeletionCheck> {
    const reasons: string[] = [];
    if (STUDENTS_WITH_FEE_DUES.has(id)) {
      reasons.push("activeFeeDues");
    }
    if (STUDENTS_WITH_HOSTEL.has(id)) {
      reasons.push("hostelAllocation");
    }
    return { canDelete: reasons.length === 0, reasons };
  }

  async delete(id: string): Promise<void> {
    const check = await this.canDelete(id);
    if (!check.canDelete) {
      throw new Error(check.reasons.join(","));
    }
    studentsDb = studentsDb.filter((s) => s.id !== id);
  }

  async getClasses(): Promise<Class[]> {
    return MOCK_CLASSES;
  }

  async getClassesWithStudents(): Promise<ClassWithStudents[]> {
    const [classes, students] = await Promise.all([
      this.getClasses(),
      this.getAll(),
    ]);
    return classes.map((cls) => ({
      ...cls,
      students: students.filter((student) => student.classId === cls.id),
    }));
  }
}

export const studentService: StudentService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreStudentService()
    : new MockStudentService();
