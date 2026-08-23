import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";
import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
  type EstimatedMetabolicPhaseId,
} from "@/services/fasting";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface MetabolicPhasesProps {
  elapsedHours: number;
  isActive: boolean;
}

const PHASE_ICONS: Record<EstimatedMetabolicPhaseId, IconName> = {
  autophagy: "leaf-outline",
  digestion: "restaurant-outline",
  glucose: "flash-outline",
  ketosis: "flame-outline",
};

export function MetabolicPhases({
  elapsedHours,
  isActive,
}: MetabolicPhasesProps) {
  const currentPhaseIndex = getEstimatedPhaseIndex(elapsedHours);

  return (
    <View className="mt-8">
      <View className="mb-4 flex-row items-end justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-headline text-2xl text-foreground">
            A tua jornada
          </Text>
          <Text className="mt-1 font-body text-sm text-muted">
            Fases metabólicas estimadas
          </Text>
        </View>
        <View className="rounded-full bg-success/10 px-3 py-1.5">
          <Text className="font-headline text-xs text-success">Referência</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {ESTIMATED_METABOLIC_PHASES.map((phase, index) => {
          const isCurrent = isActive && index === currentPhaseIndex;
          const isCompleted = isActive && index < currentPhaseIndex;
          const accentColor =
            isCurrent || isCompleted ? COLORS.success : COLORS.muted;

          return (
            <View
              accessible
              accessibilityLabel={`${phase.timeRange}, ${phase.title}${isCurrent ? ", fase estimada atual" : ""}`}
              className="min-h-36 w-40 rounded-[24px] border bg-surface p-4"
              key={phase.timeRange}
              style={{
                backgroundColor: isCurrent
                  ? "rgba(16, 185, 129, 0.08)"
                  : COLORS.surface,
                borderColor: isCurrent ? COLORS.success : COLORS.border,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-background">
                  <Ionicons
                    color={accentColor}
                    name={isCompleted ? "checkmark" : PHASE_ICONS[phase.id]}
                    size={20}
                  />
                </View>
                {isCurrent ? (
                  <Text className="font-label text-[9px] text-success">
                    ATUAL
                  </Text>
                ) : null}
              </View>
              <Text className="mt-4 font-body text-xs text-muted">
                {phase.timeRange}
              </Text>
              <Text className="mt-1 font-headline text-[15px] leading-5 text-foreground">
                {phase.title}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
