import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import type { WorkoutRecord } from "@/db/schema";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { EFFORT_LABELS, WORKOUT_OPTIONS } from "@/types/workout";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  cycling: "bicycle-outline",
  mobility: "body-outline",
  other: "sparkles-outline",
  run: "walk-outline",
  strength: "barbell-outline",
  walk: "footsteps-outline",
};

function formatDate(timestamp: number, language: "en" | "pt"): string {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(timestamp));
}

interface WorkoutHistoryProps {
  records: WorkoutRecord[];
}

export function WorkoutHistory({ records }: WorkoutHistoryProps) {
  const language = useAppPreferencesStore((state) => state.language);
  if (records.length === 0) {
    return (
      <Card>
        <View className="items-center py-5">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-success-dark">
            <Ionicons
              color={COLORS.success}
              name="footsteps-outline"
              size={25}
            />
          </View>
          <Text className="mt-4 font-headline text-base text-foreground">
            Ainda sem atividades
          </Text>
          <Text className="mt-1 max-w-[280px] text-center font-body text-sm leading-5 text-muted">
            O teu histórico aparecerá aqui depois do primeiro registo.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      {records.slice(0, 5).map((record, index) => {
        const label =
          WORKOUT_OPTIONS.find((option) => option.id === record.type)?.label ??
          "Atividade";

        return (
          <View
            className={
              index === 0
                ? "flex-row items-center pb-4"
                : "flex-row items-center border-t border-border py-4"
            }
            key={record.id}
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-success-dark">
              <Ionicons
                color={COLORS.success}
                name={ICONS[record.type] ?? "fitness-outline"}
                size={21}
              />
            </View>
            <View className="min-w-0 flex-1 px-3">
              <Text className="font-headline text-sm text-foreground">
                {label}
              </Text>
              <Text className="mt-0.5 font-body text-xs text-muted">
                {record.durationMinutes} min · {EFFORT_LABELS[record.effort]}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-label text-[10px] text-xp">
                +{record.xpEarned} XP
              </Text>
              <Text
                className="mt-1 font-body text-[11px] text-muted"
                translate={false}
              >
                {formatDate(record.timestamp, language)}
              </Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
}
