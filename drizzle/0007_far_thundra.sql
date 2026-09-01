ALTER TABLE `fasts` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `fasts_start_time_idx` ON `fasts` (`start_time`);--> statement-breakpoint
ALTER TABLE `meals` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `meals_timestamp_idx` ON `meals` (`timestamp`);--> statement-breakpoint
ALTER TABLE `weight_entries` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `weight_entries_timestamp_idx` ON `weight_entries` (`timestamp`);--> statement-breakpoint
ALTER TABLE `workouts` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `workouts_timestamp_idx` ON `workouts` (`timestamp`);