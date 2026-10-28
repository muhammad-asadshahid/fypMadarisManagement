import { Stack } from "expo-router";

import { ProgramGuard } from "@/components/common/program-guard";

export default function NazraLayout() {
  return (
    <ProgramGuard program="nazra_quran">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ProgramGuard>
  );
}
