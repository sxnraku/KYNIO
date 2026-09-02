import { View } from "react-native";

import { FastingControls } from "@/components/ui/fasting-controls";
import { FastingScheduleModal } from "@/components/ui/fasting-schedule-modal";
import { FastingTimer } from "@/components/ui/fasting-timer";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { useFastingScheduleStore } from "@/store/use-fasting-schedule-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";
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

export function FastingSummaryCard({
  elapsedMs,
  goal,
  isActive,
  isSaving,
  progress,
  targetDurationMs,
}: FastingSummaryCardProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const scheduleStore = useFastingScheduleStore();

  const scheduleLabel =
    scheduleStore.enabled && scheduleStore.mode !== "none"
      ? scheduleStore.mode === "adf"
        ? `ADF · ${scheduleStore.targetHours}h`
        : scheduleStore.mode === "daily"
          ? `Diário · ${scheduleStore.targetHours}h`
          : `Personalizado · ${scheduleStore.targetHours}h`
      : null;

  return (
    <View className="pt-1">
      <FastingTimer
        elapsedMs={elapsedMs}
        goalLabel={goal.label}
        isActive={isActive}
        progress={progress}
        targetDurationMs={targetDurationMs}
      />

      <FastingControls
        currentGoalId={goal.id}
        isActive={isActive}
        isSaving={isSaving}
        onOpenSchedule={() =>
          isPro ? setIsScheduleModalOpen(true) : setIsPaywallOpen(true)
        }
        scheduleLabel={scheduleLabel}
      />

      <FastingScheduleModal
        onClose={() => setIsScheduleModalOpen(false)}
        visible={isScheduleModalOpen}
      />

      <PaywallModal
        onClose={() => setIsPaywallOpen(false)}
        visible={isPaywallOpen}
      />
    </View>
  );
}
