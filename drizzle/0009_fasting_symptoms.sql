CREATE TABLE `fasting_symptoms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fast_id` integer,
	`intensity` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`phase_index` integer DEFAULT 0 NOT NULL,
	`symptom_key` text NOT NULL,
	`timestamp` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `fasting_symptoms_timestamp_idx` ON `fasting_symptoms` (`timestamp`);
