import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  getMetabolicExpenditureSnapshot,
  type MetabolicExpenditureData,
} from "@/services/metabolicTdeeService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export function MetabolicExpenditureCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const userHeightCm = useAppPreferencesStore((state) => state.userHeightCm);
  const userAgeYears = useAppPreferencesStore((state) => state.userAgeYears);
  const userBiologicalSex = useAppPreferencesStore((state) => state.userBiologicalSex);
  const setUserHeightCm = useAppPreferencesStore((state) => state.setUserHeightCm);
  const setUserAgeYears = useAppPreferencesStore((state) => state.setUserAgeYears);
  const setUserBiologicalSex = useAppPreferencesStore((state) => state.setUserBiologicalSex);

  const [data, setData] = useState<MetabolicExpenditureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Form states for editing
  const [tempHeight, setTempHeight] = useState(String(userHeightCm || 170));
  const [tempAge, setTempAge] = useState(String(userAgeYears || 30));
  const [tempSex, setTempSex] = useState<"male" | "female" | "other">(userBiologicalSex || "other");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const snapshot = await getMetabolicExpenditureSnapshot(language, {
        ageYears: userAgeYears,
        biologicalSex: userBiologicalSex,
        heightCm: userHeightCm,
      });
      setData(snapshot);
    } catch {
      // Ignora erro e mantém estado anterior
    } finally {
      setIsLoading(false);
    }
  }, [language, userAgeYears, userBiologicalSex, userHeightCm]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const handleOpenEdit = () => {
    setTempHeight(String(userHeightCm || 170));
    setTempAge(String(userAgeYears || 30));
    setTempSex(userBiologicalSex || "other");
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    const parsedHeight = Math.max(100, Math.min(250, Number(tempHeight) || 170));
    const parsedAge = Math.max(14, Math.min(100, Number(tempAge) || 30));
    setUserHeightCm(parsedHeight);
    setUserAgeYears(parsedAge);
    setUserBiologicalSex(tempSex);
    setIsEditModalVisible(false);
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
      {/* Header */}
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
          accessibilityRole="button"
          className="flex-row items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 active:opacity-70"
          onPress={handleOpenEdit}
        >
          <Ionicons color={COLORS.muted} name="options-outline" size={11} />
          <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
            {data.currentWeightKg}kg · {data.heightCm ?? 170}cm · {data.ageYears ?? 30}a
          </Text>
        </Pressable>
      </View>

      {/* Valor Principal TDEE */}
      <View className="mt-4 items-center rounded-2xl border border-border/80 bg-background py-4">
        <View className="flex-row items-baseline gap-1">
          <Text className="font-headline text-4xl tracking-tight text-foreground">
            ~{data.tdeeKcal}
          </Text>
          <Text className="font-label text-xs uppercase tracking-wider text-muted">
            kcal / {language === "en" ? "day" : "dia"}
          </Text>
        </View>
        <Text className="mt-0.5 font-body text-[11px] text-muted">
          {language === "en"
            ? "Total Daily Energy Expenditure (TDEE)"
            : "Despesa Energética Diária Total"}
        </Text>
      </View>

      {/* Decomposição Metabólica */}
      <View className="mt-3 flex-row gap-2">
        <View className="flex-1 rounded-xl border border-border/60 bg-background/50 p-2.5">
          <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
            {language === "en" ? "Basal (BMR)" : "Metabolismo Basal"}
          </Text>
          <Text className="mt-0.5 font-headline text-sm text-foreground">
            {data.bmrKcal} kcal
          </Text>
        </View>

        <View className="flex-1 rounded-xl border border-border/60 bg-background/50 p-2.5">
          <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
            {language === "en" ? "Workouts / Day" : "Treinos / Dia"}
          </Text>
          <Text className="mt-0.5 font-headline text-sm text-foreground">
            +{data.dailyWorkoutBurnKcal} kcal
          </Text>
        </View>

        <View className="flex-1 rounded-xl border border-border/60 bg-background/50 p-2.5">
          <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
            {language === "en" ? "Intake (Avg)" : "Ingestão Média"}
          </Text>
          <Text className="mt-0.5 font-headline text-sm text-foreground">
            {data.recentDailyIntakeKcal !== null
              ? `${data.recentDailyIntakeKcal} kcal`
              : "—"}
          </Text>
        </View>
      </View>

      {/* Cartão de Estado / Balanço Energético */}
      <View
        className={`mt-4 rounded-xl border p-3.5 ${badgeColors.bg} ${badgeColors.border}`}
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons color={badgeColors.text} name="analytics-outline" size={15} />
          <Text
            className="font-headline text-xs font-semibold"
            style={{ color: badgeColors.text }}
          >
            {data.statusLabel}
          </Text>
        </View>
        <Text className="mt-1 font-body text-xs leading-4 text-foreground/80">
          {data.statusDescription}
        </Text>
      </View>

      {/* Parâmetros biométricos rápidos com botão de ajuste */}
      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-1 px-1">
        <Text className="font-body text-[10px] text-muted">
          Mifflin-St Jeor: {data.heightCm ?? 170} cm · {data.ageYears ?? 30} {language === "en" ? "years" : "anos"}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1 active:opacity-70"
          onPress={handleOpenEdit}
        >
          <Ionicons color={COLORS.xp} name="create-outline" size={12} />
          <Text className="font-label text-[10px] uppercase text-xp">
            {language === "en" ? "Adjust" : "Ajustar"}
          </Text>
        </Pressable>
      </View>

      {/* Modal de Edição de Idade e Altura */}
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
                ? "Height and age are used in the Mifflin-St Jeor formula for accurate BMR calculation."
                : "A altura e idade são usadas na fórmula Mifflin-St Jeor para cálculo preciso da taxa basal."}
            </Text>

            {/* Altura */}
            <View className="mt-4">
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
                className="flex-1 items-center justify-center rounded-xl border border-border py-2.5"
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text className="font-label text-xs uppercase tracking-wider text-muted">
                  {language === "en" ? "Cancel" : "Cancelar"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="flex-1 items-center justify-center rounded-xl bg-foreground py-2.5"
                onPress={handleSaveEdit}
              >
                <Text className="font-label text-xs uppercase tracking-wider text-background">
                  {language === "en" ? "Save" : "Guardar"}
                </Text>
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
