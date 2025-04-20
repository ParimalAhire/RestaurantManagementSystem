-- Drop database if exists and recreate it
DROP DATABASE IF EXISTS `RestaurantDB-Local`;
CREATE DATABASE `RestaurantDB-Local`;
USE `RestaurantDB-Local`;

-- Grant access to the database for the 'work' user
CREATE USER IF NOT EXISTS 'work'@'localhost' IDENTIFIED BY 'work';
GRANT ALL PRIVILEGES ON `RestaurantDB-Local`.* TO 'work'@'localhost';
FLUSH PRIVILEGES; 