import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { FastRecord } from "@/db/schema";
import { getFastRecords } from "@/services/dbService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

interface DayStat {
  dayLabel: string;
  hours: number;
  isToday: boolean;
}

export function WeeklyFastingChart() {
  const language = useAppPreferencesStore((state) => state.language);
  const [dayStats, setDayStats] = useState<DayStat[]>([]);
  const [averageHours, setAverageHours] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const calculateStats = useCallback((records: FastRecord[]) => {
    const now = new Date();
    const days: DayStat[] = [];
    let sumHours = 0;
    let countedDays = 0;

    // Generate last 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * MS_PER_DAY);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + MS_PER_DAY;

      // Find fasts that ended on this day
      const dayFasts = records.filter(
        (r) => r.endTime >= dayStart && r.endTime < dayEnd,
      );

      const dayDurationMs = dayFasts.reduce(
        (acc, curr) => acc + Math.max(0, curr.endTime - curr.startTime),
        0,
      );
      const dayHours = Math.round((dayDurationMs / MS_PER_HOUR) * 10) / 10;

      if (dayHours > 0) {
        countedDays++;
      }
      sumHours += dayHours;

      const dayLabel = d.toLocaleDateString(
        language === "en" ? "en-GB" : "pt-PT",
        { weekday: "short" },
      ).slice(0, 3);

      days.push({
        dayLabel: dayLabel.toUpperCase(),
        hours: dayHours,
        isToday: i === 0,
      });
    }

    setDayStats(days);
    setTotalHours(Math.round(sumHours * 10) / 10);
    setAverageHours(
      countedDays > 0 ? Math.round((sumHours / countedDays) * 10) / 10 : 0,
    );
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      void getFastRecords().then((records) => {
        calculateStats(records);
      });
    }, [calculateStats]),
  );

  const maxChartHours = Math.max(20, ...dayStats.map((d) => d.hours));

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {language === "en" ? "Performance" : "Evolução"}
          </Text>
          <Text className="mt-1 font-headline text-lg text-foreground">
            {language === "en" ? "Weekly Fasting Hours" : "Horas de Jejum (7 Dias)"}
          </Text>
        </View>

        <View className="flex-row items-center rounded-full border border-success/30 bg-success/10 px-3 py-1">
          <Ionicons color={COLORS.success} name="bar-chart-outline" size={14} />
          <Text className="ml-1.5 font-mono text-xs font-bold text-success">
            {averageHours > 0 ? `Ø ${averageHours}h/dia` : "—"}
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="mt-6 flex-row items-end justify-between px-1 h-36">
        {dayStats.map((day, idx) => {
          const heightPercent = Math.min(
            100,
            Math.max(8, Math.round((day.hours / maxChartHours) * 100)),
          );
          const hasFasted = day.hours > 0;

          return (
            <View key={idx} className="flex-1 items-center justify-end h-full px-1">
              <Text className="font-mono text-[10px] text-muted mb-1.5">
                {day.hours > 0 ? `${day.hours}h` : "·"}
              </Text>

              <View
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: hasFasted
                    ? day.isToday
                      ? COLORS.success
                      : "rgba(16, 185, 129, 0.45)"
                    : "rgba(255, 255, 255, 0.05)",
                  borderWidth: hasFasted ? 1 : 0,
                  borderColor: day.isToday ? COLORS.success : "rgba(16, 185, 129, 0.6)",
                }}
              />

              <Text
                className={`mt-2 font-mono text-[10px] ${
                  day.isToday
                    ? "font-bold text-success"
                    : "text-muted"
                }`}
              >
                {day.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Summary Footer */}
      <View className="mt-5 flex-row items-center justify-between border-t border-border/60 pt-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons color={COLORS.muted} name="flame-outline" size={15} />
          <Text className="font-body text-xs text-muted">
            {language === "en" ? "Total Fasted This Week:" : "Total jejuado nesta semana:"}
          </Text>
        </View>
        <Text className="font-headline text-sm text-foreground">
          {totalHours} horas
        </Text>
      </View>
    </Card>
  );
}
