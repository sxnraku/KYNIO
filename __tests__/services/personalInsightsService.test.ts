import { calculatePersonalInsights } from '@/services/personalInsightsService';
import type { FastRecord, MealRecord } from '@/db/schema';

describe('personalInsightsService', () => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  function makeFast(endTime: number, durationHours = 16): FastRecord {
    return {
      completed: true,
      deletedAt: null,
      endTime,
      id: Math.random(),
      startTime: endTime - durationHours * 60 * 60 * 1000,
      targetHours: durationHours,
      xpEarned: 50,
    };
  }

  it('retorna hasEnoughData=false se houver menos de 2 jejuns concluídos', () => {
    const result = calculatePersonalInsights([]);
    expect(result.hasEnoughData).toBe(false);
    expect(result.mostConsistentDay).toBeNull();
  });

  it('calcula comparação semanal e identifica tendência positiva', () => {
    // 3 jejuns esta semana de 18h
    const fastsThisWeek = [
      makeFast(now - 1 * ONE_DAY_MS, 18),
      makeFast(now - 2 * ONE_DAY_MS, 18),
    ];
    // 2 jejuns semana passada de 14h
    const fastsLastWeek = [
      makeFast(now - 8 * ONE_DAY_MS, 14),
      makeFast(now - 9 * ONE_DAY_MS, 14),
    ];

    const result = calculatePersonalInsights([...fastsThisWeek, ...fastsLastWeek]);

    expect(result.hasEnoughData).toBe(true);
    expect(result.thisWeekAvgHours).toBe(18);
    expect(result.weeklyTrend).toBe('up');
    expect(result.weeklyDiffMinutes).toBe(240); // 4 horas a mais = 240 mins
  });

  it('identifica o dia da semana mais consistente e a hora típica de refeição', () => {
    // Criar vários jejuns que terminam sempre a uma terça-feira às 13:00
    // Terça-feira (getDay() = 2)
    const tuesday1 = new Date('2026-09-01T13:00:00Z').getTime();
    const tuesday2 = new Date('2026-08-25T13:00:00Z').getTime();

    const fasts = [makeFast(tuesday1), makeFast(tuesday2)];

    const meals: MealRecord[] = [
      {
        carbsGrams: 40,
        deletedAt: null,
        estimatedCalories: 600,
        fatGrams: 20,
        id: 1,
        imageUrl: null,
        proteinGrams: 30,
        tags: [],
        timestamp: tuesday1,
        xpEarned: 20,
      },
    ];

    const result = calculatePersonalInsights(fasts, meals, 'pt');

    expect(result.hasEnoughData).toBe(true);
    expect(result.mostConsistentDay).toBe('Terça-feira');
    expect(result.typicalMealStartHour).toBeDefined();
  });
});
