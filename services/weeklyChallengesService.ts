import AsyncStorage from '@react-native-async-storage/async-storage';

export const WEEKLY_CHALLENGES_STORAGE_KEY = 'kynio-weekly-challenges-v1';

/**
 * Chave da semana ISO atual (ex.: "2026-W06"). Usada para que cada desafio
 * semanal só possa ser reclamado uma vez por semana.
 */
export function getCurrentWeekKey(now = new Date()): string {
  const day = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayOfWeek = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((day.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${day.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export interface ClaimedChallengeEntry {
  weekKey: string;
  xp: number;
}

/**
 * Lê os XP de desafios reclamados do estado persistido (formato
 * zustand/persist) e devolve o total. Usado pelo sync de cloud, que não acede
 * ao store em memória para evitar dependências circulares.
 */
export async function getPersistedChallengeXp(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(WEEKLY_CHALLENGES_STORAGE_KEY);
    if (!raw) {
      return 0;
    }
    const parsed = JSON.parse(raw) as {
      state?: { claimed?: Record<string, ClaimedChallengeEntry> };
    };
    const claimed = parsed?.state?.claimed;
    if (!claimed || typeof claimed !== 'object') {
      return 0;
    }
    return Object.values(claimed).reduce(
      (total, entry) =>
        total + (entry && Number.isFinite(entry.xp) && entry.xp > 0 ? entry.xp : 0),
      0,
    );
  } catch {
    return 0;
  }
}
