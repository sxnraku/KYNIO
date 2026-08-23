import { create } from 'zustand';

import { getUserProfile, saveFastRecord } from '@/services/dbService';
import { getXpReward } from '@/services/gamificationService';
import { useUserProgressStore } from '@/store/user-progress-store';

export type FastingGoalId = '16:8' | '18:6' | '20:4';

export interface FastingGoal {
  eatingHours: number;
  fastingHours: number;
  id: FastingGoalId;
}

export const FASTING_GOALS: readonly FastingGoal[] = [
  { eatingHours: 8, fastingHours: 16, id: '16:8' },
  { eatingHours: 6, fastingHours: 18, id: '18:6' },
  { eatingHours: 4, fastingHours: 20, id: '20:4' },
];

interface FastingState {
  endFasting: () => Promise<void>;
  goal: FastingGoal;
  isActive: boolean;
  isSaving: boolean;
  persistenceError: string | null;
  resetFasting: () => void;
  setGoal: (goalId: FastingGoalId) => void;
  startFasting: () => void;
  startedAt: number | null;
  targetDurationMs: number;
}

const DEFAULT_GOAL = FASTING_GOALS[0];
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

export const useFastingStore = create<FastingState>((set, get) => ({
  endFasting: async () => {
    const { goal, isActive, isSaving, startedAt, targetDurationMs } = get();

    if (!isActive || isSaving || startedAt === null) {
      return;
    }

    const endTime = Date.now();
    const completed = endTime - startedAt >= targetDurationMs;
    const xpEarned = completed ? getXpReward('fastGoalCompleted') : 0;

    set({ isSaving: true, persistenceError: null });

    try {
      await saveFastRecord({
        completed,
        endTime,
        startTime: startedAt,
        targetHours: goal.fastingHours,
        xpEarned,
      });
      set({ isActive: false, isSaving: false, startedAt: null });

      try {
        const profile = await getUserProfile();
        useUserProgressStore.getState().syncProfile(profile);
      } catch {
        // A tab de Progresso volta a sincronizar o perfil ao receber foco.
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível guardar o jejum localmente.';
      set({ isSaving: false, persistenceError: message });
    }
  },
  goal: DEFAULT_GOAL,
  isActive: false,
  isSaving: false,
  persistenceError: null,
  resetFasting: () =>
    set({
      goal: DEFAULT_GOAL,
      isActive: false,
      isSaving: false,
      persistenceError: null,
      startedAt: null,
      targetDurationMs: DEFAULT_GOAL.fastingHours * HOURS_TO_MILLISECONDS,
    }),
  setGoal: (goalId) => {
    const nextGoal = FASTING_GOALS.find((goal) => goal.id === goalId);

    if (!nextGoal) {
      return;
    }

    set({
      goal: nextGoal,
      targetDurationMs: nextGoal.fastingHours * HOURS_TO_MILLISECONDS,
    });
  },
  startFasting: () =>
    set({ isActive: true, persistenceError: null, startedAt: Date.now() }),
  startedAt: null,
  targetDurationMs: DEFAULT_GOAL.fastingHours * HOURS_TO_MILLISECONDS,
}));
