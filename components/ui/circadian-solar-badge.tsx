import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import { calculateSolarCycle } from "@/services/solarCycleService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export function CircadianSolarBadge() {
  const language = useAppPreferencesStore((state) => state.language);
  const solarCycle = useMemo(
    () => calculateSolarCycle(new Date(), language),
    [language],
  );

  const isNight = solarCycle.phase === "circadian_night";

  return (
    <View className="mb-4 rounded-xl border border-border bg-surface-raised px-3.5 py-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className={`h-6 w-6 items-center justify-center rounded-full ${
              isNight ? "bg-muted/15" : "bg-success/15"
            }`}
          >
            <Ionicons
              color={isNight ? COLORS.muted : COLORS.success}
              name={isNight ? "moon-outline" : "sunny-outline"}
              size={14}
            />
          </View>
          <View>
            <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
              {language === "en" ? "Solar Circadian Cycle" : "Ciclo Solar Circadiano"}
            </Text>
            <Text className="font-headline text-xs text-foreground">
              {solarCycle.phaseLabel}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="font-label text-[10px] text-foreground">
            {solarCycle.sunrise} · {solarCycle.sunset}
          </Text>
          <Text className="font-body text-[9px] text-muted">
            {language === "en"
              ? `${solarCycle.daylightDurationHours}h daylight`
              : `${solarCycle.daylightDurationHours}h de luz solar`}
          </Text>
        </View>
      </View>
    </View>
  );
}
