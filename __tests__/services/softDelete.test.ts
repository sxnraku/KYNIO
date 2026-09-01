import { getInitializedDatabase } from '@/db/client';
import type { FastRecord, MealRecord } from '@/db/schema';
import {
  deleteFastRecord,
  deleteMealRecord,
  getFastRecordById,
  getFastRecords,
  getMealRecords,
} from '@/services/dbService';

jest.mock('@/db/client', () => ({
  getInitializedDatabase: jest.fn(),
}));

jest.mock('@/services/cloudSyncScheduler', () => ({
  requestCloudSync: jest.fn(),
}));

interface FakeDatabaseCalls {
  selectWheres: unknown[];
  updateSets: Record<string, unknown>[];
}

interface FakeDatabase {
  delete: jest.Mock;
  insert: jest.Mock;
  select: jest.Mock;
  transaction: (callback: (tx: FakeDatabase) => Promise<unknown>) => Promise<unknown>;
  update: jest.Mock;
}

function createFakeDatabase(selectRows: Record<string, unknown>[] = []) {
  const calls: FakeDatabaseCalls = { selectWheres: [], updateSets: [] };

  const database: FakeDatabase = {
    delete: jest.fn(() => ({
      where: jest.fn(async (): Promise<void> => undefined),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(async () => [{}]),
      })),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        limit: jest.fn(async () => selectRows),
        orderBy: jest.fn(async () => selectRows),
        where: jest.fn((condition: unknown) => {
          calls.selectWheres.push(condition);
          return {
            limit: jest.fn(async () => selectRows),
            orderBy: jest.fn(async () => selectRows),
          };
        }),
      })),
    })),
    transaction: async (callback) => callback(database),
    update: jest.fn(() => ({
      set: jest.fn((values: Record<string, unknown>) => {
        calls.updateSets.push(values);
        return { where: jest.fn(async (): Promise<void> => undefined) };
      }),
    })),
  };

  return { calls, database };
}

const getInitializedDatabaseMock = jest.mocked(getInitializedDatabase);

describe('dbService — soft delete', () => {
  it('deleteFastRecord marca deletedAt em vez de apagar a linha', async () => {
    const { calls, database } = createFakeDatabase();
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await deleteFastRecord(7);

    expect(database.update).toHaveBeenCalledTimes(1);
    expect(database.delete).not.toHaveBeenCalled();
    expect(calls.updateSets).toHaveLength(1);
    expect(typeof calls.updateSets[0].deletedAt).toBe('number');
  });

  it('deleteMealRecord marca deletedAt em vez de apagar a linha', async () => {
    const { calls, database } = createFakeDatabase();
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await deleteMealRecord(3);

    expect(database.update).toHaveBeenCalledTimes(1);
    expect(database.delete).not.toHaveBeenCalled();
    expect(calls.updateSets).toHaveLength(1);
    expect(typeof calls.updateSets[0].deletedAt).toBe('number');
  });

  it('getFastRecords aplica filtro de tombstones (deletedAt IS NULL)', async () => {
    const { calls, database } = createFakeDatabase();
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await getFastRecords();

    expect(calls.selectWheres).toHaveLength(1);
    expect(calls.selectWheres[0]).toBeDefined();
  });

  it('getMealRecords aplica filtro de tombstones (deletedAt IS NULL)', async () => {
    const { calls, database } = createFakeDatabase();
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await getMealRecords();

    expect(calls.selectWheres).toHaveLength(1);
    expect(calls.selectWheres[0]).toBeDefined();
  });

  it('getFastRecordById não devolve registos com tombstone', async () => {
    const deletedFast: FastRecord = {
      completed: true,
      deletedAt: 123,
      endTime: 2_000,
      id: 1,
      startTime: 1_000,
      targetHours: 16,
      xpEarned: 100,
    };
    const { database } = createFakeDatabase([deletedFast]);
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await expect(getFastRecordById(1)).resolves.toBeNull();

    const activeFast: FastRecord = { ...deletedFast, deletedAt: null };
    const { database: activeDatabase } = createFakeDatabase([activeFast]);
    getInitializedDatabaseMock.mockResolvedValue(activeDatabase as never);

    await expect(getFastRecordById(1)).resolves.toEqual(activeFast);
  });
});

// Garante que o tipo MealRecord continua a expor deletedAt (regressão de schema).
const mealTypeCheck: MealRecord = {
  carbsGrams: null,
  deletedAt: null,
  estimatedCalories: null,
  fatGrams: null,
  id: 1,
  imageUrl: null,
  proteinGrams: null,
  tags: [],
  timestamp: 1,
  xpEarned: 0,
};
void mealTypeCheck;
