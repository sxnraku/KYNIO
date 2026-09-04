import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "en" | "pt";
export type AppThemeMode =
  | "light"
  | "dark"
  | "amoled"
  | "midnight"
  | "matcha"
  | "eink";

/** Temas visuais exclusivos reservados aos subscritores do plano Sol Pro. */
export const PRO_THEME_IDS: ReadonlySet<AppThemeMode> = new Set([
  "amoled",
  "midnight",
  "matcha",
  "eink",
]);

export function getDefaultAppLanguage(): AppLanguage {
  try {
    const locale =
      Intl.DateTimeFormat().resolvedOptions().locale ||
      (typeof navigator !== "undefined" ? navigator.language : "") ||
      "";
    if (locale.toLowerCase().startsWith("pt")) {
      return "pt";
    }
  } catch {
    // fallback
  }
  return "en";
}

interface AppPreferencesState {
  biometricLockEnabled: boolean;
  healthConnectEnabled: boolean;
  hydrationRemindersEnabled: boolean;
  language: AppLanguage;
  setBiometricLockEnabled: (enabled: boolean) => void;
  setHealthConnectEnabled: (enabled: boolean) => void;
  setHydrationRemindersEnabled: (enabled: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
  setThemeMode: (themeMode: AppThemeMode) => void;
  themeMode: AppThemeMode;
}

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      biometricLockEnabled: false,
      healthConnectEnabled: false,
      hydrationRemindersEnabled: false,
      language: getDefaultAppLanguage(),
      setBiometricLockEnabled: (biometricLockEnabled) =>
        set({ biometricLockEnabled }),
      setHealthConnectEnabled: (healthConnectEnabled) =>
        set({ healthConnectEnabled }),
      setHydrationRemindersEnabled: (hydrationRemindersEnabled) =>
        set({ hydrationRemindersEnabled }),
      setLanguage: (language) => set({ language }),
      setThemeMode: (themeMode) => set({ themeMode }),
      themeMode: "light",
    }),

    {
      name: "kynio-app-preferences-v1",
      partialize: ({
        biometricLockEnabled,
        healthConnectEnabled,
        hydrationRemindersEnabled,
        language,
        themeMode,
      }) => ({
        biometricLockEnabled,
        healthConnectEnabled,
        hydrationRemindersEnabled,
        language,
        themeMode,
      }),
      skipHydration: process.env.NODE_ENV === "test",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
