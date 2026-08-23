CREATE TABLE `fasts` (
	`completed` integer DEFAULT false NOT NULL,
	`end_time` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`start_time` integer NOT NULL,
	`target_hours` integer NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`carbs_grams` real,
	`estimated_calories` integer,
	`fat_grams` real,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_url` text,
	`protein_grams` real,
	`tags` text DEFAULT '[]' NOT NULL,
	`timestamp` integer NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`current_level` integer DEFAULT 1 NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`streak_days` integer DEFAULT 0 NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL
);
