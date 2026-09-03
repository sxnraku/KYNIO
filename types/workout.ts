import type { WorkoutRecord } from '@/db/schema';

export type WorkoutEffort = WorkoutRecord['effort'];

export interface WorkoutOption {
  id: string;
  label: string;
}

export const WORKOUT_OPTIONS: WorkoutOption[] = [
  { id: 'walk', label: 'Caminhada' },
  { id: 'run', label: 'Corrida' },
  { id: 'strength', label: 'Força' },
  { id: 'cycling', label: 'Bicicleta' },
  { id: 'mobility', label: 'Mobilidade' },
  { id: 'other', label: 'Outro' },
];

export const EFFORT_LABELS: Record<WorkoutEffort, string> = {
  intense: 'Elevado',
  light: 'Leve',
  moderate: 'Moderado',
};

/**
 * Valores MET de referência (Compêndio de Atividades Físicas / ACSM).
 * 1 MET = 1 kcal / kg / hora.
 * Apenas indicativo — não constitui aconselhamento médico ou de fitness.
 */
export const WORKOUT_METS: Record<string, Record<WorkoutEffort, number>> = {
  walk:     { light: 2.8, moderate: 3.8, intense: 5.0 },
  run:      { light: 7.0, moderate: 9.8, intense: 12.5 },
  strength: { light: 3.5, moderate: 5.0, intense: 6.8 },
  cycling:  { light: 4.5, moderate: 7.5, intense: 10.0 },
  mobility: { light: 2.3, moderate: 3.2, intense: 4.5 },
  other:    { light: 3.0, moderate: 5.0, intense: 7.5 },
};

/**
 * Estima as calorias gastas numa atividade com base em METs.
 * Fórmula: kcal = MET × peso (kg) × (duração em minutos / 60).
 *
 * @param type         - ID do tipo de atividade (ex. 'run')
 * @param durationMin  - Duração em minutos
 * @param effort       - Nível de esforço percebido
 * @param userWeightKg - Peso corporal em kg (opcional, padrão: 70 kg)
 * @returns Estimativa em kcal (inteiro arredondado), ou null se dados inválidos
 */
export function estimateCalories(
  type: string,
  durationMin: number,
  effort: WorkoutEffort,
  userWeightKg?: number | null,
): number | null {
  const mins = Math.round(durationMin);
  if (!mins || mins <= 0) return null;

  const met = WORKOUT_METS[type]?.[effort];
  if (met == null) return null;

  const validWeight =
    typeof userWeightKg === 'number' && userWeightKg >= 25 && userWeightKg <= 300
      ? userWeightKg
      : 70;

  return Math.round(met * validWeight * (mins / 60));
}

