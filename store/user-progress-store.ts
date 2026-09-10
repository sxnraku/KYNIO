import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserProfileRecord } from '@/db/schema';
import { getUserProfile } from '@/services/dbService';
import {
  calculateLevel,
  calculateLevelProgress,
  getLevelTitle,
} from '@/services/gamificationService';
import type { UserProgress } from '@/types/progress';

interface UserProgressState extends UserProgress {
  initializeProgress: () => Promise<void>;
  resetProgress: () => void;
  syncProfile: (profile: UserProfileRecord) => void;
}

const INITIAL_PROGRESS: Omit<
  UserProgressState,
  'initializeProgress' | 'resetProgress' | 'syncProfile'
> = {
  currentXp: 0,
  level: 1,
  levelTitle: 'Aprendiz',
  progress: 0,
  targetXp: 100,
  totalXp: 0,
};

export const useUserProgressStore = create<UserProgressState>()(
  persist(
    (set, get) => ({
      ...INITIAL_PROGRESS,
      initializeProgress: async () => {
        try {
          const profile = await getUserProfile();
          get().syncProfile(profile);
        } catch {
          // Mantém os dados locais persistidos caso o SQLite ainda esteja a inicializar
        }
      },
      resetProgress: () =>
        set({
          currentXp: 0,
          level: 1,
          levelTitle: 'Aprendiz',
          progress: 0,
          targetXp: 100,
          totalXp: 0,
        }),
      syncProfile: (profile) => {
        const level = calculateLevel(profile.totalXp);
        const levelProgress = calculateLevelProgress(profile.totalXp);

        set({
          currentXp: levelProgress.xpIntoLevel,
          level,
          levelTitle: getLevelTitle(level),
          progress: levelProgress.progress,
          targetXp: levelProgress.xpRequiredInLevel,
          totalXp: profile.totalXp,
        });
      },
    }),
    {
      name: 'kynio-user-progress-v1',
      partialize: ({
        currentXp,
        level,
        levelTitle,
        progress,
        targetXp,
        totalXp,
      }) => ({
        currentXp,
        level,
        levelTitle,
        progress,
        targetXp,
        totalXp,
      }),
      skipHydration: process.env.NODE_ENV === 'test',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
