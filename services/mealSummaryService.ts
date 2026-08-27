import type { MealRecord } from "@/db/schema";

export interface DailyMealSummary {
  carbsGrams: number;
  fatGrams: number;
  mealCount: number;
  proteinGrams: number;
  totalCalories: number;
}

function isSameLocalDay(
  timestamp: number,
  referenceTimestamp: number,
): boolean {
  const date = new Date(timestamp);
  const reference = new Date(referenceTimestamp);

  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function safeValue(value: number | null): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function summarizeDailyMeals(
  records: MealRecord[],
  referenceTimestamp = Date.now(),
): DailyMealSummary {
  const summary = records.reduce<DailyMealSummary>(
    (totals, meal) => {
      if (!isSameLocalDay(meal.timestamp, referenceTimestamp)) {
        return totals;
      }

      return {
        carbsGrams: totals.carbsGrams + safeValue(meal.carbsGrams),
        fatGrams: totals.fatGrams + safeValue(meal.fatGrams),
        mealCount: totals.mealCount + 1,
        proteinGrams: totals.proteinGrams + safeValue(meal.proteinGrams),
        totalCalories: totals.totalCalories + safeValue(meal.estimatedCalories),
      };
    },
    {
      carbsGrams: 0,
      fatGrams: 0,
      mealCount: 0,
      proteinGrams: 0,
      totalCalories: 0,
    },
  );

  return {
    ...summary,
    carbsGrams: roundToOneDecimal(summary.carbsGrams),
    fatGrams: roundToOneDecimal(summary.fatGrams),
    proteinGrams: roundToOneDecimal(summary.proteinGrams),
    totalCalories: Math.round(summary.totalCalories),
  };
}
