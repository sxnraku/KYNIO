import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getUserProfile, saveFastRecord } from '@/services/dbService';
import {
  cancelFastingNotifications,
  scheduleFastingPhaseNotifications,
} from '@/services/fastingNotificationService';
import { getXpReward } from '@/services/gamificationService';
import { useUserProgressStore } from '@/store/user-progress-store';

export type FastingGoalId =
  | '16:8'
  | '18:6'
  | '20:4'
  | '24:0'
  | '36:0'
  | '48:0'
  | 'open';

export interface FastingGoal {
  description?: string;
  eatingHours: number;
  fastingHours: number;
  id: FastingGoalId;
  label: string;
}

export const FASTING_GOALS: readonly FastingGoal[] = [
  {
    description: 'Popular & Equilibrado',
    eatingHours: 8,
    fastingHours: 16,
    id: '16:8',
    label: '16:8',
  },
  {
    description: 'Queima Acelerada',
    eatingHours: 6,
    fastingHours: 18,
    id: '18:6',
    label: '18:6',
  },
  {
    description: 'Jejum Guerreiro',
    eatingHours: 4,
    fastingHours: 20,
    id: '20:4',
    label: '20:4',
  },
  {
    description: 'Uma Refeição por Dia (OMAD)',
    eatingHours: 0,
    fastingHours: 24,
    id: '24:0',
    label: '24:0 (OMAD)',
  },
  {
    description: 'Jejum Monge',
    eatingHours: 0,
    fastingHours: 36,
    id: '36:0',
    label: '36h Monge',
  },
  {
    description: 'Reset Metabólico Prolongado',
    eatingHours: 0,
    fastingHours: 48,
    id: '48:0',
    label: '48h Reset',
  },
  {
    description: 'Sem limite fixo (>1 dia / livre)',
    eatingHours: 0,
    fastingHours: 0,
    id: 'open',
    label: 'Jejum Livre',
  },
];

export interface CompletedFastSummary {
  completed: boolean;
  elapsedHours: number;
  elapsedMs: number;
  endTime: number;
  goalId: FastingGoalId;
  goalLabel: string;
  startTime: number;
  targetHours: number;
  xpEarned: number;
}

interface FastingState {
  clearLastCompletedFast: () => void;
  endFasting: () => Promise<void>;
  goal: FastingGoal;
  hasHydrated: boolean;
  historyRevision: number;
  isActive: boolean;
  isSaving: boolean;
  lastCompletedFast: CompletedFastSummary | null;
  persistenceError: string | null;
  resetFasting: () => void;
  setGoal: (goalId: FastingGoalId) => void;
  setHydrated: () => void;
  setStartedAt: (startedAt: number) => boolean;
  startFasting: (startedAt?: number) => boolean;
  startedAt: number | null;
  targetDurationMs: number;
}

const DEFAULT_GOAL = FASTING_GOALS[0];

/** Protocolos prolongados reservados ao plano Sol Pro. */
export const PRO_FASTING_GOAL_IDS: ReadonlySet<FastingGoalId> = new Set([
  "24:0",
  "36:0",
  "48:0",
  "open",
]);
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

export const FASTING_STORAGE_KEY = 'kynio-fasting-state-v1';

export const useFastingStore = create<FastingState>()(
  persist(
    (set, get) => ({
      endFasting: async () => {
        const { goal, historyRevision, isActive, isSaving, startedAt, targetDurationMs } = get();

        if (!isActive || isSaving || startedAt === null) {
          return;
        }

        const endTime = Date.now();
        const elapsedMs = Math.max(0, endTime - startedAt);
        const elapsedHours = elapsedMs / HOURS_TO_MILLISECONDS;

        let completed = false;
        let xpEarned = 0;

        if (goal.id === 'open') {
          completed = elapsedHours >= 12;
          if (completed) {
            const additionalTiers = Math.floor(
              Math.max(0, elapsedHours - 12) / 6,
            );
            xpEarned = getXpReward('fastGoalCompleted') + additionalTiers * 25;
          }
        } else {
          completed = elapsedMs >= targetDurationMs;
          xpEarned = completed ? getXpReward('fastGoalCompleted') : 0;
        }

        set({ isSaving: true, persistenceError: null });

        try {
          await saveFastRecord({
            completed,
            endTime,
            startTime: startedAt,
            targetHours:
              goal.id === 'open' ? Math.round(elapsedHours) : goal.fastingHours,
            xpEarned,
          });
          void cancelFastingNotifications();
          const completedSummary: CompletedFastSummary = {
            completed,
            elapsedHours,
            elapsedMs,
            endTime,
            goalId: goal.id,
            goalLabel: goal.label,
            startTime: startedAt,
            targetHours:
              goal.id === "open" ? Math.round(elapsedHours) : goal.fastingHours,
            xpEarned,
          };

          set({
            historyRevision: (historyRevision || 0) + 1,
            isActive: false,
            isSaving: false,
            lastCompletedFast: completedSummary,
            startedAt: null,
          });

          try {
            const profile = await getUserProfile();
            useUserProgressStore.getState().syncProfile(profile);
          } catch {
            // A tab de Progresso volta a sincronizar o perfil ao receber foco.
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Não foi possível guardar o jejum localmente.";
          set({ isSaving: false, persistenceError: message });
        }
      },
      clearLastCompletedFast: () => set({ lastCompletedFast: null }),
      goal: DEFAULT_GOAL,
      hasHydrated: false,
      historyRevision: 0,
      isActive: false,
      isSaving: false,
      lastCompletedFast: null,

      persistenceError: null,
      resetFasting: () => {
        void cancelFastingNotifications();
        set({
          goal: DEFAULT_GOAL,
          isActive: false,
          isSaving: false,
          lastCompletedFast: null,
          persistenceError: null,
          startedAt: null,
          targetDurationMs: DEFAULT_GOAL.fastingHours * HOURS_TO_MILLISECONDS,
        });
      },
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
      setHydrated: () => set({ hasHydrated: true }),
      setStartedAt: (startedAt) => {
        if (
          !get().isActive ||
          !Number.isFinite(startedAt) ||
          startedAt > Date.now()
        ) {
          return false;
        }

        set({ persistenceError: null, startedAt });
        void scheduleFastingPhaseNotifications(startedAt, get().goal.fastingHours);
        return true;
      },
      startFasting: (startedAt = Date.now()) => {
        if (!Number.isFinite(startedAt) || startedAt > Date.now()) {
          return false;
        }

        set({ isActive: true, persistenceError: null, startedAt });
        void scheduleFastingPhaseNotifications(startedAt, get().goal.fastingHours);
        return true;
      },

      startedAt: null,
      targetDurationMs: DEFAULT_GOAL.fastingHours * HOURS_TO_MILLISECONDS,
    }),
    {
      name: FASTING_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        goal: state.goal,
        isActive: state.isActive,
        startedAt: state.startedAt,
        targetDurationMs: state.targetDurationMs,
      }),
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

