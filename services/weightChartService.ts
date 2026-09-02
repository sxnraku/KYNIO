import type { WeightEntryRecord } from '@/db/schema';
import { gramsToWeight, type WeightUnit } from '@/services/dbService';
import type { AppLanguage } from '@/store/app-preferences-store';

export type WeightTimeRange = 'week' | 'month' | 'year' | 'all';

export const WEIGHT_CHART_LAYOUT = {
  height: 160,
  paddingBottom: 28,
  paddingLeft: 32,
  paddingRight: 36,
  paddingTop: 20,
  width: 320,
} as const;

export interface WeightChartPoint {
  date: string;
  weight: number;
  x: number;
  y: number;
}

export interface WeightChartData {
  maxWeight: number;
  midWeight: number;
  minWeight: number;
  pathD: string;
  points: WeightChartPoint[];
  targetVal: number | null;
  targetY: number | null;
}

export function formatWeightValue(weightGrams: number, unit: WeightUnit): number {
  return Math.round(gramsToWeight(weightGrams, unit) * 10) / 10;
}

export function filterWeightEntries(
  entries: WeightEntryRecord[],
  timeRange: WeightTimeRange,
): WeightEntryRecord[] {
  if (!entries.length) {
    return [];
  }

  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);

  if (timeRange === 'all') {
    return sortedEntries;
  }

  const daysByRange: Record<Exclude<WeightTimeRange, 'all'>, number> = {
    month: 30,
    week: 7,
    year: 365,
  };
  const cutoff = Date.now() - daysByRange[timeRange] * 24 * 60 * 60 * 1000;
  const filteredEntries = sortedEntries.filter((entry) => entry.timestamp >= cutoff);

  return filteredEntries.length ? filteredEntries : sortedEntries;
}

export function createWeightChartData({
  entries,
  language,
  targetWeightGrams,
  unit,
}: {
  entries: WeightEntryRecord[];
  language: AppLanguage;
  targetWeightGrams: number | null;
  unit: WeightUnit;
}): WeightChartData | null {
  if (!entries.length) {
    return null;
  }

  const weights = entries.map((entry) => formatWeightValue(entry.weightGrams, unit));
  const targetVal =
    targetWeightGrams === null
      ? null
      : formatWeightValue(targetWeightGrams, unit);
  const values = targetVal === null ? weights : [...weights, targetVal];
  const minWeight = Math.floor(Math.min(...values) - 2);
  const maxWeight = Math.ceil(Math.max(...values) + 2);
  const weightSpan = Math.max(1, maxWeight - minWeight);
  const availableWidth =
    WEIGHT_CHART_LAYOUT.width -
    WEIGHT_CHART_LAYOUT.paddingLeft -
    WEIGHT_CHART_LAYOUT.paddingRight;
  const availableHeight =
    WEIGHT_CHART_LAYOUT.height -
    WEIGHT_CHART_LAYOUT.paddingTop -
    WEIGHT_CHART_LAYOUT.paddingBottom;
  const points = entries.map((entry, index) => {
    const weight = formatWeightValue(entry.weightGrams, unit);
    const x =
      entries.length === 1
        ? WEIGHT_CHART_LAYOUT.paddingLeft + availableWidth / 2
        : WEIGHT_CHART_LAYOUT.paddingLeft +
          (index / (entries.length - 1)) * availableWidth;
    const y =
      WEIGHT_CHART_LAYOUT.paddingTop +
      availableHeight -
      ((weight - minWeight) / weightSpan) * availableHeight;

    return {
      date: new Date(entry.timestamp).toLocaleDateString(
        language === 'en' ? 'en-GB' : 'pt-PT',
        { day: '2-digit', month: 'short' },
      ),
      weight,
      x,
      y,
    };
  });
  const targetY =
    targetVal === null
      ? null
      : WEIGHT_CHART_LAYOUT.paddingTop +
        availableHeight -
        ((targetVal - minWeight) / weightSpan) * availableHeight;
  const pathD = points.reduce(
    (path, point, index) =>
      `${path}${index === 0 ? 'M' : ' L'} ${point.x} ${point.y}`,
    '',
  );

  return {
    maxWeight,
    midWeight: Math.round((minWeight + maxWeight) / 2),
    minWeight,
    pathD,
    points,
    targetVal,
    targetY,
  };
}
