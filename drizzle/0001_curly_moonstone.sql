CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designSoftware` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `designSoftware_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designerSoftware` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designerId` int NOT NULL,
	`softwareId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `designerSoftware_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileType` varchar(100),
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`serviceId` int NOT NULL,
	`designerId` int,
	`status` enum('pending','assigned','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`price` int NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `paymentMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`cardHolderName` varchar(100) NOT NULL,
	`cardNumberLast4` varchar(4) NOT NULL,
	`expiryMonth` varchar(2) NOT NULL,
	`expiryYear` varchar(4) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`descriptionAr` text NOT NULL,
	`price` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`imageUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('client','designer') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);