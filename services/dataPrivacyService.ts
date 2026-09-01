import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNull } from 'drizzle-orm';
import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { StoreApi, UseBoundStore } from 'zustand';

import {
  deleteAndReinitializeDatabase,
  getInitializedDatabase,
} from '@/db/client';
import migrations from '@/drizzle/migrations';
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
import { WATER_STORAGE_KEY } from '@/services/waterXpService';
import { WEEKLY_CHALLENGES_STORAGE_KEY } from '@/services/weeklyChallengesService';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import {
  GUIDED_TUTORIAL_STORAGE_KEY,
  useGuidedTutorialStore,
} from '@/store/guided-tutorial-store';
import { useLegalConsentStore } from '@/store/legal-consent-store';
import { useFastingScheduleStore } from '@/store/use-fasting-schedule-store';
import { useSubscriptionStore } from '@/store/use-subscription-store';
import { useWeeklyChallengesStore } from '@/store/use-weekly-challenges-store';
import {
  FASTING_STORAGE_KEY,
  useFastingStore,
} from '@/store/useFastingStore';
import { useWaterStore } from '@/store/useWaterStore';
import { useUserProgressStore } from '@/store/user-progress-store';

// Versão do schema local derivada do journal de migrações do Drizzle — nunca
// hardcoded, para não ficar desatualizada quando se adicionam migrações.
export const LOCAL_SCHEMA_VERSION = migrations.journal.entries.length;

// Chaves AsyncStorage dos stores com persist() do Zustand. Manter alinhado
// com os `name:` de cada store em store/.
const PERSISTED_STORAGE_KEYS = [
  FASTING_STORAGE_KEY,
  GUIDED_TUTORIAL_STORAGE_KEY,
  WATER_STORAGE_KEY,
  WEEKLY_CHALLENGES_STORAGE_KEY,
  'kynio-app-preferences-v1',
  'kynio-fasting-schedule-v1',
  'kynio-subscription-v1',
];

// Stores cujo estado em memória é reposto após a limpeza (RGPD).
const LOCAL_STORES: UseBoundStore<StoreApi<object>>[] = [
  useAppPreferencesStore,
  useFastingScheduleStore,
  useFastingStore,
  useGuidedTutorialStore,
  useLegalConsentStore,
  useSubscriptionStore,
  useUserProgressStore,
  useWaterStore,
  useWeeklyChallengesStore,
];

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
  schemaVersion: number;
  weightEntries: WeightEntryRecord[];
  workouts: WorkoutRecord[];
}

async function getFastsForExport(): Promise<FastRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(fasts).where(isNull(fasts.deletedAt));
}

async function getMealsForExport(): Promise<MealRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(meals).where(isNull(meals.deletedAt));
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
  return database.select().from(workouts).where(isNull(workouts.deletedAt));
}

async function getWeightEntriesForExport(): Promise<WeightEntryRecord[]> {
  const database = await getInitializedDatabase();
  return database
    .select()
    .from(weightEntries)
    .where(isNull(weightEntries.deletedAt));
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
    schemaVersion: LOCAL_SCHEMA_VERSION,
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

  // RGPD: limpa também os stores persistidos em AsyncStorage (água, jejum
  // ativo, subscrição, tutorial, preferências, desafios semanais, …) e
  // repõe o estado em memória de todos os stores locais.
  await AsyncStorage.multiRemove(PERSISTED_STORAGE_KEYS);

  for (const store of LOCAL_STORES) {
    store.setState(store.getInitialState(), true);
  }
}
