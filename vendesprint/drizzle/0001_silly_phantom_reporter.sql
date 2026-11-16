CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productName` varchar(180) NOT NULL,
	`title` varchar(220) NOT NULL,
	`channel` varchar(40) NOT NULL,
	`objective` varchar(80) NOT NULL,
	`tone` varchar(50) NOT NULL,
	`occasion` varchar(80) NOT NULL,
	`status` enum('draft','generated','archived') NOT NULL DEFAULT 'generated',
	`isFavorite` int NOT NULL DEFAULT 0,
	`inputData` text NOT NULL,
	`resultData` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` varchar(50) NOT NULL,
	`channel` varchar(40) NOT NULL,
	`style` varchar(50) NOT NULL,
	`productName` varchar(180) NOT NULL,
	`title` varchar(220) NOT NULL,
	`body` text NOT NULL,
	`isFavorite` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`operation` varchar(80) NOT NULL,
	`requestId` varchar(100),
	`amount` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`status` enum('reserved','completed','refunded','failed') NOT NULL DEFAULT 'completed',
	`resultData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','starter','pro','seasonal') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditsBalance` int DEFAULT 10 NOT NULL;--> statement-breakpoint
CREATE INDEX `campaigns_user_created_idx` ON `campaigns` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `campaigns_user_status_idx` ON `campaigns` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `content_user_created_idx` ON `contentItems` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `credits_user_created_idx` ON `creditLedger` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `credits_request_idx` ON `creditLedger` (`userId`,`requestId`);