import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/text-input";

import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import { getLatestWeightKg } from "@/services/dbService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import {
  EFFORT_LABELS,
  estimateCalories,
  type WorkoutEffort,
  WORKOUT_OPTIONS,
} from "@/types/workout";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  cycling: "bicycle-outline",
  mobility: "body-outline",
  other: "add-circle-outline",
  run: "walk-outline",
  strength: "barbell-outline",
  walk: "footsteps-outline",
};

const DURATION_PRESETS = ["15", "30", "45", "60"];
const EFFORT_OPTIONS: WorkoutEffort[] = ["light", "moderate", "intense"];

interface WorkoutEntryCardProps {
  duration: string;
  effort: WorkoutEffort;
  isSaving: boolean;
  notes: string;
  onChangeDuration: (value: string) => void;
  onChangeEffort: (value: WorkoutEffort) => void;
  onChangeNotes: (value: string) => void;
  onChangeType: (value: string) => void;
  onSave: () => void;
  selectedType: string;
  xpLogsRemaining?: number;
}

export function WorkoutEntryCard({
  duration,
  effort,
  isSaving,
  notes,
  onChangeDuration,
  onChangeEffort,
  onChangeNotes,
  onChangeType,
  onSave,
  selectedType,
  xpLogsRemaining = 3,
}: WorkoutEntryCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const xpAvailable = xpLogsRemaining > 0;

  const [userWeightKg, setUserWeightKg] = useState<number | null>(null);
  const [customWeight, setCustomWeight] = useState<string>("");
  const [manualCalories, setManualCalories] = useState<string>("");
  const [isPrecisionOpen, setIsPrecisionOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void getLatestWeightKg().then((weight) => {
      if (isMounted && weight) {
        setUserWeightKg(weight);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-headline text-xl text-foreground">
            {translateText("Registar atividade", language)}
          </Text>
          <Text className="mt-1 font-body text-sm text-muted">
            {translateText("O que fizeste hoje?", language)}
          </Text>
        </View>
        <View className="rounded-full bg-xp/10 px-3 py-2">
          <Text
            className="font-label text-[10px] text-xp"
            translate={false}
          >
            {xpAvailable
              ? `+50 XP · ${xpLogsRemaining}/3`
              : translateText("Limite XP diário", language)}
          </Text>
        </View>
      </View>

      <ScrollView
        className="-mx-5 mt-5"
        contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {WORKOUT_OPTIONS.map((option) => {
          const selected = selectedType === option.id;
          return (
            <Pressable
              accessibilityLabel={translateText(option.label, language)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "min-w-[84px] items-center rounded-2xl bg-success px-3 py-4"
                  : "min-w-[84px] items-center rounded-2xl border border-border bg-surface-raised px-3 py-4"
              }
              key={option.id}
              onPress={() => onChangeType(option.id)}
            >
              <Ionicons
                color={selected ? "#FFFFFF" : COLORS.foreground}
                name={ICONS[option.id]}
                size={22}
              />
              <Text
                className={
                  selected
                    ? "mt-2 font-headline text-xs text-white"
                    : "mt-2 font-headline text-xs text-foreground"
                }
              >
                {translateText(option.label, language)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text className="mb-3 mt-6 font-label text-[10px] uppercase tracking-widest text-muted">
        {translateText("Duração em minutos", language)}
      </Text>
      <View className="flex-row gap-2">
        {DURATION_PRESETS.map((preset) => {
          const selected = duration === preset;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "flex-1 items-center rounded-xl border border-success bg-success-dark py-3"
                  : "flex-1 items-center rounded-xl border border-border bg-surface-raised py-3"
              }
              key={preset}
              onPress={() => onChangeDuration(preset)}
            >
              <Text
                className={
                  selected
                    ? "font-headline text-sm text-success"
                    : "font-headline text-sm text-muted"
                }
              >
                {preset}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-2 flex-row items-center rounded-xl border border-border bg-surface-raised px-4">
        <TextInput
          accessibilityLabel={
            language === "en"
              ? "Custom duration in minutes"
              : "Duração personalizada em minutos"
          }
          className="min-w-0 flex-1 py-3 font-body text-base text-foreground"
          inputMode="numeric"
          maxLength={3}
          onChangeText={onChangeDuration}
          placeholder={language === "en" ? "Other duration" : "Outra duração"}
          placeholderTextColor={COLORS.muted}
          value={duration}
        />
        <Text className="font-body text-sm text-muted">min</Text>
      </View>

      <Text className="mb-3 mt-6 font-label text-[10px] uppercase tracking-widest text-muted">
        {translateText("Esforço percebido", language)}
      </Text>
      <View className="flex-row rounded-2xl bg-background p-1">
        {EFFORT_OPTIONS.map((option) => {
          const selected = effort === option;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "flex-1 items-center rounded-xl bg-surface py-3"
                  : "flex-1 items-center py-3"
              }
              key={option}
              onPress={() => onChangeEffort(option)}
            >
              <Text
                className={
                  selected
                    ? "font-headline text-xs text-foreground"
                    : "font-body text-xs text-muted"
                }
              >
                {translateText(EFFORT_LABELS[option], language)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Estimativa calórica — atualiza em tempo real com maior precisão opcional */}
      {(() => {
        const durationNum = parseInt(duration, 10);
        if (!durationNum || durationNum <= 0) return null;

        const parsedCustomWeight = parseFloat(customWeight.replace(",", "."));
        const hasCustomWeight =
          !isNaN(parsedCustomWeight) &&
          parsedCustomWeight >= 25 &&
          parsedCustomWeight <= 300;
        const effectiveWeight = hasCustomWeight
          ? parsedCustomWeight
          : userWeightKg ?? 70;

        const calculatedKcal = estimateCalories(
          selectedType,
          durationNum,
          effort,
          effectiveWeight,
        );
        const parsedManual = parseInt(manualCalories, 10);
        const hasManual = !isNaN(parsedManual) && parsedManual > 0;
        const displayKcal = hasManual ? parsedManual : calculatedKcal;

        if (!displayKcal) return null;

        const handleAddCaloriesToNotes = () => {
          const calorieTag = `[${displayKcal} kcal]`;
          if (notes.includes(calorieTag)) return;
          const updatedNotes = notes.trim()
            ? `${calorieTag} ${notes.trim()}`
            : calorieTag;
          onChangeNotes(updatedNotes);
        };

        return (
          <View className="mt-4 rounded-2xl border border-border bg-surface-raised p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2 pr-2">
                <Ionicons color={COLORS.success} name="flame-outline" size={20} />
                <View className="flex-1">
                  <Text className="font-headline text-sm text-foreground">
                    ~{displayKcal} kcal {hasManual ? (language === "en" ? "(measured)" : "(medido)") : (language === "en" ? "estimated" : "estimadas")}
                  </Text>
                  <Text className="font-body text-[11px] text-muted">
                    {hasManual
                      ? language === "en"
                        ? "Value entered from your tracker/watch"
                        : "Valor introduzido do teu medidor/relógio"
                      : userWeightKg && !hasCustomWeight
                      ? language === "en"
                        ? `Personalised with your weight (${userWeightKg} kg)`
                        : `Personalizado com o teu peso (${userWeightKg} kg)`
                      : hasCustomWeight
                      ? language === "en"
                        ? `Calculated for ${effectiveWeight} kg`
                        : `Calculado para ${effectiveWeight} kg`
                      : language === "en"
                      ? "Default average reference (70 kg)"
                      : "Referência média padrão (70 kg)"}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityLabel={
                  language === "en"
                    ? "Higher calorie precision options"
                    : "Opções de maior precisão calórica"
                }
                accessibilityRole="button"
                className="flex-row items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 active:opacity-70"
                onPress={() => setIsPrecisionOpen((prev) => !prev)}
              >
                <Ionicons
                  color={COLORS.success}
                  name={isPrecisionOpen ? "chevron-up" : "options-outline"}
                  size={14}
                />
                <Text className="font-label text-[10px] uppercase tracking-wider text-success">
                  {isPrecisionOpen
                    ? language === "en"
                      ? "Close"
                      : "Fechar"
                    : language === "en"
                    ? "Precision"
                    : "Precisão"}
                </Text>
              </Pressable>
            </View>

            {/* Painel de precisão avançada (ajuste de peso corporal ou valor exato do smartwatch) */}
            {isPrecisionOpen ? (
              <View className="mt-4 border-t border-border pt-4">
                <Text className="mb-3 font-label text-[10px] uppercase tracking-widest text-muted">
                  {language === "en" ? "Higher calculation precision" : "Mais precisão no cálculo"}
                </Text>

                {/* 1. Ajuste de peso para a fórmula METs */}
                <View className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                  <View className="flex-1 pr-2">
                    <Text className="font-headline text-xs text-foreground">
                      {language === "en" ? "Body weight" : "Peso corporal"}
                    </Text>
                    <Text className="font-body text-[11px] text-muted">
                      {userWeightKg
                        ? language === "en"
                          ? `Logged in app: ${userWeightKg} kg`
                          : `Registado na app: ${userWeightKg} kg`
                        : language === "en"
                        ? "Reference used: 70 kg"
                        : "Referência usada: 70 kg"}
                    </Text>
                  </View>
                  <View className="w-24 flex-row items-center rounded-lg border border-border bg-surface-raised px-2 py-1">
                    <TextInput
                      accessibilityLabel={
                        language === "en"
                          ? "Body weight for calorie calculation"
                          : "Peso corporal para cálculo calórico"
                      }
                      className="flex-1 text-right font-headline text-xs text-foreground"
                      keyboardType="decimal-pad"
                      maxLength={5}
                      onChangeText={setCustomWeight}
                      placeholder={String(userWeightKg ?? 70)}
                      placeholderTextColor={COLORS.muted}
                      value={customWeight}
                    />
                    <Text className="ml-1 font-body text-xs text-muted">kg</Text>
                  </View>
                </View>

                {/* 2. Ou introduzir calorias exatas do smartwatch */}
                <View className="flex-row items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                  <View className="flex-1 pr-2">
                    <Text className="font-headline text-xs text-foreground">
                      {language === "en" ? "Smartwatch calories" : "Calorias do smartwatch"}
                    </Text>
                    <Text className="font-body text-[11px] text-muted">
                      {language === "en"
                        ? "Overrides formula with measured value"
                        : "Sobrepõe a fórmula com o valor medido"}
                    </Text>
                  </View>
                  <View className="w-24 flex-row items-center rounded-lg border border-border bg-surface-raised px-2 py-1">
                    <TextInput
                      accessibilityLabel={
                        language === "en"
                          ? "Calories measured on smartwatch"
                          : "Calorias medidas no smartwatch"
                      }
                      className="flex-1 text-right font-headline text-xs text-foreground"
                      keyboardType="number-pad"
                      maxLength={5}
                      onChangeText={setManualCalories}
                      placeholder={language === "en" ? "E.g. 320" : "Ex: 320"}
                      placeholderTextColor={COLORS.muted}
                      value={manualCalories}
                    />
                    <Text className="ml-1 font-body text-xs text-muted">kcal</Text>
                  </View>
                </View>

                {/* Botão rápido para adicionar às notas */}
                <Pressable
                  accessibilityRole="button"
                  className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-success/30 bg-success/10 py-2 active:opacity-70"
                  onPress={handleAddCaloriesToNotes}
                >
                  <Ionicons color={COLORS.success} name="bookmark-outline" size={14} />
                  <Text className="font-headline text-xs text-success">
                    {language === "en"
                      ? `Add [${displayKcal} kcal] to notes`
                      : `Adicionar [${displayKcal} kcal] às notas`}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      })()}

      <TextInput
        accessibilityLabel={
          language === "en"
            ? "Optional notes about the activity"
            : "Notas opcionais sobre a atividade"
        }
        className="mt-4 min-h-[72px] rounded-xl border border-border bg-surface-raised px-4 py-3 font-body text-sm text-foreground"
        maxLength={240}
        multiline
        onChangeText={onChangeNotes}
        placeholder={
          language === "en"
            ? "Optional notes: route, how you felt…"
            : "Notas opcionais: percurso, como te sentiste…"
        }
        placeholderTextColor={COLORS.muted}
        textAlignVertical="top"
        value={notes}
      />

      <Pressable
        accessibilityRole="button"
        className={
          isSaving
            ? "mt-5 flex-row items-center justify-center rounded-2xl bg-success/50 py-4"
            : "mt-5 flex-row items-center justify-center rounded-2xl bg-success py-4"
        }
        disabled={isSaving}
        onPress={onSave}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Ionicons color="#FFFFFF" name="add" size={20} />
        )}
        <Text
          className="ml-2 font-headline text-sm text-white"
          translate={false}
        >
          {isSaving
            ? translateText("A guardar…", language)
            : xpAvailable
              ? translateText("Guardar atividade · +50 XP", language)
              : translateText("Guardar atividade · sem XP", language)}
        </Text>
      </Pressable>

      <View className="mt-4 flex-row items-start gap-2 rounded-xl bg-background p-3">
        <Ionicons
          color={COLORS.muted}
          name="information-circle-outline"
          size={17}
        />
        <Text className="flex-1 font-body text-xs leading-[18px] text-muted">
          {translateText(
            "Regista apenas atividade já realizada. A app não recomenda duração, intensidade ou um plano de treino.",
            language,
          )}
        </Text>
      </View>
    </Card>
  );
}
