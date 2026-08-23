import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import {
  deleteDatabaseAsync,
  openDatabaseAsync,
  type SQLiteBindParams,
  type SQLiteDatabase,
} from 'expo-sqlite';

import * as schema from '@/db/schema';
import migrations from '@/drizzle/migrations';

const DATABASE_NAME = 'kynio.db';
const MIGRATIONS_TABLE = '__drizzle_migrations';

interface AppliedMigrationRow {
  created_at: number | string | null;
}

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

  sqliteClient = sqlite;
  return createDrizzleDatabase(sqlite);
}

export type LocalDatabase = SqliteRemoteDatabase<typeof schema>;

let database: LocalDatabase | undefined;
let databasePromise: Promise<LocalDatabase> | undefined;
let initializationPromise: Promise<LocalDatabase> | undefined;
let sqliteClient: SQLiteDatabase | undefined;

export function getDatabase(): Promise<LocalDatabase> {
  if (database) {
    return Promise.resolve(database);
  }

  databasePromise ??= createDatabase()
    .then((createdDatabase) => {
      database = createdDatabase;
      return createdDatabase;
    })
    .catch((error: unknown) => {
      databasePromise = undefined;
      throw error;
    });

  return databasePromise;
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
  initializationPromise ??= initializeDatabase().catch((error: unknown) => {
    initializationPromise = undefined;
    throw error;
  });
  return initializationPromise;
}

export async function deleteAndReinitializeDatabase(): Promise<LocalDatabase> {
  if (initializationPromise) {
    await initializationPromise;
  }

  const clientToClose = sqliteClient;
  database = undefined;
  databasePromise = undefined;
  initializationPromise = undefined;
  sqliteClient = undefined;

  if (clientToClose) {
    await clientToClose.closeAsync();
  }

  await deleteDatabaseAsync(DATABASE_NAME);
  return getInitializedDatabase();
}
