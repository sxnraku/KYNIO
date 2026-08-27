import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import type { FastRecord } from "@/db/schema";
import { getFastRecords } from "@/services/dbService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface FastingSummary {
  completedFasts: number;
  longestFastFormatted: string;
  totalTimeFormatted: string;
  fastingDaysCount: number;
}

function formatDuration(ms: number, language: string): string {
  if (ms <= 0) return "0h";
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  const dayUnit = language === "en" ? "d" : "d";
  const hourUnit = language === "en" ? "h" : "h";
  const minUnit = language === "en" ? "m" : "m";

  if (days > 0) {
    return remainingHours > 0 ? `${days}${dayUnit} ${remainingHours}${hourUnit}` : `${days}${dayUnit}`;
  }
  if (totalHours > 0) {
    return remainingHours > 0 && minutes > 0 ? `${totalHours}${hourUnit} ${minutes}${minUnit}` : `${totalHours}${hourUnit}`;
  }
  return `${minutes}${minUnit}`;
}

export function FastingStatsOverview() {
  const language = useAppPreferencesStore((state) => state.language);
  const [summary, setSummary] = useState<FastingSummary>({
    completedFasts: 0,
    longestFastFormatted: "0h",
    totalTimeFormatted: "0h",
    fastingDaysCount: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const records: FastRecord[] = await getFastRecords();
      if (!records || records.length === 0) {
        setSummary({
          completedFasts: 0,
          longestFastFormatted: "0h",
          totalTimeFormatted: "0h",
          fastingDaysCount: 0,
        });
        return;
      }

      let longestMs = 0;
      let totalMs = 0;
      const uniqueDays = new Set<string>();

      for (const record of records) {
        const duration = Math.max(0, record.endTime - record.startTime);
        totalMs += duration;
        if (duration > longestMs) {
          longestMs = duration;
        }

        const date = new Date(record.endTime);
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        uniqueDays.add(dayKey);
      }

      setSummary({
        completedFasts: records.length,
        longestFastFormatted: formatDuration(longestMs, language),
        totalTimeFormatted: formatDuration(totalMs, language),
        fastingDaysCount: uniqueDays.size,
      });
    } catch {
      // Graceful fallback
    }
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const labels = {
    fasts: language === "en" ? "Fasts" : "Jejuns",
    longestFast: language === "en" ? "Longest fast" : "Jejum mais longo",
    totalTime: language === "en" ? "Total fasting time" : "Tempo total de jejum",
    fastingDays: language === "en" ? "Days with fast" : "Dias com jejum",
  };

  return (
    <View className="flex-row flex-wrap gap-3">
      {/* 1. Total Fasts */}
      <View className="flex-1 min-w-[140px] rounded-2xl border border-border bg-surface p-4">
        <Text className="font-label text-xs text-muted">
          {labels.fasts}
        </Text>
        <Text className="mt-2 font-headline text-2xl text-foreground">
          {summary.completedFasts}
        </Text>
      </View>

      {/* 2. Longest Fast */}
      <View className="flex-1 min-w-[140px] rounded-2xl border border-border bg-surface p-4">
        <Text className="font-label text-xs text-muted">
          {labels.longestFast}
        </Text>
        <Text className="mt-2 font-headline text-2xl text-foreground">
          {summary.longestFastFormatted}
        </Text>
      </View>

      {/* 3. Total Fasting Time */}
      <View className="flex-1 min-w-[140px] rounded-2xl border border-border bg-surface p-4">
        <Text className="font-label text-xs text-muted">
          {labels.totalTime}
        </Text>
        <Text className="mt-2 font-headline text-2xl text-foreground">
          {summary.totalTimeFormatted}
        </Text>
      </View>

      {/* 4. Days with Fast */}
      <View className="flex-1 min-w-[140px] rounded-2xl border border-border bg-surface p-4">
        <Text className="font-label text-xs text-muted">
          {labels.fastingDays}
        </Text>
        <Text className="mt-2 font-headline text-2xl text-foreground">
          {summary.fastingDaysCount}
        </Text>
      </View>
    </View>
  );
}
