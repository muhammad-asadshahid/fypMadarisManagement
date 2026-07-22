import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/common/role-guard';

export default function StudentsLayout() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="add" />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="[id]/edit" />
      </Stack>
    </RoleGuard>
  );
}
