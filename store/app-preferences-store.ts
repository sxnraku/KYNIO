import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "en" | "pt";
export type AppThemeMode = "dark" | "light";

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
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  setThemeMode: (themeMode: AppThemeMode) => void;
  themeMode: AppThemeMode;
}

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      language: getDefaultAppLanguage(),
      setLanguage: (language) => set({ language }),
      setThemeMode: (themeMode) => set({ themeMode }),
      themeMode: "light",
    }),

    {
      name: "kynio-app-preferences-v1",
      partialize: ({ language, themeMode }) => ({ language, themeMode }),
      skipHydration: process.env.NODE_ENV === "test",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
