import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { FastingControls } from "@/components/ui/fasting-controls";
import { FastingTimer } from "@/components/ui/fasting-timer";
import { COLORS } from "@/constants/colors";
import type { FastingGoal } from "@/store/useFastingStore";

interface FastingSummaryCardProps {
  currentPhaseTitle: string;
  elapsedMs: number;
  goal: FastingGoal;
  isActive: boolean;
  isSaving: boolean;
  progress: number;
  targetDurationMs: number;
}

function formatCompactDuration(durationMs: number): string {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return minutes === 0 ? `${hours} h` : `${hours}h ${minutes}m`;
}

interface SummaryMetricProps {
  label: string;
  value: string;
}

function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <View className="flex-1 items-center px-2">
      <Text
        adjustsFontSizeToFit
        className="font-headline text-base text-foreground"
        minimumFontScale={0.68}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-0.5 font-body text-xs text-muted">{label}</Text>
    </View>
  );
}

export function FastingSummaryCard({
  currentPhaseTitle,
  elapsedMs,
  goal,
  isActive,
  isSaving,
  progress,
  targetDurationMs,
}: FastingSummaryCardProps) {
  const remainingMs = Math.max(0, targetDurationMs - elapsedMs);

  return (
    <View className="overflow-hidden rounded-[32px] border border-border bg-surface p-5">
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-success/5"
      />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-headline text-xl text-foreground">
            Resumo do jejum
          </Text>
          <Text className="mt-1 font-body text-sm text-muted">
            Acompanha o teu ritmo, sem pressão.
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-success/10">
          <Ionicons color={COLORS.success} name="timer-outline" size={21} />
        </View>
      </View>

      <View className="mt-5">
        <FastingTimer
          elapsedMs={elapsedMs}
          goalLabel={goal.id}
          isActive={isActive}
          progress={progress}
        />
      </View>

      <View className="mt-5 flex-row rounded-2xl bg-background px-2 py-4">
        <SummaryMetric
          label="Decorrido"
          value={formatCompactDuration(elapsedMs)}
        />
        <View className="w-px bg-border" />
        <SummaryMetric
          label="Restante"
          value={formatCompactDuration(remainingMs)}
        />
        <View className="w-px bg-border" />
        <SummaryMetric
          label="Fase"
          value={isActive ? currentPhaseTitle : "—"}
        />
      </View>

      <FastingControls
        currentGoalId={goal.id}
        isActive={isActive}
        isSaving={isSaving}
      />
    </View>
  );
}
