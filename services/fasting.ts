const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

export type EstimatedMetabolicPhaseId = 'autophagy' | 'digestion' | 'glucose' | 'ketosis';

export interface EstimatedMetabolicPhase {
  id: EstimatedMetabolicPhaseId;
  startHour: number;
  timeRange: string;
  title: string;
}

export interface FastingTimerCalculation {
  elapsedHours: number;
  elapsedMs: number;
  progress: number;
}

export interface CalculateFastingTimerInput {
  isActive: boolean;
  now: number;
  startedAt: number | null;
  targetDurationMs: number;
}

export const ESTIMATED_METABOLIC_PHASES: readonly EstimatedMetabolicPhase[] = [
  { id: 'digestion', startHour: 0, timeRange: '0h–4h', title: 'Digestão' },
  {
    id: 'glucose',
    startHour: 4,
    timeRange: '4h–12h',
    title: 'Início de Queima de Glicose',
  },
  { id: 'ketosis', startHour: 12, timeRange: '12h–16h', title: 'Cetose Estimada' },
  { id: 'autophagy', startHour: 16, timeRange: '16h+', title: 'Autofagia Estimada' },
];

export function formatElapsedTime(elapsedMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function getEstimatedPhaseIndex(elapsedHours: number): number {
  if (elapsedHours < 4) {
    return 0;
  }

  if (elapsedHours < 12) {
    return 1;
  }

  if (elapsedHours < 16) {
    return 2;
  }

  return 3;
}

export function calculateFastingTimer({
  isActive,
  now,
  startedAt,
  targetDurationMs,
}: CalculateFastingTimerInput): FastingTimerCalculation {
  const elapsedMs = isActive && startedAt !== null ? Math.max(0, now - startedAt) : 0;
  const progress = targetDurationMs > 0 ? Math.min(elapsedMs / targetDurationMs, 1) : 0;

  return {
    elapsedHours: elapsedMs / HOURS_TO_MILLISECONDS,
    elapsedMs,
    progress,
  };
}

export function getEstimatedMetabolicPhase(
  startedAt: number,
  now: number,
): EstimatedMetabolicPhase {
  const elapsedHours = Math.max(0, now - startedAt) / HOURS_TO_MILLISECONDS;
  return ESTIMATED_METABOLIC_PHASES[getEstimatedPhaseIndex(elapsedHours)];
}
