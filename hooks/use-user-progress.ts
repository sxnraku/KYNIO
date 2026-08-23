import { useUserProgressStore } from '@/store/user-progress-store';
import type { UserProgress } from '@/types/progress';

export function useUserProgress(): UserProgress {
  const currentXp = useUserProgressStore((state) => state.currentXp);
  const level = useUserProgressStore((state) => state.level);
  const levelTitle = useUserProgressStore((state) => state.levelTitle);
  const progress = useUserProgressStore((state) => state.progress);
  const targetXp = useUserProgressStore((state) => state.targetXp);
  const totalXp = useUserProgressStore((state) => state.totalXp);

  return { currentXp, level, levelTitle, progress, targetXp, totalXp };
}
