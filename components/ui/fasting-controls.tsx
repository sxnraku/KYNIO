import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { FastingStartModal } from "@/components/ui/fasting-start-modal";
import { COLORS } from "@/constants/colors";
import { triggerMediumImpact, triggerSuccessFeedback } from "@/services/hapticsService";
import {

  FASTING_GOALS,
  type FastingGoalId,
  useFastingStore,
} from "@/store/useFastingStore";

interface FastingControlsProps {
  currentGoalId: FastingGoalId;
  isActive: boolean;
  isSaving: boolean;
}

export function FastingControls({
  currentGoalId,
  isActive,
  isSaving,
}: FastingControlsProps) {
  const endFasting = useFastingStore((state) => state.endFasting);
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
            accessibilityLabel="Iniciar Jejum"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className="min-h-14 flex-row items-center justify-center rounded-2xl bg-success px-5 active:opacity-80"
            disabled={isSaving}
            onPress={() => {
              triggerMediumImpact();
              startFasting();
            }}
            style={{ opacity: isSaving ? 0.45 : 1 }}
            testID="start-fasting-button"
          >
            <Ionicons color="#002113" name="play" size={18} />
            <Text className="ml-2 font-headline text-base text-[#002113]">
              Iniciar Jejum
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Terminar Jejum"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className="min-h-14 flex-row items-center justify-center rounded-2xl bg-foreground px-5 active:opacity-80"
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

        {!isActive ? (
          <Pressable
            accessibilityLabel="Já comecei o jejum antes"
            accessibilityRole="button"
            className="mt-3 min-h-12 flex-row items-center justify-center rounded-2xl border border-success/30 bg-success/5 px-5 active:opacity-70"
            onPress={() => setStartModalMode("start")}
            testID="start-fasting-earlier-button"
          >
            <Ionicons color={COLORS.success} name="time-outline" size={18} />
            <Text className="ml-2 font-headline text-sm text-success">
              Já comecei antes
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Editar hora de início do jejum"
            accessibilityRole="button"
            className="mt-3 min-h-12 flex-row items-center justify-center rounded-2xl border border-success/30 bg-success/5 px-5 active:opacity-70"
            onPress={() => setStartModalMode("edit")}
            testID="edit-fasting-start-button"
          >
            <Ionicons color={COLORS.success} name="create-outline" size={18} />
            <Text className="ml-2 font-headline text-sm text-success">
              Editar início
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityLabel={`Editar Objetivo ${currentGoal.label}`}
          accessibilityRole="button"
          className="mt-3 min-h-12 flex-row items-center justify-center rounded-2xl border border-border bg-surface-raised px-5 active:opacity-70"
          onPress={() => setIsGoalPickerOpen(true)}
          testID="edit-fasting-goal-button"
        >
          <Ionicons color={COLORS.success} name="options-outline" size={18} />
          <Text className="ml-2 font-headline text-sm text-foreground">
            Objetivo · {currentGoal.label}
          </Text>
        </Pressable>
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
            accessibilityLabel="Fechar seleção de objetivo"
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
                  accessibilityLabel="Fechar"
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

