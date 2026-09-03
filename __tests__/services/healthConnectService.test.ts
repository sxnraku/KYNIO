import { Platform } from 'react-native';

jest.mock('@/services/dbService', () => ({
  getWeightEntries: jest.fn().mockResolvedValue([]),
  getWorkoutRecords: jest.fn().mockResolvedValue([]),
  saveWeightEntry: jest.fn().mockResolvedValue({}),
  saveWorkoutRecord: jest.fn().mockResolvedValue({}),
}));

import {
  checkHealthConnectAvailability,
  syncHealthConnectData,
} from '@/services/healthConnectService';

describe('healthConnectService', () => {
  it('retorna not_supported em ambientes não-Android', async () => {
    Platform.OS = 'web';
    const status = await checkHealthConnectAvailability();
    expect(status).toBe('not_supported');

    const syncResult = await syncHealthConnectData();
    expect(syncResult.success).toBe(false);
  });

  it('permite consulta de sincronização no Android', async () => {
    Platform.OS = 'android';
    const syncResult = await syncHealthConnectData();
    expect(syncResult.success).toBe(true);
    expect(syncResult.weightsImported).toBe(0);
    expect(syncResult.workoutsImported).toBe(0);
  });
});
