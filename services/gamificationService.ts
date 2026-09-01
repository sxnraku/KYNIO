import type { FastRecord, MealRecord, WorkoutRecord } from '@/db/schema';

export const XP_REWARDS = {
  fastGoalCompleted: 100,
  mealScanned: 30,
  workoutLogged: 50,
} as const;

export type GamificationEvent = keyof typeof XP_REWARDS;

export interface LevelProgress {
  currentLevelStartXp: number;
  nextLevelTotalXp: number;
  progress: number;
  xpIntoLevel: number;
  xpRequiredInLevel: number;
}

export interface LocalGamificationStats {
  activeDays: number;
  completedFasts: number;
  daysSinceLastActivity: number | null;
  mealScans: number;
  missedDaysInLine: number;
  streakDays: number;
  streakIntensity: number;
  totalFastingHours: number;
  workoutLogs: number;
}

export interface GamificationBadge {
  description: string;
  id: 'first-fast' | 'fifty-hours' | 'first-ai-scan' | 'first-workout' | 'seven-day-line';
  title: string;
  unlocked: boolean;
}

export interface XpRewardTier {
  description: string;
  id: string;
  isUnlocked: boolean;
  levelRequired: number;
  perkBadge: string;
  title: string;
  xpRequired: number;
}

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getXpReward(event: GamificationEvent): number {
  return XP_REWARDS[event];
}

export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)) + 1;
}

export function getLevelTitle(level: number): string {
  if (level >= 10) {
    return 'Mestre da Consistência';
  }

  if (level >= 5) {
    return 'Disciplinado';
  }

  if (level >= 3) {
    return 'Consistente';
  }

  if (level >= 2) {
    return 'Iniciado';
  }

  return 'Aprendiz';
}

export function calculateLevelProgress(totalXp: number): LevelProgress {
  const normalizedXp = Math.max(0, totalXp);
  const level = calculateLevel(normalizedXp);
  const currentLevelStartXp = 100 * (level - 1) ** 2;
  const nextLevelTotalXp = 100 * level ** 2;
  const xpIntoLevel = normalizedXp - currentLevelStartXp;
  const xpRequiredInLevel = nextLevelTotalXp - currentLevelStartXp;

  return {
    currentLevelStartXp,
    nextLevelTotalXp,
    progress: xpRequiredInLevel > 0 ? Math.min(xpIntoLevel / xpRequiredInLevel, 1) : 1,
    xpIntoLevel,
    xpRequiredInLevel,
  };
}

export function getXpRewardTiers(
  currentTotalXp: number,
  currentLevel: number,
): XpRewardTier[] {
  return [
    {
      description:
        'Acesso total aos temporizadores de jejum e registo local ilimitado.',
      id: 'tier-1-base',
      isUnlocked: true,
      levelRequired: 1,
      perkBadge: 'BASE',
      title: 'Aura Essencial',
      xpRequired: 0,
    },
    {
      description:
        'Ativa realces visuais âmbar e micro-animações personalizadas.',
      id: 'tier-2-visuals',
      isUnlocked: currentLevel >= 2,
      levelRequired: 2,
      perkBadge: 'VISUAL',
      title: 'Tema Aura Glow',
      xpRequired: 100,
    },
    {
      description:
        'Acesso a análises aprofundadas de macronutrientes e tendências de cetose.',
      id: 'tier-3-analytics',
      isUnlocked: currentLevel >= 3,
      levelRequired: 3,
      perkBadge: 'ANALYTICS',
      title: 'Métricas Avançadas',
      xpRequired: 400,
    },
    {
      description:
        'Prioridade e precisão aumentada no modelo Gemini de análise de refeições.',
      id: 'tier-4-ai-boost',
      isUnlocked: currentLevel >= 4,
      levelRequired: 4,
      perkBadge: 'IA BOOST',
      title: 'Modo IA Pro Turbo',
      xpRequired: 900,
    },
    {
      description:
        'Passe Premium Kynio Aura: todas as ferramentas de longevidade e exportação avançada.',
      id: 'tier-5-pro-pass',
      isUnlocked: currentLevel >= 5,
      levelRequired: 5,
      perkBadge: 'PREMIUM PASS',
      title: 'Kynio Aura Pass Pro',
      xpRequired: 1600,
    },
    {
      description:
        'Insígnia de Prestígio Mestre e estatuto honorário permanente de pioneiro Kynio.',
      id: 'tier-7-prestige',
      isUnlocked: currentLevel >= 7,
      levelRequired: 7,
      perkBadge: 'PRESTÍGIO',
      title: 'Mestre da Longevidade',
      xpRequired: 3600,
    },
  ];
}


function getLocalDayOrdinal(timestamp: number): number {
  const date = new Date(timestamp);
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_IN_MILLISECONDS);
}

function calculateStreak(dayOrdinals: number[]): {
  daysSinceLastActivity: number | null;
  intensity: number;
  missedDaysInLine: number;
  streakDays: number;
} {
  if (dayOrdinals.length === 0) {
    return { daysSinceLastActivity: null, intensity: 0, missedDaysInLine: 0, streakDays: 0 };
  }

  const uniqueDays = [...new Set(dayOrdinals)].sort((a, b) => b - a);
  let streakDays = 1;
  let missedDaysInLine = 0;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const gap = uniqueDays[index - 1] - uniqueDays[index];

    if (gap === 1) {
      streakDays += 1;
      continue;
    }

    if (gap === 2 && missedDaysInLine === 0) {
      missedDaysInLine = 1;
      streakDays += 2;
      continue;
    }

    break;
  }

  const today = getLocalDayOrdinal(Date.now());
  const daysSinceLastActivity = Math.max(0, today - uniqueDays[0]);
  const intensity = Math.max(0.25, 1 - daysSinceLastActivity * 0.25 - missedDaysInLine * 0.2);

  return { daysSinceLastActivity, intensity, missedDaysInLine, streakDays };
}

export function summarizeLocalGamificationStats(
  fastRecords: FastRecord[],
  mealRecords: MealRecord[],
  workoutRecords: WorkoutRecord[] = [],
): LocalGamificationStats {
  const completedFasts = fastRecords.filter((fast) => fast.completed).length;
  const totalFastingMilliseconds = fastRecords.reduce(
    (total, fast) => total + Math.max(0, fast.endTime - fast.startTime),
    0,
  );
  const activityDays = [
    ...fastRecords.map((fast) => getLocalDayOrdinal(fast.endTime)),
    ...mealRecords.map((meal) => getLocalDayOrdinal(meal.timestamp)),
    ...workoutRecords.map((workout) => getLocalDayOrdinal(workout.timestamp)),
  ];
  const streak = calculateStreak(activityDays);

  return {
    activeDays: new Set(activityDays).size,
    completedFasts,
    daysSinceLastActivity: streak.daysSinceLastActivity,
    mealScans: mealRecords.length,
    missedDaysInLine: streak.missedDaysInLine,
    streakDays: streak.streakDays,
    streakIntensity: streak.intensity,
    totalFastingHours: totalFastingMilliseconds / (60 * 60 * 1000),
    workoutLogs: workoutRecords.length,
  };
}

export function getGamificationBadges(stats: LocalGamificationStats): GamificationBadge[] {
  return [
    {
      description: 'Conclui um jejum no objetivo.',
      id: 'first-fast',
      title: 'Primeiro Objetivo',
      unlocked: stats.completedFasts >= 1,
    },
    {
      description: 'Acumula 50 horas registadas.',
      id: 'fifty-hours',
      title: 'Primeiras 50h',
      unlocked: stats.totalFastingHours >= 50,
    },
    {
      description: 'Confirma a primeira análise de refeição.',
      id: 'first-ai-scan',
      title: 'Primeiro Scan de IA',
      unlocked: stats.mealScans >= 1,
    },
    {
      description: 'Regista a primeira atividade realizada.',
      id: 'first-workout',
      title: 'Em Movimento',
      unlocked: stats.workoutLogs >= 1,
    },
    {
      description: 'Mantém atividade durante 7 dias seguidos.',
      id: 'seven-day-line',
      title: 'Linha de 7 Dias',
      unlocked: stats.streakDays >= 7,
    },
  ];
}
