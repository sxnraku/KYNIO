import { useFastingScheduleStore } from '@/store/use-fasting-schedule-store';

describe('useFastingScheduleStore', () => {
  beforeEach(() => {
    useFastingScheduleStore.getState().resetSchedule();
  });

  it('initializes with default schedule config (disabled)', () => {
    const state = useFastingScheduleStore.getState();
    expect(state.enabled).toBe(false);
    expect(state.mode).toBe('none');
    expect(state.startTime).toBe('20:00');
    expect(state.targetHours).toBe(16);
  });

  it('updates schedule parameters properly', () => {
    const store = useFastingScheduleStore.getState();
    store.updateConfig({
      enabled: true,
      mode: 'adf',
      remindBeforeMinutes: 30,
      startTime: '19:30',
      targetHours: 36,
    });

    const updated = useFastingScheduleStore.getState();
    expect(updated.enabled).toBe(true);
    expect(updated.mode).toBe('adf');
    expect(updated.targetHours).toBe(36);
    expect(updated.startTime).toBe('19:30');
    expect(updated.remindBeforeMinutes).toBe(30);
  });

  it('computes isTodayFastDay when daily mode is active', () => {
    const store = useFastingScheduleStore.getState();
    store.updateConfig({
      enabled: true,
      mode: 'daily',
    });

    expect(useFastingScheduleStore.getState().isTodayFastDay()).toBe(true);
  });

  it('resets schedule to defaults when requested', () => {
    const store = useFastingScheduleStore.getState();
    store.updateConfig({
      enabled: true,
      mode: 'adf',
      targetHours: 36,
    });

    store.resetSchedule();

    const resetState = useFastingScheduleStore.getState();
    expect(resetState.enabled).toBe(false);
    expect(resetState.mode).toBe('none');
    expect(resetState.targetHours).toBe(16);
  });
});
