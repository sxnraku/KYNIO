import type { MealRecord } from "@/db/schema";
import { summarizeDailyMeals } from "@/services/mealSummaryService";

function meal(
  id: number,
  timestamp: number,
  values: Partial<MealRecord> = {},
): MealRecord {
  return {
    carbsGrams: 30,
    estimatedCalories: 400,
    fatGrams: 10,
    id,
    imageUrl: null,
    proteinGrams: 20,
    tags: [],
    timestamp,
    xpEarned: 30,
    ...values,
  };
}

describe("summarizeDailyMeals", () => {
  it("soma apenas as refeições do dia local selecionado", () => {
    const reference = new Date(2026, 7, 24, 18).getTime();
    const todayMorning = new Date(2026, 7, 24, 8).getTime();
    const todayLunch = new Date(2026, 7, 24, 13).getTime();
    const yesterday = new Date(2026, 7, 23, 20).getTime();

    expect(
      summarizeDailyMeals(
        [
          meal(1, todayMorning),
          meal(2, todayLunch, {
            carbsGrams: 25.25,
            estimatedCalories: 350,
            fatGrams: 8.5,
            proteinGrams: 15.25,
          }),
          meal(3, yesterday),
        ],
        reference,
      ),
    ).toEqual({
      carbsGrams: 55.3,
      fatGrams: 18.5,
      mealCount: 2,
      proteinGrams: 35.3,
      totalCalories: 750,
    });
  });

  it("trata valores nutricionais ausentes como zero", () => {
    const reference = new Date(2026, 7, 24, 18).getTime();

    expect(
      summarizeDailyMeals(
        [
          meal(1, reference, {
            carbsGrams: null,
            estimatedCalories: null,
            fatGrams: null,
            proteinGrams: null,
          }),
        ],
        reference,
      ),
    ).toEqual({
      carbsGrams: 0,
      fatGrams: 0,
      mealCount: 1,
      proteinGrams: 0,
      totalCalories: 0,
    });
  });
});
