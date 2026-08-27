import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getUserProfile, updateUserProfileXp } from '@/services/dbService';
import { getXpReward } from '@/services/gamificationService';
import { useUserProgressStore } from '@/store/user-progress-store';


function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

interface WaterState {
  addWater: (amountMl?: number) => Promise<void>;
  currentMl: number;
  dailyGoalMl: number;
  date: string;
  hasElectrolytesTip: boolean;
  history: Record<string, number>;
  removeWater: (amountMl?: number) => void;
  resetWater: () => void;
  setDailyGoal: (goalMl: number) => void;
}

export const WATER_STORAGE_KEY = 'kynio-water-tracker-v1';

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      addWater: async (amountMl = 250) => {
        const today = getTodayString();
        const state = get();
        const currentAmount = state.date === today ? state.currentMl : 0;
        const newAmount = Math.min(6000, currentAmount + amountMl);

        set({
          currentMl: newAmount,
          date: today,
          history: {
            ...state.history,
            [today]: newAmount,
          },
        });

        // Dar XP pela hidratação (+5 XP por copo)
        try {
          const xp = 5;
          const profile = await getUserProfile();
          const updated = await updateUserProfileXp(profile.totalXp + xp);
          useUserProgressStore.getState().syncProfile(updated);
        } catch {
          // Ignora se não conseguir dar XP offline
        }

      },
      currentMl: 0,
      dailyGoalMl: 2000,
      date: getTodayString(),
      hasElectrolytesTip: true,
      history: {},
      removeWater: (amountMl = 250) => {
        const today = getTodayString();
        const state = get();
        const currentAmount = state.date === today ? state.currentMl : 0;
        const newAmount = Math.max(0, currentAmount - amountMl);

        set({
          currentMl: newAmount,
          date: today,
          history: {
            ...state.history,
            [today]: newAmount,
          },
        });
      },
      resetWater: () => {
        const today = getTodayString();
        const state = get();
        set({
          currentMl: 0,
          date: today,
          history: {
            ...state.history,
            [today]: 0,
          },
        });
      },
      setDailyGoal: (dailyGoalMl) => set({ dailyGoalMl }),
    }),
    {
      name: WATER_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
