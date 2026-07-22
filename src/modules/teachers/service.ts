import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import type { Teacher, TeacherFormData } from "@/types";

const MOCK_TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    name: "Maulana Abdullah",
    subjects: ["Hifz"],
    contactNumber: "0300111222",
    salary: 30000,
    classIds: ["cls-1"],
  },
];

let teachersDb = [...MOCK_TEACHERS];

function mapTeacherFromDb(record: any): Teacher {
  return {
    id: String(record.id),
    name: String(record.name),
    subjects: Array.isArray(record.subjects)
      ? record.subjects.map(String)
      : typeof record.subjects === "string"
        ? [String(record.subjects)]
        : [],
    contactNumber: String(record.contact_number ?? record.contactNumber ?? ""),
    salary: Number(record.salary ?? 0),
    classIds: Array.isArray(record.class_ids)
      ? record.class_ids.map(String)
      : Array.isArray(record.classIds)
        ? record.classIds.map(String)
        : typeof record.class_ids === "string"
          ? [String(record.class_ids)]
          : [],
  };
}

function mapTeacherToDb(data: TeacherFormData) {
  return {
    name: data.name,
    subjects: data.subjects ?? [],
    class_ids: data.classIds ?? [],
    contact_number: data.contactNumber,
    salary: data.salary,
  };
}

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

class SupabaseTeacherService implements TeacherService {
  async getAll(): Promise<Teacher[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("teachers").select("*");
    if (error) throw error;
    return (data ?? []).map(mapTeacherFromDb);
  }

  async getById(id: string): Promise<Teacher | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }
    return data ? mapTeacherFromDb(data) : null;
  }

  async search(query: string): Promise<Teacher[]> {
    const q = query.trim();
    if (!q) return this.getAll();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .or(`name.ilike.%${q}%,contact_number.ilike.%${q}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapTeacherFromDb);
  }

  async create(data: TeacherFormData): Promise<Teacher> {
    if (!supabase) throw new Error("Supabase is not available");
    const { data: record, error } = await supabase
      .from("teachers")
      .insert(mapTeacherToDb(data))
      .select()
      .single();
    if (error) throw error;
    if (!record) throw new Error("Teacher record not returned");
    return mapTeacherFromDb(record);
  }

  async update(id: string, data: TeacherFormData): Promise<Teacher> {
    if (!supabase) throw new Error("Supabase is not available");
    const { data: record, error } = await supabase
      .from("teachers")
      .update(mapTeacherToDb(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    if (!record) throw new Error("Teacher record not returned");
    return mapTeacherFromDb(record);
  }

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error("Supabase is not available");
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) throw error;
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
        t.subjects.some((subject) => subject.toLowerCase().includes(q)) ||
        (t.classIds ?? []).some((classId) => classId.toLowerCase().includes(q)),
    );
  }

  async create(data: TeacherFormData): Promise<Teacher> {
    const teacher: Teacher = {
      id: genId(),
      name: data.name,
      contactNumber: data.contactNumber ?? "",
      salary: data.salary ?? 0,
      subjects: data.subjects ?? [],
      classIds: data.classIds ?? [],
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
      subjects: data.subjects ?? teachersDb[idx].subjects,
      classIds: data.classIds ?? teachersDb[idx].classIds,
    };
    return teachersDb[idx];
  }

  async delete(id: string): Promise<void> {
    teachersDb = teachersDb.filter((t) => t.id !== id);
  }
}

export const teacherService: TeacherService =
  SUPABASE_CONFIGURED && supabase
    ? new SupabaseTeacherService()
    : new MockTeacherService();
