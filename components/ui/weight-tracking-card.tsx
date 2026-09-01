import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { WeightEntryRecord } from "@/db/schema";
import {
  deleteWeightEntry,
  getUserProfile,
  getWeightEntries,
  gramsToWeight,
  saveWeightEntry,
  type WeightUnit,
} from "@/services/dbService";
import { deleteRemoteWeightEntry } from "@/services/cloudSyncService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

type TimeRange = "week" | "month" | "year" | "all";

function formatWeightVal(weightGrams: number, unit: WeightUnit): number {
  return Math.round(gramsToWeight(weightGrams, unit) * 10) / 10;
}

export function WeightTrackingCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const [entries, setEntries] = useState<WeightEntryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [weight, setWeight] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [targetWeightGrams, setTargetWeightGrams] = useState<number | null>(null);

  const reload = useCallback(async () => {
    try {
      const [profile, records] = await Promise.all([
        getUserProfile(),
        getWeightEntries(),
      ]);
      setUnit(profile.weightUnit);
      setTargetWeightGrams(null);
      setEntries(records);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível carregar os registos de peso.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Filter entries based on timeRange
  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];
    const now = Date.now();
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

    if (timeRange === "all") return sorted;

    const daysMap = { week: 7, month: 30, year: 365 };
    const cutoff = now - daysMap[timeRange] * 24 * 60 * 60 * 1000;
    const filtered = sorted.filter((e) => e.timestamp >= cutoff);
    return filtered.length ? filtered : sorted;
  }, [entries, timeRange]);

  const save = async () => {
    if (isSaving) return;

    const parsedWeight = Number(weight.trim().replace(",", "."));
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Introduz um peso válido superior a zero.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await saveWeightEntry({ unit, weight: parsedWeight });
      setWeight("");
      setIsModalVisible(false);
      await reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível guardar o registo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (entry: WeightEntryRecord) => {
    Alert.alert(
      "Eliminar este registo?",
      `${formatWeightVal(entry.weightGrams, unit)} ${unit} · ${new Date(entry.timestamp).toLocaleDateString()}`,
      [
        { style: "cancel", text: "Cancelar" },
        {
          onPress: () => {
            void getUserProfile()
              .then(async (profile) => {
                if (profile.cloudUserId) {
                  await deleteRemoteWeightEntry(entry.timestamp);
                }
                await deleteWeightEntry(entry.id);
                await reload();
              })
              .catch(() => {
                setError("Não foi possível eliminar este registo.");
              });
          },
          style: "destructive",
          text: "Eliminar",
        },
      ],
    );
  };

  // SVG Chart Dimensions
  const chartWidth = 320;
  const chartHeight = 160;
  const paddingLeft = 32;
  const paddingRight = 36;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartData = useMemo(() => {
    if (filteredEntries.length === 0) return null;

    const weights = filteredEntries.map((e) => formatWeightVal(e.weightGrams, unit));
    const targetVal = targetWeightGrams ? formatWeightVal(targetWeightGrams, unit) : null;
    const allVals = targetVal ? [...weights, targetVal] : weights;

    const minWeight = Math.floor(Math.min(...allVals) - 2);
    const maxWeight = Math.ceil(Math.max(...allVals) + 2);
    const weightSpan = Math.max(1, maxWeight - minWeight);

    const availableWidth = chartWidth - paddingLeft - paddingRight;
    const availableHeight = chartHeight - paddingTop - paddingBottom;

    const points = filteredEntries.map((entry, idx) => {
      const w = formatWeightVal(entry.weightGrams, unit);
      const x =
        filteredEntries.length === 1
          ? paddingLeft + availableWidth / 2
          : paddingLeft + (idx / (filteredEntries.length - 1)) * availableWidth;
      const y =
        paddingTop +
        availableHeight -
        ((w - minWeight) / weightSpan) * availableHeight;
      return {
        date: new Date(entry.timestamp).toLocaleDateString(
          language === "en" ? "en-GB" : "pt-PT",
          { day: "2-digit", month: "short" },
        ),
        weight: w,
        x,
        y,
      };
    });

    const targetY =
      targetVal !== null
        ? paddingTop +
          availableHeight -
          ((targetVal - minWeight) / weightSpan) * availableHeight
        : null;

    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return {
      maxWeight,
      midWeight: Math.round((minWeight + maxWeight) / 2),
      minWeight,
      pathD,
      points,
      targetVal,
      targetY,
    };
  }, [filteredEntries, targetWeightGrams, unit, language]);

  return (
    <>
      <Card>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Ionicons color={COLORS.xp} name="speedometer-outline" size={20} />
            <Text className="font-headline text-lg text-foreground">
              {language === "en" ? "Weight" : "Peso"}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel={translateText("Ver todos os registos", language)}
              className="flex-row items-center py-1 pl-2 active:opacity-70"
              onPress={() => setIsHistoryModalVisible(true)}
            >
              <Text className="font-label text-xs text-muted">
                {language === "en" ? "All" : "Todos"}
              </Text>
              <Ionicons color={COLORS.muted} name="chevron-forward" size={14} />
            </Pressable>

            <Pressable
              accessibilityLabel={translateText("Adicionar registo de peso", language)}
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-background active:opacity-70"
              onPress={() => {
                setError(null);
                setIsModalVisible(true);
              }}
            >
              <Ionicons color={COLORS.xp} name="add" size={18} />
            </Pressable>
          </View>
        </View>

        {/* Filter Pills */}
        <View className="mt-4 flex-row items-center justify-center gap-1.5 rounded-xl bg-background p-1">
          {(
            [
              { id: "week", label: language === "en" ? "Week" : "Semana" },
              { id: "month", label: language === "en" ? "Month" : "Mês" },
              { id: "year", label: language === "en" ? "Year" : "Ano" },
              { id: "all", label: language === "en" ? "All" : "Todos" },
            ] as const
          ).map((filter) => {
            const isSelected = timeRange === filter.id;
            return (
              <Pressable
                className={`flex-1 items-center rounded-lg py-1.5 ${
                  isSelected ? "bg-surface border border-border" : ""
                }`}
                key={filter.id}
                onPress={() => setTimeRange(filter.id)}
              >
                <Text
                  className={`font-label text-xs ${
                    isSelected ? "text-foreground font-semibold" : "text-muted"
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Units Subtitle */}
        <Text className="mt-3 text-center font-label text-[11px] text-muted">
          {language === "en" ? `Units: ${unit}` : `Unidades: ${unit}`}
        </Text>

        {/* Chart View */}
        {isLoading ? (
          <ActivityIndicator className="my-10" color={COLORS.xp} />
        ) : chartData && chartData.points.length > 0 ? (
          <View className="mt-3 items-center">
            <Svg height={chartHeight} width={chartWidth}>
              {/* Y Axis Grid Lines & Labels */}
              <Line
                stroke={COLORS.border}
                strokeDasharray="4 4"
                x1={paddingLeft}
                x2={chartWidth - paddingRight}
                y1={paddingTop}
                y2={paddingTop}
              />
              <SvgText
                fill="#71717A"
                fontSize="10"
                textAnchor="start"
                x={chartWidth - paddingRight + 4}
                y={paddingTop + 4}
              >
                {chartData.maxWeight}
              </SvgText>

              <Line
                stroke={COLORS.border}
                strokeDasharray="4 4"
                x1={paddingLeft}
                x2={chartWidth - paddingRight}
                y1={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2}
                y2={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2}
              />
              <SvgText
                fill="#71717A"
                fontSize="10"
                textAnchor="start"
                x={chartWidth - paddingRight + 4}
                y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 4}
              >
                {chartData.midWeight}
              </SvgText>

              <Line
                stroke={COLORS.border}
                strokeDasharray="4 4"
                x1={paddingLeft}
                x2={chartWidth - paddingRight}
                y1={chartHeight - paddingBottom}
                y2={chartHeight - paddingBottom}
              />
              <SvgText
                fill="#71717A"
                fontSize="10"
                textAnchor="start"
                x={chartWidth - paddingRight + 4}
                y={chartHeight - paddingBottom + 4}
              >
                {chartData.minWeight}
              </SvgText>

              {/* Goal Dotted Line */}
              {chartData.targetY !== null ? (
                <>
                  <Line
                    stroke="#EAB308"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    x1={paddingLeft}
                    x2={chartWidth - paddingRight}
                    y1={chartData.targetY}
                    y2={chartData.targetY}
                  />
                  <Circle
                    cx={paddingLeft + 6}
                    cy={chartData.targetY}
                    fill="#EAB308"
                    r="3"
                  />
                  <SvgText
                    fill="#EAB308"
                    fontSize="9"
                    x={paddingLeft + 12}
                    y={chartData.targetY - 4}
                  >
                    {language === "en" ? "Goal" : "Objetivo"}
                  </SvgText>
                </>
              ) : null}

              {/* Weight Data Line */}
              {chartData.pathD ? (
                <Path
                  d={chartData.pathD}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="2.5"
                />
              ) : null}

              {/* Data Point Dots & X-Labels */}
              {chartData.points.map((pt, index) => {
                const showLabel =
                  chartData.points.length <= 4 ||
                  index === 0 ||
                  index === chartData.points.length - 1 ||
                  index === Math.floor(chartData.points.length / 2);

                return (
                  <React.Fragment key={index}>
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      fill="#FACC15"
                      r="4"
                      stroke={COLORS.foreground}
                      strokeWidth="2"
                    />
                    {showLabel ? (
                      <SvgText
                        fill="#71717A"
                        fontSize="9"
                        textAnchor="middle"
                        x={pt.x}
                        y={chartHeight - 6}
                      >
                        {pt.date}
                      </SvgText>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* Chart Legend */}
            <View className="mt-3 flex-row items-center justify-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <Text className="font-label text-[11px] text-muted">
                  {language === "en" ? "Weight" : "Peso"}
                </Text>
              </View>
              {chartData.targetVal ? (
                <View className="flex-row items-center gap-1.5">
                  <View className="h-0.5 w-3 bg-[#EAB308]" />
                  <Text className="font-label text-[11px] text-[#EAB308]">
                    {language === "en" ? "Goal" : "Objetivo"} (
                    {chartData.targetVal} {unit})
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View className="mt-4 rounded-2xl border border-dashed border-border bg-background p-5 text-center">
            <Text className="font-headline text-base text-foreground text-center">
              {language === "en" ? "No weight logs yet" : "Sem registos de peso"}
            </Text>
            <Text className="mt-1 font-body text-xs text-muted text-center">
              {language === "en"
                ? "Tap + to track your weight over time."
                : "Toca em + para acompanhar a tua evolução ao longo do tempo."}
            </Text>
          </View>
        )}
      </Card>

      {/* Add Weight Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
        statusBarTranslucent
        transparent
        visible={isModalVisible}
      >
        <View className="flex-1 justify-center bg-black/70 px-6">
          <View className="rounded-3xl border border-border bg-surface p-6">
            <Text className="font-headline text-xl text-foreground">
              {language === "en" ? "Log Weight" : "Registar Peso"}
            </Text>
            <Text className="mt-1 font-body text-sm text-muted">
              {language === "en"
                ? `Enter your weight in ${unit}.`
                : `Introduz o teu peso em ${unit}.`}
            </Text>

            <TextInput
              autoFocus
              className="mt-5 rounded-2xl border border-border bg-background px-4 py-3.5 font-headline text-2xl text-foreground"
              keyboardType="decimal-pad"
              onChangeText={setWeight}
              placeholder={`0.0 ${unit}`}
              placeholderTextColor={COLORS.muted}
              value={weight}
            />

            {error ? (
              <Text className="mt-3 font-body text-xs text-red-500">{error}</Text>
            ) : null}

            <View className="mt-6 flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-2xl border border-border bg-background py-3.5 active:opacity-70"
                onPress={() => {
                  setIsModalVisible(false);
                  setWeight("");
                }}
              >
                <Text className="font-label text-sm text-muted">
                  {language === "en" ? "Cancel" : "Cancelar"}
                </Text>
              </Pressable>

              <Pressable
                className="flex-1 items-center rounded-2xl bg-xp py-3.5 active:opacity-80"
                disabled={isSaving}
                onPress={() => void save()}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="font-label text-sm font-semibold text-background">
                    {language === "en" ? "Save" : "Guardar"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Weight History Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsHistoryModalVisible(false)}
        statusBarTranslucent
        transparent
        visible={isHistoryModalVisible}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="max-h-[80%] rounded-t-3xl border-t border-border bg-surface p-6">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline text-xl text-foreground">
                {language === "en" ? "Weight History" : "Histórico de Peso"}
              </Text>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-background active:opacity-70"
                onPress={() => setIsHistoryModalVisible(false)}
              >
                <Ionicons color={COLORS.muted} name="close" size={18} />
              </Pressable>
            </View>

            {entries.length === 0 ? (
              <Text className="my-8 text-center font-body text-sm text-muted">
                {language === "en" ? "No entries found." : "Nenhum registo encontrado."}
              </Text>
            ) : (
              <View className="mt-4 max-h-[400px]">
                {entries.map((entry) => (
                  <View
                    className="flex-row items-center justify-between border-b border-border/50 py-3"
                    key={entry.id}
                  >
                    <View>
                      <Text className="font-headline text-base text-foreground">
                        {formatWeightVal(entry.weightGrams, unit)} {unit}
                      </Text>
                      <Text className="mt-0.5 font-body text-xs text-muted">
                        {new Date(entry.timestamp).toLocaleDateString()} ·{" "}
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityLabel={translateText("Eliminar registo", language)}
                      className="h-8 w-8 items-center justify-center active:opacity-60"
                      onPress={() => confirmDelete(entry)}
                    >
                      <Ionicons color={COLORS.muted} name="trash-outline" size={16} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
