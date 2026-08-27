import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_SCHEDULE_CONFIG,
  FastingScheduleConfig,
  FastingScheduleMode,
  getNextScheduledFastDate,
  isScheduledFastingDay,
} from '@/services/fastingScheduleService';

export interface FastingScheduleState extends FastingScheduleConfig {
  getNextFastDate: () => Date | null;
  isTodayFastDay: () => boolean;
  resetSchedule: () => void;
  setAdfAnchorDate: (dateStr: string) => void;
  setCustomDays: (days: number[]) => void;
  setEnabled: (enabled: boolean) => void;
  setMode: (mode: FastingScheduleMode) => void;
  setRemindBeforeMinutes: (minutes: number) => void;
  setStartTime: (time: string) => void;
  setTargetHours: (hours: number) => void;
  updateConfig: (config: Partial<FastingScheduleConfig>) => void;
}

export const useFastingScheduleStore = create<FastingScheduleState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SCHEDULE_CONFIG,

      getNextFastDate: () => {
        const state = get();
        return getNextScheduledFastDate(new Date(), state);
      },

      isTodayFastDay: () => {
        const state = get();
        return isScheduledFastingDay(new Date(), state);
      },

      resetSchedule: () => {
        set({ ...DEFAULT_SCHEDULE_CONFIG });
      },

      setAdfAnchorDate: (adfAnchorDate) => set({ adfAnchorDate }),
      setCustomDays: (customDays) => set({ customDays }),
      setEnabled: (enabled) => set({ enabled }),
      setMode: (mode) => set({ mode }),
      setRemindBeforeMinutes: (remindBeforeMinutes) => set({ remindBeforeMinutes }),
      setStartTime: (startTime) => set({ startTime }),
      setTargetHours: (targetHours) => set({ targetHours }),

      updateConfig: (partial) => {
        set((state) => ({ ...state, ...partial }));
      },
    }),
    {
      name: 'kynio-fasting-schedule-v1',
      partialize: (state) => ({
        adfAnchorDate: state.adfAnchorDate,
        customDays: state.customDays,
        enabled: state.enabled,
        mode: state.mode,
        remindBeforeMinutes: state.remindBeforeMinutes,
        startTime: state.startTime,
        targetHours: state.targetHours,
      }),
      skipHydration: process.env.NODE_ENV === 'test',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
