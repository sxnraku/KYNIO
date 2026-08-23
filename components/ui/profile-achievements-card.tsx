import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { AchievementShareCard } from "@/components/ui/achievement-share-card";
import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import type { GamificationProgressSnapshot } from "@/hooks/use-gamification-progress";
import { shareAchievementCard } from "@/services/achievementShareService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { AchievementSharePayload } from "@/types/achievement-share";

interface ProfileAchievementsCardProps {
  snapshot: GamificationProgressSnapshot | null;
}

export function ProfileAchievementsCard({
  snapshot,
}: ProfileAchievementsCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const unlockedBadges =
    snapshot?.badges.filter((badge) => badge.unlocked) ?? [];
  const sharePayload = useMemo<AchievementSharePayload | null>(() => {
    if (!snapshot) {
      return null;
    }

    return {
      badgeTitles: unlockedBadges.map((badge) => badge.title),
      language,
      level: snapshot.level,
      levelTitle: snapshot.levelTitle,
      streakDays: snapshot.stats.streakDays,
      totalXp: snapshot.profile.totalXp,
    };
  }, [language, snapshot, unlockedBadges]);

  const shareAchievements = async () => {
    if (!sharePayload || isSharing) {
      return;
    }

    setIsSharing(true);
    setShareError(null);
    setShareStatus(null);

    try {
      const result = await shareAchievementCard(shareCardRef, sharePayload);

      if (result.mode !== "cancelled") {
        setShareStatus(result.statusMessage);
      }
    } catch (error: unknown) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Não foi possível preparar a partilha.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  const isDisabled = !sharePayload || isSharing;

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
            Conquistas
          </Text>
          <Text className="mt-2 font-headline text-xl text-foreground">
            O teu progresso, à tua maneira
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-xp/10">
          <Ionicons color={COLORS.xp} name="trophy-outline" size={22} />
        </View>
      </View>

      <View className="mt-5">
        {sharePayload ? (
          <AchievementShareCard payload={sharePayload} ref={shareCardRef} />
        ) : (
          <View className="h-64 items-center justify-center rounded-2xl bg-background">
            <ActivityIndicator color={COLORS.xp} />
          </View>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-xp px-4 active:opacity-80 disabled:opacity-50"
        disabled={isDisabled}
        onPress={() => void shareAchievements()}
      >
        {isSharing ? (
          <ActivityIndicator color={COLORS.surface} />
        ) : (
          <Ionicons
            color={COLORS.surface}
            name="share-social-outline"
            size={19}
          />
        )}
        <Text className="font-headline text-sm text-surface">
          {isSharing ? "A preparar imagem…" : "Partilhar imagem e link"}
        </Text>
      </Pressable>

      <Text className="mt-3 text-center font-body text-[11px] leading-4 text-muted">
        Escolhes o destino. Nada é publicado automaticamente.
      </Text>
      {shareStatus ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-2 text-center font-body text-xs text-success"
        >
          {shareStatus}
        </Text>
      ) : null}
      {shareError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-2 text-center font-body text-xs text-[#BE123C]"
        >
          {shareError}
        </Text>
      ) : null}
    </Card>
  );
}
