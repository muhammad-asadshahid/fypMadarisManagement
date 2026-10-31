import { Stack } from "expo-router";

import { RoleGuard } from "@/components/common/role-guard";

export default function ParentPortalLayout() {
  return (
    <RoleGuard allowedRoles={["parent"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[studentId]" />
      </Stack>
    </RoleGuard>
  );
}
