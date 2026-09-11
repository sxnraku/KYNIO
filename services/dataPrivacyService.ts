import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq, isNull } from 'drizzle-orm';
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
import { requestCloudSync } from '@/services/cloudSyncScheduler';
import {
  fastingSymptoms,
  type FastingSymptomRecord,
  fasts,
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
import {
  type FastingPrimaryGoal,
  useAppPreferencesStore,
} from '@/store/app-preferences-store';
import {
  GUIDED_TUTORIAL_STORAGE_KEY,
  useGuidedTutorialStore,
} from '@/store/guided-tutorial-store';
import {
  LEGAL_CONSENT_STORAGE_KEY,
  useLegalConsentStore,
} from '@/store/legal-consent-store';
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
  LEGAL_CONSENT_STORAGE_KEY,
  'kynio-app-preferences-v1',
  'kynio-fasting-schedule-v1',
  'kynio-subscription-v1',
  'kynio-user-progress-v1',
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
  demographics: {
    ageYears: number;
    biologicalSex: 'male' | 'female' | 'other';
    heightCm: number;
    primaryGoal?: FastingPrimaryGoal | null;
  };
  exportedAt: string;
  fastingSymptoms: FastingSymptomRecord[];
  fasts: FastRecord[];
  meals: MealRecord[];
  profile: UserProfileRecord | null;
  schemaVersion: number;
  water: {
    currentMl: number;
    dailyGoalMl: number;
    history: Record<string, number>;
  };
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

async function getFastingSymptomsForExport(): Promise<FastingSymptomRecord[]> {
  const database = await getInitializedDatabase();
  return database
    .select()
    .from(fastingSymptoms)
    .where(isNull(fastingSymptoms.deletedAt));
}

export async function collectLocalData(): Promise<LocalDataExport> {
  const [
    fastRecords,
    fastingSymptomRecords,
    mealRecords,
    profile,
    weightRecords,
    workoutRecords,
  ] = await Promise.all([
    getFastsForExport(),
    getFastingSymptomsForExport(),
    getMealsForExport(),
    getProfileForExport(),
    getWeightEntriesForExport(),
    getWorkoutsForExport(),
  ]);
  const fastingState = useFastingStore.getState();
  const preferencesState = useAppPreferencesStore.getState();
  const waterState = useWaterStore.getState();

  return {
    activeFasting: {
      goal: fastingState.goal.id,
      isActive: fastingState.isActive,
      startedAt: fastingState.startedAt,
      targetDurationMs: fastingState.targetDurationMs,
    },
    app: 'KYNIO',
    demographics: {
      ageYears: preferencesState.userAgeYears ?? 30,
      biologicalSex: preferencesState.userBiologicalSex ?? 'other',
      heightCm: preferencesState.userHeightCm ?? 170,
      primaryGoal: preferencesState.primaryGoal ?? null,
    },
    exportedAt: new Date().toISOString(),
    fastingSymptoms: fastingSymptomRecords,
    fasts: fastRecords,
    meals: mealRecords,
    profile,
    schemaVersion: LOCAL_SCHEMA_VERSION,
    water: {
      currentMl: waterState.currentMl,
      dailyGoalMl: waterState.dailyGoalMl,
      history: { ...waterState.history },
    },
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

export interface ImportDataResult {
  importedFastingSymptoms: number;
  importedFasts: number;
  importedMeals: number;
  importedWeightEntries: number;
  importedWorkouts: number;
}

export async function importAllLocalData(
  jsonString: string,
): Promise<ImportDataResult> {
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Formato JSON inválido no ficheiro selecionado.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Ficheiro de dados inválido.');
  }

  const exportObj = data as Partial<LocalDataExport>;
  if (exportObj.app !== 'KYNIO') {
    throw new Error(
      'Ficheiro não reconhecido. O ficheiro deve ser um backup oficial do KYNIO.',
    );
  }

  const database = await getInitializedDatabase();
  let importedFasts = 0;
  let importedMeals = 0;
  let importedWorkouts = 0;
  let importedWeightEntries = 0;
  let importedFastingSymptoms = 0;

  // 1. Perfil
  if (exportObj.profile) {
    const existingProfiles = await database.select().from(userProfile).limit(1);
    if (existingProfiles.length > 0) {
      await database
        .update(userProfile)
        .set({
          displayName:
            exportObj.profile.displayName ?? existingProfiles[0].displayName,
          bio: exportObj.profile.bio ?? existingProfiles[0].bio,
          currentLevel: Math.max(
            exportObj.profile.currentLevel ?? 1,
            existingProfiles[0].currentLevel,
          ),
          totalXp: Math.max(
            exportObj.profile.totalXp ?? 0,
            existingProfiles[0].totalXp,
          ),
          weightUnit:
            exportObj.profile.weightUnit ?? existingProfiles[0].weightUnit,
        })
        .where(eq(userProfile.id, existingProfiles[0].id));
    }
  }

  // 2. Jejuns
  if (Array.isArray(exportObj.fasts)) {
    for (const f of exportObj.fasts) {
      if (typeof f.startTime === 'number' && typeof f.endTime === 'number') {
        const existing = await database
          .select()
          .from(fasts)
          .where(eq(fasts.startTime, f.startTime))
          .limit(1);

        if (existing.length === 0) {
          await database.insert(fasts).values({
            completed: Boolean(f.completed),
            endTime: f.endTime,
            startTime: f.startTime,
            targetHours: f.targetHours ?? 16,
            xpEarned: f.xpEarned ?? 0,
            deletedAt: f.deletedAt ?? null,
          });
          importedFasts++;
        }
      }
    }
  }

  // 3. Refeições
  if (Array.isArray(exportObj.meals)) {
    for (const m of exportObj.meals) {
      if (typeof m.timestamp === 'number') {
        const existing = await database
          .select()
          .from(meals)
          .where(eq(meals.timestamp, m.timestamp))
          .limit(1);

        if (existing.length === 0) {
          await database.insert(meals).values({
            carbsGrams: m.carbsGrams ?? null,
            estimatedCalories: m.estimatedCalories ?? null,
            fatGrams: m.fatGrams ?? null,
            imageUrl: null,
            proteinGrams: m.proteinGrams ?? null,
            tags: Array.isArray(m.tags) ? m.tags : [],
            timestamp: m.timestamp,
            xpEarned: m.xpEarned ?? 0,
            deletedAt: m.deletedAt ?? null,
          });
          importedMeals++;
        }
      }
    }
  }

  // 4. Treinos
  if (Array.isArray(exportObj.workouts)) {
    for (const w of exportObj.workouts) {
      if (
        typeof w.timestamp === 'number' &&
        typeof w.durationMinutes === 'number'
      ) {
        const existing = await database
          .select()
          .from(workouts)
          .where(eq(workouts.timestamp, w.timestamp))
          .limit(1);

        if (existing.length === 0) {
          const effort: 'light' | 'moderate' | 'intense' =
            w.effort === 'light' || w.effort === 'intense'
              ? w.effort
              : 'moderate';
          await database.insert(workouts).values({
            durationMinutes: w.durationMinutes,
            effort,
            notes: w.notes ?? null,
            timestamp: w.timestamp,
            type: w.type ?? 'Treino',
            xpEarned: w.xpEarned ?? 0,
            deletedAt: w.deletedAt ?? null,
          });
          importedWorkouts++;
        }
      }
    }
  }

  // 5. Pesagens
  if (Array.isArray(exportObj.weightEntries)) {
    for (const we of exportObj.weightEntries) {
      if (
        typeof we.timestamp === 'number' &&
        typeof we.weightGrams === 'number'
      ) {
        const existing = await database
          .select()
          .from(weightEntries)
          .where(eq(weightEntries.timestamp, we.timestamp))
          .limit(1);

        if (existing.length === 0) {
          await database.insert(weightEntries).values({
            timestamp: we.timestamp,
            weightGrams: we.weightGrams,
            deletedAt: we.deletedAt ?? null,
          });
          importedWeightEntries++;
        }
      }
    }
  }

  // 6. Sintomas
  if (Array.isArray(exportObj.fastingSymptoms)) {
    for (const s of exportObj.fastingSymptoms) {
      if (typeof s.timestamp === 'number' && typeof s.symptomKey === 'string') {
        const existing = await database
          .select()
          .from(fastingSymptoms)
          .where(eq(fastingSymptoms.timestamp, s.timestamp))
          .limit(1);

        if (existing.length === 0) {
          await database.insert(fastingSymptoms).values({
            fastId: s.fastId ?? null,
            intensity: s.intensity ?? 1,
            notes: s.notes ?? null,
            phaseIndex: s.phaseIndex ?? 0,
            symptomKey: s.symptomKey,
            timestamp: s.timestamp,
            deletedAt: s.deletedAt ?? null,
          });
          importedFastingSymptoms++;
        }
      }
    }
  }


  // 7. Hidratação
  if (exportObj.water && typeof exportObj.water === 'object') {
    const waterStore = useWaterStore.getState();
    const mergedHistory = {
      ...waterStore.history,
      ...(exportObj.water.history || {}),
    };
    useWaterStore.setState({
      history: mergedHistory,
      dailyGoalMl: exportObj.water.dailyGoalMl || waterStore.dailyGoalMl,
      currentMl:
        exportObj.water.currentMl !== undefined
          ? exportObj.water.currentMl
          : waterStore.currentMl,
    });
  }

  // 8. Demografia
  if (exportObj.demographics && typeof exportObj.demographics === 'object') {
    const pref = useAppPreferencesStore.getState();
    if (typeof exportObj.demographics.ageYears === 'number') {
      pref.setUserAgeYears(exportObj.demographics.ageYears);
    }
    if (exportObj.demographics.biologicalSex) {
      pref.setUserBiologicalSex(exportObj.demographics.biologicalSex);
    }
    if (typeof exportObj.demographics.heightCm === 'number') {
      pref.setUserHeightCm(exportObj.demographics.heightCm);
    }
    if (exportObj.demographics.primaryGoal) {
      pref.setPrimaryGoal(exportObj.demographics.primaryGoal);
    }
  }

  // 9. Recomputar progresso e solicitar sync se configurado
  await useUserProgressStore.getState().initializeProgress();
  requestCloudSync();

  return {
    importedFastingSymptoms,
    importedFasts,
    importedMeals,
    importedWeightEntries,
    importedWorkouts,
  };
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

  useFastingStore.getState().setHydrated();
  useGuidedTutorialStore.getState().setHydrated();
}


