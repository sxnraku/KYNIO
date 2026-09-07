import type { MealRecord, WeightEntryRecord, WorkoutRecord } from "@/db/schema";
import { getMealRecords, getWeightEntries, getWorkoutRecords } from "@/services/dbService";
import { estimateCalories } from "@/types/workout";
import type { AppLanguage } from "@/store/app-preferences-store";

export interface UserMetabolicDemographics {
  heightCm?: number;
  ageYears?: number;
  biologicalSex?: "male" | "female" | "other";
}

export interface MetabolicExpenditureData {
  bmrKcal: number;
  tdeeKcal: number;
  dailyWorkoutBurnKcal: number;
  recentDailyIntakeKcal: number | null;
  daysLoggedCount: number;
  currentWeightKg: number;
  heightCm: number;
  ageYears: number;
  biologicalSex: "male" | "female" | "other";
  balanceStatus: "surplus" | "deficit" | "balanced" | "insufficient_data";
  statusLabel: string;
  statusDescription: string;
}

const DEFAULT_WEIGHT_KG = 70;
const DEFAULT_HEIGHT_CM = 170;
const DEFAULT_AGE_YEARS = 30;

/**
 * Calcula a Taxa Metabólica Basal (BMR) com base no peso (kg), altura (cm), idade (anos)
 * e sexo biológico, utilizando a equação clássica validada de Mifflin-St Jeor:
 * - Homens: 10 * peso + 6.25 * altura - 5 * idade + 5
 * - Mulheres: 10 * peso + 6.25 * altura - 5 * idade - 161
 * - Neutro/Geral: 10 * peso + 6.25 * altura - 5 * idade - 78
 */
export function calculateBmr(
  weightKg: number,
  heightCm: number = DEFAULT_HEIGHT_CM,
  ageYears: number = DEFAULT_AGE_YEARS,
  biologicalSex: "male" | "female" | "other" = "other",
): number {
  const safeWeight = Math.max(30, Math.min(300, weightKg));
  const safeHeight = Math.max(100, Math.min(250, heightCm));
  const safeAge = Math.max(14, Math.min(100, ageYears));

  const baseBmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;

  if (biologicalSex === "male") {
    return Math.round(baseBmr + 5);
  }
  if (biologicalSex === "female") {
    return Math.round(baseBmr - 161);
  }
  return Math.round(baseBmr - 78);
}

/**
 * Calcula a despesa energética diária total (TDEE) e cruza com a ingestão real
 * dos últimos 14 dias para gerar um resumo metabólico objetivo e neutro.
 */
export function computeMetabolicExpenditure(
  weightEntries: WeightEntryRecord[],
  meals: MealRecord[],
  workouts: WorkoutRecord[],
  language: AppLanguage = "pt",
  demographics?: UserMetabolicDemographics,
): MetabolicExpenditureData {
  const heightCm = demographics?.heightCm || DEFAULT_HEIGHT_CM;
  const ageYears = demographics?.ageYears || DEFAULT_AGE_YEARS;
  const biologicalSex = demographics?.biologicalSex || "other";

  // 1. Determinar peso mais recente
  const sortedWeights = [...weightEntries].sort((a, b) => b.timestamp - a.timestamp);
  const currentWeightKg =
    sortedWeights.length > 0
      ? Math.round((sortedWeights[0].weightGrams / 1000) * 10) / 10
      : DEFAULT_WEIGHT_KG;

  // 2. Taxa Metabólica Basal (BMR com fórmula Mifflin-St Jeor completa)
  const bmrKcal = calculateBmr(currentWeightKg, heightCm, ageYears, biologicalSex);

  // 3. Média de queima por treino nos últimos 14 dias
  const fourteenDaysAgo = Date.now() - 14 * 24 * 3600 * 1000;
  const recentWorkouts = workouts.filter((w) => w.timestamp >= fourteenDaysAgo);
  const totalWorkoutKcal = recentWorkouts.reduce((sum, w) => {
    return sum + (estimateCalories(w.type, w.durationMinutes, w.effort, currentWeightKg) || 0);
  }, 0);
  const dailyWorkoutBurnKcal = Math.round(totalWorkoutKcal / 14);

  // 4. Gasto Diário Total Estimado (TDEE): Basal x 1.2 (NEAT básico) + Treinos diários
  const tdeeKcal = Math.round(bmrKcal * 1.2 + dailyWorkoutBurnKcal);

  // 5. Média diária de ingestão recente (últimos 14 dias)
  const recentMeals = meals.filter(
    (m) => m.timestamp >= fourteenDaysAgo && m.estimatedCalories && m.estimatedCalories > 0,
  );

  // Agrupar calorias por dia de calendário
  const caloriesByDay = new Map<string, number>();
  for (const meal of recentMeals) {
    const dayKey = new Date(meal.timestamp).toISOString().slice(0, 10);
    const prev = caloriesByDay.get(dayKey) || 0;
    caloriesByDay.set(dayKey, prev + (meal.estimatedCalories || 0));
  }

  const daysLoggedCount = caloriesByDay.size;
  let recentDailyIntakeKcal: number | null = null;
  if (daysLoggedCount > 0) {
    let totalIntake = 0;
    for (const dayKcal of caloriesByDay.values()) {
      totalIntake += dayKcal;
    }
    recentDailyIntakeKcal = Math.round(totalIntake / daysLoggedCount);
  }

  // 6. Estado de balanço energético descritivo
  let balanceStatus: "surplus" | "deficit" | "balanced" | "insufficient_data" =
    "insufficient_data";
  let statusLabel =
    language === "en" ? "Awaiting more logs" : "Aguardar mais registos";
  let statusDescription =
    language === "en"
      ? "Log your meals and weight across 3+ days for personal metabolic balance insights."
      : "Regista refeições e peso durante 3+ dias para calcular o teu balanço metabólico pessoal.";

  if (recentDailyIntakeKcal !== null && daysLoggedCount >= 2) {
    const diff = recentDailyIntakeKcal - tdeeKcal;
    if (diff > 120) {
      balanceStatus = "surplus";
      statusLabel =
        language === "en" ? "Energy Surplus" : "Superavit Energético";
      statusDescription =
        language === "en"
          ? `Intake exceeds estimated expenditure by ~${diff} kcal/day.`
          : `Ingestão média excede o gasto estimado em ~${diff} kcal/dia.`;
    } else if (diff < -120) {
      balanceStatus = "deficit";
      statusLabel =
        language === "en" ? "Energy Deficit" : "Défice Energético";
      statusDescription =
        language === "en"
          ? `Expenditure exceeds estimated intake by ~${Math.abs(diff)} kcal/day.`
          : `Gasto estimado excede a ingestão em ~${Math.abs(diff)} kcal/dia.`;
    } else {
      balanceStatus = "balanced";
      statusLabel =
        language === "en" ? "Energy Balance" : "Balanço Equilibrado";
      statusDescription =
        language === "en"
          ? "Daily caloric intake is closely aligned with estimated expenditure."
          : "Ingestão calórica diária está alinhada com o gasto estimado.";
    }
  }

  return {
    ageYears,
    balanceStatus,
    biologicalSex,
    bmrKcal,
    currentWeightKg,
    dailyWorkoutBurnKcal,
    daysLoggedCount,
    heightCm,
    recentDailyIntakeKcal,
    statusDescription,
    statusLabel,
    tdeeKcal,
  };
}

/**
 * Carrega os dados locais do SQLite e calcula a estimativa de despesa metabólica.
 */
export async function getMetabolicExpenditureSnapshot(
  language: AppLanguage = "pt",
  demographics?: UserMetabolicDemographics,
): Promise<MetabolicExpenditureData> {
  const [weights, meals, workouts] = await Promise.all([
    getWeightEntries(),
    getMealRecords(),
    getWorkoutRecords(),
  ]);

  return computeMetabolicExpenditure(weights, meals, workouts, language, demographics);
}
