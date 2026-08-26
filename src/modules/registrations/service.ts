import { MOCK_CLASSES } from "@/constants/mock-data";
import {
    collection,
    doc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    setDoc,
    where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { studentService } from "@/modules/students/service";
import type {
  Class,
  ProgramType,
  Registration,
  RegistrationFormData,
  StudentFormData,
} from "@/types";

export interface RegistrationService {
  submit(data: RegistrationFormData): Promise<Registration>;
  getPending(): Promise<Registration[]>;
  getAll(): Promise<Registration[]>;
  approve(id: string): Promise<Registration>;
  reject(id: string): Promise<Registration>;
}

export function buildRegistrationFromDb(record: any): Registration {
  return {
    id: String(record.id),
    firstName: String(record.firstName ?? record.first_name ?? ""),
    lastName: String(record.lastName ?? record.last_name ?? ""),
    fatherName: String(record.fatherName ?? record.father_name ?? ""),
    bFormCnic: String(record.bFormCnic ?? record.b_form_cnic ?? ""),
    guardianMobile: String(
      record.guardianMobile ?? record.guardian_mobile ?? "",
    ),
    guardianEmail: String(
      record.guardianEmail ?? record.guardian_email ?? "",
    ),
    password: String(record.password ?? ""),
    address: String(record.address ?? ""),
    city: String(record.city ?? ""),
    programType: String(
      record.programType ?? record.program_type ?? "hifz_ul_quran",
    ) as ProgramType,
    photoUri: record.photoUri ?? record.photo_uri ?? undefined,
    status: String(record.status ?? "pending") as Registration["status"],
    createdAt: String(
      record.createdAt ?? record.created_at ?? new Date().toISOString(),
    ),
    approvedAt: record.approvedAt ?? record.approved_at ?? undefined,
    rejectedAt: record.rejectedAt ?? record.rejected_at ?? undefined,
  };
}

function generateId(): string {
  return `reg-${Date.now()}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function classForProgram(classes: Class[], programType: ProgramType): string {
  return (
    classes.find((c) => c.programType === programType)?.id ?? classes[0]?.id ?? ""
  );
}

// Shared field set between Registration and Student. On approve, every shared
// field is copied verbatim so the two collections stay alike.
function buildStudentFromRegistration(
  classes: Class[],
  reg: Registration,
): StudentFormData {
  const name = `${reg.firstName} ${reg.lastName}`.trim();
  return {
    name,
    firstName: reg.firstName,
    lastName: reg.lastName,
    fatherName: reg.fatherName,
    dateOfBirth: "",
    address: reg.address,
    contactNumber: reg.guardianMobile,
    admissionDate: today(),
    programType: reg.programType,
    classId: classForProgram(classes, reg.programType),
    hostelStatus: reg.hostelStatus ?? false,
    photoUri: reg.photoUri,
    email: reg.guardianEmail,
    password: reg.password,
    bFormCnic: reg.bFormCnic,
    city: reg.city,
    guardianEmail: reg.guardianEmail,
    guardianMobile: reg.guardianMobile,
  };
}

// In-memory store (mock mode).
export let registrationDb: Registration[] = [];

function getRegistration(id: string): Registration {
  const reg = registrationDb.find((r) => r.id === id);
  if (!reg) throw new Error("Registration not found");
  return reg;
}

class FirestoreRegistrationService implements RegistrationService {
  private regsCol() {
    return collection(db!, "registrations");
  }

  async submit(data: RegistrationFormData): Promise<Registration> {
    const now = new Date().toISOString();
    const registration: Registration = {
      id: generateId(),
      ...data,
      status: "pending",
      createdAt: now,
    };
    await setDoc(doc(db!, "registrations", registration.id), registration);
    return registration;
  }

  async getPending(): Promise<Registration[]> {
    const q = query(
      this.regsCol(),
      where("status", "==", "pending"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => buildRegistrationFromDb(d.data()))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async getAll(): Promise<Registration[]> {
    const q = query(this.regsCol(), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => buildRegistrationFromDb(d.data()));
  }

  async approve(id: string): Promise<Registration> {
    const reg = await this.getById(id);

    const classes = await studentService.getClasses();
    const student = await studentService.create(
      buildStudentFromRegistration(classes, reg),
    );

    // Create a login user for the guardian (parent role).
    const userId = `usr-${student.id}`;
    await setDoc(doc(db!, "users", userId), {
      id: userId,
      email: reg.guardianEmail.toLowerCase(),
      password: reg.password,
      fullName: student.name,
      role: "parent",
      parentStudentIds: [student.id],
    });

    // The record moved to the students table — remove the original registration.
    await deleteDoc(doc(db!, "registrations", id));
    return {
      ...reg,
      status: "approved" as const,
      approvedAt: new Date().toISOString(),
    };
  }

  async reject(id: string): Promise<Registration> {
    const reg = await this.getById(id).catch(() => undefined);
    await deleteDoc(doc(db!, "registrations", id));
    return {
      ...reg!,
      status: "rejected" as const,
      rejectedAt: new Date().toISOString(),
    };
  }

  private async getById(id: string): Promise<Registration> {
    const snap = await getDoc(doc(db!, "registrations", id));
    if (!snap.exists()) throw new Error("Registration not found");
    return buildRegistrationFromDb(snap.data());
  }
}

class MockRegistrationService implements RegistrationService {
  async submit(data: RegistrationFormData): Promise<Registration> {
    const now = new Date().toISOString();
    const registration: Registration = {
      id: generateId(),
      firstName: data.firstName,
      lastName: data.lastName,
      fatherName: data.fatherName,
      bFormCnic: data.bFormCnic,
      guardianMobile: data.guardianMobile,
      guardianEmail: data.guardianEmail,
      password: data.password,
      address: data.address,
      city: data.city,
      programType: data.programType,
      photoUri: data.photoUri,
      status: "pending",
      createdAt: now,
    };
    registrationDb = [registration, ...registrationDb];
    return registration;
  }

  async getPending(): Promise<Registration[]> {
    return registrationDb.filter((r) => r.status === "pending");
  }

  async getAll(): Promise<Registration[]> {
    return [...registrationDb].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async approve(id: string): Promise<Registration> {
    const reg = getRegistration(id);

    const student = await studentService.create(
      buildStudentFromRegistration(MOCK_CLASSES, reg),
    );

    const updated: Registration = {
      ...reg,
      status: "approved",
      approvedAt: new Date().toISOString(),
    };
    registrationDb = registrationDb.filter((r) => r.id !== id);
    return updated;
  }

  async reject(id: string): Promise<Registration> {
    const updated: Registration = {
      ...getRegistration(id),
      status: "rejected",
      rejectedAt: new Date().toISOString(),
    };
    registrationDb = registrationDb.filter((r) => r.id !== id);
    return updated;
  }
}

export const registrationService: RegistrationService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreRegistrationService()
    : new MockRegistrationService();
