import "../global.css";

import { HankenGrotesk_400Regular } from "@expo-google-fonts/hanken-grotesk/400Regular";
import { HankenGrotesk_600SemiBold } from "@expo-google-fonts/hanken-grotesk/600SemiBold";
import { HankenGrotesk_700Bold } from "@expo-google-fonts/hanken-grotesk/700Bold";
import { HankenGrotesk_800ExtraBold } from "@expo-google-fonts/hanken-grotesk/800ExtraBold";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono/500Medium";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

import { AppThemeProvider } from "@/components/app-theme-provider";
import { BiometricLockGuard } from "@/components/biometric-lock-guard";
import { CloudSyncBootstrap } from "@/components/cloud-sync-bootstrap";
import { HydrationRemindersBootstrap } from "@/components/hydration-reminders-bootstrap";
import { ForceUpdateModal } from "@/components/ui/force-update-modal";
import { GuidedTutorialModal } from "@/components/ui/guided-tutorial-modal";
import { LegalOnboardingModal } from "@/components/ui/legal-onboarding-modal";
import { ProfileOnboardingModal } from "@/components/ui/profile-onboarding-modal";
import { getColorPalette } from "@/constants/colors";
import { handleStripeReturnIfPresent } from "@/services/stripeSubscriptionService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

import { setupTabCoordination } from "@/services/webTabCoordinator";

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
    handleStripeReturnIfPresent();
    if (Platform.OS === "web" && typeof window !== "undefined") {
      setupTabCoordination();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/KYNIO/app/sw.js", { scope: "/KYNIO/app/" })
          .catch(() => undefined);
      }
    }
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
      <HydrationRemindersBootstrap />
      <BiometricLockGuard />
      <LegalOnboardingModal />
      <ProfileOnboardingModal />
      <GuidedTutorialModal />
      <ForceUpdateModal />
    </AppThemeProvider>
  );
}

