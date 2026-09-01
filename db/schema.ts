import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const fasts = sqliteTable(
  'fasts',
  {
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    deletedAt: integer('deleted_at'),
    endTime: integer('end_time').notNull(),
    id: integer('id').primaryKey({ autoIncrement: true }),
    startTime: integer('start_time').notNull(),
    targetHours: integer('target_hours').notNull(),
    xpEarned: integer('xp_earned').notNull().default(0),
  },
  (table) => [index('fasts_start_time_idx').on(table.startTime)],
);

export const meals = sqliteTable(
  'meals',
  {
    carbsGrams: real('carbs_grams'),
    deletedAt: integer('deleted_at'),
    estimatedCalories: integer('estimated_calories'),
    fatGrams: real('fat_grams'),
    id: integer('id').primaryKey({ autoIncrement: true }),
    imageUrl: text('image_url'),
    proteinGrams: real('protein_grams'),
    tags: text('tags', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    timestamp: integer('timestamp').notNull(),
    xpEarned: integer('xp_earned').notNull().default(0),
  },
  (table) => [index('meals_timestamp_idx').on(table.timestamp)],
);

export const workouts = sqliteTable(
  'workouts',
  {
    deletedAt: integer('deleted_at'),
    durationMinutes: integer('duration_minutes').notNull(),
    effort: text('effort', { enum: ['light', 'moderate', 'intense'] }).notNull(),
    id: integer('id').primaryKey({ autoIncrement: true }),
    notes: text('notes'),
    timestamp: integer('timestamp').notNull(),
    type: text('type').notNull(),
    xpEarned: integer('xp_earned').notNull().default(0),
  },
  (table) => [index('workouts_timestamp_idx').on(table.timestamp)],
);

export const userProfile = sqliteTable('user_profile', {
  avatarRemotePath: text('avatar_remote_path'),
  avatarUri: text('avatar_uri'),
  bio: text('bio').notNull().default(''),
  cloudLinkedAt: integer('cloud_linked_at'),
  cloudUserId: text('cloud_user_id'),
  currentLevel: integer('current_level').notNull().default(1),
  displayName: text('display_name').notNull().default('Utilizador KYNIO'),
  googleAvatarUrl: text('google_avatar_url'),
  googleDisplayName: text('google_display_name'),
  googleEmail: text('google_email'),
  id: integer('id').primaryKey(),
  onboardingCompletedAt: integer('onboarding_completed_at'),
  profileUpdatedAt: integer('profile_updated_at').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(0),
  termsAcceptedAt: integer('terms_accepted_at'),
  totalXp: integer('total_xp').notNull().default(0),
  weightUnit: text('weight_unit', { enum: ['kg', 'lb'] })
    .notNull()
    .default('kg'),
});

export const friends = sqliteTable('friends', {
  createdAt: integer('created_at').notNull(),
  displayName: text('display_name').notNull(),
  id: integer('id').primaryKey({ autoIncrement: true }),
});

export const weightEntries = sqliteTable(
  'weight_entries',
  {
    deletedAt: integer('deleted_at'),
    id: integer('id').primaryKey({ autoIncrement: true }),
    timestamp: integer('timestamp').notNull(),
    weightGrams: integer('weight_grams').notNull(),
  },
  (table) => [index('weight_entries_timestamp_idx').on(table.timestamp)],
);

export type FastRecord = typeof fasts.$inferSelect;
export type MealRecord = typeof meals.$inferSelect;
export type WorkoutRecord = typeof workouts.$inferSelect;
export type FriendRecord = typeof friends.$inferSelect;
export type WeightEntryRecord = typeof weightEntries.$inferSelect;
export type NewFastRecord = typeof fasts.$inferInsert;
export type NewMealRecord = typeof meals.$inferInsert;
export type NewWorkoutRecord = typeof workouts.$inferInsert;
export type NewFriendRecord = typeof friends.$inferInsert;
export type NewWeightEntryRecord = typeof weightEntries.$inferInsert;
export type UserProfileRecord = typeof userProfile.$inferSelect;
