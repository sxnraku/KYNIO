import {
  calculateBmr,
  computeMetabolicExpenditure,
} from "@/services/metabolicTdeeService";
import type { MealRecord, WeightEntryRecord, WorkoutRecord } from "@/db/schema";

describe("metabolicTdeeService", () => {
  describe("calculateBmr", () => {
    it("calcula BMR esperado com base no peso corporal e valores padrão (170cm, 30 anos, neutro)", () => {
      // 70 kg, 170 cm, 30 anos, neutro -> 10*70 + 6.25*170 - 5*30 - 78 = 700 + 1062.5 - 150 - 78 = 1534.5 -> 1535 kcal
      expect(calculateBmr(70)).toBe(1535);
      // 85 kg, 170 cm, 30 anos, neutro -> 10*85 + 1062.5 - 150 - 78 = 850 + 834.5 = 1684.5 -> 1685 kcal
      expect(calculateBmr(85)).toBe(1685);
    });

    it("calcula BMR personalizado para homem jovem e alto", () => {
      // 70 kg, 180 cm, 25 anos, male -> 700 + 1125 - 125 + 5 = 1705 kcal
      expect(calculateBmr(70, 180, 25, "male")).toBe(1705);
    });

    it("calcula BMR personalizado para mulher adulta", () => {
      // 60 kg, 165 cm, 35 anos, female -> 600 + 1031.25 - 175 - 161 = 1295.25 -> 1295 kcal
      expect(calculateBmr(60, 165, 35, "female")).toBe(1295);
    });

    it("limita pesos fora de limites biológicos aceitáveis", () => {
      expect(calculateBmr(10, 170, 30)).toBe(calculateBmr(30, 170, 30));
      expect(calculateBmr(350, 170, 30)).toBe(calculateBmr(300, 170, 30));
    });
  });

  describe("computeMetabolicExpenditure", () => {
    const mockWeights: WeightEntryRecord[] = [
      {
        deletedAt: null,
        id: 1,
        timestamp: Date.now(),
        weightGrams: 75000, // 75 kg
      },
    ];

    const mockMeals: MealRecord[] = [
      {
        carbsGrams: 200,
        deletedAt: null,
        estimatedCalories: 2100,
        fatGrams: 70,
        id: 1,
        imageUrl: null,
        proteinGrams: 120,
        tags: ["Almoço"],
        timestamp: Date.now() - 3600 * 1000,
        xpEarned: 30,
      },
      {
        carbsGrams: 220,
        deletedAt: null,
        estimatedCalories: 2300,
        fatGrams: 80,
        id: 2,
        imageUrl: null,
        proteinGrams: 110,
        tags: ["Jantar"],
        timestamp: Date.now() - 26 * 3600 * 1000, // outro dia
        xpEarned: 30,
      },
    ];

    const mockWorkouts: WorkoutRecord[] = [
      {
        deletedAt: null,
        durationMinutes: 45,
        effort: "moderate",
        id: 1,
        notes: null,
        timestamp: Date.now() - 12 * 3600 * 1000,
        type: "running",
        xpEarned: 50,
      },
    ];

    it("calcula TDEE e média diária de ingestão corretamente", () => {
      const result = computeMetabolicExpenditure(
        mockWeights,
        mockMeals,
        mockWorkouts,
        "pt",
      );

      // Peso 75kg -> BMR = 10 * 75 + 6.25*170 - 5*30 - 78 = 1585
      expect(result.currentWeightKg).toBe(75);
      expect(result.bmrKcal).toBe(1585);
      expect(result.tdeeKcal).toBeGreaterThan(1585);
      // Média de 2 dias (2100 e 2300) -> 2200 kcal/dia
      expect(result.recentDailyIntakeKcal).toBe(2200);
      expect(result.daysLoggedCount).toBe(2);
    });

    it("respeita dados demográficos personalizados (altura, idade, sexo)", () => {
      const result = computeMetabolicExpenditure(
        mockWeights,
        mockMeals,
        mockWorkouts,
        "pt",
        { ageYears: 25, biologicalSex: "male", heightCm: 185 },
      );

      // 75kg, 185cm, 25 anos, male -> 10*75 + 6.25*185 - 5*25 + 5 = 750 + 1156.25 - 125 + 5 = 1786.25 -> 1786
      expect(result.bmrKcal).toBe(1786);
      expect(result.heightCm).toBe(185);
      expect(result.ageYears).toBe(25);
      expect(result.biologicalSex).toBe("male");
    });

    it("apresenta estado descritivo em inglês quando idioma for en", () => {
      const result = computeMetabolicExpenditure(
        mockWeights,
        mockMeals,
        mockWorkouts,
        "en",
      );

      expect(result.statusLabel).toBeDefined();
      expect(result.statusDescription).toBeDefined();
    });
  });
});
