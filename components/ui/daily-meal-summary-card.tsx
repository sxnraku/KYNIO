import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { DailyMealSummary } from "@/services/mealSummaryService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface DailyMealSummaryCardProps {
  error: string | null;
  isLoading: boolean;
  summary: DailyMealSummary;
}

interface MacroTileProps {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}

function MacroTile({ color, icon, label, value }: MacroTileProps) {
  return (
    <View className="min-w-0 flex-1 rounded-2xl border border-border bg-background p-3">
      <View className="flex-row items-center gap-1.5">
        <Ionicons color={color} name={icon} size={14} />
        <Text
          className="font-label text-[9px] uppercase tracking-wider text-muted"
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <View className="mt-2 flex-row items-baseline">
        <Text className="font-headline text-lg text-foreground">{value}</Text>
        <Text className="ml-1 font-body text-[10px] text-muted">g</Text>
      </View>
    </View>
  );
}

export function DailyMealSummaryCard({
  error,
  isLoading,
  summary,
}: DailyMealSummaryCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const calorieFormatter = new Intl.NumberFormat(
    language === "pt" ? "pt-PT" : "en-US",
    { maximumFractionDigits: 0 },
  );

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            Resumo de hoje
          </Text>
          <Text className="mt-1 font-body text-xs text-muted">
            {summary.mealCount === 1
              ? "1 refeição confirmada"
              : `${summary.mealCount} refeições confirmadas`}
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-success/10">
          <Ionicons color={COLORS.success} name="nutrition-outline" size={21} />
        </View>
      </View>

      <View className="mt-5 flex-row items-end">
        {isLoading ? (
          <ActivityIndicator color={COLORS.success} size="small" />
        ) : (
          <Text className="font-headline text-4xl text-foreground">
            {calorieFormatter.format(summary.totalCalories)}
          </Text>
        )}
        <Text className="mb-1 ml-2 font-body text-sm text-muted">kcal</Text>
      </View>
      <Text className="mt-1 font-body text-xs text-muted">
        Calorias registadas hoje
      </Text>

      <View className="mt-5 flex-row gap-2">
        <MacroTile
          color={COLORS.success}
          icon="fitness-outline"
          label="Proteína"
          value={summary.proteinGrams}
        />
        <MacroTile
          color={COLORS.xp}
          icon="leaf-outline"
          label="Hidratos"
          value={summary.carbsGrams}
        />
        <MacroTile
          color="#F59E0B"
          icon="water-outline"
          label="Gordura"
          value={summary.fatGrams}
        />
      </View>

      <Text className="mt-4 font-body text-[11px] leading-4 text-muted">
        Totais dos registos confirmados. Sem metas prescritas.
      </Text>
      {error ? (
        <Text className="mt-2 font-body text-xs text-red-500">{error}</Text>
      ) : null}
    </Card>
  );
}
