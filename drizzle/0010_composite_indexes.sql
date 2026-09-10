CREATE INDEX IF NOT EXISTS `fasts_deleted_start_time_idx` ON `fasts` (`deleted_at`, `start_time`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `meals_deleted_timestamp_idx` ON `meals` (`deleted_at`, `timestamp`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `workouts_deleted_timestamp_idx` ON `workouts` (`deleted_at`, `timestamp`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `weight_entries_deleted_timestamp_idx` ON `weight_entries` (`deleted_at`, `timestamp`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fasting_symptoms_deleted_timestamp_idx` ON `fasting_symptoms` (`deleted_at`, `timestamp`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fasting_symptoms_fast_id_idx` ON `fasting_symptoms` (`fast_id`);
