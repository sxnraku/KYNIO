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

import { Card } from "@/components/ui/card";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { WeightChart } from "@/components/ui/weight-chart";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { WeightEntryRecord } from "@/db/schema";
import {
  deleteWeightEntry,
  getUserProfile,
  getWeightEntries,
  saveWeightEntry,
  type WeightUnit,
} from "@/services/dbService";
import { deleteRemoteWeightEntry } from "@/services/cloudSyncService";
import {
  createWeightChartData,
  filterWeightEntries,
  formatWeightValue,
  type WeightTimeRange,
} from "@/services/weightChartService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";

export function WeightTrackingCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const [entries, setEntries] = useState<WeightEntryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [isSaving, setIsSaving] = useState(false);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [weight, setWeight] = useState("");
  const [timeRange, setTimeRange] = useState<WeightTimeRange>("month");
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

  const filteredEntries = useMemo(
    () => filterWeightEntries(entries, timeRange),
    [entries, timeRange],
  );

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
      `${formatWeightValue(entry.weightGrams, unit)} ${unit} · ${new Date(entry.timestamp).toLocaleDateString()}`,
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

  const chartData = useMemo(
    () =>
      createWeightChartData({
        entries: filteredEntries,
        language,
        targetWeightGrams,
        unit,
      }),
    [filteredEntries, language, targetWeightGrams, unit],
  );

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
              accessibilityLabel={translateText(
                isPro
                  ? "Ver todos os registos"
                  : "Histórico completo de peso · Sol Pro",
                language,
              )}className="flex-row items-center py-1 pl-2 active:opacity-70"
              onPress={() =>
                isPro
                  ? setIsHistoryModalVisible(true)
                  : setIsPaywallVisible(true)
              }
            >
              <Text className="font-label text-xs text-muted">
                {language === "en" ? "All" : "Todos"}
              </Text>
              {!isPro ? (
                <Ionicons
                  color={COLORS.xp}
                  name="lock-closed"
                  size={11}
                  style={{ marginLeft: 3 }}
                />
              ) : null}
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
            const isLocked =
              !isPro && (filter.id === "year" || filter.id === "all");
            return (
              <Pressable
                accessibilityLabel={
                  isLocked
                    ? `${filter.label} · ${translateText("Tendências Sol Pro", language)}`
                    : undefined
                }
                className={`flex-1 flex-row items-center justify-center rounded-lg py-1.5 ${
                  isSelected ? "bg-surface border border-border" : ""
                }`}
                key={filter.id}
                onPress={() =>
                  isLocked
                    ? setIsPaywallVisible(true)
                    : setTimeRange(filter.id)
                }
              >
                <Text
                  className={`font-label text-xs ${
                    isSelected ? "text-foreground font-semibold" : "text-muted"
                  }`}
                  translate={false}
                >
                  {filter.label}
                </Text>
                {isLocked ? (
                  <Ionicons
                    color={COLORS.xp}
                    name="lock-closed"
                    size={10}
                    style={{ marginLeft: 3 }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Units Subtitle */}
        <Text className="mt-3 text-center font-label text-[11px] text-muted">
          {language === "en" ? `Units: ${unit}` : `Unidades: ${unit}`}
        </Text>

        <WeightChart
          chartData={chartData}
          isLoading={isLoading}
          language={language}
          unit={unit}
        />
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
                        {formatWeightValue(entry.weightGrams, unit)} {unit}
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

      <PaywallModal
        onClose={() => setIsPaywallVisible(false)}
        visible={isPaywallVisible}
      />
    </>
  );
}
