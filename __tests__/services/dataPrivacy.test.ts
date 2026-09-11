import AsyncStorage from '@react-native-async-storage/async-storage';

import { getInitializedDatabase } from '@/db/client';
import migrations from '@/drizzle/migrations';
import {
  collectLocalData,
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
  beforeEach(() => {
    jest.clearAllMocks();
    const mockDb = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          limit: jest.fn(async () => []),
          where: jest.fn(async () => []),
        })),
      })),
    };
    (getInitializedDatabase as unknown as jest.Mock).mockResolvedValue(mockDb);
  });

  it('deriva o schemaVersion do journal de migrações (sem hardcode)', () => {
    expect(LOCAL_SCHEMA_VERSION).toBe(migrations.journal.entries.length);
    expect(LOCAL_SCHEMA_VERSION).toBeGreaterThanOrEqual(7);
  });

  it('deleteAllLocalData remove todas as chaves AsyncStorage dos stores persistidos incluindo user progress', async () => {
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
        'kynio-user-progress-v1',
        'kynio_legal_consent_v1',
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

  it('collectLocalData exporta todos os dados locais incluindo fastingSymptoms e water', async () => {
    useWaterStore.setState({
      currentMl: 750,
      dailyGoalMl: 2500,
      history: { '2026-09-10': 750 },
    });

    const exportData = await collectLocalData();

    expect(exportData.app).toBe('KYNIO');
    expect(exportData.schemaVersion).toBe(LOCAL_SCHEMA_VERSION);
    expect(exportData.fastingSymptoms).toEqual([]);
    expect(exportData.water).toEqual({
      currentMl: 750,
      dailyGoalMl: 2500,
      history: { '2026-09-10': 750 },
    });
    expect(Array.isArray(exportData.fasts)).toBe(true);
    expect(Array.isArray(exportData.meals)).toBe(true);
    expect(Array.isArray(exportData.workouts)).toBe(true);
    expect(Array.isArray(exportData.weightEntries)).toBe(true);
  });
});
