import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { UserProfileRecord } from '@/db/schema';
import {
  getFastRecords,
  getMealRecords,
  getUserProfile,
  getWorkoutRecords,
  updateUserProfileStreak,
} from '@/services/dbService';
import {
  calculateLevel,
  calculateLevelProgress,
  type GamificationBadge,
  getGamificationBadges,
  getLevelTitle,
  type LevelProgress,
  type LocalGamificationStats,
  summarizeLocalGamificationStats,
} from '@/services/gamificationService';
import { useSubscriptionStore } from '@/store/use-subscription-store';
import { useUserProgressStore } from '@/store/user-progress-store';

export interface GamificationProgressSnapshot {
  badges: GamificationBadge[];
  level: number;
  levelProgress: LevelProgress;
  levelTitle: string;
  profile: UserProfileRecord;
  stats: LocalGamificationStats;
}

interface GamificationProgressState {
  error: string | null;
  isLoading: boolean;
  snapshot: GamificationProgressSnapshot | null;
}

export function useGamificationProgress(): GamificationProgressState {
  const syncProfile = useUserProgressStore((state) => state.syncProfile);
  const [state, setState] = useState<GamificationProgressState>({
    error: null,
    isLoading: true,
    snapshot: null,
  });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      setState((current) => ({ ...current, error: null, isLoading: true }));

      void (async () => {
        try {
          const [fastRecords, mealRecords, storedProfile, workoutRecords] = await Promise.all([
            getFastRecords(),
            getMealRecords(),
            getUserProfile(),
            getWorkoutRecords(),
          ]);
          const isPro = useSubscriptionStore.getState().isPro;
          const stats = summarizeLocalGamificationStats(
            fastRecords,
            mealRecords,
            workoutRecords,
            isPro,
          );
          const profile =
            storedProfile.streakDays === stats.streakDays
              ? storedProfile
              : await updateUserProfileStreak(stats.streakDays);
          const level = calculateLevel(profile.totalXp);

          syncProfile(profile);

          if (isMounted) {
            setState({
              error: null,
              isLoading: false,
              snapshot: {
                badges: getGamificationBadges(stats),
                level,
                levelProgress: calculateLevelProgress(profile.totalXp),
                levelTitle: getLevelTitle(level),
                profile,
                stats,
              },
            });
          }
        } catch (error: unknown) {
          if (isMounted) {
            setState({
              error:
                error instanceof Error
                  ? error.message
                  : 'Não foi possível carregar o progresso local.',
              isLoading: false,
              snapshot: null,
            });
          }
        }
      })();

      return () => {
        isMounted = false;
      };
    }, [syncProfile]),
  );

  return state;
}
