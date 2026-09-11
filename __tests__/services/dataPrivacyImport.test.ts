import { getInitializedDatabase } from '@/db/client';
import {
  importAllLocalData,
  type LocalDataExport,
} from '@/services/dataPrivacyService';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useWaterStore } from '@/store/useWaterStore';

jest.mock('@/db/client', () => ({
  deleteAndReinitializeDatabase: jest.fn(async () => ({})),
  getInitializedDatabase: jest.fn(),
}));

jest.mock('@/services/cloudSyncScheduler', () => ({
  requestCloudSync: jest.fn(),
}));

describe('dataPrivacyService — importAllLocalData', () => {
  let insertValuesMock: jest.Mock;
  let updateSetMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    insertValuesMock = jest.fn(async () => [{ id: 1 }]);
    updateSetMock = jest.fn(() => ({
      where: jest.fn(async () => [{ id: 1 }]),
    }));

    const mockDb = {
      insert: jest.fn(() => ({
        values: insertValuesMock,
      })),
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          limit: jest.fn(async () => []),
          where: jest.fn(() => ({
            limit: jest.fn(async () => []),
          })),
        })),
      })),
      update: jest.fn(() => ({
        set: updateSetMock,
      })),
    };

    (getInitializedDatabase as unknown as jest.Mock).mockResolvedValue(mockDb);
  });

  it('rejeita ficheiros com JSON corrompido', async () => {
    await expect(importAllLocalData('invalid-json{')).rejects.toThrow(
      'Formato JSON inválido no ficheiro selecionado.',
    );
  });

  it('rejeita backups que não sejam da aplicação KYNIO', async () => {
    const invalidBackup = JSON.stringify({ app: 'OTHER_APP', version: 1 });
    await expect(importAllLocalData(invalidBackup)).rejects.toThrow(
      'Ficheiro não reconhecido. O ficheiro deve ser um backup oficial do KYNIO.',
    );
  });

  it('importa com sucesso os dados de um backup válido e restaura stores', async () => {
    const validBackup: LocalDataExport = {
      activeFasting: {
        goal: '16:8',
        isActive: false,
        startedAt: null,
        targetDurationMs: 57600000,
      },
      app: 'KYNIO',
      demographics: {
        ageYears: 32,
        biologicalSex: 'male',
        heightCm: 178,
      },
      exportedAt: new Date().toISOString(),
      fastingSymptoms: [
        {
          deletedAt: null,
          fastId: null,
          id: 1,
          intensity: 2,
          notes: 'Muita energia',
          phaseIndex: 1,
          symptomKey: 'energy',
          timestamp: 1700000000000,
        },
      ],
      fasts: [
        {
          completed: true,
          deletedAt: null,
          endTime: 1700057600000,
          id: 10,
          startTime: 1700000000000,
          targetHours: 16,
          xpEarned: 50,
        },
      ],
      meals: [
        {
          carbsGrams: 30,
          deletedAt: null,
          estimatedCalories: 450,
          fatGrams: 15,
          id: 5,
          imageUrl: null,
          proteinGrams: 40,
          tags: ['almoço', 'saudável'],
          timestamp: 1700060000000,
          xpEarned: 20,
        },
      ],
      profile: {
        avatarRemotePath: null,
        avatarUri: null,
        bio: 'Foco total',
        cloudLinkedAt: null,
        cloudUserId: null,
        currentLevel: 3,
        displayName: 'Renato',
        googleAvatarUrl: null,
        googleDisplayName: null,
        googleEmail: null,
        id: 1,
        onboardingCompletedAt: 1700000000000,
        profileUpdatedAt: 1700000000000,
        streakDays: 5,
        termsAcceptedAt: 1700000000000,
        totalXp: 350,
        weightUnit: 'kg',
      },
      schemaVersion: 7,
      water: {
        currentMl: 1500,
        dailyGoalMl: 2500,
        history: { '2026-09-11': 1500 },
      },
      weightEntries: [
        {
          deletedAt: null,
          id: 3,
          timestamp: 1700000000000,
          weightGrams: 75000,
        },
      ],
      workouts: [
        {
          deletedAt: null,
          durationMinutes: 45,
          effort: 'intense',
          id: 2,
          notes: 'Corrida matinal',
          timestamp: 1700070000000,
          type: 'Corrida',
          xpEarned: 30,
        },
      ],
    };

    const result = await importAllLocalData(JSON.stringify(validBackup));

    expect(result.importedFasts).toBe(1);
    expect(result.importedMeals).toBe(1);
    expect(result.importedWorkouts).toBe(1);
    expect(result.importedWeightEntries).toBe(1);
    expect(result.importedFastingSymptoms).toBe(1);

    // Valida stores
    expect(useWaterStore.getState().dailyGoalMl).toBe(2500);
    expect(useWaterStore.getState().history['2026-09-11']).toBe(1500);

    expect(useAppPreferencesStore.getState().userAgeYears).toBe(32);
    expect(useAppPreferencesStore.getState().userBiologicalSex).toBe('male');
    expect(useAppPreferencesStore.getState().userHeightCm).toBe(178);
  });
});
