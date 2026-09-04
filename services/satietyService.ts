import type { MealMacros } from '@/types/meal';

export type SatietyLevel = 'low' | 'moderate' | 'high';

export interface SatietyAnalysis {
  dominantFactor: string;
  dominantFactorEn: string;
  estimatedFullUntilTime: string;
  hoursOfSatiety: number;
  level: SatietyLevel;
  numericScore: number;
}

export interface CalculateSatietyInput {
  baseDate?: Date;
  calories: number;
  macros: MealMacros;
  tags?: string[];
}

const HIGH_FIBER_TAG_KEYWORDS = [
  'fibra',
  'fiber',
  'vegetal',
  'legume',
  'salada',
  'salad',
  'integral',
  'chia',
  'aveia',
  'oats',
];

/**
 * Calcula a Pontuação de Saciedade e a Janela de Fome estimada.
 * Baseado na fisiologia de digestão:
 * - Proteína estimula PYY e GLP-1 (alta saciedade inicial e intermediária).
 * - Gorduras retardam o esvaziamento gástrico (sustentação temporal).
 * - Fibras adicionam volume e retardam absorção.
 * - Calorias totais fornecem energia metabólica de base.
 */
export function calculateSatiety({
  calories,
  macros,
  tags = [],
  baseDate = new Date(),
}: CalculateSatietyInput): SatietyAnalysis {
  const protein = Math.max(0, macros.protein_g);
  const carbs = Math.max(0, macros.carbs_g);
  const fat = Math.max(0, macros.fat_g);
  const safeCalories = Math.max(1, calories);

  const fatCalorieRatio = (fat * 9) / safeCalories;

  // Verificar presença de tags de fibra
  const hasFiber = tags.some((tag) => {
    const lower = tag.toLowerCase();
    return HIGH_FIBER_TAG_KEYWORDS.some((kw) => lower.includes(kw));
  });

  // Cálculo da pontuação de 1 a 100
  // Pontos base de volume calórico (máx 35)
  const caloriePoints = Math.min(35, Math.round((safeCalories / 750) * 35));

  // Pontos de proteína (máx 40)
  const proteinPoints = Math.min(40, Math.round((protein / 35) * 40));

  // Pontos de gordura saudável e sustentação (máx 15)
  const fatPoints = Math.min(15, Math.round((fat / 25) * 15));

  // Bónus de fibra (10 pontos)
  const fiberBonus = hasFiber ? 10 : 0;

  const rawScore = caloriePoints + proteinPoints + fatPoints + fiberBonus;
  const numericScore = Math.max(15, Math.min(98, rawScore));

  let level: SatietyLevel = 'moderate';
  if (numericScore >= 68 || protein >= 32) {
    level = 'high';
  } else if (numericScore < 40 || (safeCalories < 250 && protein < 12)) {
    level = 'low';
  }

  // Previsão de horas de saciedade contínua
  let hoursOfSatiety = 3.0;
  if (level === 'high') {
    hoursOfSatiety = safeCalories >= 600 ? 5.0 : 4.0;
    if (fatCalorieRatio >= 0.35 && protein >= 35) {
      hoursOfSatiety = Math.min(5.5, hoursOfSatiety + 0.5);
    }
  } else if (level === 'low') {
    hoursOfSatiety = safeCalories < 200 ? 1.5 : 2.0;
  } else {
    hoursOfSatiety = safeCalories >= 450 ? 3.5 : 3.0;
  }

  // Horário previsto até à próxima sensação de fome
  const targetMs = baseDate.getTime() + Math.round(hoursOfSatiety * 60 * 60 * 1000);
  const targetDate = new Date(targetMs);
  const hoursFormatted = String(targetDate.getHours()).padStart(2, '0');
  const minutesFormatted = String(targetDate.getMinutes()).padStart(2, '0');
  const estimatedFullUntilTime = `${hoursFormatted}:${minutesFormatted}`;

  // Fator dominante descritivo
  let dominantFactor = 'Refeição equilibrada';
  let dominantFactorEn = 'Balanced meal';

  if (protein >= 28 && hasFiber) {
    dominantFactor = 'Rico em fibra e proteína · Alta saciedade';
    dominantFactorEn = 'High in fiber and protein · High satiety';
  } else if (protein >= 30) {
    dominantFactor = 'Excelente densidade proteica · Sustenta energia';
    dominantFactorEn = 'High protein density · Sustains energy';
  } else if (fat >= 22 && carbs < 20) {
    dominantFactor = 'Perfil cetogénico / lipídico · Digestão sustentada';
    dominantFactorEn = 'Keto / lipid profile · Sustained digestion';
  } else if (carbs >= 60 && protein < 15) {
    dominantFactor = 'Maioria hidratos de carbono · Digestão mais rápida';
    dominantFactorEn = 'Predominantly carbs · Faster digestion';
  } else if (level === 'low') {
    dominantFactor = 'Snack ligeiro ou porção reduzida';
    dominantFactorEn = 'Light snack or small portion';
  }

  return {
    dominantFactor,
    dominantFactorEn,
    estimatedFullUntilTime,
    hoursOfSatiety,
    level,
    numericScore,
  };
}
