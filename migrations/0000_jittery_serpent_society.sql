CREATE TABLE `customer_visits` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`table_id` int NOT NULL,
	`start_time` timestamp NOT NULL DEFAULT (now()),
	`end_time` timestamp,
	CONSTRAINT `customer_visits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`category` text NOT NULL,
	`available` boolean DEFAULT true,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`menu_item_id` int NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`table_id` int NOT NULL,
	`status` text NOT NULL,
	`total_amount` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`capacity` int NOT NULL,
	`occupied` boolean DEFAULT false,
	`arrival_time` timestamp,
	CONSTRAINT `tables_id` PRIMARY KEY(`id`),
	CONSTRAINT `tables_number_unique` UNIQUE(`number`)
);
