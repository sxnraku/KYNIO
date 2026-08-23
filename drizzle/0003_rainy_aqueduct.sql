CREATE TABLE `friends` (
	`created_at` integer NOT NULL,
	`display_name` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user_profile` ADD `avatar_uri` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `bio` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `display_name` text DEFAULT 'Utilizador KYNIO' NOT NULL;