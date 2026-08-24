import { eq } from 'drizzle-orm';

import { getInitializedDatabase } from '@/db/client';
import {
  fasts,
  friends,
  meals,
  userProfile,
  weightEntries,
  workouts,
} from '@/db/schema';
import { calculateLevel } from '@/services/gamificationService';
import { requireSupabase } from '@/services/supabaseClient';

interface RemoteProfileRow {
  avatar_path: string | null;
  bio: string;
  display_name: string;
  onboarding_completed_at: number | string | null;
  streak_days: number;
  total_xp: number;
  updated_at: number | string;
  user_id: string;
  weight_unit: 'kg' | 'lb';
}

interface RemoteFastRow {
  completed: boolean;
  end_time: number | string;
  record_key: string;
  start_time: number | string;
  target_hours: number;
  updated_at: number | string;
  user_id: string;
  xp_earned: number;
}

interface RemoteMealRow {
  carbs_grams: number | null;
  estimated_calories: number | null;
  fat_grams: number | null;
  protein_grams: number | null;
  record_key: string;
  tags: string[];
  timestamp: number | string;
  updated_at: number | string;
  user_id: string;
  xp_earned: number;
}

interface RemoteWorkoutRow {
  duration_minutes: number;
  effort: 'light' | 'moderate' | 'intense';
  notes: string | null;
  record_key: string;
  timestamp: number | string;
  type: string;
  updated_at: number | string;
  user_id: string;
  xp_earned: number;
}

interface RemoteFriendRow {
  created_at: number | string;
  display_name: string;
  record_key: string;
  updated_at: number | string;
  user_id: string;
}

interface RemoteWeightRow {
  record_key: string;
  timestamp: number | string;
  updated_at: number | string;
  user_id: string;
  weight_grams: number;
}

export interface CloudSyncResult {
  downloadedRecords: number;
  syncedAt: number;
  uploadedRecords: number;
}

export async function deleteRemoteFriendContact(
  createdAt: number,
  displayName: string,
): Promise<void> {
  const client = requireSupabase();
  const { data } = await client.auth.getSession();

  if (!data.session?.user) {
    return;
  }

  const result = await client
    .from('friend_contacts')
    .delete()
    .eq('user_id', data.session.user.id)
    .eq('record_key', friendKey(createdAt, displayName));
  requireNoError(
    result.error,
    'Não foi possível remover o amigo da sincronização.',
  );
}

export async function deleteRemoteWeightEntry(
  timestamp: number,
): Promise<void> {
  const client = requireSupabase();
  const { data } = await client.auth.getSession();

  if (!data.session?.user) {
    return;
  }

  const result = await client
    .from('weight_entries')
    .delete()
    .eq('user_id', data.session.user.id)
    .eq('record_key', weightKey(timestamp));
  requireNoError(
    result.error,
    'Não foi possível remover o peso da sincronização.',
  );
}

function fastKey(startTime: number, endTime: number): string {
  return `${startTime}:${endTime}`;
}

function mealKey(timestamp: number): string {
  return String(timestamp);
}

function workoutKey(timestamp: number): string {
  return String(timestamp);
}

function friendKey(createdAt: number, displayName: string): string {
  return `${createdAt}:${displayName.trim().toLocaleLowerCase('pt-PT')}`;
}

function weightKey(timestamp: number): string {
  return String(timestamp);
}

function requireNoError(
  error: { message: string } | null,
  fallback: string,
): void {
  if (error) {
    throw new Error(error.message || fallback);
  }
}

async function createSignedAvatarUrl(path: string): Promise<string> {
  const client = requireSupabase();
  const result = await client.storage
    .from('profile-avatars')
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  requireNoError(
    result.error,
    'Não foi possível carregar a fotografia de perfil remota.',
  );

  if (!result.data?.signedUrl) {
    throw new Error(
      'A fotografia de perfil remota não devolveu um endereço válido.',
    );
  }

  return result.data.signedUrl;
}

async function uploadLocalAvatar(
  userId: string,
  avatarUri: string,
): Promise<string> {
  const client = requireSupabase();
  const response = await fetch(avatarUri);

  if (!response.ok) {
    throw new Error(
      'Não foi possível preparar a fotografia de perfil para sincronização.',
    );
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const path = `${userId}/avatar`;
  const upload = await client.storage
    .from('profile-avatars')
    .upload(path, await response.arrayBuffer(), { contentType, upsert: true });
  requireNoError(
    upload.error,
    'Não foi possível sincronizar a fotografia de perfil.',
  );
  return path;
}

export async function syncAllUserData(): Promise<CloudSyncResult> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  requireNoError(userError, 'Não foi possível validar a sessão remota.');

  const user = userData.user;

  if (!user) {
    throw new Error('Liga uma conta Google antes de sincronizar.');
  }

  const database = await getInitializedDatabase();
  const [storedLocalProfile] = await database
    .select()
    .from(userProfile)
    .where(eq(userProfile.id, 1))
    .limit(1);

  if (!storedLocalProfile) {
    throw new Error('Não foi possível carregar o perfil local.');
  }

  let localProfile = storedLocalProfile;

  const remoteProfileResult = await client
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  requireNoError(
    remoteProfileResult.error,
    'Não foi possível carregar o perfil remoto.',
  );
  const remoteProfile =
    remoteProfileResult.data as unknown as RemoteProfileRow | null;

  if (
    remoteProfile &&
    Number(remoteProfile.updated_at) > localProfile.profileUpdatedAt
  ) {
    const remoteAvatarUri = remoteProfile.avatar_path
      ? await createSignedAvatarUrl(remoteProfile.avatar_path)
      : localProfile.googleAvatarUrl;
    const [updatedProfile] = await database
      .update(userProfile)
      .set({
        avatarRemotePath: remoteProfile.avatar_path,
        avatarUri: remoteAvatarUri,
        bio: remoteProfile.bio,
        displayName: remoteProfile.display_name,
        onboardingCompletedAt: remoteProfile.onboarding_completed_at
          ? Number(remoteProfile.onboarding_completed_at)
          : localProfile.onboardingCompletedAt,
        profileUpdatedAt: Number(remoteProfile.updated_at),
        weightUnit: remoteProfile.weight_unit,
      })
      .where(eq(userProfile.id, 1))
      .returning();

    if (updatedProfile) {
      localProfile = updatedProfile;
    }
  } else {
    const hasCustomLocalAvatar = Boolean(
      localProfile.avatarUri &&
      localProfile.avatarUri !== localProfile.googleAvatarUrl,
    );
    let avatarPath = localProfile.avatarRemotePath;

    if (hasCustomLocalAvatar && localProfile.avatarUri && !avatarPath) {
      avatarPath = await uploadLocalAvatar(user.id, localProfile.avatarUri);
      const [updatedProfile] = await database
        .update(userProfile)
        .set({ avatarRemotePath: avatarPath })
        .where(eq(userProfile.id, 1))
        .returning();

      if (updatedProfile) {
        localProfile = updatedProfile;
      }
    } else if (!hasCustomLocalAvatar && avatarPath) {
      const removal = await client.storage
        .from('profile-avatars')
        .remove([avatarPath]);
      requireNoError(
        removal.error,
        'Não foi possível remover a fotografia de perfil remota.',
      );
      avatarPath = null;
      const [updatedProfile] = await database
        .update(userProfile)
        .set({ avatarRemotePath: null })
        .where(eq(userProfile.id, 1))
        .returning();

      if (updatedProfile) {
        localProfile = updatedProfile;
      }
    }

    const profileUpload = await client.from('profiles').upsert(
      {
        avatar_path: avatarPath,
        bio: localProfile.bio,
        display_name: localProfile.displayName,
        onboarding_completed_at: localProfile.onboardingCompletedAt,
        streak_days: localProfile.streakDays,
        total_xp: localProfile.totalXp,
        updated_at: localProfile.profileUpdatedAt,
        user_id: user.id,
        weight_unit: localProfile.weightUnit,
      },
      { onConflict: 'user_id' },
    );
    requireNoError(
      profileUpload.error,
      'Não foi possível guardar o perfil remoto.',
    );
  }

  const [localFasts, localMeals, localWorkouts, localFriends, localWeights] =
    await Promise.all([
      database.select().from(fasts),
      database.select().from(meals),
      database.select().from(workouts),
      database.select().from(friends),
      database.select().from(weightEntries),
    ]);
  const syncTimestamp = Date.now();
  const fastUploads = localFasts.map((fast) => ({
    completed: fast.completed,
    end_time: fast.endTime,
    record_key: fastKey(fast.startTime, fast.endTime),
    start_time: fast.startTime,
    target_hours: fast.targetHours,
    updated_at: fast.endTime,
    user_id: user.id,
    xp_earned: fast.xpEarned,
  }));
  const mealUploads = localMeals.map((meal) => ({
    carbs_grams: meal.carbsGrams,
    estimated_calories: meal.estimatedCalories,
    fat_grams: meal.fatGrams,
    protein_grams: meal.proteinGrams,
    record_key: mealKey(meal.timestamp),
    tags: meal.tags,
    timestamp: meal.timestamp,
    updated_at: meal.timestamp,
    user_id: user.id,
    xp_earned: meal.xpEarned,
  }));
  const workoutUploads = localWorkouts.map((workout) => ({
    duration_minutes: workout.durationMinutes,
    effort: workout.effort,
    notes: workout.notes,
    record_key: workoutKey(workout.timestamp),
    timestamp: workout.timestamp,
    type: workout.type,
    updated_at: workout.timestamp,
    user_id: user.id,
    xp_earned: workout.xpEarned,
  }));
  const friendUploads = localFriends.map((friend) => ({
    created_at: friend.createdAt,
    display_name: friend.displayName,
    record_key: friendKey(friend.createdAt, friend.displayName),
    updated_at: friend.createdAt,
    user_id: user.id,
  }));
  const weightUploads = localWeights.map((entry) => ({
    record_key: weightKey(entry.timestamp),
    timestamp: entry.timestamp,
    updated_at: entry.timestamp,
    user_id: user.id,
    weight_grams: entry.weightGrams,
  }));

  const uploads = [
    fastUploads.length
      ? client
          .from('fasts')
          .upsert(fastUploads, { onConflict: 'user_id,record_key' })
      : Promise.resolve({ error: null }),
    mealUploads.length
      ? client
          .from('meals')
          .upsert(mealUploads, { onConflict: 'user_id,record_key' })
      : Promise.resolve({ error: null }),
    workoutUploads.length
      ? client
          .from('workouts')
          .upsert(workoutUploads, { onConflict: 'user_id,record_key' })
      : Promise.resolve({ error: null }),
    friendUploads.length
      ? client
          .from('friend_contacts')
          .upsert(friendUploads, { onConflict: 'user_id,record_key' })
      : Promise.resolve({ error: null }),
    weightUploads.length
      ? client
          .from('weight_entries')
          .upsert(weightUploads, { onConflict: 'user_id,record_key' })
      : Promise.resolve({ error: null }),
  ];
  const uploadResults = await Promise.all(uploads);

  for (const result of uploadResults) {
    requireNoError(result.error, 'Não foi possível enviar os dados locais.');
  }

  const [
    fastDownload,
    mealDownload,
    workoutDownload,
    friendDownload,
    weightDownload,
  ] = await Promise.all([
    client.from('fasts').select('*').eq('user_id', user.id),
    client.from('meals').select('*').eq('user_id', user.id),
    client.from('workouts').select('*').eq('user_id', user.id),
    client.from('friend_contacts').select('*').eq('user_id', user.id),
    client.from('weight_entries').select('*').eq('user_id', user.id),
  ]);

  requireNoError(fastDownload.error, 'Não foi possível descarregar jejuns.');
  requireNoError(mealDownload.error, 'Não foi possível descarregar refeições.');
  requireNoError(
    workoutDownload.error,
    'Não foi possível descarregar atividades.',
  );
  requireNoError(friendDownload.error, 'Não foi possível descarregar amigos.');
  requireNoError(weightDownload.error, 'Não foi possível descarregar pesos.');

  const remoteFasts = (fastDownload.data ?? []) as unknown as RemoteFastRow[];
  const remoteMeals = (mealDownload.data ?? []) as unknown as RemoteMealRow[];
  const remoteWorkouts = (workoutDownload.data ??
    []) as unknown as RemoteWorkoutRow[];
  const remoteFriends = (friendDownload.data ??
    []) as unknown as RemoteFriendRow[];
  const remoteWeights = (weightDownload.data ??
    []) as unknown as RemoteWeightRow[];
  const localFastKeys = new Set(
    localFasts.map((fast) => fastKey(fast.startTime, fast.endTime)),
  );
  const localMealKeys = new Set(
    localMeals.map((meal) => mealKey(meal.timestamp)),
  );
  const localWorkoutKeys = new Set(
    localWorkouts.map((workout) => workoutKey(workout.timestamp)),
  );
  const localFriendKeys = new Set(
    localFriends.map((friend) =>
      friendKey(friend.createdAt, friend.displayName),
    ),
  );
  const localWeightKeys = new Set(
    localWeights.map((entry) => weightKey(entry.timestamp)),
  );
  const missingFasts = remoteFasts.filter(
    (fast) => !localFastKeys.has(fast.record_key),
  );
  const missingMeals = remoteMeals.filter(
    (meal) => !localMealKeys.has(meal.record_key),
  );
  const missingWorkouts = remoteWorkouts.filter(
    (workout) => !localWorkoutKeys.has(workout.record_key),
  );
  const missingFriends = remoteFriends.filter(
    (friend) => !localFriendKeys.has(friend.record_key),
  );
  const missingWeights = remoteWeights.filter(
    (entry) => !localWeightKeys.has(entry.record_key),
  );

  await database.transaction(async (transaction) => {
    if (missingFasts.length) {
      await transaction.insert(fasts).values(
        missingFasts.map((fast) => ({
          completed: fast.completed,
          endTime: Number(fast.end_time),
          startTime: Number(fast.start_time),
          targetHours: fast.target_hours,
          xpEarned: fast.xp_earned,
        })),
      );
    }

    if (missingMeals.length) {
      await transaction.insert(meals).values(
        missingMeals.map((meal) => ({
          carbsGrams: meal.carbs_grams,
          estimatedCalories: meal.estimated_calories,
          fatGrams: meal.fat_grams,
          imageUrl: null,
          proteinGrams: meal.protein_grams,
          tags: meal.tags,
          timestamp: Number(meal.timestamp),
          xpEarned: meal.xp_earned,
        })),
      );
    }

    if (missingWorkouts.length) {
      await transaction.insert(workouts).values(
        missingWorkouts.map((workout) => ({
          durationMinutes: workout.duration_minutes,
          effort: workout.effort,
          notes: workout.notes,
          timestamp: Number(workout.timestamp),
          type: workout.type,
          xpEarned: workout.xp_earned,
        })),
      );
    }

    if (missingFriends.length) {
      await transaction.insert(friends).values(
        missingFriends.map((friend) => ({
          createdAt: Number(friend.created_at),
          displayName: friend.display_name,
        })),
      );
    }

    if (missingWeights.length) {
      await transaction.insert(weightEntries).values(
        missingWeights.map((entry) => ({
          timestamp: Number(entry.timestamp),
          weightGrams: entry.weight_grams,
        })),
      );
    }
  });

  const [mergedFasts, mergedMeals, mergedWorkouts] = await Promise.all([
    database.select().from(fasts),
    database.select().from(meals),
    database.select().from(workouts),
  ]);
  const totalXp = [...mergedFasts, ...mergedMeals, ...mergedWorkouts].reduce(
    (total, record) => total + record.xpEarned,
    0,
  );
  await database
    .update(userProfile)
    .set({
      cloudUserId: user.id,
      currentLevel: calculateLevel(totalXp),
      totalXp,
    })
    .where(eq(userProfile.id, 1));
  const finalProfile = await database
    .select()
    .from(userProfile)
    .where(eq(userProfile.id, 1))
    .limit(1);
  const profile = finalProfile[0];

  if (profile) {
    const finalProfileUpload = await client.from('profiles').upsert(
      {
        avatar_path: profile.avatarRemotePath,
        bio: profile.bio,
        display_name: profile.displayName,
        onboarding_completed_at: profile.onboardingCompletedAt,
        streak_days: profile.streakDays,
        total_xp: profile.totalXp,
        updated_at: profile.profileUpdatedAt,
        user_id: user.id,
        weight_unit: profile.weightUnit,
      },
      { onConflict: 'user_id' },
    );
    requireNoError(
      finalProfileUpload.error,
      'Não foi possível finalizar a sincronização.',
    );
  }

  return {
    downloadedRecords:
      missingFasts.length +
      missingMeals.length +
      missingWorkouts.length +
      missingFriends.length +
      missingWeights.length,
    syncedAt: syncTimestamp,
    uploadedRecords:
      fastUploads.length +
      mealUploads.length +
      workoutUploads.length +
      friendUploads.length +
      weightUploads.length,
  };
}
