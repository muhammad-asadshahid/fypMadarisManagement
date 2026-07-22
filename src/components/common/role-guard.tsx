import type { UserRole } from '@/types';
import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: string;
}

export function RoleGuard({ allowedRoles, children, fallback = '/(app)' }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Redirect href={fallback as never} />;
  }

  return <>{children}</>;
}
