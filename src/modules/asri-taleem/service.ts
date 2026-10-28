import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { studentService } from "@/modules/students/service";
import type {
  MarksInput,
  MarksRecord,
  Student,
  StudentFormData,
  Subject,
} from "@/types";

/** The four fixed Asri Taleem subjects. Nothing else is ever shown. */
export const DEFAULT_ASRI_SUBJECT_NAMES = [
  "English",
  "Math",
  "Science",
  "Computer",
];

export interface AsriTaleemService {
  getSubjects(): Promise<Subject[]>;
  renameSubject(subjectId: string, name: string): Promise<void>;
  saveMarks(entries: MarksInput[], teacherId: string): Promise<void>;
  getAllMarks(): Promise<MarksRecord[]>;
  setGrade(studentId: string, grade: number): Promise<void>;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function defaultSubjects(): Subject[] {
  return DEFAULT_ASRI_SUBJECT_NAMES.map((name) => ({
    id: `asri-sub-${slugify(name)}`,
    name,
    programType: "asri_taleem" as const,
  }));
}

function markId(studentId: string, subjectId: string): string {
  return `marks-${studentId}-${subjectId}`;
}

function toFormData(student: Student): StudentFormData {
  return {
    name: student.name,
    firstName: student.firstName,
    lastName: student.lastName,
    fatherName: student.fatherName,
    dateOfBirth: student.dateOfBirth,
    address: student.address,
    contactNumber: student.contactNumber,
    admissionDate: student.admissionDate,
    programType: student.programType,
    classId: student.classId,
    hostelStatus: student.hostelStatus,
    grade: student.grade,
    photoUri: student.photoUri,
    email: student.email,
    password: student.password,
    bFormCnic: student.bFormCnic,
    city: student.city,
    guardianEmail: student.guardianEmail,
    guardianMobile: student.guardianMobile,
  };
}

async function persistGrade(studentId: string, grade: number): Promise<void> {
  const student = await studentService.getById(studentId);
  if (!student) return;
  await studentService.update(studentId, { ...toFormData(student), grade });
}

class FirestoreAsriService implements AsriTaleemService {
  private subjectsCol() {
    return collection(db!, "subjects");
  }
  private marksCol() {
    return collection(db!, "marksRecords");
  }

  async getSubjects(): Promise<Subject[]> {
    // Only the fixed four are ever returned; stored docs merely override a name.
    const snapshot = await getDocs(
      query(this.subjectsCol(), where("programType", "==", "asri_taleem")),
    );
    const renames = new Map<string, string>();
    snapshot.docs.forEach((d) => {
      const data = d.data() as Subject;
      if (data?.name) renames.set(d.id, data.name);
    });
    return defaultSubjects().map((subject) => ({
      ...subject,
      name: renames.get(subject.id) ?? subject.name,
    }));
  }

  async renameSubject(subjectId: string, name: string): Promise<void> {
    await setDoc(
      doc(db!, "subjects", subjectId),
      { id: subjectId, name, programType: "asri_taleem" },
      { merge: true },
    );
  }

  async saveMarks(entries: MarksInput[], teacherId: string): Promise<void> {
    if (entries.length === 0) return;
    const now = new Date().toISOString();
    const batch = writeBatch(db!);
    for (const entry of entries) {
      const record: MarksRecord = {
        id: markId(entry.studentId, entry.subjectId),
        ...entry,
        teacherId,
        date: now,
        updatedAt: now,
      };
      batch.set(doc(db!, "marksRecords", record.id), record);
    }
    await batch.commit();
  }

  async getAllMarks(): Promise<MarksRecord[]> {
    const snapshot = await getDocs(this.marksCol());
    return snapshot.docs.map((d) => d.data() as MarksRecord);
  }

  async setGrade(studentId: string, grade: number): Promise<void> {
    await persistGrade(studentId, grade);
  }
}

class MockAsriService implements AsriTaleemService {
  private renames: Record<string, string> = {};
  private marks: MarksRecord[] = [];

  async getSubjects(): Promise<Subject[]> {
    return defaultSubjects().map((subject) => ({
      ...subject,
      name: this.renames[subject.id] ?? subject.name,
    }));
  }

  async renameSubject(subjectId: string, name: string): Promise<void> {
    this.renames = { ...this.renames, [subjectId]: name };
  }

  async saveMarks(entries: MarksInput[], teacherId: string): Promise<void> {
    const now = new Date().toISOString();
    for (const entry of entries) {
      const record: MarksRecord = {
        id: markId(entry.studentId, entry.subjectId),
        ...entry,
        teacherId,
        date: now,
        updatedAt: now,
      };
      this.marks = [...this.marks.filter((m) => m.id !== record.id), record];
    }
  }

  async getAllMarks(): Promise<MarksRecord[]> {
    return [...this.marks];
  }

  async setGrade(studentId: string, grade: number): Promise<void> {
    await persistGrade(studentId, grade);
  }
}

export const asriTaleemService: AsriTaleemService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreAsriService()
    : new MockAsriService();
