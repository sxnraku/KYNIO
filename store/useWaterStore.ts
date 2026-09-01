import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getUserProfile, updateUserProfileXp } from '@/services/dbService';
import { getXpReward } from '@/services/gamificationService';
import { calculateWaterXp, WATER_STORAGE_KEY } from '@/services/waterXpService';
import { useUserProgressStore } from '@/store/user-progress-store';

export { WATER_STORAGE_KEY };


function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

interface WaterState {
  addWater: (amountMl?: number) => Promise<void>;
  currentMl: number;
  dailyGoalMl: number;
  date: string;
  ensureToday: () => void;
  hasElectrolytesTip: boolean;
  history: Record<string, number>;
  removeWater: (amountMl?: number) => Promise<void>;
  resetWater: () => Promise<void>;
  setDailyGoal: (goalMl: number) => void;
}

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

        // XP determinístico: 5 XP por cada 250 ml efetivamente adicionados
        // (derivável do histórico, para o sync de cloud não o perder)
        const xpEarned = calculateWaterXp(newAmount - currentAmount);
        if (xpEarned > 0) {
          try {
            const profile = await getUserProfile();
            const updated = await updateUserProfileXp(profile.totalXp + xpEarned);
            useUserProgressStore.getState().syncProfile(updated);
          } catch {
            // Ignora se não conseguir dar XP offline
          }
        }
      },
      currentMl: 0,
      dailyGoalMl: 2000,
      date: getTodayString(),
      ensureToday: () => {
        const today = getTodayString();
        const state = get();
        // Viragem de dia: o contador volta a zero sem apagar o histórico —
        // o total de ontem já ficou registado em history[ontem].
        if (state.date !== today) {
          set({ currentMl: 0, date: today });
        }
      },
      hasElectrolytesTip: true,
      history: {},
      removeWater: async (amountMl = 250) => {
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

        // Subtrai o XP correspondente ao que foi removido, para não ser
        // possível acumular XP adicionando e removendo água repetidamente.
        const xpRemoved = calculateWaterXp(currentAmount - newAmount);
        if (xpRemoved > 0) {
          try {
            const profile = await getUserProfile();
            const updated = await updateUserProfileXp(Math.max(0, profile.totalXp - xpRemoved));
            useUserProgressStore.getState().syncProfile(updated);
          } catch {
            // Ignora se não conseguir atualizar o XP offline
          }
        }
      },
      resetWater: async () => {
        const today = getTodayString();
        const state = get();
        const previousAmount = state.date === today ? state.currentMl : 0;
        set({
          currentMl: 0,
          date: today,
          history: {
            ...state.history,
            [today]: 0,
          },
        });

        const xpRemoved = calculateWaterXp(previousAmount);
        if (xpRemoved > 0) {
          try {
            const profile = await getUserProfile();
            const updated = await updateUserProfileXp(Math.max(0, profile.totalXp - xpRemoved));
            useUserProgressStore.getState().syncProfile(updated);
          } catch {
            // Ignora se não conseguir atualizar o XP offline
          }
        }
      },
      setDailyGoal: (dailyGoalMl) => set({ dailyGoalMl }),
    }),
    {
      name: WATER_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
