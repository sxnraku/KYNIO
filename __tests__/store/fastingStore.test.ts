import {
  calculateFastingTimer,
  formatElapsedTime,
  getEstimatedMetabolicPhase,
} from '@/services/fasting';
import { useFastingStore } from '@/store/useFastingStore';

jest.mock('@/services/dbService', () => ({
  getUserProfile: jest.fn(),
  saveFastRecord: jest.fn(),
}));

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const START_TIME = new Date(2026, 7, 22, 8, 0, 0).getTime();

describe('useFastingStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(START_TIME);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calcula o tempo decorrido a partir do timestamp guardado no store', () => {
    useFastingStore.getState().startFasting();
    jest.advanceTimersByTime(2 * HOUR_IN_MILLISECONDS + 5 * 60 * 1000 + 9 * 1000);

    const state = useFastingStore.getState();
    const now = Date.now();
    const timer = calculateFastingTimer({
      isActive: state.isActive,
      now,
      startedAt: state.startedAt,
      targetDurationMs: state.targetDurationMs,
    });

    expect(state.startedAt).toBe(START_TIME);
    expect(timer.elapsedMs).toBe(2 * HOUR_IN_MILLISECONDS + 5 * 60 * 1000 + 9 * 1000);
    expect(timer.elapsedHours).toBeCloseTo(2.0858, 3);
    expect(formatElapsedTime(timer.elapsedMs)).toBe('02:05:09');
    expect(timer.progress).toBeCloseTo(timer.elapsedMs / (16 * HOUR_IN_MILLISECONDS));
  });

  it.each([
    { elapsedHours: 0, expectedId: 'digestion', expectedTitle: 'Digestão' },
    { elapsedHours: 3.99, expectedId: 'digestion', expectedTitle: 'Digestão' },
    {
      elapsedHours: 4,
      expectedId: 'glucose',
      expectedTitle: 'Início de Queima de Glicose',
    },
    {
      elapsedHours: 11.99,
      expectedId: 'glucose',
      expectedTitle: 'Início de Queima de Glicose',
    },
    { elapsedHours: 12, expectedId: 'ketosis', expectedTitle: 'Cetose Estimada' },
    { elapsedHours: 15.99, expectedId: 'ketosis', expectedTitle: 'Cetose Estimada' },
    { elapsedHours: 16, expectedId: 'autophagy', expectedTitle: 'Autofagia Estimada' },
  ])(
    'determina $expectedTitle após $elapsedHours horas',
    ({ elapsedHours, expectedId, expectedTitle }) => {
      const phase = getEstimatedMetabolicPhase(
        START_TIME,
        START_TIME + elapsedHours * HOUR_IN_MILLISECONDS,
      );

      expect(phase.id).toBe(expectedId);
      expect(phase.title).toBe(expectedTitle);
    },
  );
});
