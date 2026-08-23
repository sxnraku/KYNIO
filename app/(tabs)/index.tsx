import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { FastingSummaryCard } from "@/components/ui/fasting-summary-card";
import { MetabolicPhases } from "@/components/ui/metabolic-phases";
import { Screen } from "@/components/ui/screen";
import { COLORS } from "@/constants/colors";
import { useFastingTimer } from "@/hooks/use-fasting-timer";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
  type EstimatedMetabolicPhaseId,
} from "@/services/fasting";
import { useFastingStore } from "@/store/useFastingStore";

const PHASE_SHORT_LABELS: Record<EstimatedMetabolicPhaseId, string> = {
  autophagy: "Autofagia",
  digestion: "Digestão",
  glucose: "Glicose",
  ketosis: "Cetose",
};

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
  const isActive = useFastingStore((state) => state.isActive);
  const isSaving = useFastingStore((state) => state.isSaving);
  const persistenceError = useFastingStore((state) => state.persistenceError);
  const targetDurationMs = useFastingStore((state) => state.targetDurationMs);
  const { elapsedHours, elapsedMs, progress } = useFastingTimer();
  const currentPhase =
    ESTIMATED_METABOLIC_PHASES[getEstimatedPhaseIndex(elapsedHours)] ??
    ESTIMATED_METABOLIC_PHASES[0];

  return (
    <Screen>
      <View className="mb-5 flex-row items-end justify-between">
        <View>
          <Text className="font-headline text-3xl text-foreground">Hoje</Text>
          <Text className="mt-1 font-body text-sm text-muted" translate={false}>
            {getTodayLabel(language)}
          </Text>
        </View>
        <View className="flex-row items-center rounded-full border border-xp/20 bg-xp/10 px-3 py-2">
          <Ionicons color={COLORS.xp} name="diamond-outline" size={15} />
          <Text className="ml-1.5 font-headline text-xs text-foreground">
            Constrói o teu ritmo
          </Text>
        </View>
      </View>

      <FastingSummaryCard
        currentPhaseTitle={PHASE_SHORT_LABELS[currentPhase.id]}
        elapsedMs={elapsedMs}
        goal={goal}
        isActive={isActive}
        isSaving={isSaving}
        progress={progress}
        targetDurationMs={targetDurationMs}
      />

      {persistenceError ? (
        <View className="mt-4 rounded-2xl border border-[#FB7185]/40 bg-[#FB7185]/10 px-4 py-3">
          <Text className="font-body text-sm leading-5 text-[#FDA4AF]">
            {persistenceError}
          </Text>
        </View>
      ) : null}

      <MetabolicPhases elapsedHours={elapsedHours} isActive={isActive} />

      <View className="mt-6 flex-row items-start rounded-2xl border border-border bg-surface px-4 py-4">
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-background">
          <Ionicons
            color={COLORS.muted}
            name="information-circle-outline"
            size={17}
          />
        </View>
        <Text className="ml-3 flex-1 font-body text-xs leading-5 text-muted">
          Fases metabólicas estimadas com base em literatura geral. Varia de
          pessoa para pessoa.
        </Text>
      </View>
    </Screen>
  );
}
