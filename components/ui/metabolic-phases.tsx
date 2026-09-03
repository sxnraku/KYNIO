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

import { FastingSymptomModal } from "@/components/ui/fasting-symptom-modal";
import { MetabolicPhaseDetailModal } from "@/components/ui/metabolic-phase-detail-modal";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
  type EstimatedMetabolicPhase,
  type EstimatedMetabolicPhaseId,
} from "@/services/fasting";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";

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
  const language = useAppPreferencesStore((state) => state.language);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const currentPhaseIndex = getEstimatedPhaseIndex(elapsedHours);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] =
    useState<EstimatedMetabolicPhase | null>(null);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);

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
    if (!isPro) {
      setIsPaywallOpen(true);
      return;
    }
    setSelectedPhase(phase);
    setSelectedPhaseIndex(index);
  };

  return (
    <View className="mt-8">
      <View className="mb-4">
        <View className="flex-row items-baseline justify-between">
          <Text
            className="font-label text-[11px] uppercase text-success"
            style={{ letterSpacing: 2.6 }}
          >
            A tua jornada
          </Text>
          {isActive ? (
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center rounded-lg border border-success/30 bg-success/10 px-2.5 py-1 active:opacity-60"
              onPress={() => setIsSymptomModalOpen(true)}
            >
              <Ionicons color={COLORS.success} name="heart-outline" size={13} />
              <Text className="ml-1 font-label text-[10px] uppercase tracking-wider text-success font-bold">
                {language === 'en' ? 'Feeling?' : 'Como te sentes?'}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text className="mt-1 font-body text-sm text-muted">
          {isPro
            ? "Fases metabólicas · Toca para ver o que acontece no corpo"
            : "Fases metabólicas · Detalhe biológico no Sol Pro"}
        </Text>
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
              accessibilityLabel={translateText(
                `${phase.timeRange}, ${phase.title}${isCurrent ? ", fase estimada atual" : ""}`,
                language,
              )}
              accessibilityRole="button"
              className="min-h-40 w-44 border-b-2 py-1 pr-4 active:opacity-75"
              key={phase.timeRange}
              onPress={() => openPhaseDetail(phase, index)}
              style={{
                borderBottomColor: isCurrent
                  ? COLORS.success
                  : COLORS.border,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Ionicons
                  color={accentColor}
                  name={isCompleted ? "checkmark" : PHASE_ICONS[phase.id]}
                  size={20}
                />
                {isCurrent ? (
                  <Animated.View
                    className="flex-row items-center"
                    style={activePulseStyle}
                  >
                    <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success" />
                    <Text className="font-label text-[9px] text-success">
                      ATUAL
                    </Text>
                  </Animated.View>
                ) : isCompleted ? (
                  <Text className="font-label text-[9px] text-success">
                    CONCLUÍDO
                  </Text>
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
                {isPro ? (
                  <Text className="font-body text-[11px] text-success">
                    Ver biologia & dicas →
                  </Text>
                ) : (
                  <>
                    <Ionicons color={COLORS.xp} name="lock-closed" size={11} />
                    <Text
                      className="ml-1 font-body text-[11px] text-xp"
                      translate={false}
                    >
                      {translateText("Ver biologia & dicas", language)} · PRO
                    </Text>
                  </>
                )}
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

      <PaywallModal
        onClose={() => setIsPaywallOpen(false)}
        visible={isPaywallOpen}
      />

      <FastingSymptomModal
        currentPhaseIndex={currentPhaseIndex}
        onClose={() => setIsSymptomModalOpen(false)}
        visible={isSymptomModalOpen}
      />
    </View>
  );
}

