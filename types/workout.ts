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
