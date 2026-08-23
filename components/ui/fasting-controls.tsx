import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
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
  const startFasting = useFastingStore((state) => state.startFasting);
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);

  const selectGoal = (goalId: FastingGoalId) => {
    setGoal(goalId);
    setIsGoalPickerOpen(false);
  };

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
            onPress={startFasting}
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

        <Pressable
          accessibilityLabel={`Editar Objetivo ${currentGoalId}`}
          accessibilityRole="button"
          className="mt-3 min-h-12 flex-row items-center justify-center rounded-2xl border border-border bg-surface-raised px-5 active:opacity-70"
          onPress={() => setIsGoalPickerOpen(true)}
          testID="edit-fasting-goal-button"
        >
          <Ionicons color={COLORS.success} name="options-outline" size={18} />
          <Text className="ml-2 font-headline text-sm text-foreground">
            Editar objetivo · {currentGoalId}
          </Text>
        </Pressable>
      </View>

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
              className="rounded-t-[32px] border border-border bg-surface px-5 pb-5 pt-3"
              style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
            >
              <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />
              <View className="mb-5 flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="font-headline text-2xl text-foreground">
                    Objetivo de jejum
                  </Text>
                  <Text className="mt-1 font-body text-sm leading-5 text-muted">
                    Escolhe a janela que pretendes acompanhar.
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

              <View className="gap-3">
                {FASTING_GOALS.map((goal) => {
                  const isSelected = goal.id === currentGoalId;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      className="min-h-16 flex-row items-center justify-between rounded-2xl border bg-surface-raised px-5"
                      key={goal.id}
                      onPress={() => selectGoal(goal.id)}
                      style={{
                        borderColor: isSelected
                          ? COLORS.success
                          : COLORS.border,
                      }}
                    >
                      <View>
                        <Text className="font-headline text-xl text-foreground">
                          {goal.id}
                        </Text>
                        <Text className="mt-0.5 font-body text-xs text-muted">
                          {goal.fastingHours}h de jejum · {goal.eatingHours}h de
                          janela
                        </Text>
                      </View>
                      <Ionicons
                        color={isSelected ? COLORS.success : COLORS.muted}
                        name={
                          isSelected ? "radio-button-on" : "radio-button-off"
                        }
                        size={21}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}
