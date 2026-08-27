import {
  ESTIMATED_METABOLIC_PHASES,
  calculateFastingTimer,
  getEstimatedMetabolicPhase,
  getEstimatedPhaseIndex,
} from '@/services/fasting';
import { FASTING_GOALS, useFastingStore } from '@/store/useFastingStore';

describe('Fasting Open Goal and Extended Phases', () => {
  it('contains extended metabolic phases with rich biological descriptions', () => {
    expect(ESTIMATED_METABOLIC_PHASES.length).toBe(6);
    expect(ESTIMATED_METABOLIC_PHASES[0].id).toBe('digestion');
    expect(ESTIMATED_METABOLIC_PHASES[1].id).toBe('glucose');
    expect(ESTIMATED_METABOLIC_PHASES[2].id).toBe('fat_burning');
    expect(ESTIMATED_METABOLIC_PHASES[3].id).toBe('ketosis');
    expect(ESTIMATED_METABOLIC_PHASES[4].id).toBe('autophagy');
    expect(ESTIMATED_METABOLIC_PHASES[5].id).toBe('deep_renewal');

    for (const phase of ESTIMATED_METABOLIC_PHASES) {
      expect(phase.title.length).toBeGreaterThan(0);
      expect(phase.description.length).toBeGreaterThan(15);
      expect(phase.physiologicalEffect.length).toBeGreaterThan(10);
      expect(phase.benefits.length).toBeGreaterThan(0);
      expect(phase.tip.length).toBeGreaterThan(0);
    }
  });

  it('correctly maps elapsed hours to phase index across extended fasts', () => {
    expect(getEstimatedPhaseIndex(2)).toBe(0); // 0-4h
    expect(getEstimatedPhaseIndex(8)).toBe(1); // 4-12h
    expect(getEstimatedPhaseIndex(14)).toBe(2); // 12-18h
    expect(getEstimatedPhaseIndex(20)).toBe(3); // 18-24h
    expect(getEstimatedPhaseIndex(36)).toBe(4); // 24-48h
    expect(getEstimatedPhaseIndex(60)).toBe(5); // 48h+
  });

  it('retrieves correct phase object based on start timestamp', () => {
    const now = 1000000000000;
    const startedAt = now - 22 * 60 * 60 * 1000; // 22h ago
    const phase = getEstimatedMetabolicPhase(startedAt, now);

    expect(phase.id).toBe('ketosis');
    expect(phase.title).toBe('Cetose Ativa');
  });

  it('includes open goal and extended protocols in FASTING_GOALS', () => {
    const openGoal = FASTING_GOALS.find((g) => g.id === 'open');
    expect(openGoal).toBeDefined();
    expect(openGoal?.label).toContain('Livre');
    expect(openGoal?.fastingHours).toBe(0);

    const monkGoal = FASTING_GOALS.find((g) => g.id === '36:0');
    expect(monkGoal).toBeDefined();
    expect(monkGoal?.fastingHours).toBe(36);
  });

  it('supports selecting open goal in useFastingStore', () => {
    const store = useFastingStore.getState();
    store.setGoal('open');

    expect(useFastingStore.getState().goal.id).toBe('open');
    expect(useFastingStore.getState().targetDurationMs).toBe(0);
  });
});
