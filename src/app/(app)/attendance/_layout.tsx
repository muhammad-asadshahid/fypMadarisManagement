import { Stack } from "expo-router";

import { RoleGuard } from "@/components/common/role-guard";

export default function AttendanceLayout() {
  return (
    <RoleGuard allowedRoles={["admin", "teacher"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="reports" />
      </Stack>
    </RoleGuard>
  );
}
