import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import { getFastRecords, getMealRecords } from "@/services/dbService";
import {
  calculatePersonalInsights,
  type PersonalFactualInsights,
} from "@/services/personalInsightsService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export function FactualInsightsCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const [insights, setInsights] = useState<PersonalFactualInsights | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const [fasts, meals] = await Promise.all([
        getFastRecords(),
        getMealRecords(),
      ]);
      if (isMounted) {
        setInsights(calculatePersonalInsights(fasts, meals, language));
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [language]);

  if (!insights || !insights.hasEnoughData) {
    return null;
  }

  const formatWeeklyDiff = () => {
    const mins = Math.abs(insights.weeklyDiffMinutes);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const timeStr = h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;

    if (insights.weeklyTrend === "up") {
      return language === "en"
        ? `+${timeStr.trim()} on average vs last week`
        : `+${timeStr.trim()} em média vs semana anterior`;
    }
    if (insights.weeklyTrend === "down") {
      return language === "en"
        ? `-${timeStr.trim()} on average vs last week`
        : `-${timeStr.trim()} em média vs semana anterior`;
    }
    return language === "en"
      ? "Stable consistency vs last week"
      : "Consistência estável vs semana anterior";
  };

  return (
    <Card>
      <View className="flex-row items-center gap-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-success/10">
          <Ionicons color={COLORS.success} name="analytics-outline" size={19} />
        </View>
        <View className="flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {language === "en" ? "Personal Patterns" : "Padrões Pessoais"}
          </Text>
          <Text className="mt-0.5 font-headline text-base text-foreground">
            {language === "en" ? "Factual Insights" : "Insights Factuais"}
          </Text>
        </View>
        <View className="rounded-full bg-surface-raised border border-border px-2.5 py-1">
          <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
            {language === "en" ? "Local SQLite" : "SQLite Local"}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2.5">
        {/* 1. Média e Comparação Semanal */}
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface-raised p-3">
          <View className="flex-1 pr-2">
            <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
              {language === "en" ? "Weekly Trend" : "Evolução Semanal"}
            </Text>
            <Text className="mt-1 font-headline text-sm text-foreground">
              {formatWeeklyDiff()}
            </Text>
            <Text className="mt-0.5 font-body text-xs text-muted">
              {language === "en"
                ? `Current average: ${insights.thisWeekAvgHours}h per fast`
                : `Média atual: ${insights.thisWeekAvgHours}h por jejum`}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-background">
            <Ionicons
              color={
                insights.weeklyTrend === "up"
                  ? COLORS.success
                  : insights.weeklyTrend === "down"
                  ? COLORS.muted
                  : COLORS.success
              }
              name={
                insights.weeklyTrend === "up"
                  ? "trending-up"
                  : insights.weeklyTrend === "down"
                  ? "trending-down"
                  : "remove"
              }
              size={18}
            />
          </View>
        </View>

        {/* 2. Dia mais consistente */}
        {insights.mostConsistentDay ? (
          <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface-raised p-3">
            <View className="flex-1 pr-2">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === "en" ? "Most Consistent Day" : "Dia de Maior Consistência"}
              </Text>
              <Text className="mt-1 font-headline text-sm text-foreground">
                {insights.mostConsistentDay}
              </Text>
              <Text className="mt-0.5 font-body text-xs text-muted">
                {language === "en"
                  ? "Day you complete the most fasting goals"
                  : "Dia em que concluis mais metas de jejum"}
              </Text>
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-background">
              <Ionicons color={COLORS.success} name="calendar-outline" size={16} />
            </View>
          </View>
        ) : null}

        {/* 3. Janela alimentar típica */}
        {insights.typicalMealStartHour ? (
          <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface-raised p-3">
            <View className="flex-1 pr-2">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === "en" ? "Typical Eating Window" : "Janela Habitual de Refeição"}
              </Text>
              <Text className="mt-1 font-headline text-sm text-foreground">
                {language === "en"
                  ? `Around ${insights.typicalMealStartHour}`
                  : `Por volta das ${insights.typicalMealStartHour}`}
              </Text>
              <Text className="mt-0.5 font-body text-xs text-muted">
                {language === "en"
                  ? "Hour you break fast most frequently"
                  : "Hora em que quebras o jejum com mais frequência"}
              </Text>
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-background">
              <Ionicons color={COLORS.success} name="time-outline" size={16} />
            </View>
          </View>
        ) : null}
      </View>

      <Text className="mt-3 font-body text-[10px] text-muted">
        {language === "en"
          ? "Purely descriptive calculations derived from your local device records."
          : "Cálculos puramente descritivos derivados dos teus registos locais no dispositivo."}
      </Text>
    </Card>
  );
}
