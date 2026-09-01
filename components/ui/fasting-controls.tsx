import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { FastingStartModal } from "@/components/ui/fasting-start-modal";
import { COLORS } from "@/constants/colors";
import { triggerMediumImpact, triggerSuccessFeedback } from "@/services/hapticsService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import {

  FASTING_GOALS,
  type FastingGoalId,
  useFastingStore,
} from "@/store/useFastingStore";

interface FastingControlsProps {
  currentGoalId: FastingGoalId;
  isActive: boolean;
  isSaving: boolean;
  onOpenSchedule: () => void;
  scheduleLabel: string | null;
}

export function FastingControls({
  currentGoalId,
  isActive,
  isSaving,
  onOpenSchedule,
  scheduleLabel,
}: FastingControlsProps) {
  const endFasting = useFastingStore((state) => state.endFasting);
  const language = useAppPreferencesStore((state) => state.language);
  const setGoal = useFastingStore((state) => state.setGoal);
  const setStartedAt = useFastingStore((state) => state.setStartedAt);
  const startFasting = useFastingStore((state) => state.startFasting);
  const startedAt = useFastingStore((state) => state.startedAt);
  const currentGoal =
    FASTING_GOALS.find((g) => g.id === currentGoalId) || FASTING_GOALS[0];
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
  const [startModalMode, setStartModalMode] = useState<
    "edit" | "start" | null
  >(null);

  const selectGoal = (goalId: FastingGoalId) => {
    setGoal(goalId);
    setIsGoalPickerOpen(false);
  };

  const confirmStartedAt = (timestamp: number): boolean =>
    startModalMode === "edit"
      ? setStartedAt(timestamp)
      : startFasting(timestamp);

  return (
    <>
      <View className="mt-5">
        {!isActive ? (
          <Pressable
            accessibilityLabel={translateText("Iniciar Jejum", language)}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className="min-h-14 flex-row items-center justify-center rounded-full bg-success px-5 active:opacity-80"
            disabled={isSaving}
            onPress={() => {
              triggerMediumImpact();
              startFasting();
            }}
            style={{ opacity: isSaving ? 0.45 : 1 }}
            testID="start-fasting-button"
          >
            <Ionicons color="#3A2200" name="play" size={18} />
            <Text className="ml-2 font-headline text-base text-[#3A2200]">
              Iniciar Jejum
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel={translateText("Terminar Jejum", language)}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className="min-h-14 flex-row items-center justify-center rounded-full bg-foreground px-5 active:opacity-80"
            disabled={isSaving}
            onPress={() => {
              triggerSuccessFeedback();
              void endFasting();
            }}

            style={{ opacity: isSaving ? 0.45 : 1 }}
            testID="end-fasting-button"
          >
            <Ionicons color={COLORS.background} name="stop" size={17} />
            <Text className="ml-2 font-headline text-base text-background">
              {isSaving ? "A guardar…" : "Terminar Jejum"}
            </Text>
          </Pressable>
        )}

        {/* ações secundárias em mono, sem caixas */}
        <Pressable
          accessibilityLabel={translateText("Configurar Rotina de Jejum", language)}
          accessibilityRole="button"
          className="mt-4 min-h-11 items-center justify-center active:opacity-60"
          onPress={onOpenSchedule}
        >
          <Text
            className="font-label text-[10px] uppercase text-muted"
            style={{ letterSpacing: 1.6 }}
            translate={false}
          >
            {scheduleLabel
              ? `${translateText("Ajustar rotina", language)} · ${scheduleLabel}`
              : translateText("Configurar rotina de jejum", language)}
          </Text>
        </Pressable>

        <View className="mt-1 flex-row items-center justify-center">
          <Pressable
            accessibilityLabel={translateText(
              `Editar Objetivo ${currentGoal.label}`,
              language,
            )}
            accessibilityRole="button"
            className="min-h-11 flex-row items-center justify-center px-3 active:opacity-60"
            onPress={() => setIsGoalPickerOpen(true)}
            testID="edit-fasting-goal-button"
          >
            <Text
              className="font-label text-[10px] uppercase text-success"
              style={{ letterSpacing: 1.2 }}
            >
              Objetivo · {currentGoal.label}
            </Text>
          </Pressable>

          <Text className="font-label text-[10px] text-border" translate={false}>
            ·
          </Text>

          {!isActive ? (
            <Pressable
              accessibilityLabel={translateText("Já comecei o jejum antes", language)}
              accessibilityRole="button"
              className="min-h-11 flex-row items-center justify-center px-3 active:opacity-60"
              onPress={() => setStartModalMode("start")}
              testID="start-fasting-earlier-button"
            >
              <Text
                className="font-label text-[10px] uppercase text-success"
                style={{ letterSpacing: 1.2 }}
              >
                Já comecei antes
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel={translateText("Editar hora de início do jejum", language)}
              accessibilityRole="button"
              className="min-h-11 flex-row items-center justify-center px-3 active:opacity-60"
              onPress={() => setStartModalMode("edit")}
              testID="edit-fasting-start-button"
            >
              <Text
                className="font-label text-[10px] uppercase text-success"
                style={{ letterSpacing: 1.2 }}
              >
                Editar início
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {startModalMode ? (
        <FastingStartModal
          initialStartedAt={startedAt}
          mode={startModalMode}
          onClose={() => setStartModalMode(null)}
          onConfirm={confirmStartedAt}
        />
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsGoalPickerOpen(false)}
        transparent
        visible={isGoalPickerOpen}
      >
        <View className="flex-1 justify-end bg-black/70">
          <Pressable
            accessibilityLabel={translateText("Fechar seleção de objetivo", language)}
            onPress={() => setIsGoalPickerOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={["bottom"]}>
            <View
              className="max-h-[85vh] rounded-t-[32px] border border-border bg-surface px-5 pb-5 pt-3"
              style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
            >
              <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="font-headline text-2xl text-foreground">
                    Objetivo de jejum
                  </Text>
                  <Text className="mt-1 font-body text-sm leading-5 text-muted">
                    Escolhe o protocolo ou opta por jejum livre sem limite fixo.
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={translateText("Fechar", language)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-background"
                  onPress={() => setIsGoalPickerOpen(false)}
                >
                  <Ionicons color={COLORS.muted} name="close" size={20} />
                </Pressable>
              </View>

              <ScrollView
                className="my-1"
                contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {FASTING_GOALS.map((goal) => {
                  const isSelected = goal.id === currentGoalId;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      className="min-h-16 flex-row items-center justify-between rounded-2xl border bg-surface-raised px-4 py-3"
                      key={goal.id}
                      onPress={() => selectGoal(goal.id)}
                      style={{
                        borderColor: isSelected
                          ? COLORS.success
                          : COLORS.border,
                      }}
                    >
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center">
                          <Text className="font-headline text-lg text-foreground">
                            {goal.label}
                          </Text>
                          {goal.id === "open" ? (
                            <View className="ml-2 rounded-full bg-success/15 px-2 py-0.5">
                              <Text className="font-label text-[10px] text-success">
                                FLEXÍVEL
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="mt-0.5 font-body text-xs text-muted">
                          {goal.id === "open"
                            ? "Sem meta pré-fixada · Conta até decidires terminar"
                            : `${goal.fastingHours}h de jejum · ${goal.eatingHours}h janela · ${goal.description}`}
                        </Text>
                      </View>
                      <Ionicons
                        color={isSelected ? COLORS.success : COLORS.muted}
                        name={
                          isSelected ? "radio-button-on" : "radio-button-off"
                        }
                        size={22}
                      />
                    </Pressable>
                  );
                })}

                <View className="mt-2 rounded-2xl border border-border bg-background p-3.5">
                  <View className="flex-row items-center">
                    <Ionicons
                      color={COLORS.success}
                      name="shield-checkmark-outline"
                      size={15}
                    />
                    <Text className="ml-1.5 font-headline text-xs text-foreground">
                      Segurança de Saúde & Privacidade RGPD
                    </Text>
                  </View>
                  <Text className="mt-1 font-body text-xs leading-4 text-muted">
                    Ouve sempre os sinais do teu corpo. Jejuns prolongados (superiores a 24h)
                    não são indicados para menores, grávidas ou sem acompanhamento
                    médico. Todos os teus registos são 100% locais e confidenciais.
                  </Text>

                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

    </>
  );
}

