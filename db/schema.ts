import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const fasts = sqliteTable('fasts', {
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  endTime: integer('end_time').notNull(),
  id: integer('id').primaryKey({ autoIncrement: true }),
  startTime: integer('start_time').notNull(),
  targetHours: integer('target_hours').notNull(),
  xpEarned: integer('xp_earned').notNull().default(0),
});

export const meals = sqliteTable('meals', {
  carbsGrams: real('carbs_grams'),
  estimatedCalories: integer('estimated_calories'),
  fatGrams: real('fat_grams'),
  id: integer('id').primaryKey({ autoIncrement: true }),
  imageUrl: text('image_url'),
  proteinGrams: real('protein_grams'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  timestamp: integer('timestamp').notNull(),
  xpEarned: integer('xp_earned').notNull().default(0),
});

export const workouts = sqliteTable('workouts', {
  durationMinutes: integer('duration_minutes').notNull(),
  effort: text('effort', { enum: ['light', 'moderate', 'intense'] }).notNull(),
  id: integer('id').primaryKey({ autoIncrement: true }),
  notes: text('notes'),
  timestamp: integer('timestamp').notNull(),
  type: text('type').notNull(),
  xpEarned: integer('xp_earned').notNull().default(0),
});

export const userProfile = sqliteTable('user_profile', {
  currentLevel: integer('current_level').notNull().default(1),
  id: integer('id').primaryKey(),
  streakDays: integer('streak_days').notNull().default(0),
  termsAcceptedAt: integer('terms_accepted_at'),
  totalXp: integer('total_xp').notNull().default(0),
});

export type FastRecord = typeof fasts.$inferSelect;
export type MealRecord = typeof meals.$inferSelect;
export type WorkoutRecord = typeof workouts.$inferSelect;
export type NewFastRecord = typeof fasts.$inferInsert;
export type NewMealRecord = typeof meals.$inferInsert;
export type NewWorkoutRecord = typeof workouts.$inferInsert;
export type UserProfileRecord = typeof userProfile.$inferSelect;
