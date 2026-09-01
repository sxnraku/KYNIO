import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import { getFastRecords, getMealRecords, getUserProfile, updateUserProfileXp } from "@/services/dbService";
import { triggerSuccessFeedback } from "@/services/hapticsService";
import { getCurrentWeekKey } from "@/services/weeklyChallengesService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useUserProgressStore } from "@/store/user-progress-store";
import { useWaterStore } from "@/store/useWaterStore";
import { useWeeklyChallengesStore } from "@/store/use-weekly-challenges-store";

interface Challenge {
  current: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  id: string;
  isClaimed: boolean;
  target: number;
  title: string;
  xpReward: number;
}

export function WeeklyChallengesCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const waterHistory = useWaterStore((state) => state.history);
  const claimedMap = useWeeklyChallengesStore((state) => state.claimed);
  const claimChallenge = useWeeklyChallengesStore((state) => state.claimChallenge);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const weekKey = getCurrentWeekKey();

  const loadChallengesProgress = useCallback(async () => {
    try {
      const now = Date.now();
      const weekStart = now - 7 * 24 * 60 * 60 * 1000;

      const [fasts, meals] = await Promise.all([
        getFastRecords(),
        getMealRecords(),
      ]);

      // Count completed fasts >= 14h in the last 7 days
      const weeklyFasts = fasts.filter(
        (f) =>
          f.endTime >= weekStart &&
          (f.completed || (f.endTime - f.startTime) >= 14 * 60 * 60 * 1000),
      ).length;

      // Count water days >= 1500ml in the last 7 days
      const recentDayKeys = new Set(
        Array.from({ length: 7 }, (_, index) => {
          const day = new Date(now);
          day.setDate(day.getDate() - index);
          return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        }),
      );
      const waterDays = Object.entries(waterHistory).filter(
        ([dayKey, ml]) => recentDayKeys.has(dayKey) && ml >= 1500,
      ).length;

      // Count AI meals logged in the last 7 days
      const weeklyMeals = meals.filter((m) => m.timestamp >= weekStart).length;


      setChallenges([
        {
          current: Math.min(4, weeklyFasts),
          description:
            language === "en"
              ? "Complete 4 fasts of 14h+ this week"
              : "Completa 4 jejuns de 14h+ nesta semana",
          icon: "flame",
          id: "iron_week",
          isClaimed: claimedMap.iron_week?.weekKey === weekKey,
          target: 4,
          title: language === "en" ? "Iron Week" : "Semana de Ferro",
          xpReward: 150,
        },
        {
          current: Math.min(4, waterDays),
          description:
            language === "en"
              ? "Drink 1.5L+ of water across 4 days"
              : "Bebe 1.5L+ de água em 4 dias",
          icon: "water",
          id: "hydration_master",
          isClaimed: claimedMap.hydration_master?.weekKey === weekKey,
          target: 4,
          title: language === "en" ? "Hydration Master" : "Mestre da Água",
          xpReward: 100,
        },
        {
          current: Math.min(3, weeklyMeals),
          description:
            language === "en"
              ? "Log 3 AI-analyzed meals this week"
              : "Regista 3 refeições com análise IA",
          icon: "restaurant",
          id: "nutrition_tracker",
          isClaimed: claimedMap.nutrition_tracker?.weekKey === weekKey,
          target: 3,
          title: language === "en" ? "Mindful Nutrition" : "Nutrição Consciente",
          xpReward: 75,
        },
      ]);
    } catch {
      // Non-blocking
    }
  }, [claimedMap, language, waterHistory, weekKey]);

  useFocusEffect(
    useCallback(() => {
      void loadChallengesProgress();
    }, [loadChallengesProgress]),
  );

  const handleClaimReward = async (challenge: Challenge) => {
    try {
      triggerSuccessFeedback();
      const profile = await getUserProfile();
      const updated = await updateUserProfileXp(profile.totalXp + challenge.xpReward);
      useUserProgressStore.getState().syncProfile(updated);

      // Persiste o claim para a semana atual: impede reclamar o mesmo desafio
      // várias vezes ao remontar o ecrã e permite ao sync derivar este XP.
      claimChallenge(challenge.id, weekKey, challenge.xpReward);

      Alert.alert(
        language === "en" ? "Challenge Completed! 🎉" : "Desafio Concluído! 🎉",
        language === "en"
          ? `You earned +${challenge.xpReward} XP for completing "${challenge.title}"!`
          : `Ganhaste +${challenge.xpReward} XP ao completar "${challenge.title}"!`,
      );
    } catch {
      // Non-blocking
    }
  };

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
            {language === "en" ? "Consistency Quests" : "Desafios Semanais"}
          </Text>
          <Text className="mt-1 font-headline text-lg text-foreground">
            {language === "en" ? "Weekly Challenges" : "Metas da Semana"}
          </Text>
        </View>

        <View className="flex-row items-center rounded-full border border-xp/30 bg-xp/10 px-3 py-1">
          <Ionicons color={COLORS.xp} name="trophy-outline" size={14} />
          <Text className="ml-1.5 font-mono text-xs font-bold text-xp">
            +325 XP
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-3">
        {challenges.map((c) => {
          const isComplete = c.current >= c.target;
          const progressPercent = Math.min(100, Math.round((c.current / c.target) * 100));

          return (
            <View
              key={c.id}
              className="rounded-2xl border border-border bg-background p-3.5"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-xp/10 border border-xp/20">
                    <Ionicons color={COLORS.xp} name={c.icon} size={18} />
                  </View>
                  <View className="ml-2.5 flex-1">
                    <Text className="font-headline text-sm text-foreground">
                      {c.title}
                    </Text>
                    <Text className="font-body text-xs text-muted">
                      {c.description}
                    </Text>
                  </View>
                </View>

                {c.isClaimed ? (
                  <View className="flex-row items-center rounded-lg bg-success/15 px-2.5 py-1 border border-success/30">
                    <Ionicons color={COLORS.success} name="checkmark-done" size={14} />
                    <Text className="ml-1 font-headline text-xs text-success">
                      {language === "en" ? "Claimed" : "Resgatado"}
                    </Text>
                  </View>
                ) : isComplete ? (
                  <Pressable
                    className="flex-row items-center rounded-lg bg-xp px-2.5 py-1.5 active:opacity-80"
                    onPress={() => void handleClaimReward(c)}
                  >
                    <Ionicons color="#1E1B4B" name="gift" size={14} />
                    <Text className="ml-1 font-headline text-xs text-[#1E1B4B]">
                      +{c.xpReward} XP
                    </Text>
                  </Pressable>
                ) : (
                  <View className="rounded-lg bg-surface px-2 py-1 border border-border">
                    <Text className="font-mono text-xs text-muted">
                      {c.current}/{c.target}
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress bar */}
              <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <View
                  className={`h-full rounded-full ${isComplete ? "bg-success" : "bg-xp"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
