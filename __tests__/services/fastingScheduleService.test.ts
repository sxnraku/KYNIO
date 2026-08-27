import {
  DEFAULT_SCHEDULE_CONFIG,
  FastingScheduleConfig,
  formatTargetHoursLabel,
  getNextScheduledFastDate,
  isAdfFastingDay,
  isScheduledFastingDay,
} from '@/services/fastingScheduleService';

describe('fastingScheduleService', () => {
  describe('isAdfFastingDay', () => {
    it('returns true on anchor date and every 2nd day afterwards', () => {
      const anchorDate = '2026-08-01'; // Day 0 -> Fast day
      const day0 = new Date('2026-08-01T10:00:00');
      const day1 = new Date('2026-08-02T10:00:00');
      const day2 = new Date('2026-08-03T10:00:00');
      const day3 = new Date('2026-08-04T10:00:00');

      expect(isAdfFastingDay(day0, anchorDate)).toBe(true);
      expect(isAdfFastingDay(day1, anchorDate)).toBe(false);
      expect(isAdfFastingDay(day2, anchorDate)).toBe(true);
      expect(isAdfFastingDay(day3, anchorDate)).toBe(false);
    });
  });

  describe('isScheduledFastingDay', () => {
    it('returns false when schedule is disabled', () => {
      const config: FastingScheduleConfig = {
        ...DEFAULT_SCHEDULE_CONFIG,
        enabled: false,
        mode: 'daily',
      };
      expect(isScheduledFastingDay(new Date(), config)).toBe(false);
    });

    it('returns true every day for daily mode when enabled', () => {
      const config: FastingScheduleConfig = {
        ...DEFAULT_SCHEDULE_CONFIG,
        enabled: true,
        mode: 'daily',
      };
      expect(isScheduledFastingDay(new Date('2026-08-27'), config)).toBe(true);
      expect(isScheduledFastingDay(new Date('2026-08-28'), config)).toBe(true);
    });

    it('checks custom weekdays correctly', () => {
      // 1 = Monday, 3 = Wednesday, 5 = Friday
      const config: FastingScheduleConfig = {
        ...DEFAULT_SCHEDULE_CONFIG,
        customDays: [1, 3, 5],
        enabled: true,
        mode: 'custom_days',
      };

      // 2026-08-24 is Monday (1)
      expect(isScheduledFastingDay(new Date('2026-08-24T12:00:00'), config)).toBe(true);
      // 2026-08-25 is Tuesday (2)
      expect(isScheduledFastingDay(new Date('2026-08-25T12:00:00'), config)).toBe(false);
      // 2026-08-26 is Wednesday (3)
      expect(isScheduledFastingDay(new Date('2026-08-26T12:00:00'), config)).toBe(true);
    });
  });

  describe('getNextScheduledFastDate', () => {
    it('returns null when schedule is disabled', () => {
      const now = new Date('2026-08-27T10:00:00');
      expect(getNextScheduledFastDate(now, DEFAULT_SCHEDULE_CONFIG)).toBeNull();
    });

    it('calculates the next start time today if start time is in the future', () => {
      const now = new Date('2026-08-27T10:00:00');
      const config: FastingScheduleConfig = {
        ...DEFAULT_SCHEDULE_CONFIG,
        enabled: true,
        mode: 'daily',
        startTime: '20:00',
      };

      const nextDate = getNextScheduledFastDate(now, config);
      expect(nextDate).not.toBeNull();
      expect(nextDate?.getHours()).toBe(20);
      expect(nextDate?.getMinutes()).toBe(0);
      expect(nextDate?.getDate()).toBe(27);
    });

    it('calculates the next start time tomorrow if start time has already passed today', () => {
      const now = new Date('2026-08-27T21:00:00');
      const config: FastingScheduleConfig = {
        ...DEFAULT_SCHEDULE_CONFIG,
        enabled: true,
        mode: 'daily',
        startTime: '20:00',
      };

      const nextDate = getNextScheduledFastDate(now, config);
      expect(nextDate).not.toBeNull();
      expect(nextDate?.getHours()).toBe(20);
      expect(nextDate?.getDate()).toBe(28);
    });
  });

  describe('formatTargetHoursLabel', () => {
    it('formats hours with suffix', () => {
      expect(formatTargetHoursLabel(16)).toBe('16h');
      expect(formatTargetHoursLabel(36)).toBe('36h');
    });
  });
});
