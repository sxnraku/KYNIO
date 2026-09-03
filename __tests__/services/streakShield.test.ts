import { summarizeLocalGamificationStats } from '@/services/gamificationService';
import type { FastRecord, MealRecord } from '@/db/schema';

describe('Streak Shield (Escudo de Sol)', () => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  function makeFast(endTime: number): FastRecord {
    return {
      completed: true,
      deletedAt: null,
      endTime,
      id: 1,
      startTime: endTime - 16 * 60 * 60 * 1000,
      targetHours: 16,
      xpEarned: 50,
    };
  }

  it('protege a sequência quando o utilizador tem o Escudo de Sol ativo e falha um dia adicional', () => {
    // Registos com um intervalo maior (ex: 3 dias de gap)
    const fastToday = makeFast(now);
    const fastThreeDaysAgo = makeFast(now - 3 * DAY_MS);

    const statsWithShield = summarizeLocalGamificationStats(
      [fastToday, fastThreeDaysAgo],
      [],
      [],
      true, // hasStreakShield
    );

    const statsWithoutShield = summarizeLocalGamificationStats(
      [fastToday, fastThreeDaysAgo],
      [],
      [],
      false, // sem escudo
    );

    expect(statsWithShield.hasStreakShield).toBe(true);
    // Com escudo, o gap de 3 dias é absorvido
    expect(statsWithShield.streakDays).toBeGreaterThan(statsWithoutShield.streakDays);
    expect(statsWithShield.isShieldActive).toBe(true);
  });

  it('funciona normalmente para utilizadores sem escudo em dias consecutivos', () => {
    const fastToday = makeFast(now);
    const fastYesterday = makeFast(now - DAY_MS);

    const stats = summarizeLocalGamificationStats(
      [fastToday, fastYesterday],
      [],
      [],
      false,
    );

    expect(stats.hasStreakShield).toBe(false);
    expect(stats.isShieldActive).toBe(false);
    expect(stats.streakDays).toBe(2);
  });
});
