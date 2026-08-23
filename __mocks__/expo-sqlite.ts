const sqliteDatabaseMock = {
  closeAsync: jest.fn(async (): Promise<void> => undefined),
  closeSync: jest.fn(),
  execAsync: jest.fn(async (): Promise<void> => undefined),
  execSync: jest.fn(),
};

export const deleteDatabaseAsync = jest.fn(async (): Promise<void> => undefined);
export const deleteDatabaseSync = jest.fn();
export const openDatabaseAsync = jest.fn(async () => sqliteDatabaseMock);
export const openDatabaseSync = jest.fn(() => sqliteDatabaseMock);

export function resetExpoSqliteMock(): void {
  deleteDatabaseAsync.mockClear();
  deleteDatabaseSync.mockClear();
  openDatabaseAsync.mockClear();
  openDatabaseSync.mockClear();
  sqliteDatabaseMock.closeAsync.mockClear();
  sqliteDatabaseMock.closeSync.mockClear();
  sqliteDatabaseMock.execAsync.mockClear();
  sqliteDatabaseMock.execSync.mockClear();
}
