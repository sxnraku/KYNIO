import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { COLORS } from '@/constants/colors';
import type {
  EditableMealNutrition,
  EditableMealNutritionField,
  MealAnalysisConfidence,
  MealAnalysisResult,
} from '@/types/meal';

interface MealAnalysisCardProps {
  analysis: MealAnalysisResult;
  editableNutrition: EditableMealNutrition;
  isSaving: boolean;
  onChangeNutrition: (field: EditableMealNutritionField, value: string) => void;
  onConfirm: () => void;
}

interface NutritionInputProps {
  field: EditableMealNutritionField;
  label: string;
  onChange: (field: EditableMealNutritionField, value: string) => void;
  suffix: string;
  value: string;
}

const CONFIDENCE_LABELS: Record<MealAnalysisConfidence, string> = {
  high: 'Confiança alta',
  medium: 'Confiança média',
  low: 'Confiança baixa',
};

function NutritionInput({ field, label, onChange, suffix, value }: NutritionInputProps) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-background px-3 py-3">
      <Text className="font-label text-[9px] uppercase tracking-wider text-muted">{label}</Text>
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
  isSaving,
  onChangeNutrition,
  onConfirm,
}: MealAnalysisCardProps) {
  return (
    <Card>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            Resultado estruturado
          </Text>
          <Text className="mt-2 font-headline text-2xl text-foreground">{analysis.dish_name}</Text>
        </View>
        <View className="rounded-full bg-success/10 px-3 py-1.5">
          <Text className="font-label text-[9px] uppercase text-success">
            {CONFIDENCE_LABELS[analysis.confidence]}
          </Text>
        </View>
      </View>

      <View className="mt-5 rounded-xl border border-success/20 bg-success/5 p-4">
        <View className="flex-row items-center gap-4">
          <View className="min-w-0 flex-1">
            <Text className="font-label text-[10px] uppercase tracking-widest text-muted">
              Calorias estimadas
            </Text>
            <Text className="mt-1 font-body text-xs text-muted">Toca no valor para ajustar</Text>
          </View>
          <View className="flex-row items-end" style={{ flexShrink: 0 }}>
            <TextInput
              accessibilityLabel="Calorias estimadas, editável"
              className="p-0 text-right font-headline text-3xl text-success"
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={(value) => onChangeNutrition('estimatedCalories', value)}
              selectTextOnFocus
              style={{ width: 88 }}
              value={editableNutrition.estimatedCalories}
            />
            <Text className="mb-1 ml-1 font-body text-sm text-muted">kcal</Text>
          </View>
        </View>
      </View>

      <Text className="mb-2 mt-5 font-label text-[10px] uppercase tracking-widest text-muted">
        Macros estimados · editáveis
      </Text>
      <View className="flex-row gap-2">
        <NutritionInput
          field="proteinGrams"
          label="Proteína"
          onChange={onChangeNutrition}
          suffix="g"
          value={editableNutrition.proteinGrams}
        />
        <NutritionInput
          field="carbsGrams"
          label="Hidratos"
          onChange={onChangeNutrition}
          suffix="g"
          value={editableNutrition.carbsGrams}
        />
        <NutritionInput
          field="fatGrams"
          label="Gordura"
          onChange={onChangeNutrition}
          suffix="g"
          value={editableNutrition.fatGrams}
        />
      </View>

      {analysis.tags.length > 0 ? (
        <View className="mt-5 flex-row flex-wrap gap-2">
          {analysis.tags.map((tag, index) => (
            <View
              className="rounded-full border border-border bg-background px-3 py-2"
              key={`${tag}-${index}`}>
              <Text className="font-label text-[10px] text-foreground">{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving }}
        className="mt-6 min-h-14 flex-row items-center justify-center gap-2 rounded-xl bg-xp px-5 active:opacity-80 disabled:opacity-60"
        disabled={isSaving}
        onPress={onConfirm}>
        {isSaving ? (
          <ActivityIndicator color={COLORS.foreground} size="small" />
        ) : (
          <Ionicons color={COLORS.foreground} name="checkmark-circle" size={21} />
        )}
        <Text className="font-headline text-base text-foreground">
          {isSaving ? 'A guardar…' : 'Confirmar e Ganhar +30 XP'}
        </Text>
      </Pressable>

      <View className="mt-5 border-t border-border pt-4">
        <Text className="font-body text-xs leading-5 text-muted">
          Valores estimados por IA para acompanhamento pessoal de hábitos. Ajuste manualmente
          conforme necessário.
        </Text>
      </View>
    </Card>
  );
}
