import type { FastRecord, MealRecord } from '@/db/schema';

export interface PersonalFactualInsights {
  hasEnoughData: boolean;
  mostConsistentDay: string | null;
  thisWeekAvgHours: number;
  typicalMealStartHour: string | null;
  weeklyDiffMinutes: number;
  weeklyTrend: 'up' | 'down' | 'equal';
}

const DAY_NAMES_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DAY_NAMES_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function calculatePersonalInsights(
  fastRecords: FastRecord[],
  mealRecords: MealRecord[] = [],
  language: 'en' | 'pt' = 'pt',
): PersonalFactualInsights {
  const completedFasts = fastRecords.filter((f) => f.completed);

  if (completedFasts.length < 2) {
    return {
      hasEnoughData: false,
      mostConsistentDay: null,
      thisWeekAvgHours: 0,
      typicalMealStartHour: null,
      weeklyDiffMinutes: 0,
      weeklyTrend: 'equal',
    };
  }

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * ONE_DAY_MS;
  const fourteenDaysAgo = now - 14 * ONE_DAY_MS;

  // 1. Comparação Semanal (últimos 7 dias vs 7 dias anteriores)
  const thisWeekFasts = completedFasts.filter((f) => f.endTime >= sevenDaysAgo);
  const prevWeekFasts = completedFasts.filter(
    (f) => f.endTime >= fourteenDaysAgo && f.endTime < sevenDaysAgo,
  );

  const getFastingHours = (fasts: FastRecord[]) =>
    fasts.reduce((acc, f) => acc + Math.max(0, f.endTime - f.startTime), 0) /
    (60 * 60 * 1000);

  const thisWeekHours = getFastingHours(thisWeekFasts);
  const prevWeekHours = getFastingHours(prevWeekFasts);

  const thisWeekAvg = thisWeekFasts.length > 0 ? thisWeekHours / thisWeekFasts.length : 0;
  const prevWeekAvg = prevWeekFasts.length > 0 ? prevWeekHours / prevWeekFasts.length : 0;

  const diffHours = thisWeekAvg - prevWeekAvg;
  const weeklyDiffMinutes = Math.round(diffHours * 60);

  let weeklyTrend: 'up' | 'down' | 'equal' = 'equal';
  if (weeklyDiffMinutes > 15) {
    weeklyTrend = 'up';
  } else if (weeklyDiffMinutes < -15) {
    weeklyTrend = 'down';
  }

  // 2. Dia da semana mais consistente
  const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const fast of completedFasts) {
    const dayOfWeek = new Date(fast.endTime).getDay();
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] ?? 0) + 1;
  }

  let bestDayIndex = 0;
  let maxCount = -1;
  for (let d = 0; d < 7; d++) {
    if ((dayCounts[d] ?? 0) > maxCount) {
      maxCount = dayCounts[d] ?? 0;
      bestDayIndex = d;
    }
  }

  const dayNames = language === 'en' ? DAY_NAMES_EN : DAY_NAMES_PT;
  const mostConsistentDay = maxCount > 0 ? dayNames[bestDayIndex] : null;

  // 3. Janela alimentar típica (hora mais comum da primeira refeição ou fim de jejum)
  const timestamps = [
    ...mealRecords.map((m) => m.timestamp),
    ...completedFasts.map((f) => f.endTime),
  ];

  let typicalMealStartHour: string | null = null;
  if (timestamps.length > 0) {
    const hourBuckets: Record<number, number> = {};
    for (const ts of timestamps) {
      const h = new Date(ts).getHours();
      hourBuckets[h] = (hourBuckets[h] ?? 0) + 1;
    }

    let topHour = 13;
    let topHourCount = -1;
    for (const [hourStr, count] of Object.entries(hourBuckets)) {
      if (count > topHourCount) {
        topHourCount = count;
        topHour = parseInt(hourStr, 10);
      }
    }
    typicalMealStartHour = `${String(topHour).padStart(2, '0')}:00`;
  }

  return {
    hasEnoughData: true,
    mostConsistentDay,
    thisWeekAvgHours: Number(thisWeekAvg.toFixed(1)),
    typicalMealStartHour,
    weeklyDiffMinutes,
    weeklyTrend,
  };
}
