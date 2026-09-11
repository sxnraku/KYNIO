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

export type FastingPrimaryGoal =
  | "fat_loss"
  | "autophagy"
  | "discipline"
  | "circadian_health";

interface AppPreferencesState {
  biometricLockEnabled: boolean;
  healthConnectEnabled: boolean;
  hydrationRemindersEnabled: boolean;
  language: AppLanguage;
  primaryGoal: FastingPrimaryGoal | null;
  setBiometricLockEnabled: (enabled: boolean) => void;
  setHealthConnectEnabled: (enabled: boolean) => void;
  setHydrationRemindersEnabled: (enabled: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
  setPrimaryGoal: (primaryGoal: FastingPrimaryGoal | null) => void;
  setThemeMode: (themeMode: AppThemeMode) => void;
  setUserAgeYears: (userAgeYears: number) => void;
  setUserBiologicalSex: (userBiologicalSex: "male" | "female" | "other") => void;
  setUserHeightCm: (userHeightCm: number) => void;
  themeMode: AppThemeMode;
  userAgeYears: number;
  userBiologicalSex: "male" | "female" | "other";
  userHeightCm: number;
}

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      biometricLockEnabled: false,
      healthConnectEnabled: false,
      hydrationRemindersEnabled: false,
      language: getDefaultAppLanguage(),
      primaryGoal: null,
      setBiometricLockEnabled: (biometricLockEnabled) =>
        set({ biometricLockEnabled }),
      setHealthConnectEnabled: (healthConnectEnabled) =>
        set({ healthConnectEnabled }),
      setHydrationRemindersEnabled: (hydrationRemindersEnabled) =>
        set({ hydrationRemindersEnabled }),
      setLanguage: (language) => set({ language }),
      setPrimaryGoal: (primaryGoal) => set({ primaryGoal }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setUserAgeYears: (userAgeYears) => set({ userAgeYears }),
      setUserBiologicalSex: (userBiologicalSex) => set({ userBiologicalSex }),
      setUserHeightCm: (userHeightCm) => set({ userHeightCm }),
      themeMode: "light",
      userAgeYears: 30,
      userBiologicalSex: "other",
      userHeightCm: 170,
    }),

    {
      name: "kynio-app-preferences-v1",
      partialize: ({
        biometricLockEnabled,
        healthConnectEnabled,
        hydrationRemindersEnabled,
        language,
        primaryGoal,
        themeMode,
        userAgeYears,
        userBiologicalSex,
        userHeightCm,
      }) => ({
        biometricLockEnabled,
        healthConnectEnabled,
        hydrationRemindersEnabled,
        language,
        primaryGoal,
        themeMode,
        userAgeYears,
        userBiologicalSex,
        userHeightCm,
      }),
      skipHydration: process.env.NODE_ENV === "test",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
