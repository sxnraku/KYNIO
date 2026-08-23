import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import {
  deleteDatabaseAsync,
  openDatabaseAsync,
  type SQLiteBindParams,
  type SQLiteDatabase,
} from 'expo-sqlite';
import { Platform } from 'react-native';

import * as schema from '@/db/schema';
import migrations from '@/drizzle/migrations';

const DATABASE_NAME = 'kynio.db';
const MIGRATIONS_TABLE = '__drizzle_migrations';

interface AppliedMigrationRow {
  created_at: number | string | null;
}

interface DatabaseRuntimeState {
  database?: LocalDatabase;
  databasePromise?: Promise<LocalDatabase>;
  initializationPromise?: Promise<LocalDatabase>;
  sqliteClient?: SQLiteDatabase;
}

const moduleRuntime: DatabaseRuntimeState = {};
const globalRuntime = globalThis as typeof globalThis & {
  __kynioDatabaseRuntime?: DatabaseRuntimeState;
};
const runtime =
  Platform.OS === 'web'
    ? (globalRuntime.__kynioDatabaseRuntime ??= {})
    : moduleRuntime;

async function applyMigrations(sqlite: SQLiteDatabase): Promise<void> {
  await sqlite.execAsync(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at NUMERIC
    );
  `);

  const latestMigration = await sqlite.getFirstAsync<AppliedMigrationRow>(
    `SELECT created_at FROM ${MIGRATIONS_TABLE} ORDER BY created_at DESC LIMIT 1`,
  );
  const latestTimestamp = Number(latestMigration?.created_at ?? 0);

  for (const entry of migrations.journal.entries) {
    if (entry.when <= latestTimestamp) {
      continue;
    }

    const migrationKey = `m${entry.idx.toString().padStart(4, '0')}`;
    const migrationSql = migrations.migrations[migrationKey];

    if (!migrationSql) {
      throw new Error(`Migração local em falta: ${migrationKey}.`);
    }

    await sqlite.withTransactionAsync(async () => {
      await sqlite.execAsync(migrationSql);
      await sqlite.runAsync(
        `INSERT INTO ${MIGRATIONS_TABLE} (hash, created_at) VALUES (?, ?)`,
        entry.tag,
        entry.when,
      );
    });
  }
}

async function getRawRows(
  sqlite: SQLiteDatabase,
  query: string,
  params: unknown[],
): Promise<unknown[][]> {
  const statement = await sqlite.prepareAsync(query);

  try {
    const result = await statement.executeForRawResultAsync<Record<string, unknown>>(
      params as SQLiteBindParams,
    );
    return (await result.getAllAsync()) as unknown[][];
  } finally {
    await statement.finalizeAsync();
  }
}

function createDrizzleDatabase(sqlite: SQLiteDatabase): LocalDatabase {
  return drizzle(
    async (query, params, method) => {
      if (method === 'run') {
        const result = await sqlite.runAsync(query, params as SQLiteBindParams);
        return { rows: [{ changes: result.changes, lastInsertRowId: result.lastInsertRowId }] };
      }

      const rows = await getRawRows(sqlite, query, params);

      if (method === 'get') {
        return { rows: rows[0] ?? [] };
      }

      return { rows };
    },
    { schema },
  );
}

async function createDatabase(): Promise<LocalDatabase> {
  const sqlite = await openDatabaseAsync(DATABASE_NAME, { enableChangeListener: true });
  await sqlite.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await applyMigrations(sqlite);

  runtime.sqliteClient = sqlite;
  return createDrizzleDatabase(sqlite);
}

function isInvalidWebVfsState(error: unknown): boolean {
  return (
    Platform.OS === 'web' &&
    error instanceof Error &&
    error.message.toLowerCase().includes('invalid vfs state')
  );
}

async function createDatabaseWithWebRecovery(): Promise<LocalDatabase> {
  try {
    return await createDatabase();
  } catch (error) {
    if (!isInvalidWebVfsState(error)) {
      throw error;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 200);
    });
    return createDatabase();
  }
}

export type LocalDatabase = SqliteRemoteDatabase<typeof schema>;

export function getDatabase(): Promise<LocalDatabase> {
  if (runtime.database) {
    return Promise.resolve(runtime.database);
  }

  runtime.databasePromise ??= createDatabaseWithWebRecovery()
    .then((createdDatabase) => {
      runtime.database = createdDatabase;
      return createdDatabase;
    })
    .catch((error: unknown) => {
      runtime.databasePromise = undefined;
      throw error;
    });

  return runtime.databasePromise;
}

async function initializeDatabase(): Promise<LocalDatabase> {
  const localDatabase = await getDatabase();

  await localDatabase
    .insert(schema.userProfile)
    .values({ id: 1 })
    .onConflictDoNothing({ target: schema.userProfile.id });

  return localDatabase;
}

export function getInitializedDatabase(): Promise<LocalDatabase> {
  runtime.initializationPromise ??= initializeDatabase().catch((error: unknown) => {
    runtime.initializationPromise = undefined;
    throw error;
  });
  return runtime.initializationPromise;
}

export async function deleteAndReinitializeDatabase(): Promise<LocalDatabase> {
  if (runtime.initializationPromise) {
    await runtime.initializationPromise;
  }

  const clientToClose = runtime.sqliteClient;
  runtime.database = undefined;
  runtime.databasePromise = undefined;
  runtime.initializationPromise = undefined;
  runtime.sqliteClient = undefined;

  if (clientToClose) {
    await clientToClose.closeAsync();
  }

  await deleteDatabaseAsync(DATABASE_NAME);
  return getInitializedDatabase();
}
