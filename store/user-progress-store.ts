import { create } from 'zustand';

import type { UserProfileRecord } from '@/db/schema';
import {
  calculateLevel,
  calculateLevelProgress,
  getLevelTitle,
} from '@/services/gamificationService';
import type { UserProgress } from '@/types/progress';

interface UserProgressState extends UserProgress {
  resetProgress: () => void;
  syncProfile: (profile: UserProfileRecord) => void;
}

const INITIAL_PROGRESS: UserProgressState = {
  currentXp: 0,
  level: 1,
  levelTitle: 'Aprendiz',
  progress: 0,
  resetProgress: () => undefined,
  targetXp: 100,
  totalXp: 0,
  syncProfile: () => undefined,
};

export const useUserProgressStore = create<UserProgressState>((set) => ({
  ...INITIAL_PROGRESS,
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
}));
