import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

import { getInitializedDatabase } from '@/db/client';
import {
  fasts,
  friends,
  meals,
  userProfile,
  weightEntries,
  workouts,
} from '@/db/schema';
import { syncAllUserData } from '@/services/cloudSyncService';
import { requireSupabase } from '@/services/supabaseClient';

jest.mock('@/db/client', () => ({
  getInitializedDatabase: jest.fn(),
}));

jest.mock('@/services/localProfileImageService', () => ({
  deleteProfileImage: jest.fn(),
  persistRemoteProfileImage: jest.fn(async () => null),
}));

jest.mock('@/services/supabaseClient', () => ({
  isCloudSyncConfigured: true,
  requireSupabase: jest.fn(),
}));

type Row = Record<string, unknown>;

const dialect = new SQLiteSyncDialect();

function thenable<T>(value: T, extra: object = {}): T & PromiseLike<T> {
  return Object.assign(
    {
      then: (onFulfilled: (value: T) => unknown) =>
        Promise.resolve(value).then(onFulfilled),
    },
    extra,
  ) as unknown as T & PromiseLike<T>;
}

interface FakeDatabaseSeed {
  fasts?: Row[];
  friends?: Row[];
  meals?: Row[];
  profile: Row;
  weightEntries?: Row[];
  workouts?: Row[];
}

function createFakeDatabase(seed: FakeDatabaseSeed) {
  const tables = new Map<object, Row[]>([
    [fasts, [...(seed.fasts ?? [])]],
    [friends, [...(seed.friends ?? [])]],
    [meals, [...(seed.meals ?? [])]],
    [userProfile, [seed.profile]],
    [weightEntries, [...(seed.weightEntries ?? [])]],
    [workouts, [...(seed.workouts ?? [])]],
  ]);

  function selectRows(table: object, condition?: unknown): Row[] {
    const rows = tables.get(table) ?? [];

    if (!condition) {
      return rows;
    }

    const { sql } = dialect.sqlToQuery(condition as never);

    if (sql.includes('deleted_at') && sql.includes('is null')) {
      return rows.filter((row) => row.deletedAt == null);
    }

    return rows;
  }

  const database = {
    delete: (table: object) => ({
      where: (condition: unknown) => {
        const { params, sql } = dialect.sqlToQuery(condition as never);
        const rows = tables.get(table) ?? [];

        if (sql.includes('start_time')) {
          const [startTime, endTime] = params;
          tables.set(
            table,
            rows.filter(
              (row) =>
                !(row.startTime === startTime && row.endTime === endTime),
            ),
          );
        } else if (sql.includes(' in ')) {
          tables.set(
            table,
            rows.filter((row) => !params.includes(row.id)),
          );
        } else if (sql.includes('timestamp')) {
          tables.set(
            table,
            rows.filter((row) => row.timestamp !== params[0]),
          );
        }

        return Promise.resolve(undefined);
      },
    }),
    insert: (table: object) => ({
      values: (rows: Row[]) => {
        const existing = tables.get(table) ?? [];
        existing.push(...rows);
        return Promise.resolve(undefined);
      },
    }),
    select: () => ({
      from: (table: object) => {
        const allRows = selectRows(table);
        return thenable(allRows, {
          limit: (count: number) => Promise.resolve(allRows.slice(0, count)),
          orderBy: () => Promise.resolve(allRows),
          where: (condition: unknown) => {
            const filtered = selectRows(table, condition);
            return thenable(filtered, {
              limit: (count: number) =>
                Promise.resolve(filtered.slice(0, count)),
              orderBy: () => Promise.resolve(filtered),
            });
          },
        });
      },
    }),
    transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(database),
    update: (table: object) => ({
      set: (values: Row) => ({
        where: () => {
          const rows = tables.get(table) ?? [];

          if (rows[0]) {
            Object.assign(rows[0], values);
          }

          return thenable(undefined, {
            returning: () => Promise.resolve(rows.slice(0, 1)),
          });
        },
      }),
    }),
  };

  return { database, tables };
}

interface FakeSupabase {
  client: unknown;
  upserts: { rows: Row[]; table: string }[];
}

function createFakeSupabase(remote: Record<string, Row[]>): FakeSupabase {
  const upserts: { rows: Row[]; table: string }[] = [];
  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: 'user-1' } } },
        error: null,
      }),
      getUser: async () => ({
        data: { user: { id: 'user-1' } },
        error: null,
      }),
    },
    from: (table: string) => ({
      delete: () => ({
        eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
      select: () => ({
        eq: () =>
          thenable(
            { data: remote[table] ?? [], error: null },
            {
              maybeSingle: () =>
                Promise.resolve({
                  data: (remote[table] ?? [])[0] ?? null,
                  error: null,
                }),
            },
          ),
      }),
      upsert: (rows: Row[]) => {
        upserts.push({ rows, table });
        return Promise.resolve({ error: null });
      },
    }),
    storage: {
      from: () => ({
        createSignedUrl: async () => ({
          data: { signedUrl: 'https://example.invalid/avatar' },
          error: null,
        }),
        remove: async () => ({ error: null }),
        upload: async () => ({ error: null }),
      }),
    },
  };

  return { client, upserts };
}

function createProfile(): Row {
  return {
    avatarRemotePath: null,
    avatarUri: null,
    bio: '',
    cloudLinkedAt: null,
    cloudUserId: null,
    currentLevel: 1,
    displayName: 'Utilizador KYNIO',
    googleAvatarUrl: null,
    googleDisplayName: null,
    googleEmail: null,
    id: 1,
    onboardingCompletedAt: null,
    profileUpdatedAt: 100,
    streakDays: 0,
    termsAcceptedAt: null,
    totalXp: 0,
    weightUnit: 'kg',
  };
}

const EMPTY_REMOTE = {
  fasts: [],
  friend_contacts: [],
  meals: [],
  profiles: [],
  weight_entries: [],
  workouts: [],
};

const getInitializedDatabaseMock = jest.mocked(getInitializedDatabase);
const requireSupabaseMock = jest.mocked(requireSupabase);

describe('cloudSyncService — soft delete no sync', () => {
  it('envia tombstones locais para o remoto e purga-os sem os ressuscitar', async () => {
    const activeFast: Row = {
      completed: true,
      deletedAt: null,
      endTime: 2_000,
      id: 1,
      startTime: 1_000,
      targetHours: 16,
      xpEarned: 100,
    };
    const deletedFast: Row = {
      completed: true,
      deletedAt: 5_000,
      endTime: 4_000,
      id: 2,
      startTime: 3_000,
      targetHours: 16,
      xpEarned: 50,
    };
    const deletedMeal: Row = {
      carbsGrams: null,
      deletedAt: 6_000,
      estimatedCalories: null,
      fatGrams: null,
      id: 1,
      imageUrl: null,
      proteinGrams: null,
      tags: [],
      timestamp: 7_000,
      xpEarned: 30,
    };
    const { database, tables } = createFakeDatabase({
      fasts: [activeFast, deletedFast],
      meals: [deletedMeal],
      profile: createProfile(),
    });
    const { client, upserts } = createFakeSupabase({ ...EMPTY_REMOTE });
    getInitializedDatabaseMock.mockResolvedValue(database as never);
    requireSupabaseMock.mockReturnValue(client as never);

    const result = await syncAllUserData();

    const fastUpserts = upserts.filter((entry) => entry.table === 'fasts');
    const mealUpserts = upserts.filter((entry) => entry.table === 'meals');

    // Um upsert com o jejum ativo e outro com o tombstone (deleted_at preenchido).
    expect(fastUpserts).toHaveLength(2);
    expect(
      fastUpserts.some((entry) =>
        entry.rows.some(
          (row) => row.record_key === '3000:4000' && row.deleted_at === 5_000,
        ),
      ),
    ).toBe(true);
    expect(
      mealUpserts.some((entry) =>
        entry.rows.some(
          (row) => row.record_key === '7000' && row.deleted_at === 6_000,
        ),
      ),
    ).toBe(true);

    // Os tombstones foram purgados localmente após o upload.
    expect(tables.get(fasts)).toEqual([activeFast]);
    expect(tables.get(meals)).toEqual([]);

    // O XP recalculado exclui os registos apagados.
    expect(tables.get(userProfile)?.[0].totalXp).toBe(100);
    expect(result.uploadedRecords).toBeGreaterThan(0);
  });

  it('aplica deletes vindos do remoto sem reinserir tombstones', async () => {
    const localFast: Row = {
      completed: true,
      deletedAt: null,
      endTime: 2_000,
      id: 1,
      startTime: 1_000,
      targetHours: 16,
      xpEarned: 100,
    };
    const { database, tables } = createFakeDatabase({
      fasts: [localFast],
      profile: createProfile(),
    });
    const { client } = createFakeSupabase({
      ...EMPTY_REMOTE,
      fasts: [
        {
          completed: true,
          deleted_at: 9_000,
          end_time: 2_000,
          record_key: '1000:2000',
          start_time: 1_000,
          target_hours: 16,
          updated_at: 9_000,
          user_id: 'user-1',
          xp_earned: 100,
        },
      ],
    });
    getInitializedDatabaseMock.mockResolvedValue(database as never);
    requireSupabaseMock.mockReturnValue(client as never);

    const result = await syncAllUserData();

    // O jejum apagado noutro dispositivo é removido localmente e não
    // ressuscita como registo novo.
    expect(tables.get(fasts)).toEqual([]);
    expect(result.downloadedRecords).toBe(0);
    expect(tables.get(userProfile)?.[0].totalXp).toBe(0);
  });

  it('insere registos ativos vindos do remoto que não existem localmente', async () => {
    const { database, tables } = createFakeDatabase({
      profile: createProfile(),
    });
    const { client } = createFakeSupabase({
      ...EMPTY_REMOTE,
      fasts: [
        {
          completed: true,
          deleted_at: null,
          end_time: 2_000,
          record_key: '1000:2000',
          start_time: 1_000,
          target_hours: 16,
          updated_at: 2_000,
          user_id: 'user-1',
          xp_earned: 100,
        },
      ],
    });
    getInitializedDatabaseMock.mockResolvedValue(database as never);
    requireSupabaseMock.mockReturnValue(client as never);

    const result = await syncAllUserData();

    expect(tables.get(fasts)).toHaveLength(1);
    expect(tables.get(fasts)?.[0].startTime).toBe(1_000);
    expect(result.downloadedRecords).toBe(1);
    expect(tables.get(userProfile)?.[0].totalXp).toBe(100);
  });
});
