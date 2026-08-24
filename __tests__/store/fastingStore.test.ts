import {
  calculateFastingTimer,
  formatElapsedTime,
  getEstimatedMetabolicPhase,
} from '@/services/fasting';
import { FASTING_STORAGE_KEY, useFastingStore } from '@/store/useFastingStore';

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
    jest.advanceTimersByTime(
      2 * HOUR_IN_MILLISECONDS + 5 * 60 * 1000 + 9 * 1000,
    );

    const state = useFastingStore.getState();
    const now = Date.now();
    const timer = calculateFastingTimer({
      isActive: state.isActive,
      now,
      startedAt: state.startedAt,
      targetDurationMs: state.targetDurationMs,
    });

    expect(state.startedAt).toBe(START_TIME);
    expect(timer.elapsedMs).toBe(
      2 * HOUR_IN_MILLISECONDS + 5 * 60 * 1000 + 9 * 1000,
    );
    expect(timer.elapsedHours).toBeCloseTo(2.0858, 3);
    expect(formatElapsedTime(timer.elapsedMs)).toBe('02:05:09');
    expect(timer.progress).toBeCloseTo(
      timer.elapsedMs / (16 * HOUR_IN_MILLISECONDS),
    );
  });

  it('retoma o jejum pelo timestamp depois de a app ser totalmente fechada', async () => {
    await useFastingStore.persist.clearStorage();
    useFastingStore.getState().startFasting();
    await Promise.resolve();

    const persistedState = await AsyncStorage.getItem(FASTING_STORAGE_KEY);
    expect(persistedState).toContain(String(START_TIME));

    useFastingStore.setState({ isActive: false, startedAt: null });
    await AsyncStorage.setItem(FASTING_STORAGE_KEY, persistedState!);
    jest.setSystemTime(START_TIME + 24 * HOUR_IN_MILLISECONDS);
    await useFastingStore.persist.rehydrate();

    const restored = useFastingStore.getState();
    const timer = calculateFastingTimer({
      isActive: restored.isActive,
      now: Date.now(),
      startedAt: restored.startedAt,
      targetDurationMs: restored.targetDurationMs,
    });

    expect(restored.isActive).toBe(true);
    expect(restored.startedAt).toBe(START_TIME);
    expect(timer.elapsedMs).toBe(24 * HOUR_IN_MILLISECONDS);
  });

  it('disponibiliza o objetivo de jejum de 24 horas', () => {
    useFastingStore.getState().setGoal('24:0');

    expect(useFastingStore.getState().goal).toMatchObject({
      eatingHours: 0,
      fastingHours: 24,
      id: '24:0',
    });
    expect(useFastingStore.getState().targetDurationMs).toBe(
      24 * HOUR_IN_MILLISECONDS,
    );
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
    {
      elapsedHours: 12,
      expectedId: 'ketosis',
      expectedTitle: 'Cetose Estimada',
    },
    {
      elapsedHours: 15.99,
      expectedId: 'ketosis',
      expectedTitle: 'Cetose Estimada',
    },
    {
      elapsedHours: 16,
      expectedId: 'autophagy',
      expectedTitle: 'Autofagia Estimada',
    },
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
import AsyncStorage from '@react-native-async-storage/async-storage';
