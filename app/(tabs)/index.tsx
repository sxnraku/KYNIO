import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { FastCompletionModal } from "@/components/ui/fast-completion-modal";
import { FastingHistoryCard } from "@/components/ui/fasting-history-card";
import { FastingSummaryCard } from "@/components/ui/fasting-summary-card";
import { MetabolicPhases } from "@/components/ui/metabolic-phases";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { WaterTrackerCard } from "@/components/ui/water-tracker-card";
import { COLORS } from "@/constants/colors";
import { useFastingTimer } from "@/hooks/use-fasting-timer";
import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
} from "@/services/fasting";
import {
  cancelFastingNotifications,
  updateFastingOngoingNotification,
} from "@/services/fastingNotificationService";
import { syncWidgetFastingState } from "@/services/fastingWidgetService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useFastingStore } from "@/store/useFastingStore";

function getTodayLabel(language: "en" | "pt"): string {
  const formattedDate = new Intl.DateTimeFormat(
    language === "en" ? "en-GB" : "pt-PT",
    {
      day: "numeric",
      month: "long",
      weekday: "long",
    },
  ).format(new Date());

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export default function HomeScreen() {
  const language = useAppPreferencesStore((state) => state.language);
  const goal = useFastingStore((state) => state.goal);
  const hasHydrated = useFastingStore((state) => state.hasHydrated);
  const isActive = useFastingStore((state) => state.isActive);
  const isSaving = useFastingStore((state) => state.isSaving);
  const persistenceError = useFastingStore((state) => state.persistenceError);
  const startedAt = useFastingStore((state) => state.startedAt);
  const targetDurationMs = useFastingStore((state) => state.targetDurationMs);
  const lastCompletedFast = useFastingStore((state) => state.lastCompletedFast);
  const clearLastCompletedFast = useFastingStore((state) => state.clearLastCompletedFast);
  const { elapsedHours, elapsedMs, progress } = useFastingTimer();
  const currentPhaseIndex = getEstimatedPhaseIndex(elapsedHours);
  const currentPhase =
    ESTIMATED_METABOLIC_PHASES[currentPhaseIndex] ??
    ESTIMATED_METABOLIC_PHASES[0];

  React.useEffect(() => {
    // Aguardar hidratação do store — antes disso os valores podem ser undefined
    if (!hasHydrated) return;

    const safePhaseTitle = currentPhase?.title ?? 'Digestão & Absorção';
    const safePhaseTip   = currentPhase?.tip   ?? 'Jejum em curso';

    if (isActive && startedAt) {
      void updateFastingOngoingNotification(startedAt, goal.fastingHours);
      syncWidgetFastingState(
        true,
        startedAt,
        goal.fastingHours,
        safePhaseTitle,
      );
    } else {
      void cancelFastingNotifications();
      syncWidgetFastingState(false, 0, goal.fastingHours ?? 16, 'Pronto');
    }
  }, [hasHydrated, isActive, startedAt, goal.fastingHours, currentPhase?.title]);

  if (!hasHydrated) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-24">
          <ActivityIndicator color={COLORS.success} size="large" />
          <Text className="mt-4 font-body text-sm text-muted">
            A recuperar o jejum em curso…
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="mb-5 flex-row items-baseline justify-between">
        <Text
          className="font-label text-[11px] uppercase text-success"
          style={{ letterSpacing: 2.6 }}
        >
          Hoje
        </Text>
        <Text className="font-body text-sm text-muted" translate={false}>
          {getTodayLabel(language)}
        </Text>
      </View>

      <FastingSummaryCard
        currentPhaseTitle={currentPhase.title}
        elapsedMs={elapsedMs}
        goal={goal}
        isActive={isActive}
        isSaving={isSaving}
        progress={progress}
        targetDurationMs={targetDurationMs}
      />

      {persistenceError ? (
        <View className="mt-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3">
          <Text className="font-body text-sm leading-5 text-danger">
            {persistenceError}
          </Text>
        </View>
      ) : null}

      {/* Rastreador de Água & Eletrólitos */}
      <View className="mt-5">
        <WaterTrackerCard />
      </View>

      <MetabolicPhases elapsedHours={elapsedHours} isActive={isActive} />

      <View className="mt-5">
        <FastingHistoryCard />
      </View>

      <View className="mt-6 flex-row items-start border-t border-border px-1 pt-4">
        <Ionicons
          color={COLORS.muted}
          name="information-circle-outline"
          size={16}
          style={{ marginTop: 1 }}
        />
        <Text className="ml-2.5 flex-1 font-body text-xs leading-5 text-muted">
          Fases metabólicas estimadas com base em literatura científica de jejum. Varia de pessoa para pessoa. Toca nas fases para ver todos os detalhes biológicos.
        </Text>
      </View>

      <FastCompletionModal
        onClose={clearLastCompletedFast}
        summary={lastCompletedFast}
        visible={Boolean(lastCompletedFast)}
      />
    </Screen>
  );
}
