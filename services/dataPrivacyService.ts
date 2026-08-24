import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import {
  deleteAndReinitializeDatabase,
  getInitializedDatabase,
} from '@/db/client';
import { deleteCloudAccountAndData } from '@/services/cloudAuthService';
import {
  fasts,
  type FriendRecord,
  friends,
  meals,
  type FastRecord,
  type MealRecord,
  type UserProfileRecord,
  userProfile,
  type WeightEntryRecord,
  weightEntries,
  type WorkoutRecord,
  workouts,
} from '@/db/schema';
import {
  DATA_EXPORTS_DIRECTORY_NAME,
  deletePrivateLocalFiles,
} from '@/services/localMealImageService';
import { isCloudSyncConfigured } from '@/services/supabaseClient';
import { useFastingStore } from '@/store/useFastingStore';

export interface LocalDataExport {
  activeFasting: {
    goal: string;
    isActive: boolean;
    startedAt: number | null;
    targetDurationMs: number;
  };
  app: 'KYNIO';
  exportedAt: string;
  fasts: FastRecord[];
  friends: FriendRecord[];
  meals: MealRecord[];
  profile: UserProfileRecord | null;
  schemaVersion: 4;
  weightEntries: WeightEntryRecord[];
  workouts: WorkoutRecord[];
}

async function getFastsForExport(): Promise<FastRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(fasts);
}

async function getMealsForExport(): Promise<MealRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(meals);
}

async function getFriendsForExport(): Promise<FriendRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(friends);
}

async function getProfileForExport(): Promise<UserProfileRecord | null> {
  const database = await getInitializedDatabase();
  const [profile] = await database.select().from(userProfile).limit(1);
  return profile ?? null;
}

async function getWorkoutsForExport(): Promise<WorkoutRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(workouts);
}

async function getWeightEntriesForExport(): Promise<WeightEntryRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(weightEntries);
}

export async function collectLocalData(): Promise<LocalDataExport> {
  const [
    fastRecords,
    friendRecords,
    mealRecords,
    profile,
    weightRecords,
    workoutRecords,
  ] = await Promise.all([
    getFastsForExport(),
    getFriendsForExport(),
    getMealsForExport(),
    getProfileForExport(),
    getWeightEntriesForExport(),
    getWorkoutsForExport(),
  ]);
  const fastingState = useFastingStore.getState();

  return {
    activeFasting: {
      goal: fastingState.goal.id,
      isActive: fastingState.isActive,
      startedAt: fastingState.startedAt,
      targetDurationMs: fastingState.targetDurationMs,
    },
    app: 'KYNIO',
    exportedAt: new Date().toISOString(),
    fasts: fastRecords,
    friends: friendRecords,
    meals: mealRecords,
    profile,
    schemaVersion: 4,
    weightEntries: weightRecords,
    workouts: workoutRecords,
  };
}

function createExportFileName(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `kynio-dados-${timestamp}.json`;
}

function downloadJsonOnWeb(fileName: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export async function exportAllLocalData(): Promise<string> {
  const exportData = await collectLocalData();
  const json = JSON.stringify(exportData, null, 2);
  const fileName = createExportFileName();

  if (Platform.OS === 'web') {
    downloadJsonOnWeb(fileName, json);
    return fileName;
  }

  const sharingAvailable = await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      'A partilha de ficheiros não está disponível neste dispositivo.',
    );
  }

  const exportDirectory = new Directory(
    Paths.cache,
    DATA_EXPORTS_DIRECTORY_NAME,
  );
  exportDirectory.create({ idempotent: true, intermediates: true });
  const exportFile = new File(exportDirectory, fileName);
  exportFile.create({ overwrite: true });
  exportFile.write(json);

  await Sharing.shareAsync(exportFile.uri, {
    dialogTitle: 'Exportar os meus dados do KYNIO',
    mimeType: 'application/json',
    UTI: 'public.json',
  });

  return fileName;
}

export async function deleteAllLocalData(): Promise<void> {
  if (isCloudSyncConfigured) {
    await deleteCloudAccountAndData();
  }

  deletePrivateLocalFiles();
  await deleteAndReinitializeDatabase();
}
