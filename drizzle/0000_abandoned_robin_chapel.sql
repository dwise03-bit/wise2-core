CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`services` text NOT NULL,
	`idea` text NOT NULL,
	`goal` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`source_path` text DEFAULT '/start' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inquiries_status_created_at` ON `inquiries` (`status`,`created_at`);