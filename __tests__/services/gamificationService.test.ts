import type { FastRecord } from '@/db/schema';
import {
  calculateLevel,
  calculateLevelProgress,
  getGamificationBadges,
  getLevelTitle,
  getXpReward,
  getXpRewardTiers,
  summarizeLocalGamificationStats,
} from '@/services/gamificationService';


const FIXED_NOW = new Date(2026, 7, 22, 12, 0, 0).getTime();
const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

function getLocalNoonDaysAgo(daysAgo: number): number {
  const date = new Date(FIXED_NOW);
  date.setDate(date.getDate() - daysAgo);
  return date.getTime();
}

function createFastRecord(id: number, daysAgo: number): FastRecord {
  const endTime = getLocalNoonDaysAgo(daysAgo);

  return {
    completed: true,
    endTime,
    id,
    startTime: endTime - 16 * HOUR_IN_MILLISECONDS,
    targetHours: 16,
    xpEarned: 100,
  };
}

describe('gamificationService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('atribui +100 XP ao completar um jejum no objetivo', () => {
    expect(getXpReward('fastGoalCompleted')).toBe(100);
  });

  it('passa do nível 1 para o nível 2 ao atingir 100 XP', () => {
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);

    const progress = calculateLevelProgress(100);
    expect(progress.currentLevelStartXp).toBe(100);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.nextLevelTotalXp).toBe(400);
  });

  it('mantém a linha de consistência com degradação suave quando falha um dia', () => {
    const uninterrupted = summarizeLocalGamificationStats(
      [createFastRecord(1, 0), createFastRecord(2, 1), createFastRecord(3, 2)],
      [],
    );
    const withOneMissedDay = summarizeLocalGamificationStats(
      [createFastRecord(1, 0), createFastRecord(2, 2), createFastRecord(3, 3)],
      [],
    );

    expect(uninterrupted.streakDays).toBe(3);
    expect(uninterrupted.streakIntensity).toBe(1);
    expect(withOneMissedDay.missedDaysInLine).toBe(1);
    expect(withOneMissedDay.streakDays).toBe(4);
    expect(withOneMissedDay.streakIntensity).toBeCloseTo(0.8);
    expect(withOneMissedDay.streakIntensity).toBeGreaterThan(0.25);
  });

  it('retorna os títulos corretos de acordo com o nível', () => {

    expect(getLevelTitle(1)).toBe('Aprendiz');
    expect(getLevelTitle(2)).toBe('Iniciado');
    expect(getLevelTitle(3)).toBe('Consistente');
    expect(getLevelTitle(5)).toBe('Disciplinado');
    expect(getLevelTitle(10)).toBe('Mestre da Consistência');
  });

  it('retorna os escalões de recompensas XP com desbloqueios corretos', () => {
    const tiersLevel1 = getXpRewardTiers(0, 1);
    expect(tiersLevel1[0].isUnlocked).toBe(true);
    expect(tiersLevel1[1].isUnlocked).toBe(false);

    const tiersLevel7 = getXpRewardTiers(3600, 7);
    expect(tiersLevel7.every((t) => t.isUnlocked)).toBe(true);
  });

  it('calcula estatísticas incluindo refeições e treinos', () => {
    const emptyStats = summarizeLocalGamificationStats([], []);
    expect(emptyStats.activeDays).toBe(0);
    expect(emptyStats.daysSinceLastActivity).toBeNull();
    expect(emptyStats.streakDays).toBe(0);

    const badgesEmpty = getGamificationBadges(emptyStats);
    expect(badgesEmpty.every((b) => !b.unlocked)).toBe(true);

    const fast = createFastRecord(1, 0);
    const meal = {
      carbsGrams: 20,
      estimatedCalories: 450,
      fatGrams: 15,
      id: 1,
      imageUrl: null,
      proteinGrams: 30,
      tags: ['ovo'],
      timestamp: FIXED_NOW,
      xpEarned: 30,
    };
    const workout = {
      durationMinutes: 45,
      effort: 'moderate' as const,
      id: 1,
      notes: null,
      timestamp: FIXED_NOW,
      type: 'Corrida',
      xpEarned: 50,
    };


    const fullStats = summarizeLocalGamificationStats([fast], [meal], [workout]);
    expect(fullStats.completedFasts).toBe(1);
    expect(fullStats.mealScans).toBe(1);
    expect(fullStats.workoutLogs).toBe(1);

    const badgesFull = getGamificationBadges({
      ...fullStats,
      streakDays: 7,
      totalFastingHours: 55,
    });
    expect(badgesFull.every((b) => b.unlocked)).toBe(true);
  });
});

