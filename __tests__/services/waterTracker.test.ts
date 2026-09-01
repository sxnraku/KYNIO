import { useWaterStore } from '@/store/useWaterStore';
import { updateUserProfileXp } from '@/services/dbService';

jest.mock('@/services/dbService', () => ({
  getUserProfile: jest.fn().mockResolvedValue({ totalXp: 100 }),
  updateUserProfileXp: jest.fn().mockResolvedValue({ currentLevel: 1, totalXp: 105 }),
}));

const updateUserProfileXpMock = updateUserProfileXp as jest.Mock;

describe('Water Tracker Store', () => {
  beforeEach(() => {
    updateUserProfileXpMock.mockClear();
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

  it('reinicia o contador quando o dia muda, mantendo o histórico', () => {
    useWaterStore.setState({
      currentMl: 1500,
      date: '2020-01-01',
      history: { '2020-01-01': 1500 },
    });

    useWaterStore.getState().ensureToday();

    const state = useWaterStore.getState();
    expect(state.currentMl).toBe(0);
    expect(state.date).not.toBe('2020-01-01');
    expect(state.history['2020-01-01']).toBe(1500);
  });

  it('não altera o contador quando o dia é o mesmo', () => {
    useWaterStore.getState().addWater(500);

    const dateBefore = useWaterStore.getState().date;
    useWaterStore.getState().ensureToday();

    const state = useWaterStore.getState();
    expect(state.currentMl).toBe(500);
    expect(state.date).toBe(dateBefore);
  });

  it('concede 5 XP por cada 250 ml efetivamente adicionados', async () => {
    await useWaterStore.getState().addWater(250);
    expect(updateUserProfileXpMock).toHaveBeenLastCalledWith(105);

    await useWaterStore.getState().addWater(500);
    expect(updateUserProfileXpMock).toHaveBeenLastCalledWith(110);
  });

  it('subtrai o XP correspondente ao remover água', async () => {
    await useWaterStore.getState().addWater(500);
    expect(updateUserProfileXpMock).toHaveBeenLastCalledWith(110);

    await useWaterStore.getState().removeWater(250);
    expect(updateUserProfileXpMock).toHaveBeenLastCalledWith(95);
  });

  it('não concede XP por quantidades abaixo de 250 ml', async () => {
    await useWaterStore.getState().addWater(100);
    expect(useWaterStore.getState().currentMl).toBe(100);
    expect(updateUserProfileXpMock).not.toHaveBeenCalled();
  });
});

