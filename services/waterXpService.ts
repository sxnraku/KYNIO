import AsyncStorage from '@react-native-async-storage/async-storage';

export const WATER_STORAGE_KEY = 'kynio-water-tracker-v1';

export const WATER_XP_GLASS_ML = 250;
export const WATER_XP_PER_GLASS = 5;

/**
 * XP de hidratação é determinístico: 5 XP por cada 250 ml registados.
 * Assim, o XP total de água pode ser sempre derivado do histórico diário,
 * o que permite ao sync de cloud recalculá-lo sem o perder.
 */
export function calculateWaterXp(amountMl: number): number {
  if (!Number.isFinite(amountMl) || amountMl <= 0) {
    return 0;
  }
  return Math.floor(amountMl / WATER_XP_GLASS_ML) * WATER_XP_PER_GLASS;
}

export function calculateWaterXpFromHistory(history: Record<string, number>): number {
  return Object.values(history).reduce((total, ml) => total + calculateWaterXp(ml), 0);
}

/**
 * Lê o histórico de água persistido (formato zustand/persist) e devolve o XP
 * total de hidratação. Usado pelo sync de cloud, que não acede ao store em
 * memória para evitar dependências circulares.
 */
export async function getPersistedWaterXp(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(WATER_STORAGE_KEY);
    if (!raw) {
      return 0;
    }
    const parsed = JSON.parse(raw) as { state?: { history?: Record<string, number> } };
    const history = parsed?.state?.history;
    if (!history || typeof history !== 'object') {
      return 0;
    }
    return calculateWaterXpFromHistory(history);
  } catch {
    return 0;
  }
}
