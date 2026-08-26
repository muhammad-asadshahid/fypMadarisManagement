import "@/i18n";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nManager, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

import { darkTheme, lightTheme } from "@/constants/paper-theme";
import { seedIfEmpty } from "@/lib/seed";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import i18n from "../i18n";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const initializeAuth = useAuthStore((s) => s.initialize);
  const initializeSettings = useSettingsStore((s) => s.initialize);
  const authReady = useAuthStore((s) => s.isInitialized);
  const settingsReady = useSettingsStore((s) => s.isInitialized);

  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    // set RTL according to i18n language
    if (i18n.language === "ur") {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
    initializeSettings();
    seedIfEmpty();
  }, [initializeAuth, initializeSettings]);

  useEffect(() => {
    if (fontsLoaded && authReady && settingsReady) SplashScreen.hideAsync();
  }, [fontsLoaded, authReady, settingsReady]);

  if (!fontsLoaded || !authReady || !settingsReady) return null;

  return (
    <GestureHandlerRootView
      style={{ flex: 1, direction: I18nManager.isRTL ? "rtl" : "ltr" }}
    >
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
