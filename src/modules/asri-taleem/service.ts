import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { studentService } from "@/modules/students/service";
import type {
  MarksInput,
  MarksRecord,
  PromotionRecord,
  StudentResult,
  Subject,
} from "@/types";

export interface AsriTaleemService {
  getSubjects(): Promise<Subject[]>;
  addSubject(name: string): Promise<Subject>;
  enterMarks(marks: MarksInput, teacherId: string): Promise<MarksRecord>;
  getMarksByStudent(studentId: string): Promise<MarksRecord[]>;
  getMarksByClass(classId: string): Promise<MarksRecord[]>;
  generateResults(classId: string, examType: string): Promise<StudentResult[]>;
  promote(studentId: string, toClassId: string, by: string): Promise<PromotionRecord>;
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub-urdu", name: "Urdu", programType: "asri_taleem" },
  { id: "sub-english", name: "English", programType: "asri_taleem" },
  { id: "sub-mathematics", name: "Mathematics", programType: "asri_taleem" },
  { id: "sub-science", name: "Science", programType: "asri_taleem" },
  { id: "sub-islamiyat", name: "Islamiyat", programType: "asri_taleem" },
];

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

class FirestoreAsriService implements AsriTaleemService {
  private subjectsCol() {
    return collection(db!, "subjects");
  }
  private marksCol() {
    return collection(db!, "marksRecords");
  }
  private promotionsCol() {
    return collection(db!, "promotions");
  }

  async getSubjects(): Promise<Subject[]> {
    const snapshot = await getDocs(this.subjectsCol());
    const subjects = snapshot.docs.map((d) => d.data() as Subject);
    return subjects.length ? subjects : DEFAULT_SUBJECTS;
  }

  async addSubject(name: string): Promise<Subject> {
    const subject: Subject = { id: genId("sub"), name, programType: "asri_taleem" };
    await setDoc(doc(db!, "subjects", subject.id), subject);
    return subject;
  }

  async enterMarks(
    mark: MarksInput,
    teacherId: string,
  ): Promise<MarksRecord> {
    const record: MarksRecord = {
      id: genId("marks"),
      ...mark,
      teacherId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db!, "marksRecords", record.id), record);
    return record;
  }

  async getMarksByStudent(studentId: string): Promise<MarksRecord[]> {
    const q = query(this.marksCol(), where("studentId", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as MarksRecord);
  }

  async getMarksByClass(classId: string): Promise<MarksRecord[]> {
    const q = query(this.marksCol(), where("classId", "==", classId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as MarksRecord);
  }

  async generateResults(
    classId: string,
    examType: string,
  ): Promise<StudentResult[]> {
    const students = await studentService.getAll();
    const classStudents = students.filter((s) => s.classId === classId);
    const subjects = await this.getSubjects();
    const marks = await this.getMarksByClass(classId);

    return classStudents.map((student) => {
      const studentMarks = marks.filter(
        (m) => m.studentId === student.id && m.examType === examType,
      );
      const subjectResults = subjects.map((sub) => {
        const recs = studentMarks.filter((m) => m.subjectId === sub.id);
        const total = recs.reduce((sum, r) => sum + r.marksObtained, 0);
        const max = recs.reduce((sum, r) => sum + r.totalMarks, 0);
        return {
          subjectName: sub.name,
          percentage: max > 0 ? (total / max) * 100 : 0,
        };
      });
      const overall = subjectResults.length
        ? subjectResults.reduce((sum, s) => sum + s.percentage, 0) /
          subjectResults.length
        : 0;
      return {
        studentId: student.id,
        studentName: student.name,
        percentage: overall,
        passed: overall >= 40,
        subjectResults,
      };
    });
  }

  async promote(
    studentId: string,
    toClassId: string,
    by: string,
  ): Promise<PromotionRecord> {
    const record: PromotionRecord = {
      id: genId("promo"),
      studentId,
      fromClassId: "",
      toClassId,
      promotedAt: new Date().toISOString(),
      promotedBy: by,
    };
    await setDoc(doc(db!, "promotions", record.id), record);
    return record;
  }
}

class MockAsriService implements AsriTaleemService {
  private subjects: Subject[] = [...DEFAULT_SUBJECTS];
  private marks: MarksRecord[] = [];
  private promotions: PromotionRecord[] = [];

  async getSubjects(): Promise<Subject[]> {
    return [...this.subjects];
  }

  async addSubject(name: string): Promise<Subject> {
    const subject: Subject = { id: genId("sub"), name, programType: "asri_taleem" };
    this.subjects = [subject, ...this.subjects];
    return subject;
  }

  async enterMarks(
    mark: MarksInput,
    teacherId: string,
  ): Promise<MarksRecord> {
    const record: MarksRecord = {
      id: genId("marks"),
      ...mark,
      teacherId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.marks = [record, ...this.marks];
    return record;
  }

  async getMarksByStudent(studentId: string): Promise<MarksRecord[]> {
    return this.marks.filter((m) => m.studentId === studentId);
  }

  async getMarksByClass(classId: string): Promise<MarksRecord[]> {
    return this.marks.filter((m) => m.classId === classId);
  }

  async generateResults(
    classId: string,
    examType: string,
  ): Promise<StudentResult[]> {
    const students = (await studentService.getAll()).filter(
      (s) => s.classId === classId,
    );
    return students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      percentage: 0,
      passed: false,
      subjectResults: [],
    }));
  }

  async promote(
    studentId: string,
    toClassId: string,
    by: string,
  ): Promise<PromotionRecord> {
    const record: PromotionRecord = {
      id: genId("promo"),
      studentId,
      fromClassId: "",
      toClassId,
      promotedAt: new Date().toISOString(),
      promotedBy: by,
    };
    this.promotions = [record, ...this.promotions];
    return record;
  }
}

export const asriTaleemService: AsriTaleemService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreAsriService()
    : new MockAsriService();