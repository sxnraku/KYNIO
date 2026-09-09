import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import { saveWeightEntry } from "@/services/dbService";
import { triggerLightImpact, triggerSuccessFeedback } from "@/services/hapticsService";
import {
  getMetabolicExpenditureSnapshot,
  type MetabolicExpenditureData,
} from "@/services/metabolicTdeeService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useUserDataSyncStore } from "@/store/user-data-sync-store";

export function MetabolicExpenditureCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const userHeightCm = useAppPreferencesStore((state) => state.userHeightCm);
  const userAgeYears = useAppPreferencesStore((state) => state.userAgeYears);
  const userBiologicalSex = useAppPreferencesStore(
    (state) => state.userBiologicalSex,
  );
  const setUserHeightCm = useAppPreferencesStore(
    (state) => state.setUserHeightCm,
  );
  const setUserAgeYears = useAppPreferencesStore(
    (state) => state.setUserAgeYears,
  );
  const setUserBiologicalSex = useAppPreferencesStore(
    (state) => state.setUserBiologicalSex,
  );

  const dataVersion = useUserDataSyncStore((state) => state.dataVersion);

  const [data, setData] = useState<MetabolicExpenditureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for editing (peso corporal incluído)
  const [tempWeight, setTempWeight] = useState("70");
  const [tempHeight, setTempHeight] = useState(String(userHeightCm || 170));
  const [tempAge, setTempAge] = useState(String(userAgeYears || 30));
  const [tempSex, setTempSex] = useState<"male" | "female" | "other">(
    userBiologicalSex || "other",
  );

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const snapshot = await getMetabolicExpenditureSnapshot(language, {
        ageYears: userAgeYears,
        biologicalSex: userBiologicalSex,
        heightCm: userHeightCm,
      });
      setData(snapshot);
      setTempWeight(String(snapshot.currentWeightKg));
    } catch {
      // Mantém estado anterior se falhar
    } finally {
      setIsLoading(false);
    }
  }, [language, userAgeYears, userBiologicalSex, userHeightCm]);

  // Atualização em foco de ecrã
  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  // Atualização reativa imediata quando qualquer registo de peso, refeição ou treino for guardado
  useEffect(() => {
    if (dataVersion > 0) {
      void loadData();
    }
  }, [dataVersion, loadData]);

  const handleOpenEdit = () => {
    triggerLightImpact();
    if (data) {
      setTempWeight(String(data.currentWeightKg));
    }
    setTempHeight(String(userHeightCm || 170));
    setTempAge(String(userAgeYears || 30));
    setTempSex(userBiologicalSex || "other");
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const parsedWeight = Number(tempWeight.trim().replace(",", "."));
      const parsedHeight = Math.max(
        100,
        Math.min(250, Number(tempHeight) || 170),
      );
      const parsedAge = Math.max(14, Math.min(100, Number(tempAge) || 30));

      setUserHeightCm(parsedHeight);
      setUserAgeYears(parsedAge);
      setUserBiologicalSex(tempSex);

      if (Number.isFinite(parsedWeight) && parsedWeight > 0) {
        await saveWeightEntry({ unit: "kg", weight: parsedWeight });
      }

      triggerSuccessFeedback();
      setIsEditModalVisible(false);
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !data) {
    return (
      <View className="rounded-2xl border border-border bg-surface p-5">
        <ActivityIndicator color={COLORS.xp} size="small" />
      </View>
    );
  }

  if (!data) {
    return null;
  }

  const getStatusBadgeColors = () => {
    switch (data.balanceStatus) {
      case "deficit":
      case "surplus":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: COLORS.xp,
        };
      case "balanced":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: COLORS.success,
        };
      default:
        return {
          bg: "bg-neutral-500/10",
          border: "border-neutral-500/20",
          text: COLORS.muted,
        };
    }
  };

  const badgeColors = getStatusBadgeColors();

  return (
    <View className="rounded-2xl border border-border bg-surface p-5">
      {/* Cabeçalho */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 pr-1">
          <Text className="font-label text-[10px] uppercase tracking-wider text-xp">
            {translateText("Despesa Metabólica Dinâmica", language)}
          </Text>
          <Text className="mt-0.5 font-headline text-lg text-foreground">
            {translateText("Gasto Diário Estimado", language)}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={
            language === "en"
              ? "Adjust metabolic profile"
              : "Ajustar perfil metabólico"
          }
          accessibilityRole="button"
          className="flex-row items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 active:opacity-70"
          onPress={handleOpenEdit}
        >
          <Ionicons color={COLORS.muted} name="options-outline" size={11} />
          <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
            {data.currentWeightKg}kg · {data.heightCm ?? 170}cm ·{" "}
            {data.ageYears ?? 30}a
          </Text>
        </Pressable>
      </View>

      {/* BLOCO 1: O QUE O TEU CORPO QUEIMA (SAÍDAS) */}
      <View className="mt-4 rounded-2xl border border-border/80 bg-background p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons color={COLORS.xp} name="flame-outline" size={16} />
            <Text className="font-label text-[11px] uppercase tracking-wider text-foreground font-bold">
              {language === "en" ? "Energy Burned (Out)" : "Gasto Total do Teu Corpo (Saídas)"}
            </Text>
          </View>
          <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
            {language === "en" ? "Burned / Day" : "Queimado / Dia"}
          </Text>
        </View>

        <View className="mt-2 flex-row items-baseline gap-1">
          <Text className="font-headline text-3xl tracking-tight text-foreground">
            ~{data.tdeeKcal}
          </Text>
          <Text className="font-label text-xs uppercase tracking-wider text-muted">
            kcal / {language === "en" ? "day" : "dia"}
          </Text>
        </View>

        <Text className="mt-0.5 font-body text-[11px] text-muted">
          {language === "en"
            ? "Everything your body burns = Basal + Daily Routine + Workouts"
            : "Tudo o que o teu corpo queima = Basal + Rotina + Treinos"}
        </Text>

        {/* Decomposição transparente dos 3 componentes do gasto */}
        <View className="mt-3.5 flex-row gap-2">
          <View className="flex-1 rounded-xl border border-border/60 bg-surface/80 p-2">
            <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
              {language === "en" ? "Basal (BMR)" : "Metabolismo Basal"}
            </Text>
            <Text className="mt-0.5 font-headline text-xs text-foreground">
              {data.bmrKcal} kcal
            </Text>
            <Text className="text-[8px] text-muted">
              {language === "en" ? "Organs at rest" : "Em repouso"}
            </Text>
          </View>

          <View className="flex-1 rounded-xl border border-border/60 bg-surface/80 p-2">
            <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
              {language === "en" ? "Routine / NEAT" : "Rotina Diária"}
            </Text>
            <Text className="mt-0.5 font-headline text-xs text-foreground">
              +{data.dailyRoutineBurnKcal} kcal
            </Text>
            <Text className="text-[8px] text-muted">
              {language === "en" ? "Steps & living" : "Passos e tarefas"}
            </Text>
          </View>

          <View className="flex-1 rounded-xl border border-border/60 bg-surface/80 p-2">
            <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
              {language === "en" ? "Workouts / Day" : "Treinos / Dia"}
            </Text>
            <Text className="mt-0.5 font-headline text-xs text-foreground">
              +{data.dailyWorkoutBurnKcal} kcal
            </Text>
            <Text className="text-[8px] text-muted">
              {language === "en" ? "Exercise logged" : "Exercício registado"}
            </Text>
          </View>
        </View>
      </View>

      {/* BLOCO 2: O QUE COMES (ENTRADAS) */}
      <View className="mt-3 rounded-2xl border border-border/80 bg-background p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons color={COLORS.success} name="restaurant-outline" size={15} />
            <Text className="font-label text-[11px] uppercase tracking-wider text-foreground font-bold">
              {language === "en" ? "Energy Consumed (In)" : "Ingestão Alimentar (Entradas)"}
            </Text>
          </View>
          <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
            {data.isPartialIntake
              ? language === "en"
                ? "Today (in progress)"
                : "Hoje (em curso)"
              : language === "en"
              ? "Daily average"
              : "Média diária"}
          </Text>
        </View>

        <View className="mt-2 flex-row items-baseline justify-between">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-headline text-2xl tracking-tight text-foreground">
              {data.recentDailyIntakeKcal !== null
                ? `${data.recentDailyIntakeKcal} kcal`
                : "—"}
            </Text>
            {data.recentDailyIntakeKcal !== null ? (
              <Text className="font-label text-xs uppercase tracking-wider text-muted">
                {data.isPartialIntake
                  ? language === "en"
                    ? "logged today"
                    : "ingeridas hoje"
                  : language === "en"
                  ? "kcal / day"
                  : "kcal / dia"}
              </Text>
            ) : null}
          </View>

          {data.recentDailyIntakeKcal !== null && data.tdeeKcal > 0 ? (
            <Text className="font-label text-[10px] uppercase text-muted">
              {Math.round((data.recentDailyIntakeKcal / data.tdeeKcal) * 100)}%{" "}
              {language === "en" ? "of daily burn" : "do gasto diário"}
            </Text>
          ) : null}
        </View>
      </View>

      {/* BLOCO 3: O BALANÇO (ENTRADAS VS SAÍDAS) */}
      <View
        className={`mt-3 rounded-xl border p-3.5 ${badgeColors.bg} ${badgeColors.border}`}
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons color={badgeColors.text} name="scale-outline" size={15} />
          <Text
            className="font-headline text-xs font-semibold"
            style={{ color: badgeColors.text }}
          >
            {data.statusLabel}
          </Text>
        </View>
        <Text className="mt-1 font-body text-xs leading-4 text-foreground/80">
          {data.isPartialIntake && data.recentDailyIntakeKcal !== null
            ? language === "en"
              ? `You've consumed ${data.recentDailyIntakeKcal} kcal so far today against ~${data.tdeeKcal} kcal estimated daily burn.`
              : `Consumiste ${data.recentDailyIntakeKcal} kcal hoje face a cerca de ~${data.tdeeKcal} kcal que o teu corpo queima no total do dia.`
            : data.statusDescription}
        </Text>
      </View>

      {/* Parâmetros biométricos rápidos com botão de ajuste */}
      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-1 px-1">
        <Text className="font-body text-[10px] text-muted">
          Mifflin-St Jeor: {data.currentWeightKg} kg · {data.heightCm ?? 170} cm
          · {data.ageYears ?? 30} {language === "en" ? "years" : "anos"}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1 active:opacity-70"
          onPress={handleOpenEdit}
        >
          <Ionicons color={COLORS.xp} name="create-outline" size={12} />
          <Text className="font-label text-[10px] uppercase text-xp font-bold">
            {language === "en" ? "Adjust" : "Ajustar"}
          </Text>
        </Pressable>
      </View>

      {/* Modal de Edição de Peso, Idade e Altura */}
      <Modal
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
        transparent
        visible={isEditModalVisible}
      >
        <View className="flex-1 items-center justify-center bg-black/60 p-4">
          <View className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5">
            <Text className="font-headline text-lg text-foreground">
              {language === "en" ? "Metabolic Profile" : "Perfil Metabólico"}
            </Text>
            <Text className="mt-1 font-body text-xs text-muted">
              {language === "en"
                ? "Weight, height and age are used in the Mifflin-St Jeor equation for accurate BMR calculation."
                : "O peso, altura e idade são usados na equação Mifflin-St Jeor para cálculo rigoroso da taxa basal."}
            </Text>

            {/* Peso Corporal (kg) */}
            <View className="mt-4">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === "en" ? "Body Weight (kg)" : "Peso Corporal (kg)"}
              </Text>
              <TextInput
                className="mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground"
                keyboardType="decimal-pad"
                maxLength={6}
                onChangeText={setTempWeight}
                placeholder="70.0"
                placeholderTextColor={COLORS.muted}
                value={tempWeight}
              />
            </View>

            {/* Altura */}
            <View className="mt-3">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === "en" ? "Height (cm)" : "Altura (cm)"}
              </Text>
              <TextInput
                className="mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground"
                keyboardType="numeric"
                maxLength={3}
                onChangeText={setTempHeight}
                placeholder="170"
                placeholderTextColor={COLORS.muted}
                value={tempHeight}
              />
            </View>

            {/* Idade */}
            <View className="mt-3">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === "en" ? "Age (years)" : "Idade (anos)"}
              </Text>
              <TextInput
                className="mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground"
                keyboardType="numeric"
                maxLength={3}
                onChangeText={setTempAge}
                placeholder="30"
                placeholderTextColor={COLORS.muted}
                value={tempAge}
              />
            </View>

            {/* Sexo Biológico */}
            <View className="mt-3">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === "en" ? "Biological Sex" : "Sexo Biológico"}
              </Text>
              <View className="mt-1.5 flex-row gap-2">
                {(["male", "female", "other"] as const).map((sex) => {
                  const isSelected = tempSex === sex;
                  const label =
                    sex === "male"
                      ? language === "en"
                        ? "Male"
                        : "Masculino"
                      : sex === "female"
                      ? language === "en"
                        ? "Female"
                        : "Feminino"
                      : language === "en"
                      ? "Neutral"
                      : "Neutro";
                  return (
                    <Pressable
                      key={sex}
                      accessibilityRole="button"
                      className={`flex-1 items-center justify-center rounded-xl border py-2 ${
                        isSelected
                          ? "border-xp bg-xp/10"
                          : "border-border bg-background"
                      }`}
                      onPress={() => setTempSex(sex)}
                    >
                      <Text
                        className={`font-label text-xs uppercase tracking-wider ${
                          isSelected ? "font-bold text-xp" : "text-muted"
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Botões de Ação */}
            <View className="mt-5 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                className="flex-1 items-center justify-center rounded-xl border border-border py-2.5 active:opacity-70 active:scale-[0.98]"
                disabled={isSaving}
                onPress={() => {
                  triggerLightImpact();
                  setIsEditModalVisible(false);
                }}
              >
                <Text className="font-label text-xs uppercase tracking-wider text-muted">
                  {language === "en" ? "Cancel" : "Cancelar"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="flex-1 items-center justify-center rounded-xl bg-foreground py-2.5 active:opacity-80 active:scale-[0.98]"
                disabled={isSaving}
                onPress={handleSaveEdit}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text className="font-label text-xs uppercase tracking-wider text-background font-bold">
                    {language === "en" ? "Save" : "Guardar"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nota de rodapé neutra */}
      <Text className="mt-3 text-center font-body text-[10px] text-muted">
        {translateText(
          "Estimativa matemática local; não prescreve calorias nem constitui plano médico.",
          language,
        )}
      </Text>
    </View>
  );
}
