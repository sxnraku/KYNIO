import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getCurrentWeekKey,
  getPersistedChallengeXp,
  WEEKLY_CHALLENGES_STORAGE_KEY,
} from '@/services/weeklyChallengesService';
import { useWeeklyChallengesStore } from '@/store/use-weekly-challenges-store';

describe('weeklyChallengesService', () => {
  it('gera a mesma chave dentro da mesma semana ISO', () => {
    const monday = getCurrentWeekKey(new Date(2026, 1, 9));
    const sunday = getCurrentWeekKey(new Date(2026, 1, 15));
    expect(monday).toBe(sunday);
  });

  it('muda de chave na semana seguinte', () => {
    const thisWeek = getCurrentWeekKey(new Date(2026, 1, 15));
    const nextWeek = getCurrentWeekKey(new Date(2026, 1, 16));
    expect(thisWeek).not.toBe(nextWeek);
  });

  it('lê o XP total de claims persistidos', async () => {
    await AsyncStorage.setItem(
      WEEKLY_CHALLENGES_STORAGE_KEY,
      JSON.stringify({
        state: {
          claimed: {
            iron_week: { weekKey: '2026-W07', xp: 150 },
            hydration_master: { weekKey: '2026-W06', xp: 100 },
          },
        },
        version: 0,
      }),
    );

    await expect(getPersistedChallengeXp()).resolves.toBe(250);
  });

  it('devolve zero sem dados persistidos ou com dados corrompidos', async () => {
    await AsyncStorage.removeItem(WEEKLY_CHALLENGES_STORAGE_KEY);
    await expect(getPersistedChallengeXp()).resolves.toBe(0);

    await AsyncStorage.setItem(WEEKLY_CHALLENGES_STORAGE_KEY, 'json-invalido');
    await expect(getPersistedChallengeXp()).resolves.toBe(0);
  });
});

describe('Weekly Challenges Store', () => {
  it('regista o claim e reconhece-o apenas na mesma semana', () => {
    const store = useWeeklyChallengesStore.getState();
    expect(store.hasClaimedThisWeek('iron_week', '2026-W07')).toBe(false);

    store.claimChallenge('iron_week', '2026-W07', 150);

    expect(
      useWeeklyChallengesStore.getState().hasClaimedThisWeek('iron_week', '2026-W07'),
    ).toBe(true);
    expect(
      useWeeklyChallengesStore.getState().hasClaimedThisWeek('iron_week', '2026-W08'),
    ).toBe(false);
  });

  it('permite reclamar de novo numa semana diferente', () => {
    const store = useWeeklyChallengesStore.getState();
    store.claimChallenge('hydration_master', '2026-W07', 100);
    store.claimChallenge('hydration_master', '2026-W08', 100);

    expect(
      useWeeklyChallengesStore.getState().hasClaimedThisWeek('hydration_master', '2026-W08'),
    ).toBe(true);
    expect(useWeeklyChallengesStore.getState().claimed.hydration_master.weekKey).toBe(
      '2026-W08',
    );
  });
});
