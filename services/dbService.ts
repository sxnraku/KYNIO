import { desc, eq } from 'drizzle-orm';

import { getInitializedDatabase } from '@/db/client';
import {
  fasts,
  type FriendRecord,
  friends,
  meals,
  type FastRecord,
  type MealRecord,
  type UserProfileRecord,
  userProfile,
  type WorkoutRecord,
  workouts,
  type WeightEntryRecord,
  weightEntries,
} from '@/db/schema';
import { calculateLevel, getXpReward } from '@/services/gamificationService';
import { requestCloudSync } from '@/services/cloudSyncScheduler';

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

export interface UpdateLocalProfileInput {
  avatarRemotePath?: string | null;
  avatarUri: string | null;
  bio: string;
  displayName: string;
}

export interface LinkCloudAccountInput {
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  userId: string;
}

export type WeightUnit = 'kg' | 'lb';

export interface CompleteProfileOnboardingInput {
  displayName: string;
  initialWeight?: number;
  weightUnit: WeightUnit;
}

export interface SaveWeightEntryInput {
  timestamp?: number;
  unit: WeightUnit;
  weight: number;
}

const GRAMS_PER_POUND = 453.59237;

export function weightToGrams(weight: number, unit: WeightUnit): number {
  if (!Number.isFinite(weight) || weight <= 0 || weight > 2_000) {
    throw new Error('Introduz um peso válido superior a zero.');
  }

  return Math.round(unit === 'kg' ? weight * 1_000 : weight * GRAMS_PER_POUND);
}

export function gramsToWeight(weightGrams: number, unit: WeightUnit): number {
  const rawWeight =
    unit === 'kg' ? weightGrams / 1_000 : weightGrams / GRAMS_PER_POUND;
  return Math.round(rawWeight * 10) / 10;
}

function requireInsertedRecord<T>(
  record: T | undefined,
  entityName: string,
): T {
  if (!record) {
    throw new Error(`Não foi possível guardar o registo de ${entityName}.`);
  }

  return record;
}

export async function saveFastRecord(
  input: SaveFastRecordInput,
): Promise<FastRecord> {
  const database = await getInitializedDatabase();
  const xpEarned = Math.max(0, Math.floor(input.xpEarned ?? 0));

  const record = await database.transaction(async (transaction) => {
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

  requestCloudSync();
  return record;
}

export async function getFastRecords(): Promise<FastRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(fasts).orderBy(desc(fasts.startTime));
}

export async function getFastRecordById(
  id: number,
): Promise<FastRecord | null> {
  const database = await getInitializedDatabase();
  const [record] = await database
    .select()
    .from(fasts)
    .where(eq(fasts.id, id))
    .limit(1);
  return record ?? null;
}

export async function deleteFastRecord(id: number): Promise<void> {
  const database = await getInitializedDatabase();
  await database.delete(fasts).where(eq(fasts.id, id));
  requestCloudSync();
}


export async function saveMealRecord(
  input: SaveMealRecordInput,
): Promise<MealRecord> {
  const database = await getInitializedDatabase();
  const xpEarned = Math.max(0, Math.floor(input.xpEarned ?? 0));

  const record = await database.transaction(async (transaction) => {
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

  requestCloudSync();
  return record;
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

export async function getMealRecordById(
  id: number,
): Promise<MealRecord | null> {
  const database = await getInitializedDatabase();
  const [record] = await database
    .select()
    .from(meals)
    .where(eq(meals.id, id))
    .limit(1);
  return record ?? null;
}

export async function saveWorkoutRecord(
  input: SaveWorkoutRecordInput,
): Promise<WorkoutRecord> {
  const database = await getInitializedDatabase();
  const xpEarned = Math.max(0, Math.floor(input.xpEarned ?? 0));
  const durationMinutes = Math.max(1, Math.floor(input.durationMinutes));

  const record = await database.transaction(async (transaction) => {
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

  requestCloudSync();
  return record;
}

export async function saveLoggedWorkoutRecord(
  input: Omit<SaveWorkoutRecordInput, 'xpEarned'>,
): Promise<WorkoutRecord> {
  return saveWorkoutRecord({
    ...input,
    xpEarned: getXpReward('workoutLogged'),
  });
}

export async function getWorkoutRecords(): Promise<WorkoutRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(workouts).orderBy(desc(workouts.timestamp));
}

export async function getWeightEntries(): Promise<WeightEntryRecord[]> {
  const database = await getInitializedDatabase();
  return database
    .select()
    .from(weightEntries)
    .orderBy(desc(weightEntries.timestamp));
}

export async function saveWeightEntry(
  input: SaveWeightEntryInput,
): Promise<WeightEntryRecord> {
  const database = await getInitializedDatabase();
  const [record] = await database
    .insert(weightEntries)
    .values({
      timestamp: input.timestamp ?? Date.now(),
      weightGrams: weightToGrams(input.weight, input.unit),
    })
    .returning();

  const savedRecord = requireInsertedRecord(record, 'peso');
  await database
    .update(userProfile)
    .set({ profileUpdatedAt: Date.now(), weightUnit: input.unit })
    .where(eq(userProfile.id, 1));
  requestCloudSync();
  return savedRecord;
}

export async function deleteWeightEntry(id: number): Promise<void> {
  const database = await getInitializedDatabase();
  await database.delete(weightEntries).where(eq(weightEntries.id, id));
  requestCloudSync();
}

export async function getFriendRecords(): Promise<FriendRecord[]> {
  const database = await getInitializedDatabase();
  return database.select().from(friends).orderBy(desc(friends.createdAt));
}

export async function saveFriendRecord(
  displayName: string,
): Promise<FriendRecord> {
  const normalizedName = displayName.trim().slice(0, 40);

  if (!normalizedName) {
    throw new Error('Escreve o nome do amigo.');
  }

  const database = await getInitializedDatabase();
  const [friend] = await database
    .insert(friends)
    .values({ createdAt: Date.now(), displayName: normalizedName })
    .returning();

  const record = requireInsertedRecord(friend, 'amigo');
  requestCloudSync();
  return record;
}

export async function deleteFriendRecord(id: number): Promise<void> {
  const database = await getInitializedDatabase();
  await database.delete(friends).where(eq(friends.id, id));
  requestCloudSync();
}

export async function getUserProfile(): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const [profile] = await database
    .select()
    .from(userProfile)
    .where(eq(userProfile.id, 1))
    .limit(1);

  if (!profile) {
    throw new Error('Não foi possível carregar o perfil local.');
  }

  return profile;
}

export async function updateUserProfileXp(
  totalXp: number,
): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const safeXp = Math.max(0, Math.floor(totalXp));
  const [profile] = await database
    .update(userProfile)
    .set({
      currentLevel: calculateLevel(safeXp),
      profileUpdatedAt: Date.now(),
      totalXp: safeXp,
    })
    .where(eq(userProfile.id, 1))
    .returning();

  if (!profile) {
    throw new Error('Não foi possível atualizar o XP do perfil.');
  }

  requestCloudSync();
  return profile;
}


export async function updateLocalProfile(
  input: UpdateLocalProfileInput,
): Promise<UserProfileRecord> {
  const displayName = input.displayName.trim().slice(0, 40);
  const bio = input.bio.trim().slice(0, 160);

  if (!displayName) {
    throw new Error('O nome do perfil não pode ficar vazio.');
  }

  const database = await getInitializedDatabase();
  const [profile] = await database
    .update(userProfile)
    .set({
      ...(input.avatarRemotePath !== undefined
        ? { avatarRemotePath: input.avatarRemotePath }
        : {}),
      avatarUri: input.avatarUri,
      bio,
      displayName,
      profileUpdatedAt: Date.now(),
    })
    .where(eq(userProfile.id, 1))
    .returning();

  if (!profile) {
    throw new Error('Não foi possível atualizar o perfil local.');
  }

  requestCloudSync(1_200);
  return profile;
}

export async function completeProfileOnboarding(
  input: CompleteProfileOnboardingInput,
): Promise<UserProfileRecord> {
  const displayName = input.displayName.trim().slice(0, 40);

  if (!displayName) {
    throw new Error('Escolhe um nome para o teu perfil.');
  }

  const database = await getInitializedDatabase();
  const completedAt = Date.now();
  const profile = await database.transaction(async (transaction) => {
    if (input.initialWeight !== undefined) {
      await transaction.insert(weightEntries).values({
        timestamp: completedAt,
        weightGrams: weightToGrams(input.initialWeight, input.weightUnit),
      });
    }

    const [updatedProfile] = await transaction
      .update(userProfile)
      .set({
        displayName,
        onboardingCompletedAt: completedAt,
        profileUpdatedAt: completedAt,
        weightUnit: input.weightUnit,
      })
      .where(eq(userProfile.id, 1))
      .returning();

    if (!updatedProfile) {
      throw new Error('Não foi possível concluir o perfil local.');
    }

    return updatedProfile;
  });

  requestCloudSync();
  return profile;
}

export async function linkCloudAccount(
  input: LinkCloudAccountInput,
): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const currentProfile = await getUserProfile();
  const shouldUseGoogleName = currentProfile.displayName === 'Utilizador KYNIO';
  const [profile] = await database
    .update(userProfile)
    .set({
      avatarUri: currentProfile.avatarUri ?? input.avatarUrl,
      cloudLinkedAt: Date.now(),
      cloudUserId: input.userId,
      displayName:
        shouldUseGoogleName && input.displayName
          ? input.displayName
          : currentProfile.displayName,
      googleAvatarUrl: input.avatarUrl,
      googleDisplayName: input.displayName,
      googleEmail: input.email,
      profileUpdatedAt:
        shouldUseGoogleName && input.displayName
          ? Date.now()
          : currentProfile.profileUpdatedAt,
    })
    .where(eq(userProfile.id, 1))
    .returning();

  if (!profile) {
    throw new Error(
      'Não foi possível associar a conta Google ao perfil local.',
    );
  }

  requestCloudSync();
  return profile;
}

export async function unlinkCloudAccount(): Promise<UserProfileRecord> {
  const database = await getInitializedDatabase();
  const [profile] = await database
    .update(userProfile)
    .set({
      cloudLinkedAt: null,
      cloudUserId: null,
      googleAvatarUrl: null,
      googleDisplayName: null,
      googleEmail: null,
    })
    .where(eq(userProfile.id, 1))
    .returning();

  if (!profile) {
    throw new Error('Não foi possível desligar a conta Google.');
  }

  return profile;
}

export async function updateUserProfileStreak(
  streakDays: number,
): Promise<UserProfileRecord> {
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

  requestCloudSync();
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
