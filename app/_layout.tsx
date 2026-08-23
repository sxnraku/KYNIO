import "../global.css";

import {
  HankenGrotesk_400Regular,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/hanken-grotesk";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AppThemeProvider } from "@/components/app-theme-provider";
import { CloudSyncBootstrap } from "@/components/cloud-sync-bootstrap";
import { LegalOnboardingModal } from "@/components/ui/legal-onboarding-modal";
import { getColorPalette } from "@/constants/colors";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const colors = getColorPalette(themeMode);
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      />
      <CloudSyncBootstrap />
      <LegalOnboardingModal />
    </AppThemeProvider>
  );
}
