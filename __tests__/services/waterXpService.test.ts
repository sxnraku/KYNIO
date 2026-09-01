import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  calculateWaterXp,
  calculateWaterXpFromHistory,
  getPersistedWaterXp,
  WATER_STORAGE_KEY,
} from '@/services/waterXpService';

describe('waterXpService', () => {
  it('calcula 5 XP por cada 250 ml completos', () => {
    expect(calculateWaterXp(250)).toBe(5);
    expect(calculateWaterXp(500)).toBe(10);
    expect(calculateWaterXp(2000)).toBe(40);
  });

  it('ignora quantidades incompletas ou inválidas', () => {
    expect(calculateWaterXp(100)).toBe(0);
    expect(calculateWaterXp(0)).toBe(0);
    expect(calculateWaterXp(-250)).toBe(0);
    expect(calculateWaterXp(Number.NaN)).toBe(0);
  });

  it('deriva o XP total do histórico diário', () => {
    expect(
      calculateWaterXpFromHistory({
        '2024-01-01': 500,
        '2024-01-02': 1750,
        '2024-01-03': 100,
      }),
    ).toBe(45);
  });

  it('lê o XP do histórico persistido em AsyncStorage', async () => {
    await AsyncStorage.setItem(
      WATER_STORAGE_KEY,
      JSON.stringify({ state: { history: { '2024-01-01': 500 } }, version: 0 }),
    );

    await expect(getPersistedWaterXp()).resolves.toBe(10);
  });

  it('devolve zero quando não há histórico persistido ou está corrompido', async () => {
    await AsyncStorage.removeItem(WATER_STORAGE_KEY);
    await expect(getPersistedWaterXp()).resolves.toBe(0);

    await AsyncStorage.setItem(WATER_STORAGE_KEY, 'json-invalido');
    await expect(getPersistedWaterXp()).resolves.toBe(0);
  });
});
