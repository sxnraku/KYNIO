import { desc, eq } from 'drizzle-orm';

import { getInitializedDatabase } from '@/db/client';
import {
  fasts,
  meals,
  type FastRecord,
  type MealRecord,
  type UserProfileRecord,
  userProfile,
  type WorkoutRecord,
  workouts,
} from '@/db/schema';
import { calculateLevel, getXpReward } from '@/services/gamificationService';

export interface SaveFastRecordInput {
  completed: boolean;
  endTime: number;
  startTime: number;
  targetHours: number;
  xpEarned?: number;
}

export interface SaveMealRecordInput {
  carbsGrams?: number | null;
  estimatedCalories?: number | null;
  fatGrams?: number | null;
  imageUrl?: string | null;
  proteinGrams?: number | null;
  tags: string[];
  timestamp: number;
  xpEarned?: number;
}

export interface SaveWorkoutRecordInput {
  durationMinutes: number;
  effort: WorkoutRecord['effort'];
  notes?: string | null;
  timestamp: number;
  type: string;
  xpEarned?: number;
}

function requireInsertedRecord<T>(record: T | undefined, entityName: string): T {
  if (!record) {
    throw new Error(`Não foi possível guardar o registo de ${entityName}.`);
  }

  return record;
}

export async function saveFastRecord(input: SaveFastRecordInput): Promise<FastRecord> {
  const database = await getInitializedDatabase();
  const xpEarned = Math.max(0, Math.floor(input.xpEarned ?? 0));

  return database.transaction(async (transaction) => {
    const [savedRecord] = await transaction
      .insert(fasts)
      .values({ ...input, xpEarned })
      .returning();

    if (xpEarned > 0) {
      const [profile] = await transaction
        .select()
        .from(userProfile)
        .where(eq(userProfile.id, 1))
        .limit(1);

      if (!profile) {
        throw new Error('Não foi possível atualizar o perfil local.');
      }

      const totalXp = profile.totalXp + xpEarned;
      await transaction
        .update(userProfile)
        .set({ currentLevel: calculateLevel(totalXp), totalXp })
        .where(eq(userProfile.id, 1));
    }

    return requireInsertedRecord(savedRecord, 'jejum');
  });
}

export async function getFastRecords(): Promise<FastRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(fasts).orderBy(desc(fasts.startTime));
}

export async function getFastRecordById(id: number): Promise<FastRecord | null> {
  const database = await getInitializedDatabase();
  const [record] = await database.select().from(fasts).where(eq(fasts.id, id)).limit(1);
  return record ?? null;
}

export async function saveMealRecord(input: SaveMealRecordInput): Promise<MealRecord> {
  const database = await getInitializedDatabase();
  const xpEarned = Math.max(0, Math.floor(input.xpEarned ?? 0));

  return database.transaction(async (transaction) => {
    const [savedRecord] = await transaction
      .insert(meals)
      .values({ ...input, xpEarned })
      .returning();

    if (xpEarned > 0) {
      const [profile] = await transaction
        .select()
        .from(userProfile)
        .where(eq(userProfile.id, 1))
        .limit(1);

      if (!profile) {
        throw new Error('Não foi possível atualizar o perfil local.');
      }

      const totalXp = profile.totalXp + xpEarned;
      await transaction
        .update(userProfile)
        .set({ currentLevel: calculateLevel(totalXp), totalXp })
        .where(eq(userProfile.id, 1));
    }

    return requireInsertedRecord(savedRecord, 'refeição');
  });
}

export async function saveScannedMealRecord(
  input: Omit<SaveMealRecordInput, 'xpEarned'>,
): Promise<MealRecord> {
  return saveMealRecord({ ...input, xpEarned: getXpReward('mealScanned') });
}

export async function getMealRecords(): Promise<MealRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(meals).orderBy(desc(meals.timestamp));
}

export async function getMealRecordById(id: number): Promise<MealRecord | null> {
  const database = await getInitializedDatabase();
  const [record] = await database.select().from(meals).where(eq(meals.id, id)).limit(1);
  return record ?? null;
}

export async function saveWorkoutRecord(
  input: SaveWorkoutRecordInput,
): Promise<WorkoutRecord> {
  const database = await getInitializedDatabase();
  const xpEarned = Math.max(0, Math.floor(input.xpEarned ?? 0));
  const durationMinutes = Math.max(1, Math.floor(input.durationMinutes));

  return database.transaction(async (transaction) => {
    const [savedRecord] = await transaction
      .insert(workouts)
      .values({ ...input, durationMinutes, xpEarned })
      .returning();

    if (xpEarned > 0) {
      const [profile] = await transaction
        .select()
        .from(userProfile)
        .where(eq(userProfile.id, 1))
        .limit(1);

      if (!profile) {
        throw new Error('Não foi possível atualizar o perfil local.');
      }

      const totalXp = profile.totalXp + xpEarned;
      await transaction
        .update(userProfile)
        .set({ currentLevel: calculateLevel(totalXp), totalXp })
        .where(eq(userProfile.id, 1));
    }

    return requireInsertedRecord(savedRecord, 'atividade');
  });
}

export async function saveLoggedWorkoutRecord(
  input: Omit<SaveWorkoutRecordInput, 'xpEarned'>,
): Promise<WorkoutRecord> {
  return saveWorkoutRecord({ ...input, xpEarned: getXpReward('workoutLogged') });
}

export async function getWorkoutRecords(): Promise<WorkoutRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(workouts).orderBy(desc(workouts.timestamp));
}

export async function getUserProfile(): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const [profile] = await database.select().from(userProfile).where(eq(userProfile.id, 1)).limit(1);

  if (!profile) {
    throw new Error('Não foi possível carregar o perfil local.');
  }

  return profile;
}

export async function updateUserProfileStreak(streakDays: number): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const normalizedStreak = Math.max(0, Math.floor(streakDays));
  const [profile] = await database
    .update(userProfile)
    .set({ streakDays: normalizedStreak })
    .where(eq(userProfile.id, 1))
    .returning();

  if (!profile) {
    throw new Error('Não foi possível atualizar a linha de consistência.');
  }

  return profile;
}

export async function acceptLegalTerms(): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const [profile] = await database
    .update(userProfile)
    .set({ termsAcceptedAt: Date.now() })
    .where(eq(userProfile.id, 1))
    .returning();

  if (!profile) {
    throw new Error('Não foi possível guardar a aceitação dos termos.');
  }

  return profile;
}
