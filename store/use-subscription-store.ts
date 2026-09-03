import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SubscriptionTier = "free" | "monthly" | "annual" | "lifetime" | "trial";

export interface SubscriptionState {
  isPro: boolean;
  tier: SubscriptionTier;
  expiresAt: string | null;
  trialStartedAt: string | null;
  purchaseToken?: string | null;
  orderId?: string | null;
  dailyAiScansDate: string;
  dailyAiScansCount: number;
  maxFreeDailyAiScans: number;
  bonusAiScans: number;
  emergencyShields: number;

  // Actions
  activateSubscription: (tier: SubscriptionTier, durationDays?: number, purchaseToken?: string, orderId?: string) => void;
  activateFreeTrial: () => boolean;
  cancelSubscription: () => void;
  canPerformAiScan: () => boolean;
  consumeAiScan: () => boolean;
  getRemainingAiScans: () => number;
  addBonusAiScans: (count: number) => void;
  addEmergencyShield: (count: number) => void;
  useEmergencyShield: () => boolean;
}

const FREE_DAILY_AI_LIMIT = 3;

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      tier: "free",
      expiresAt: null,
      trialStartedAt: null,
      dailyAiScansDate: getTodayIsoDate(),
      dailyAiScansCount: 0,
      maxFreeDailyAiScans: FREE_DAILY_AI_LIMIT,
      bonusAiScans: 0,
      emergencyShields: 0,

      activateSubscription: (tier, durationDays, purchaseToken, orderId) => {
        let expiresAt: string | null = null;
        if (tier === "lifetime") {
          expiresAt = null;
        } else if (durationDays) {
          const exp = new Date();
          exp.setDate(exp.getDate() + durationDays);
          expiresAt = exp.toISOString();
        } else if (tier === "monthly") {
          const exp = new Date();
          exp.setMonth(exp.getMonth() + 1);
          expiresAt = exp.toISOString();
        } else if (tier === "annual") {
          const exp = new Date();
          exp.setFullYear(exp.getFullYear() + 1);
          expiresAt = exp.toISOString();
        }

        set({
          isPro: true,
          tier,
          expiresAt,
          purchaseToken: purchaseToken || null,
          orderId: orderId || null,
        });
      },

      activateFreeTrial: () => {
        const state = get();
        if (state.trialStartedAt) {
          return false; // Trial already used
        }
        const now = new Date();
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days free trial

        set({
          isPro: true,
          tier: "trial",
          trialStartedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
        });
        return true;
      },

      cancelSubscription: () => {
        set({
          isPro: false,
          tier: "free",
          expiresAt: null,
        });
      },

      addBonusAiScans: (count: number) => {
        const state = get();
        set({ bonusAiScans: (state.bonusAiScans || 0) + Math.max(0, count) });
      },

      addEmergencyShield: (count: number) => {
        const state = get();
        set({ emergencyShields: (state.emergencyShields || 0) + Math.max(0, count) });
      },

      useEmergencyShield: () => {
        const state = get();
        if ((state.emergencyShields || 0) > 0) {
          set({ emergencyShields: state.emergencyShields - 1 });
          return true;
        }
        return false;
      },

      canPerformAiScan: () => {
        const state = get();
        if (state.isPro) {
          if (state.expiresAt && new Date(state.expiresAt).getTime() < Date.now()) {
            set({ isPro: false, tier: "free", expiresAt: null });
          } else {
            return true;
          }
        }

        const today = getTodayIsoDate();
        let currentCount = state.dailyAiScansCount;
        if (state.dailyAiScansDate !== today) {
          currentCount = 0;
          set({ dailyAiScansDate: today, dailyAiScansCount: 0 });
        }

        const freeAvailable = currentCount < state.maxFreeDailyAiScans;
        const bonusAvailable = (state.bonusAiScans || 0) > 0;
        return freeAvailable || bonusAvailable;
      },

      consumeAiScan: () => {
        const state = get();
        if (state.isPro) {
          if (!state.expiresAt || new Date(state.expiresAt).getTime() >= Date.now()) {
            return true;
          }
          set({ isPro: false, tier: "free", expiresAt: null });
        }

        const today = getTodayIsoDate();
        let currentCount = state.dailyAiScansCount;
        if (state.dailyAiScansDate !== today) {
          currentCount = 0;
        }

        if (currentCount < state.maxFreeDailyAiScans) {
          set({
            dailyAiScansDate: today,
            dailyAiScansCount: currentCount + 1,
          });
          return true;
        }

        // Consume bonus scan if available
        if ((state.bonusAiScans || 0) > 0) {
          set({ bonusAiScans: state.bonusAiScans - 1 });
          return true;
        }

        return false;
      },

      getRemainingAiScans: () => {
        const state = get();
        if (state.isPro) {
          if (!state.expiresAt || new Date(state.expiresAt).getTime() >= Date.now()) {
            return 999;
          }
        }
        const today = getTodayIsoDate();
        const currentCount = state.dailyAiScansDate === today ? state.dailyAiScansCount : 0;
        const freeRemaining = Math.max(0, state.maxFreeDailyAiScans - currentCount);
        return freeRemaining + (state.bonusAiScans || 0);
      },
    }),
    {
      name: "kynio-subscription-v1",
      partialize: (state) => ({
        isPro: state.isPro,
        tier: state.tier,
        expiresAt: state.expiresAt,
        trialStartedAt: state.trialStartedAt,
        dailyAiScansDate: state.dailyAiScansDate,
        dailyAiScansCount: state.dailyAiScansCount,
        bonusAiScans: state.bonusAiScans,
        emergencyShields: state.emergencyShields,
      }),
      skipHydration: process.env.NODE_ENV === "test",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
