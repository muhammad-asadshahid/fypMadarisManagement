import { Stack } from "expo-router";

import { ProgramGuard } from "@/components/common/program-guard";

export default function AsriTaleemLayout() {
  return (
    <ProgramGuard program="asri_taleem">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ProgramGuard>
  );
}
