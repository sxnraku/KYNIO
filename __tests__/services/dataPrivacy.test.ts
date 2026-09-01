import AsyncStorage from '@react-native-async-storage/async-storage';

import migrations from '@/drizzle/migrations';
import {
  deleteAllLocalData,
  LOCAL_SCHEMA_VERSION,
} from '@/services/dataPrivacyService';
import { useGuidedTutorialStore } from '@/store/guided-tutorial-store';
import { useUserProgressStore } from '@/store/user-progress-store';
import { useWaterStore } from '@/store/useWaterStore';

jest.mock('@/db/client', () => ({
  deleteAndReinitializeDatabase: jest.fn(async () => ({})),
  getInitializedDatabase: jest.fn(),
}));

jest.mock('@/services/cloudAuthService', () => ({
  deleteCloudAccountAndData: jest.fn(async () => undefined),
}));

jest.mock('@/services/localMealImageService', () => ({
  DATA_EXPORTS_DIRECTORY_NAME: 'data-exports',
  deletePrivateLocalFiles: jest.fn(),
}));

jest.mock('@/services/supabaseClient', () => ({
  isCloudSyncConfigured: false,
}));

const multiRemoveMock = jest.mocked(AsyncStorage.multiRemove);

describe('dataPrivacyService', () => {
  it('deriva o schemaVersion do journal de migrações (sem hardcode)', () => {
    expect(LOCAL_SCHEMA_VERSION).toBe(migrations.journal.entries.length);
    expect(LOCAL_SCHEMA_VERSION).toBeGreaterThanOrEqual(7);
  });

  it('deleteAllLocalData remove todas as chaves AsyncStorage dos stores persistidos', async () => {
    await deleteAllLocalData();

    expect(multiRemoveMock).toHaveBeenCalledTimes(1);
    const removedKeys = multiRemoveMock.mock.calls[0][0];

    expect(removedKeys).toEqual(
      expect.arrayContaining([
        'kynio-water-tracker-v1',
        'kynio-fasting-state-v1',
        'kynio-subscription-v1',
        'kynio-guided-tutorial-v1',
        'kynio-app-preferences-v1',
        'kynio-fasting-schedule-v1',
        'kynio-weekly-challenges-v1',
      ]),
    );
  });

  it('deleteAllLocalData repõe o estado em memória dos stores locais', async () => {
    useWaterStore.setState({
      currentMl: 1_500,
      dailyGoalMl: 3_000,
      history: { '2026-08-24': 1_500 },
    });
    useGuidedTutorialStore.setState({ hasCompletedTutorial: true });
    useUserProgressStore.setState({ currentXp: 500, totalXp: 500 });

    await deleteAllLocalData();

    expect(useWaterStore.getState().currentMl).toBe(0);
    expect(useWaterStore.getState().dailyGoalMl).toBe(2_000);
    expect(useWaterStore.getState().history).toEqual({});
    expect(useGuidedTutorialStore.getState().hasCompletedTutorial).toBe(false);
    expect(useUserProgressStore.getState().totalXp).toBe(0);
  });
});
