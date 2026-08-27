import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { MetabolicPhaseDetailModal } from "@/components/ui/metabolic-phase-detail-modal";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
  type EstimatedMetabolicPhase,
  type EstimatedMetabolicPhaseId,
} from "@/services/fasting";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface MetabolicPhasesProps {
  elapsedHours: number;
  isActive: boolean;
}

const PHASE_ICONS: Record<EstimatedMetabolicPhaseId, IconName> = {
  autophagy: "leaf-outline",
  deep_renewal: "sparkles-outline",
  digestion: "restaurant-outline",
  fat_burning: "flame-outline",
  glucose: "flash-outline",
  ketosis: "speedometer-outline",
};

export function MetabolicPhases({
  elapsedHours,
  isActive,
}: MetabolicPhasesProps) {
  const currentPhaseIndex = getEstimatedPhaseIndex(elapsedHours);
  const [selectedPhase, setSelectedPhase] =
    useState<EstimatedMetabolicPhase | null>(null);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);

  // Pulse animation for active card
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1200 }),
          withTiming(1, { duration: 1200 }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isActive, pulseAnim]);

  const activePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const openPhaseDetail = (
    phase: EstimatedMetabolicPhase,
    index: number,
  ) => {
    setSelectedPhase(phase);
    setSelectedPhaseIndex(index);
  };

  return (
    <View className="mt-8">
      <View className="mb-4 flex-row items-end justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-headline text-2xl text-foreground">
            A tua jornada
          </Text>
          <Text className="mt-1 font-body text-sm text-muted">
            Fases metabólicas · Toca para ver o que acontece no corpo
          </Text>
        </View>
        <View className="rounded-full bg-success/10 px-3 py-1.5 border border-success/20">
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
            <Pressable
              accessibilityHint="Abre explicações e benefícios detalhados desta fase metabólica"
              accessibilityLabel={`${phase.timeRange}, ${phase.title}${isCurrent ? ", fase estimada atual" : ""}`}
              accessibilityRole="button"
              className="min-h-40 w-44 rounded-[24px] border bg-surface p-4 active:opacity-75"
              key={phase.timeRange}
              onPress={() => openPhaseDetail(phase, index)}
              style={{
                backgroundColor: isCurrent
                  ? "rgba(16, 185, 129, 0.09)"
                  : COLORS.surface,
                borderColor: isCurrent ? COLORS.success : COLORS.border,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-background border border-border/50">
                  <Ionicons
                    color={accentColor}
                    name={isCompleted ? "checkmark" : PHASE_ICONS[phase.id]}
                    size={20}
                  />
                </View>
                {isCurrent ? (
                  <Animated.View
                    className="flex-row items-center rounded-full bg-success/20 px-2 py-0.5"
                    style={activePulseStyle}
                  >
                    <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success" />
                    <Text className="font-label text-[9px] text-success">
                      ATUAL
                    </Text>
                  </Animated.View>
                ) : isCompleted ? (
                  <View className="rounded-full bg-success/10 px-2 py-0.5">
                    <Text className="font-label text-[9px] text-success">
                      CONCLUÍDO
                    </Text>
                  </View>
                ) : (
                  <Ionicons color={COLORS.muted} name="information-circle-outline" size={16} />
                )}
              </View>

              <Text className="mt-3 font-body text-xs text-muted">
                {phase.timeRange}
              </Text>
              <Text
                className="mt-0.5 font-headline text-[15px] leading-5 text-foreground"
                numberOfLines={2}
              >
                {phase.title}
              </Text>

              <View className="mt-3 flex-row items-center">
                <Text className="font-body text-[11px] text-success">
                  Ver biologia & dicas →
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <MetabolicPhaseDetailModal
        currentPhaseIndex={currentPhaseIndex}
        isActive={isActive}
        onClose={() => setSelectedPhase(null)}
        phase={selectedPhase}
        phaseIndex={selectedPhaseIndex}
      />
    </View>
  );
}

