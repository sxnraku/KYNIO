CREATE TABLE `workouts` (
	`duration_minutes` integer NOT NULL,
	`effort` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`notes` text,
	`timestamp` integer NOT NULL,
	`type` text NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL
);
