import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GuidedTutorialState {
  completeTutorial: () => void;
  currentStep: number;
  hasCompletedTutorial: boolean;
  hasHydrated: boolean;
  profileOnboardingComplete: boolean;
  resetTutorial: () => void;
  restartTutorial: () => void;
  setCurrentStep: (step: number) => void;
  setHydrated: () => void;
  setProfileOnboardingComplete: (isComplete: boolean) => void;
}

export const GUIDED_TUTORIAL_STORAGE_KEY = 'kynio-guided-tutorial-v1';

export const useGuidedTutorialStore = create<GuidedTutorialState>()(
  persist(
    (set) => ({
      completeTutorial: () =>
        set({ currentStep: 0, hasCompletedTutorial: true }),
      currentStep: 0,
      hasCompletedTutorial: false,
      hasHydrated: false,
      profileOnboardingComplete: false,
      resetTutorial: () =>
        set({
          currentStep: 0,
          hasCompletedTutorial: false,
          profileOnboardingComplete: false,
        }),
      restartTutorial: () =>
        set({ currentStep: 0, hasCompletedTutorial: false }),
      setCurrentStep: (step) => set({ currentStep: Math.max(0, step) }),
      setHydrated: () => set({ hasHydrated: true }),
      setProfileOnboardingComplete: (profileOnboardingComplete) =>
        set({ profileOnboardingComplete }),
    }),
    {
      name: GUIDED_TUTORIAL_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        hasCompletedTutorial: state.hasCompletedTutorial,
      }),
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

