import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { EstimatedMetabolicPhase } from "@/services/fasting";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface MetabolicPhaseDetailModalProps {
  currentPhaseIndex: number;
  isActive: boolean;
  onClose: () => void;
  phase: EstimatedMetabolicPhase | null;
  phaseIndex: number;
}

const PHASE_ICONS: Record<string, IconName> = {
  autophagy: "leaf-outline",
  deep_renewal: "sparkles-outline",
  digestion: "restaurant-outline",
  fat_burning: "flame-outline",
  glucose: "flash-outline",
  ketosis: "speedometer-outline",
};

export function MetabolicPhaseDetailModal({
  currentPhaseIndex,
  isActive,
  onClose,
  phase,
  phaseIndex,
}: MetabolicPhaseDetailModalProps) {
  const language = useAppPreferencesStore((state) => state.language);

  if (!phase) {
    return null;
  }

  const isCurrent = isActive && phaseIndex === currentPhaseIndex;
  const isCompleted = isActive && phaseIndex < currentPhaseIndex;
  const iconName = PHASE_ICONS[phase.id] || "pulse-outline";

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={Boolean(phase)}
    >
      <View className="flex-1 justify-end bg-black/75">
        <Pressable
          accessibilityLabel={translateText("Fechar detalhes da fase", language)}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={["bottom"]}>
          <View
            className="max-h-[90vh] rounded-t-[32px] border border-border bg-surface px-5 pb-6 pt-3"
            style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
          >
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />

            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border">
                  <Ionicons
                    color={isCurrent || isCompleted ? COLORS.success : COLORS.muted}
                    name={isCompleted ? "checkmark-circle" : iconName}
                    size={24}
                  />
                </View>
                <View>
                  <Text className="font-headline text-2xl text-foreground">
                    {phase.title}
                  </Text>
                  <Text className="mt-0.5 font-label text-xs text-muted">
                    {phase.timeRange} de jejum
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityLabel={translateText("Fechar", language)}
                className="h-9 w-9 items-center justify-center rounded-full bg-background"
                onPress={onClose}
              >
                <Ionicons color={COLORS.muted} name="close" size={20} />
              </Pressable>
            </View>

            {isCurrent ? (
              <View className="mb-4 flex-row items-center rounded-xl bg-success/10 px-3 py-2 border border-success/30">
                <View className="mr-2 h-2 w-2 rounded-full bg-success animate-pulse" />
                <Text className="font-headline text-xs text-success">
                  Esta é a fase estimada em que o teu organismo se encontra agora.
                </Text>
              </View>
            ) : null}

            <ScrollView
              className="my-1"
              contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* O que acontece no corpo */}
              <View className="rounded-2xl border border-border bg-surface-raised p-4">
                <View className="mb-2 flex-row items-center">
                  <Ionicons color={COLORS.success} name="analytics-outline" size={18} />
                  <Text className="ml-2 font-headline text-sm text-foreground">
                    O que está a acontecer no organismo
                  </Text>
                </View>
                <Text className="font-body text-sm leading-6 text-muted">
                  {phase.description}
                </Text>
              </View>

              {/* Efeito Fisiológico */}
              <View className="rounded-2xl border border-border bg-background p-4">
                <View className="mb-1.5 flex-row items-center">
                  <Ionicons color={COLORS.success} name="hardware-chip-outline" size={17} />
                  <Text className="ml-2 font-headline text-xs text-success">
                    BIOLOGIA & HORMONAS
                  </Text>
                </View>
                <Text className="font-body text-xs leading-5 text-muted">
                  {phase.physiologicalEffect}
                </Text>
              </View>

              {/* Benefícios Principais */}
              <View className="rounded-2xl border border-border bg-surface-raised p-4">
                <View className="mb-3 flex-row items-center">
                  <Ionicons color={COLORS.success} name="shield-checkmark-outline" size={18} />
                  <Text className="ml-2 font-headline text-sm text-foreground">
                    Benefícios comprovados
                  </Text>
                </View>
                <View className="gap-2.5">
                  {phase.benefits.map((benefit, idx) => (
                    <View className="flex-row items-start" key={idx}>
                      <View className="mr-2.5 mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-success/15">
                        <Ionicons color={COLORS.success} name="checkmark" size={11} />
                      </View>
                      <Text className="flex-1 font-body text-xs leading-5 text-muted">
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Dica Prática */}
              <View className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
                <View className="mb-1.5 flex-row items-center">
                  <Ionicons color={COLORS.warning} name="bulb-outline" size={17} />
                  <Text className="ml-2 font-headline text-xs text-warning">
                    DICA PRÁTICA
                  </Text>
                </View>
                <Text className="font-body text-xs leading-5 text-muted">
                  {phase.tip}
                </Text>
              </View>

              {/* Aviso Médico e Proteção de Dados RGPD */}
              <View className="rounded-2xl border border-border bg-background p-3.5">
                <View className="flex-row items-center">
                  <Ionicons color={COLORS.muted} name="shield-checkmark-outline" size={15} />
                  <Text className="ml-1.5 font-headline text-[11px] text-muted">
                    AVISO DE SAÚDE & PRIVACIDADE RGPD
                  </Text>
                </View>
                <Text className="mt-1 font-body text-[11px] leading-4 text-muted">
                  As fases são estimativas biológicas de referência e não substituem avaliação médica. Em caso de tonturas ou mal-estar, interrompe o jejum. Todos os dados permanecem na tua base SQLite local privada.
                </Text>
              </View>
            </ScrollView>


            <Pressable
              accessibilityLabel={translateText("Entendido", language)}
              accessibilityRole="button"
              className="mt-2 min-h-12 items-center justify-center rounded-2xl bg-foreground active:opacity-80"
              onPress={onClose}
            >
              <Text className="font-headline text-sm text-background">
                Entendido
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
