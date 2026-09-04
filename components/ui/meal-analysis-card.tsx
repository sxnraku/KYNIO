import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/text-input";


import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import { translateText } from "@/services/i18n";
import { calculateSatiety } from "@/services/satietyService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type {
  EditableMealNutrition,
  EditableMealNutritionField,
  MealAnalysisConfidence,
  MealAnalysisResult,
} from "@/types/meal";

interface MealAnalysisCardProps {
  analysis: MealAnalysisResult;
  editableNutrition: EditableMealNutrition;
  isAnalyzing?: boolean;
  isSaving: boolean;
  onChangeNutrition: (field: EditableMealNutritionField, value: string) => void;
  onConfirm: () => void;
  onRefine?: (clarificationText: string) => void;
}

interface NutritionInputProps {
  field: EditableMealNutritionField;
  label: string;
  onChange: (field: EditableMealNutritionField, value: string) => void;
  suffix: string;
  value: string;
}

const CONFIDENCE_LABELS: Record<MealAnalysisConfidence, { en: string; pt: string }> = {
  high: { en: "High confidence", pt: "Confiança alta" },
  medium: { en: "Medium confidence", pt: "Confiança média" },
  low: { en: "Low confidence", pt: "Confiança baixa" },
};

function NutritionInput({
  field,
  label,
  onChange,
  suffix,
  value,
}: NutritionInputProps) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-background px-3 py-3">
      <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
        {label}
      </Text>
      <View className="mt-1 flex-row items-end">
        <TextInput
          accessibilityLabel={`${label}, editável`}
          className="min-w-0 flex-1 p-0 font-headline text-xl text-foreground"
          inputMode="decimal"
          keyboardType="decimal-pad"
          onChangeText={(nextValue) => onChange(field, nextValue)}
          selectTextOnFocus
          value={value}
        />
        <Text className="pb-0.5 font-body text-xs text-muted">{suffix}</Text>
      </View>
    </View>
  );
}

export function MealAnalysisCard({
  analysis,
  editableNutrition,
  isAnalyzing = false,
  isSaving,
  onChangeNutrition,
  onConfirm,
  onRefine,
}: MealAnalysisCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [clarificationText, setClarificationText] = useState("");
  const [showRefineInput, setShowRefineInput] = useState(
    analysis.confidence === "low",
  );

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {translateText("Resultado estruturado", language)}
          </Text>
          <Text className="mt-2 font-headline text-2xl text-foreground">
            {translateText(analysis.dish_name, language)}
          </Text>
        </View>
        <View className="rounded-full bg-success/10 px-3 py-1.5">
          <Text className="font-label text-[9px] uppercase text-success">
            {CONFIDENCE_LABELS[analysis.confidence][language]}
          </Text>
        </View>
      </View>

      <View className="mt-5 rounded-xl border border-success/20 bg-success/5 p-4">
        <View className="flex-row items-center gap-4">
          <View className="min-w-0 flex-1">
            <Text className="font-label text-[10px] uppercase tracking-widest text-muted">
              {translateText("Calorias estimadas", language)}
            </Text>
            <Text className="mt-1 font-body text-xs text-muted">
              {translateText("Toca no valor para ajustar", language)}
            </Text>
          </View>
          <View className="flex-row items-end" style={{ flexShrink: 0 }}>
            <TextInput
              accessibilityLabel={
                language === "en"
                  ? "Estimated calories, editable"
                  : "Calorias estimadas, editável"
              }
              className="p-0 text-right font-headline text-3xl text-success"
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={(value) =>
                onChangeNutrition("estimatedCalories", value)
              }
              selectTextOnFocus
              style={{ width: 88 }}
              value={editableNutrition.estimatedCalories}
            />
            <Text className="mb-1 ml-1 font-body text-sm text-muted">kcal</Text>
          </View>
        </View>
      </View>

      <Text className="mb-2 mt-5 font-label text-[10px] uppercase tracking-widest text-muted">
        {language === "en"
          ? "Estimated macros · editable"
          : "Macros estimados · editáveis"}
      </Text>
      <View className="flex-row gap-2">
        <NutritionInput
          field="proteinGrams"
          label={language === "en" ? "Protein" : "Proteína"}
          onChange={onChangeNutrition}
          suffix="g"
          value={editableNutrition.proteinGrams}
        />
        <NutritionInput
          field="carbsGrams"
          label={language === "en" ? "Carbs" : "Hidratos"}
          onChange={onChangeNutrition}
          suffix="g"
          value={editableNutrition.carbsGrams}
        />
        <NutritionInput
          field="fatGrams"
          label={language === "en" ? "Fat" : "Gordura"}
          onChange={onChangeNutrition}
          suffix="g"
          value={editableNutrition.fatGrams}
        />
      </View>

      {/* Superpoder Pro: Índice de Saciedade & Janela de Fome */}
      {(() => {
        const calories = Number(editableNutrition.estimatedCalories) || analysis.estimated_calories;
        const protein = Number(editableNutrition.proteinGrams) || analysis.macros.protein_g;
        const carbs = Number(editableNutrition.carbsGrams) || analysis.macros.carbs_g;
        const fat = Number(editableNutrition.fatGrams) || analysis.macros.fat_g;
        const satiety = calculateSatiety({
          calories,
          macros: { carbs_g: carbs, fat_g: fat, protein_g: protein },
          tags: analysis.tags,
        });

        const levelColor =
          satiety.level === "high"
            ? COLORS.success
            : satiety.level === "moderate"
            ? COLORS.warning
            : COLORS.muted;

        const levelLabel =
          satiety.level === "high"
            ? language === "en" ? "High Satiety" : "Alta Saciedade"
            : satiety.level === "moderate"
            ? language === "en" ? "Moderate Satiety" : "Saciedade Moderada"
            : language === "en" ? "Light Satiety" : "Digestão Rápida";

        return (
          <View className="mt-4 rounded-xl border border-border bg-background p-3.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons color={COLORS.success} name="time-outline" size={16} />
                <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                  {language === "en" ? "Hunger Window Prediction" : "Previsão de Janela de Fome"}
                </Text>
              </View>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${levelColor}1A` }}
              >
                <Text
                  className="font-label text-[9px] uppercase tracking-wide"
                  style={{ color: levelColor }}
                >
                  {levelLabel}
                </Text>
              </View>
            </View>

            <View className="mt-2.5 flex-row items-baseline justify-between">
              <Text className="font-headline text-base text-foreground">
                {language === "en"
                  ? `Comfortable until ${satiety.estimatedFullUntilTime}`
                  : `Aguenta confortavelmente até às ${satiety.estimatedFullUntilTime}`}
              </Text>
              <Text className="font-label text-xs font-semibold text-success">
                ~{satiety.hoursOfSatiety}h
              </Text>
            </View>

            <Text className="mt-1 font-body text-xs text-muted">
              {language === "en" ? satiety.dominantFactorEn : satiety.dominantFactor}
            </Text>
          </View>
        );
      })()}

      {analysis.tags.length > 0 ? (
        <View className="mt-4 flex-row flex-wrap gap-2">
          {analysis.tags.map((tag, index) => (
            <View
              className="rounded-full border border-border bg-background px-3 py-2"
              key={`${tag}-${index}`}
            >
              <Text className="font-label text-[10px] text-foreground">
                {translateText(tag, language)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Clarification / Refine Section */}
      {onRefine ? (
        <View className="mt-5 rounded-xl border border-border bg-background/80 p-3.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons
                color={analysis.confidence === "low" ? "#F59E0B" : COLORS.success}
                name={analysis.confidence === "low" ? "help-circle-outline" : "sparkles-outline"}
                size={16}
              />
              <Text className="font-headline text-xs text-foreground">
                {analysis.confidence === "low"
                  ? translateText("A imagem não ficou clara? Clarifica aqui:", language)
                  : language === "en"
                  ? "Want to adjust ingredients or portion?"
                  : "Queres ajustar ingredientes ou porção?"}
              </Text>
            </View>
            {!showRefineInput && analysis.confidence !== "low" ? (
              <Pressable
                onPress={() => setShowRefineInput(true)}
                className="rounded-md bg-surface px-2 py-1 border border-border"
              >
                <Text className="font-label text-[10px] text-muted">
                  {language === "en" ? "Adjust" : "Ajustar"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {showRefineInput || analysis.confidence === "low" ? (
            <View className="mt-2.5">
              <TextInput
                accessibilityLabel={
                  language === "en"
                    ? "Food clarification"
                    : "Clarificação dos alimentos"
                }
                className="rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-foreground"
                onChangeText={setClarificationText}
                placeholder={
                  language === "en"
                    ? "e.g.: it's tofu with brown rice, around 300g"
                    : "Ex.: é tofu com arroz integral, cerca de 300g"
                }
                placeholderTextColor={COLORS.muted}
                value={clarificationText}
              />
              <Pressable
                accessibilityRole="button"
                disabled={!clarificationText.trim() || isAnalyzing}
                onPress={() => onRefine(clarificationText)}
                className={`mt-2 flex-row items-center justify-center gap-2 rounded-lg py-2.5 ${
                  clarificationText.trim() && !isAnalyzing
                    ? "bg-success active:opacity-80"
                    : "bg-border opacity-50"
                }`}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Ionicons color={COLORS.background} name="refresh-outline" size={15} />
                )}
                <Text className="font-headline text-xs text-background">
                  {isAnalyzing
                    ? translateText("A recalcular…", language)
                    : language === "en"
                    ? "Recalculate with details"
                    : "Recalcular com estes detalhes"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving || isAnalyzing }}
        className="mt-6 min-h-14 flex-row items-center justify-center gap-2 rounded-xl bg-xp px-5 active:opacity-80 disabled:opacity-60"
        disabled={isSaving || isAnalyzing}
        onPress={onConfirm}
      >
        {isSaving ? (
          <ActivityIndicator color={COLORS.foreground} size="small" />
        ) : (
          <Ionicons
            color={COLORS.foreground}
            name="checkmark-circle"
            size={21}
          />
        )}
        <Text className="font-headline text-base text-foreground">
          {isSaving
            ? translateText("A guardar…", language)
            : language === "en"
            ? "Confirm and Earn +30 XP"
            : "Confirmar e Ganhar +30 XP"}
        </Text>
      </Pressable>

      <View className="mt-5 border-t border-border pt-4">
        <Text className="font-body text-xs leading-5 text-muted">
          {language === "en"
            ? "AI estimated values for personal habit tracking. Adjust manually as needed."
            : "Valores estimados por IA para acompanhamento pessoal de hábitos. Ajuste manualmente conforme necessário."}
        </Text>
      </View>
    </Card>
  );
}
