import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { getMealRecords } from "@/services/dbService";
import {
  type DailyMealSummary,
  summarizeDailyMeals,
} from "@/services/mealSummaryService";

const EMPTY_SUMMARY: DailyMealSummary = {
  carbsGrams: 0,
  fatGrams: 0,
  mealCount: 0,
  proteinGrams: 0,
  totalCalories: 0,
};

export function useDailyMealSummary(refreshToken: number) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DailyMealSummary>(EMPTY_SUMMARY);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);

      void getMealRecords()
        .then((records) => {
          if (!isActive) {
            return;
          }

          setSummary(summarizeDailyMeals(records));
          setError(null);
        })
        .catch(() => {
          if (isActive) {
            setError("Não foi possível calcular o resumo de hoje.");
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, [refreshToken]),
  );

  return { error, isLoading, summary };
}
