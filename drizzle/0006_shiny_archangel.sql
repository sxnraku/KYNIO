CREATE TABLE `weight_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`weight_grams` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user_profile` ADD `onboarding_completed_at` integer;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `weight_unit` text DEFAULT 'kg' NOT NULL;