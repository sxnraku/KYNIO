import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";


import { FastingControls } from "@/components/ui/fasting-controls";
import { FastingScheduleModal } from "@/components/ui/fasting-schedule-modal";
import { FastingTimer } from "@/components/ui/fasting-timer";
import { COLORS } from "@/constants/colors";
import { useFastingScheduleStore } from "@/store/use-fasting-schedule-store";
import type { FastingGoal } from "@/store/useFastingStore";
import { useState } from "react";

interface FastingSummaryCardProps {
  currentPhaseTitle: string;
  elapsedMs: number;
  goal: FastingGoal;
  isActive: boolean;
  isSaving: boolean;
  onPressPhase?: () => void;
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
  onPress?: () => void;
  value: string;
}

function SummaryMetric({ label, onPress, value }: SummaryMetricProps) {
  const content = (
    <View className="flex-1 items-center px-2">
      <Text
        adjustsFontSizeToFit
        className={`font-headline text-base ${onPress ? "text-success underline" : "text-foreground"}`}
        minimumFontScale={0.68}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-0.5 font-body text-xs text-muted">{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable className="flex-1 items-center active:opacity-60" onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export function FastingSummaryCard({
  currentPhaseTitle,
  elapsedMs,
  goal,
  isActive,
  isSaving,
  onPressPhase,
  progress,
  targetDurationMs,
}: FastingSummaryCardProps) {
  const remainingMs = Math.max(0, targetDurationMs - elapsedMs);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const scheduleStore = useFastingScheduleStore();

  const isScheduleActive = scheduleStore.enabled && scheduleStore.mode !== 'none';
  const scheduleLabel = scheduleStore.mode === 'adf'
    ? `ADF · ${scheduleStore.targetHours}h`
    : scheduleStore.mode === 'daily'
    ? `Diário · ${scheduleStore.targetHours}h`
    : `Personalizado · ${scheduleStore.targetHours}h`;

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
        <Pressable
          accessibilityLabel="Configurar Rotina de Jejum"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-2xl bg-success/10 active:opacity-70"
          onPress={() => setIsScheduleModalOpen(true)}
        >
          <Ionicons color={COLORS.success} name="calendar-outline" size={20} />
        </Pressable>
      </View>

      {/* Routine Status Pill */}
      <View className="mt-3 flex-row items-center justify-between rounded-xl border border-border/80 bg-background/60 px-3 py-2">
        <View className="flex-row items-center gap-2">
          <View className={`h-2 w-2 rounded-full ${isScheduleActive ? 'bg-success' : 'bg-muted'}`} />
          <Text className="font-body text-xs text-muted">
            {isScheduleActive ? `Rotina: ${scheduleLabel}` : "Rotina: Desativada"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsScheduleModalOpen(true)}
        >
          <Text className="font-headline text-xs text-success">
            {isScheduleActive ? "Alterar ↗" : "Configurar ↗"}
          </Text>
        </Pressable>
      </View>

      <View className="mt-4">
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
          label="Fase (Ver ↗)"
          onPress={onPressPhase}
          value={isActive ? currentPhaseTitle : "—"}
        />
      </View>

      <FastingControls
        currentGoalId={goal.id}
        isActive={isActive}
        isSaving={isSaving}
      />

      <FastingScheduleModal
        onClose={() => setIsScheduleModalOpen(false)}
        visible={isScheduleModalOpen}
      />
    </View>
  );
}
