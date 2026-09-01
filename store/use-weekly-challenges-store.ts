import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  ClaimedChallengeEntry,
  WEEKLY_CHALLENGES_STORAGE_KEY,
} from '@/services/weeklyChallengesService';

interface WeeklyChallengesState {
  /** challengeId → entrada do claim. Válido apenas para a semana registada. */
  claimed: Record<string, ClaimedChallengeEntry>;
  claimChallenge: (challengeId: string, weekKey: string, xp: number) => void;
  hasClaimedThisWeek: (challengeId: string, weekKey: string) => boolean;
}

export const useWeeklyChallengesStore = create<WeeklyChallengesState>()(
  persist(
    (set, get) => ({
      claimed: {},
      claimChallenge: (challengeId, weekKey, xp) => {
        set({
          claimed: {
            ...get().claimed,
            [challengeId]: { weekKey, xp },
          },
        });
      },
      hasClaimedThisWeek: (challengeId, weekKey) =>
        get().claimed[challengeId]?.weekKey === weekKey,
    }),
    {
      name: WEEKLY_CHALLENGES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
