import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/common/role-guard';

export default function ApprovalsLayout() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </RoleGuard>
  );
}
