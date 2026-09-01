import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { COLORS, successWithAlpha } from "@/constants/colors";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useWaterStore } from "@/store/useWaterStore";

export function WaterTrackerCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const currentMl = useWaterStore((state) => state.currentMl);
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const addWater = useWaterStore((state) => state.addWater);
  const removeWater = useWaterStore((state) => state.removeWater);
  const ensureToday = useWaterStore((state) => state.ensureToday);

  // Garante que o contador reinicia à meia-noite: ao focar o ecrã e a cada 30 s
  // enquanto estiver aberto (cobre a app deixada aberta por cima da viragem do dia).
  useFocusEffect(
    useCallback(() => {
      ensureToday();
      const interval = setInterval(ensureToday, 30_000);
      return () => clearInterval(interval);
    }, [ensureToday]),
  );

  const totalGlasses = 8;
  const currentGlasses = Math.min(totalGlasses, Math.floor(currentMl / 250));

  return (
    <View className="border-t border-border pt-5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {language === "en" ? "Hydration & Fasting" : "Hidratação & Jejum"}
          </Text>
          <Text className="mt-1 font-headline text-lg text-foreground">
            {language === "en" ? "Water & Electrolytes" : "Água & Eletrólitos"}
          </Text>
        </View>

        <View
          className="flex-row items-center rounded-full border px-3 py-1"
          style={{
            backgroundColor: successWithAlpha(0.1),
            borderColor: successWithAlpha(0.3),
          }}
        >
          <Ionicons color={COLORS.success} name="water" size={14} />
          <Text className="ml-1.5 font-mono text-xs font-bold text-success">
            {currentMl} / {dailyGoalMl} ml
          </Text>
        </View>
      </View>

      {/* Segmentos de copos — a "luz" sobe a cada copo */}
      <View className="mt-4 flex-row gap-1.5">
        {Array.from({ length: totalGlasses }).map((_, index) => {
          const isFilled = index < currentGlasses;
          return (
            <View
              accessibilityElementsHidden
              className="h-5 flex-1 rounded-md border"
              importantForAccessibility="no-hide-descendants"
              key={index}
              style={{
                backgroundColor: isFilled
                  ? COLORS.success
                  : COLORS.surfaceRaised,
                borderColor: isFilled ? COLORS.success : COLORS.border,
              }}
            />
          );
        })}
      </View>

      {/* Quick Add Buttons */}
      <View className="mt-5 flex-row items-center gap-2">
        <Pressable
          accessibilityLabel={translateText("Adicionar 250ml de água", language)}
          accessibilityRole="button"
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-3 active:opacity-75"
          onPress={() => void addWater(250)}
          style={{
            backgroundColor: successWithAlpha(0.15),
            borderColor: successWithAlpha(0.4),
          }}
        >
          <Ionicons color={COLORS.success} name="add" size={17} />
          <Text className="font-headline text-xs text-success">
            +250 ml <Text className="font-body text-[11px] text-muted">(Copo)</Text>
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel={translateText("Adicionar 500ml de água", language)}
          accessibilityRole="button"
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-3 active:opacity-75"
          onPress={() => void addWater(500)}
          style={{
            backgroundColor: successWithAlpha(0.15),
            borderColor: successWithAlpha(0.4),
          }}
        >
          <Ionicons color={COLORS.success} name="add" size={17} />
          <Text className="font-headline text-xs text-success">
            +500 ml <Text className="font-body text-[11px] text-muted">(Garrafa)</Text>
          </Text>
        </Pressable>

        {currentMl > 0 ? (
          <Pressable
            accessibilityLabel={translateText("Remover 250ml de água", language)}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface active:opacity-60"
            onPress={() => void removeWater(250)}
          >
            <Ionicons color={COLORS.muted} name="remove" size={16} />
          </Pressable>
        ) : null}
      </View>

      {/* Hydration Tip Banner */}
      <View
        className="mt-4 flex-row items-start rounded-xl border p-3"
        style={{
          backgroundColor: successWithAlpha(0.08),
          borderColor: successWithAlpha(0.2),
        }}
      >
        <Ionicons color={COLORS.success} name="water-outline" size={16} />
        <View className="ml-2 flex-1">
          <Text className="font-headline text-xs text-success">
            {language === "en" ? "Healthy Hydration" : "Dica de Hidratação Saudável"}
          </Text>
          <Text className="mt-0.5 font-body text-xs leading-4 text-muted">
            {language === "en"
              ? "Drinking mineral water regularly supports natural electrolyte balance during fasts. In case of health conditions, consult your doctor."
              : "A ingestão regular de água mineral apoia o equilíbrio natural de eletrólitos durante o jejum. Em caso de condições de saúde, consulta o teu médico."}
          </Text>
        </View>
      </View>
    </View>
  );
}
