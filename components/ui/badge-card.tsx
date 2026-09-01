import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";
import type { GamificationBadge } from "@/services/gamificationService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

type IconName = ComponentProps<typeof Ionicons>["name"];

const BADGE_ICONS: Record<GamificationBadge["id"], IconName> = {
  "fifty-hours": "hourglass-outline",
  "first-ai-scan": "scan-outline",
  "first-fast": "timer-outline",
  "first-workout": "fitness-outline",
  "seven-day-line": "flame-outline",
};

interface BadgeCardProps {
  badge: GamificationBadge;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const accentColor = badge.unlocked ? COLORS.xp : COLORS.muted;

  return (
    <View
      accessible
      accessibilityLabel={translateText(
        `${badge.title}, ${badge.unlocked ? "desbloqueada" : "bloqueada"}`,
        language,
      )}
      className="min-h-48 w-[48%] rounded-2xl border bg-surface p-4"
      style={{
        borderColor: badge.unlocked ? COLORS.xp : COLORS.border,
        opacity: badge.unlocked ? 1 : 0.55,
      }}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-background">
        <Ionicons
          color={accentColor}
          name={badge.unlocked ? BADGE_ICONS[badge.id] : "lock-closed-outline"}
          size={21}
        />
      </View>
      <Text className="mt-5 font-headline text-base leading-5 text-foreground">
        {badge.title}
      </Text>
      <Text className="mt-2 font-body text-xs leading-4 text-muted">
        {badge.description}
      </Text>
      <Text
        className="mt-auto pt-4 font-label text-[9px] uppercase"
        style={{ color: accentColor }}
      >
        {badge.unlocked ? "Desbloqueada" : "Bloqueada"}
      </Text>
    </View>
  );
}
