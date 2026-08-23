ALTER TABLE `user_profile` ADD `cloud_linked_at` integer;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `cloud_user_id` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `google_avatar_url` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `google_display_name` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `google_email` text;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `profile_updated_at` integer DEFAULT 0 NOT NULL;