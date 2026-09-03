import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import type { WorkoutRecord } from "@/db/schema";
import type { WorkoutSummary } from "@/hooks/use-workout-tracker";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface WorkoutSummaryCardProps {
  records: WorkoutRecord[];
  summary: WorkoutSummary;
}

const DAY_LABELS_PT = ["D", "S", "T", "Q", "Q", "S", "S"];
const DAY_LABELS_EN = ["S", "M", "T", "W", "T", "F", "S"];

function getLastSevenDays(records: WorkoutRecord[], language: "en" | "pt") {
  const dayLabels = language === "en" ? DAY_LABELS_EN : DAY_LABELS_PT;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
    const dayStart = date.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    return {
      isToday: index === 6,
      label: dayLabels[date.getDay()],
      minutes: records
        .filter(
          (record) => record.timestamp >= dayStart && record.timestamp < dayEnd,
        )
        .reduce((total, record) => total + record.durationMinutes, 0),
    };
  });
}

export function WorkoutSummaryCard({
  records,
  summary,
}: WorkoutSummaryCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const days = getLastSevenDays(records, language);
  const maxMinutes = Math.max(...days.map((day) => day.minutes), 30);

  const hoursEquivalent =
    summary.weekMinutes >= 60
      ? `${Math.floor(summary.weekMinutes / 60)}h ${
          summary.weekMinutes % 60 > 0 ? `${summary.weekMinutes % 60}m` : ""
        }`.trim()
      : null;

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {translateText("Últimos 7 dias", language)}
          </Text>
          <Text className="mt-2 font-headline text-2xl text-foreground">
            {translateText("O teu movimento", language)}
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-success-dark">
          <Ionicons color={COLORS.success} name="fitness" size={25} />
        </View>
      </View>

      <View className="mt-6 flex-row items-end gap-5">
        <View className="min-w-[112px]">
          <View className="flex-row items-baseline">
            <Text className="font-headline text-[38px] leading-[42px] text-foreground">
              {summary.weekMinutes}
            </Text>
            <Text className="ml-1 font-body text-sm text-muted">min</Text>
          </View>
          {hoursEquivalent ? (
            <Text className="font-label text-[10px] uppercase text-success">
              ≈ {hoursEquivalent}
            </Text>
          ) : null}
          <Text className="mt-1 font-body text-xs text-muted">
            {summary.weekCount === 1
              ? translateText("1 atividade registada", language)
              : translateText(`${summary.weekCount} atividades registadas`, language)}
          </Text>
        </View>

        <View className="h-[92px] flex-1 flex-row items-end justify-between gap-2">
          {days.map((day, index) => {
            const barHeight =
              day.minutes === 0
                ? 6
                : Math.max(16, (day.minutes / maxMinutes) * 64);

            return (
              <View
                className="flex-1 items-center"
                key={`${day.label}-${index}`}
              >
                <View
                  className={
                    day.isToday
                      ? "w-full rounded-full bg-success"
                      : "w-full rounded-full bg-border"
                  }
                  style={{ height: barHeight, maxWidth: 12 }}
                />
                <Text
                  className={
                    day.isToday
                      ? "mt-2 font-label text-[9px] text-success"
                      : "mt-2 font-label text-[9px] text-muted"
                  }
                >
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className="mt-6 flex-row gap-2 border-t border-border pt-4">
        <View className="flex-1">
          <Text className="font-headline text-lg text-foreground">
            {summary.totalMinutes}
          </Text>
          <Text className="font-body text-xs text-muted">
            {translateText("minutos no total", language)}
          </Text>
        </View>
        <View className="h-9 w-px bg-border" />
        <View className="flex-1 pl-4">
          <Text className="font-headline text-lg text-xp">
            +{summary.weekXp} XP
          </Text>
          <Text className="font-body text-xs text-muted">
            {translateText("ganhos esta semana", language)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
