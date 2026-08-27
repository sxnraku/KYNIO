import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";
import type { LocalGamificationStats } from "@/services/gamificationService";

interface ConsistencyLineProps {
  stats: LocalGamificationStats;
}

function getIntensityLabel(stats: LocalGamificationStats): string {
  const { daysSinceLastActivity, missedDaysInLine } = stats;

  if (daysSinceLastActivity === null) {
    return "Sem atividade registada";
  }

  if (missedDaysInLine === 1 && daysSinceLastActivity === 0) {
    return "Intensidade alta · 1 dia de tolerância usado";
  }

  if (daysSinceLastActivity === 0) {
    return "Intensidade máxima · atividade hoje";
  }

  if (daysSinceLastActivity === 1) {
    return "Intensidade suave · 1 dia em pausa";
  }

  return `Intensidade reduzida · ${daysSinceLastActivity} dias em pausa`;
}

export function ConsistencyLine({ stats }: ConsistencyLineProps) {
  return (
    <View className="rounded-3xl border border-border bg-surface p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <Ionicons color={COLORS.success} name="pulse" size={20} />
          </View>
          <View className="ml-3">
            <Text className="font-label text-[10px] uppercase tracking-widest text-success">
              Linha de Consistência
            </Text>
            <Text className="mt-1 font-body text-sm text-muted">
              {getIntensityLabel(stats)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-headline text-3xl text-foreground">
            {stats.streakDays}
          </Text>
          <Text className="font-label text-[9px] text-muted">DIAS</Text>
        </View>
      </View>

      <View className="mt-6 flex-row gap-2">
        {Array.from({ length: 7 }, (_, index) => {
          const segmentStrength = Math.min(
            1,
            stats.streakIntensity * (0.55 + index * 0.075),
          );

          return (
            <View
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-background"
              key={index}
            >
              <View
                className="h-full w-full rounded-full bg-success"
                style={{ opacity: segmentStrength }}
              />
            </View>
          );
        })}
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="min-w-0 flex-1 pr-3 font-body text-xs text-muted">
          A intensidade suaviza quando há uma pausa; o histórico permanece.
        </Text>
        <Text className="shrink-0 font-label text-[10px] text-success">
          {Math.round(stats.streakIntensity * 100)}%
        </Text>
      </View>
    </View>
  );
}
