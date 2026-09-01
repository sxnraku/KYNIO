import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";
import type { LevelProgress } from "@/services/gamificationService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface LevelProgressCardProps {
  level: number;
  levelProgress: LevelProgress;
  levelTitle: string;
  totalXp: number;
}

export function LevelProgressCard({
  level,
  levelProgress,
  levelTitle,
  totalXp,
}: LevelProgressCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const remainingXp = Math.max(0, levelProgress.nextLevelTotalXp - totalXp);

  return (
    <View className="overflow-hidden rounded-3xl border border-xp/40 bg-surface p-5">
      <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-xp/10" />
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full border border-xp/30 bg-xp/15">
          <Ionicons color={COLORS.xp} name="trophy" size={23} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
            Nível atual
          </Text>
          <Text className="mt-1 font-headline text-2xl text-foreground">
            Nível {level}: {levelTitle}
          </Text>
        </View>
      </View>

      <View className="mt-6 flex-row items-end justify-between">
        <Text className="font-headline text-3xl text-foreground">
          {totalXp} XP
        </Text>
        <Text className="font-label text-[10px] text-muted">
          {remainingXp} XP PARA NÍVEL {level + 1}
        </Text>
      </View>

      <View
        accessibilityLabel={translateText(
          `${levelProgress.xpIntoLevel} de ${levelProgress.xpRequiredInLevel} XP para o próximo nível`,
          language,
        )}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max: levelProgress.xpRequiredInLevel,
          min: 0,
          now: levelProgress.xpIntoLevel,
        }}
        className="mt-4 h-3 overflow-hidden rounded-full bg-background"
      >
        <View
          className="h-full rounded-full bg-xp"
          style={{ width: `${levelProgress.progress * 100}%` }}
        />
      </View>
      <Text className="mt-2 text-right font-label text-[10px] text-muted">
        {levelProgress.xpIntoLevel} / {levelProgress.xpRequiredInLevel} XP
      </Text>
    </View>
  );
}
