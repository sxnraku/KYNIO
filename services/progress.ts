import type { UserProgress } from '@/types/progress';

type LevelSummary = Pick<UserProgress, 'level' | 'levelTitle'>;

export function formatLevelLabel({ level, levelTitle }: LevelSummary): string {
  return `Nível ${level} - ${levelTitle}`;
}
