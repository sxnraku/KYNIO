import { getInitializedDatabase } from '@/db/client';
import type { FastRecord } from '@/db/schema';
import { updateFastRecord } from '@/services/dbService';

jest.mock('@/db/client', () => ({
  getInitializedDatabase: jest.fn(),
}));

jest.mock('@/services/cloudSyncScheduler', () => ({
  requestCloudSync: jest.fn(),
}));

interface FakeDatabaseCalls {
  updateSets: Record<string, unknown>[];
}

function createFakeDatabase(existingRecord: FastRecord | null) {
  const calls: FakeDatabaseCalls = { updateSets: [] };

  const database = {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(async () => (existingRecord ? [existingRecord] : [])),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn((values: Record<string, unknown>) => {
        calls.updateSets.push(values);
        return {
          where: jest.fn(() => ({
            returning: jest.fn(async () => [
              {
                ...existingRecord,
                ...values,
              },
            ]),
          })),
        };
      }),
    })),
  };

  return { calls, database };
}

const getInitializedDatabaseMock = jest.mocked(getInitializedDatabase);

describe('dbService — updateFastRecord', () => {
  const sampleFast: FastRecord = {
    completed: true,
    deletedAt: null,
    endTime: 1_000 + 16 * 60 * 60 * 1_000,
    id: 42,
    startTime: 1_000,
    targetHours: 16,
    xpEarned: 100,
  };

  it('atualiza startTime e endTime recalculando completed quando duração >= targetHours', async () => {
    const { calls, database } = createFakeDatabase(sampleFast);
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    const newStart = 10_000;
    const newEnd = newStart + 16 * 60 * 60 * 1_000; // exatamente 16h
    const updated = await updateFastRecord({
      endTime: newEnd,
      id: 42,
      startTime: newStart,
    });

    expect(database.update).toHaveBeenCalledTimes(1);
    expect(calls.updateSets[0]).toEqual({
      completed: true,
      endTime: newEnd,
      startTime: newStart,
      targetHours: 16,
    });
    expect(updated.startTime).toBe(newStart);
    expect(updated.endTime).toBe(newEnd);
    expect(updated.completed).toBe(true);
  });

  it('marca completed: false quando a duração ajustada for inferior a targetHours', async () => {
    const { calls, database } = createFakeDatabase(sampleFast);
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    const newStart = 10_000;
    const newEnd = newStart + 14 * 60 * 60 * 1_000; // 14h < 16h meta
    const updated = await updateFastRecord({
      endTime: newEnd,
      id: 42,
      startTime: newStart,
    });

    expect(calls.updateSets[0].completed).toBe(false);
    expect(updated.completed).toBe(false);
  });

  it('rejeita quando endTime <= startTime', async () => {
    const { database } = createFakeDatabase(sampleFast);
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await expect(
      updateFastRecord({
        endTime: 1_000,
        id: 42,
        startTime: 2_000,
      }),
    ).rejects.toThrow('A hora de fim deve ser posterior à hora de início.');

    await expect(
      updateFastRecord({
        endTime: 1_000,
        id: 42,
        startTime: 1_000,
      }),
    ).rejects.toThrow('A hora de fim deve ser posterior à hora de início.');
  });

  it('rejeita quando o registo de jejum não existe ou está apagado', async () => {
    const { database } = createFakeDatabase(null);
    getInitializedDatabaseMock.mockResolvedValue(database as never);

    await expect(
      updateFastRecord({
        endTime: 2_000,
        id: 999,
        startTime: 1_000,
      }),
    ).rejects.toThrow('Registo de jejum não encontrado.');
  });
});
