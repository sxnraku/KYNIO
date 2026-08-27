import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useWaterStore } from "@/store/useWaterStore";

export function WaterTrackerCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const currentMl = useWaterStore((state) => state.currentMl);
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const addWater = useWaterStore((state) => state.addWater);
  const removeWater = useWaterStore((state) => state.removeWater);
  const [showElectrolytesModal, setShowElectrolytesModal] = useState(false);

  const progressPercent = Math.min(100, Math.round((currentMl / dailyGoalMl) * 100));
  const totalGlasses = 8;
  const currentGlasses = Math.min(totalGlasses, Math.floor(currentMl / 250));

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-[#38BDF8]">
            {language === "en" ? "Hydration & Fasting" : "Hidratação & Jejum"}
          </Text>
          <Text className="mt-1 font-headline text-lg text-foreground">
            {language === "en" ? "Water & Electrolytes" : "Água & Eletrólitos"}
          </Text>
        </View>

        <View className="flex-row items-center rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-3 py-1">
          <Ionicons color="#38BDF8" name="water" size={14} />
          <Text className="ml-1.5 font-mono text-xs font-bold text-[#38BDF8]">
            {currentMl} / {dailyGoalMl} ml
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mt-4">
        <View className="h-3 w-full overflow-hidden rounded-full bg-background border border-border">
          <View
            className="h-full rounded-full bg-[#38BDF8]"
            style={{ width: `${progressPercent}%` }}
          />
        </View>

        {/* Cups indicator */}
        <View className="mt-3 flex-row items-center justify-between px-1">
          {Array.from({ length: totalGlasses }).map((_, index) => {
            const isFilled = index < currentGlasses;
            return (
              <View
                key={index}
                className={`h-7 w-7 items-center justify-center rounded-lg border ${
                  isFilled
                    ? "bg-[#38BDF8]/20 border-[#38BDF8]/50"
                    : "bg-background border-border/60"
                }`}
              >
                <Ionicons
                  color={isFilled ? "#38BDF8" : COLORS.muted}
                  name="water"
                  size={15}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Quick Add Buttons */}
      <View className="mt-5 flex-row items-center gap-2">
        <Pressable
          accessibilityLabel="Adicionar 250ml de água"
          accessibilityRole="button"
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/15 py-3 active:opacity-75"
          onPress={() => void addWater(250)}
        >
          <Ionicons color="#38BDF8" name="add" size={17} />
          <Text className="font-headline text-xs text-[#38BDF8]">
            +250 ml <Text className="font-body text-[11px] text-muted">(Copo)</Text>
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Adicionar 500ml de água"
          accessibilityRole="button"
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/15 py-3 active:opacity-75"
          onPress={() => void addWater(500)}
        >
          <Ionicons color="#38BDF8" name="add" size={17} />
          <Text className="font-headline text-xs text-[#38BDF8]">
            +500 ml <Text className="font-body text-[11px] text-muted">(Garrafa)</Text>
          </Text>
        </Pressable>

        {currentMl > 0 ? (
          <Pressable
            accessibilityLabel="Remover 250ml de água"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-xl border border-border bg-background active:opacity-60"
            onPress={() => removeWater(250)}
          >
            <Ionicons color={COLORS.muted} name="remove" size={16} />
          </Pressable>
        ) : null}
      </View>

      {/* Hydration Tip Banner */}
      <View className="mt-4 flex-row items-start rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
        <Ionicons color="#38BDF8" name="water-outline" size={16} />
        <View className="ml-2 flex-1">
          <Text className="font-headline text-xs text-[#38BDF8]">
            {language === "en" ? "Healthy Hydration" : "Dica de Hidratação Saudável"}
          </Text>
          <Text className="mt-0.5 font-body text-xs leading-4 text-muted">
            {language === "en"
              ? "Drinking mineral water regularly supports natural electrolyte balance during fasts. In case of health conditions, consult your doctor."
              : "A ingestão regular de água mineral apoia o equilíbrio natural de eletrólitos durante o jejum. Em caso de condições de saúde, consulta o teu médico."}
          </Text>
        </View>
      </View>
    </Card>
  );
}

