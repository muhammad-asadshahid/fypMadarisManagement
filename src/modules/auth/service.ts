import { DEMO_USERS } from "@/constants/mock-data";
import { clearAuthUser, getAuthUser, saveAuthUser } from "@/lib/storage";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { studentService } from "@/modules/students/service";
import type { User } from "@/types";

export interface AuthService {
  login(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

async function findUserInFirestore(
  email: string,
  password: string,
): Promise<User | null> {
  if (!db) return null;
  const q = query(
    collection(db, "users"),
    where("email", "==", email.trim().toLowerCase()),
  );
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.password === password) {
      const user: User = {
        id: String(data.id ?? docSnap.id),
        email: String(data.email),
        fullName: String(data.fullName ?? ""),
        role: String(data.role ?? "parent") as User["role"],
        teacherId: data.teacherId ?? undefined,
        parentStudentIds: Array.isArray(data.parentStudentIds)
          ? data.parentStudentIds.map(String)
          : undefined,
      };
      await saveAuthUser(user);
      return user;
    }
  }
  return null;
}

class FirestoreAuthService implements AuthService {
  async login(email: string, password: string): Promise<User> {
    if (!db) throw new Error("auth.noSupabase");

    // 1. Look up the user in the Firestore `users` collection.
    const user = await findUserInFirestore(email, password);
    if (user) return user;

    // 2. Fall back to local demo users so the app works without seeding.
    const normalized = email.trim().toLowerCase();
    const demo = DEMO_USERS[normalized];
    if (demo) {
      if (demo.password !== password) {
        throw new Error("auth.invalidCredentials");
      }
      await saveAuthUser(demo.user);
      return demo.user;
    }

    // 3. Approved registrations log in with the guardian email + 4-digit PIN.
    const approved = await studentService.getAll();
    const student = approved.find(
      (s) =>
        s.email?.toLowerCase() === normalized && s.password === password,
    );
    if (!student) {
      throw new Error("auth.invalidCredentials");
    }
    const parentUser: User = {
      id: `usr-${student.id}`,
      email: student.email ?? normalized,
      fullName: student.name,
      role: "parent",
      parentStudentIds: [student.id],
    };
    await saveAuthUser(parentUser);
    return parentUser;
  }

  async signUp(): Promise<void> {
    // Registration is handled by the registration service; the admin approval
    // creates the login. Nothing to do here.
  }

  async logout(): Promise<void> {
    await clearAuthUser();
  }

  async getCurrentUser(): Promise<User | null> {
    return getAuthUser();
  }
}

class MockAuthService implements AuthService {
  async login(email: string, password: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const demo = DEMO_USERS[normalized];
    if (demo) {
      if (demo.password !== password) {
        throw new Error("auth.invalidCredentials");
      }
      await saveAuthUser(demo.user);
      return demo.user;
    }

    // Approved registrations log in with the guardian email + 4-digit PIN.
    const approved = await studentService.getAll();
    const student = approved.find(
      (s) =>
        s.email?.toLowerCase() === normalized && s.password === password,
    );
    if (!student) {
      throw new Error("auth.invalidCredentials");
    }
    const user: User = {
      id: `usr-${student.id}`,
      email: student.email ?? normalized,
      fullName: student.name,
      role: "parent",
      parentStudentIds: [student.id],
    };
    await saveAuthUser(user);
    return user;
  }

  async signUp(): Promise<void> {
    // Registration is handled by the registration service; the admin approval
    // creates the login. Nothing to do here in mock mode.
  }

  async logout(): Promise<void> {
    await clearAuthUser();
  }

  async getCurrentUser(): Promise<User | null> {
    return getAuthUser();
  }
}

export const authService: AuthService =
  FIREBASE_CONFIGURED && db
    ? new FirestoreAuthService()
    : new MockAuthService();
