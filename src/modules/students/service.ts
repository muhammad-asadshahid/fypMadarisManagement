import {
    MOCK_CLASSES,
    MOCK_STUDENTS,
    STUDENTS_WITH_FEE_DUES,
    STUDENTS_WITH_HOSTEL,
} from "@/constants/mock-data";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import type {
    Class,
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
}

let studentsDb = [...MOCK_STUDENTS];

function mapStudentFromDb(record: any): Student {
  return {
    id: String(record.id),
    name: String(record.name),
    fatherName: String(record.father_name ?? record.fatherName ?? ""),
    dateOfBirth: String(record.date_of_birth ?? record.dateOfBirth ?? ""),
    address: String(record.address ?? ""),
    contactNumber: String(record.contact_number ?? record.contactNumber ?? ""),
    admissionDate: String(record.admission_date ?? record.admissionDate ?? ""),
    programType: String(
      record.program_type ?? record.programType ?? "hifz_ul_quran",
    ) as Student["programType"],
    classId: String(record.class_id ?? record.classId ?? ""),
    hostelStatus: Boolean(record.hostel_status ?? record.hostelStatus),
    photoUri: record.photo_uri ?? record.photoUri ?? undefined,
    createdAt: String(
      record.created_at ?? record.createdAt ?? new Date().toISOString(),
    ),
    updatedAt: String(
      record.updated_at ?? record.updatedAt ?? new Date().toISOString(),
    ),
  };
}

function mapStudentToDb(data: StudentFormData) {
  return {
    name: data.name,
    father_name: data.fatherName,
    date_of_birth: data.dateOfBirth,
    address: data.address,
    contact_number: data.contactNumber,
    admission_date: data.admissionDate,
    program_type: data.programType,
    class_id: data.classId,
    hostel_status: data.hostelStatus,
    photo_uri: data.photoUri ?? null,
  };
}

function generateId(): string {
  return `stu-${Date.now()}`;
}

class SupabaseStudentService implements StudentService {
  async getAll(): Promise<Student[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapStudentFromDb);
  }

  async getById(id: string): Promise<Student | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }
    return data ? mapStudentFromDb(data) : null;
  }

  async search(query: string): Promise<Student[]> {
    const q = query.trim();
    if (!q) return this.getAll();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(
        `name.ilike.%${q}%,father_name.ilike.%${q}%,contact_number.ilike.%${q}%`,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapStudentFromDb);
  }

  async create(data: StudentFormData): Promise<Student> {
    if (!supabase) throw new Error("Supabase is not available");
    const now = new Date().toISOString();
    const values = {
      ...mapStudentToDb(data),
      created_at: now,
      updated_at: now,
    };
    const { data: record, error } = await supabase
      .from("students")
      .insert(values)
      .select()
      .single();
    if (error) throw error;
    if (!record) throw new Error("Student record not returned");
    return mapStudentFromDb(record);
  }

  async update(id: string, data: StudentFormData): Promise<Student> {
    if (!supabase) throw new Error("Supabase is not available");
    const values = {
      ...mapStudentToDb(data),
      updated_at: new Date().toISOString(),
    };
    const { data: record, error } = await supabase
      .from("students")
      .update(values)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    if (!record) throw new Error("Student record not returned");
    return mapStudentFromDb(record);
  }

  async canDelete(id: string): Promise<StudentDeletionCheck> {
    return { canDelete: true, reasons: [] };
  }

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error("Supabase is not available");
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
  }

  async getClasses(): Promise<Class[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("classes").select("*");
    if (error) throw error;
    return (data ?? []).map((cls: any) => ({
      id: String(cls.id),
      name: String(cls.name),
      programType: String(
        cls.program_type ?? cls.programType ?? "hifz_ul_quran",
      ) as Class["programType"],
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
      ...data,
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
      ...data,
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
}

export const studentService: StudentService =
  SUPABASE_CONFIGURED && supabase
    ? new SupabaseStudentService()
    : new MockStudentService();
