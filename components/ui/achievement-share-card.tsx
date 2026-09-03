import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";
import { getShareUrlLabel } from "@/services/achievementShareContent";
import { translateText } from "@/services/i18n";
import type { AchievementSharePayload } from "@/types/achievement-share";

interface AchievementShareCardProps {
  payload: AchievementSharePayload;
}

export const AchievementShareCard = forwardRef<View, AchievementShareCardProps>(
  function AchievementShareCard({ payload }, ref) {
    const visibleBadges = payload.badgeTitles.slice(0, 3);
    const isEn = payload.language === "en";

    return (
      <View
        className="overflow-hidden rounded-2xl border border-[#D5CBAF] bg-[#F6F0DE]"
        collapsable={false}
        ref={ref}
      >
        <View className="bg-success px-5 pb-6 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FBF7EA]">
                <Ionicons
                  color={COLORS.success}
                  name="shield-checkmark-outline"
                  size={23}
                />
              </View>
              <View>
                <Text className="font-headline text-lg tracking-wide text-[#3A2200]">
                  KYNIO
                </Text>
                <Text className="font-label text-[8px] uppercase tracking-widest text-[#3A2200]/80">
                  {isEn ? "My journey" : "A minha jornada"}
                </Text>
              </View>
            </View>
            <View className="rounded-full bg-[#3A2200]/15 px-3 py-2">
              <Text className="font-label text-[8px] uppercase tracking-widest text-[#3A2200]">
                {isEn ? "Achievement" : "Conquista"}
              </Text>
            </View>
          </View>

          <Text className="mt-7 font-label text-[9px] uppercase tracking-widest text-[#3A2200]/75">
            {isEn ? "Current level" : "Nível atual"}
          </Text>
          <Text className="mt-1 font-headline text-[32px] leading-9 text-[#3A2200]">
            {isEn ? `Level ${payload.level}` : `Nível ${payload.level}`}
          </Text>
          <Text className="mt-1 font-body text-base text-[#3A2200]/90">
            {translateText(payload.levelTitle, payload.language)}
          </Text>
        </View>

        <View className="px-5 pb-5 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 rounded-xl bg-[#EDE6D3] p-3">
              <Text className="font-headline text-xl text-[#3A3A38]">
                {payload.totalXp}
              </Text>
              <Text className="mt-1 font-label text-[8px] uppercase text-[#6F6E66]">
                {isEn ? "Total XP" : "XP total"}
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-[#EDE6D3] p-3">
              <Text className="font-headline text-xl text-[#3A3A38]">
                {payload.streakDays}
              </Text>
              <Text className="mt-1 font-label text-[8px] uppercase text-[#6F6E66]">
                {isEn ? "Streak days" : "Dias seguidos"}
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-[#F0DFC0] p-3">
              <Text className="font-headline text-xl text-xp">
                {payload.badgeTitles.length}
              </Text>
              <Text className="mt-1 font-label text-[8px] uppercase text-[#6F6E66]">
                {isEn ? "Badges" : "Insígnias"}
              </Text>
            </View>
          </View>

          <View className="mt-4 min-h-9 flex-row flex-wrap gap-2">
            {visibleBadges.length ? (
              visibleBadges.map((badge) => (
                <View
                  className="rounded-full bg-[#F0DFC0] px-3 py-2"
                  key={badge}
                >
                  <Text className="font-label text-[8px] text-xp">
                    {translateText(badge, payload.language)}
                  </Text>
                </View>
              ))
            ) : (
              <View className="rounded-full bg-success-dark px-3 py-2">
                <Text className="font-label text-[8px] text-success">
                  {isEn ? "Journey started" : "Jornada iniciada"}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-5 flex-row items-center justify-between border-t border-[#D5CBAF] pt-4">
            <Text className="font-body text-[11px] text-[#6F6E66]">
              {isEn ? "Habits at my own pace." : "Hábitos ao meu ritmo."}
            </Text>
            <Text className="font-label text-[8px] text-success">
              {getShareUrlLabel()}
            </Text>
          </View>
        </View>
      </View>
    );
  },
);
