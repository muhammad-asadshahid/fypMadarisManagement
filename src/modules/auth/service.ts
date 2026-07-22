import { DEMO_USERS } from "@/constants/mock-data";
import { clearAuthUser, getAuthUser, saveAuthUser } from "@/lib/storage";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import type { User } from "@/types";

export interface AuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

function normalizeParentIds(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

function buildUserFromSupabase(user: any): User {
  const metadata = user?.user_metadata ?? {};
  return {
    id: String(user.id),
    email: String(user.email ?? ""),
    fullName:
      String(
        metadata.full_name || metadata.fullName || user.email || "",
      ).trim() || String(user.email ?? ""),
    role: String(metadata.role || "parent") as User["role"],
    teacherId:
      metadata.teacher_id ||
      metadata.teacherId ||
      metadata.teacherId ||
      undefined,
    parentStudentIds: normalizeParentIds(
      metadata.parent_student_ids ?? metadata.parentStudentIds,
    ),
  };
}

class SupabaseAuthService implements AuthService {
  async login(email: string, password: string): Promise<User> {
    if (!supabase) {
      throw new Error("auth.noSupabase");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      throw new Error(error?.message || "auth.invalidCredentials");
    }

    const user = buildUserFromSupabase(data.user);
    await saveAuthUser(user);
    return user;
  }

  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
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
    if (!demo || demo.password !== password) {
      throw new Error("auth.invalidCredentials");
    }
    await saveAuthUser(demo.user);
    return demo.user;
  }

  async logout(): Promise<void> {
    await clearAuthUser();
  }

  async getCurrentUser(): Promise<User | null> {
    return getAuthUser();
  }
}

export const authService: AuthService =
  SUPABASE_CONFIGURED && supabase
    ? new SupabaseAuthService()
    : new MockAuthService();
