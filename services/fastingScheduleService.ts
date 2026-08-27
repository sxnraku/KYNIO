export type FastingScheduleMode = 'none' | 'daily' | 'adf' | 'custom_days';

export interface FastingScheduleConfig {
  adfAnchorDate: string; // YYYY-MM-DD anchor date to alternate
  customDays: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  enabled: boolean;
  mode: FastingScheduleMode;
  remindBeforeMinutes: number; // 0, 15, 30, 60
  startTime: string; // HH:MM (e.g. "20:00")
  targetHours: number; // e.g. 16, 18, 20, 24, 36, 48
}

export const DEFAULT_SCHEDULE_CONFIG: FastingScheduleConfig = {
  adfAnchorDate: new Date().toISOString().slice(0, 10),
  customDays: [1, 3, 5], // Monday, Wednesday, Friday
  enabled: false,
  mode: 'none',
  remindBeforeMinutes: 15,
  startTime: '20:00',
  targetHours: 16,
};

export const PRESET_SCHEDULES = [
  {
    description: 'Jejum em dias alternados (ex: 36h de jejum / 12h de alimentação)',
    descriptionEn: 'Alternate-day fasting (e.g. 36h fast / 12h eating window)',
    id: 'adf_36',
    label: 'ADF · 36h Alternado',
    labelEn: 'ADF · 36h Alternate',
    mode: 'adf' as FastingScheduleMode,
    targetHours: 36,
  },
  {
    description: 'Jejum diário equilibrado e consistente',
    descriptionEn: 'Balanced daily consistency',
    id: 'daily_16',
    label: 'Diário · 16:8',
    labelEn: 'Daily · 16:8',
    mode: 'daily' as FastingScheduleMode,
    targetHours: 16,
  },
  {
    description: 'Jejum diário prolongado com janela de 6h',
    descriptionEn: 'Prolonged daily fasting with 6h window',
    id: 'daily_18',
    label: 'Diário · 18:6',
    labelEn: 'Daily · 18:6',
    mode: 'daily' as FastingScheduleMode,
    targetHours: 18,
  },
  {
    description: 'Uma refeição por dia diária (24h)',
    descriptionEn: 'One meal a day daily routine (24h)',
    id: 'daily_24',
    label: 'OMAD · 24h Diário',
    labelEn: 'OMAD · 24h Daily',
    mode: 'daily' as FastingScheduleMode,
    targetHours: 24,
  },
  {
    description: 'Dias fixos na semana (Segunda, Quarta e Sexta)',
    descriptionEn: 'Fixed weekdays (Monday, Wednesday, Friday)',
    id: 'custom_mwf',
    label: 'Seg / Qua / Sex',
    labelEn: 'Mon / Wed / Fri',
    mode: 'custom_days' as FastingScheduleMode,
    targetHours: 16,
  },
];

/**
 * Checks if a given date is a fasting start day for ADF mode
 */
export function isAdfFastingDay(targetDate: Date, anchorDateStr: string): boolean {
  const anchor = new Date(anchorDateStr + 'T00:00:00');
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diffTime = target.getTime() - anchor.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % 2 === 0;
}

/**
 * Checks if a given date matches the configured schedule
 */
export function isScheduledFastingDay(date: Date, config: FastingScheduleConfig): boolean {
  if (!config.enabled || config.mode === 'none') {
    return false;
  }

  if (config.mode === 'daily') {
    return true;
  }

  if (config.mode === 'adf') {
    return isAdfFastingDay(date, config.adfAnchorDate);
  }

  if (config.mode === 'custom_days') {
    const dayOfWeek = date.getDay();
    return config.customDays.includes(dayOfWeek);
  }

  return false;
}

/**
 * Computes the next scheduled fast start timestamp based on config
 */
export function getNextScheduledFastDate(
  now: Date,
  config: FastingScheduleConfig,
): Date | null {
  if (!config.enabled || config.mode === 'none') {
    return null;
  }

  const [hours, minutes] = config.startTime.split(':').map(Number);
  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);

  // Search forward up to 14 days
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(candidate);
    checkDate.setDate(candidate.getDate() + i);

    if (isScheduledFastingDay(checkDate, config)) {
      if (checkDate.getTime() > now.getTime()) {
        return checkDate;
      }
    }
  }

  return null;
}

/**
 * Formats duration in hours for display (e.g. "36h")
 */
export function formatTargetHoursLabel(hours: number): string {
  return `${hours}h`;
}
