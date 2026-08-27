import { useWaterStore } from '@/store/useWaterStore';

jest.mock('@/services/dbService', () => ({
  getUserProfile: jest.fn().mockResolvedValue({ totalXp: 100 }),
  updateUserProfileXp: jest.fn().mockResolvedValue({ currentLevel: 1, totalXp: 105 }),
}));

describe('Water Tracker Store', () => {
  beforeEach(() => {
    useWaterStore.getState().resetWater();
  });

  it('inicia o registo de água a zero', () => {
    const state = useWaterStore.getState();
    expect(state.currentMl).toBe(0);
    expect(state.dailyGoalMl).toBe(2000);
  });

  it('adiciona 250ml de água por copo', async () => {
    await useWaterStore.getState().addWater(250);
    expect(useWaterStore.getState().currentMl).toBe(250);

    await useWaterStore.getState().addWater(500);
    expect(useWaterStore.getState().currentMl).toBe(750);
  });

  it('remove 250ml de água sem passar para negativo', () => {
    useWaterStore.getState().removeWater(250);
    expect(useWaterStore.getState().currentMl).toBe(0);

    useWaterStore.getState().addWater(500);
    useWaterStore.getState().removeWater(250);
    expect(useWaterStore.getState().currentMl).toBe(250);
  });

  it('permite alterar a meta diária e fazer reset manual', () => {
    useWaterStore.getState().setDailyGoal(3000);
    expect(useWaterStore.getState().dailyGoalMl).toBe(3000);

    useWaterStore.getState().addWater();
    expect(useWaterStore.getState().currentMl).toBe(250);

    useWaterStore.getState().resetWater();
    expect(useWaterStore.getState().currentMl).toBe(0);
  });
});

