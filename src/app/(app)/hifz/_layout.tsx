import { Stack } from "expo-router";

import { ProgramGuard } from "@/components/common/program-guard";

export default function HifzLayout() {
  return (
    <ProgramGuard program="hifz_ul_quran">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ProgramGuard>
  );
}
