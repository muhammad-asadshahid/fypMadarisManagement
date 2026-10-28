import { Redirect } from "expo-router";
import type { ReactNode } from "react";

import { useAssignedClasses } from "@/hooks/use-assigned-classes";
import { useAuthStore } from "@/store/authStore";
import type { ProgramType } from "@/types";

interface ProgramGuardProps {
  program: ProgramType;
  children: ReactNode;
  fallback?: string;
}

/**
 * Allows access to admins, and to teachers assigned to a class of the given
 * program type. Everyone else is redirected away.
 */
export function ProgramGuard({
  program,
  children,
  fallback = "/(app)",
}: ProgramGuardProps) {
  const user = useAuthStore((s) => s.user);
  const { classes, loading } = useAssignedClasses();

  if (!user) return <Redirect href={"/(auth)/login" as never} />;
  if (user.role === "admin") return <>{children}</>;
  if (loading) return null;

  const allowed = classes.some((cls) => cls.programType === program);
  if (!allowed) return <Redirect href={fallback as never} />;

  return <>{children}</>;
}
