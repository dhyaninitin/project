-- MySQL dump 10.13  Distrib 8.1.0, for macos13.3 (x86_64)
--
-- Host: localhost    Database: configurator_staging
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_credentials`
--

DROP TABLE IF EXISTS `api_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_credentials` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `provider` varchar(255) NOT NULL DEFAULT '',
  `type` varchar(255) DEFAULT NULL,
  `value` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `api_limit`
--

DROP TABLE IF EXISTS `api_limit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_limit` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_versions`
--

DROP TABLE IF EXISTS `app_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_versions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(10) NOT NULL DEFAULT '',
  `is_minimum` tinyint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brand_type_model_mapping`
--

DROP TABLE IF EXISTS `brand_type_model_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand_type_model_mapping` (
  `id` bigint NOT NULL,
  `brand_id` bigint NOT NULL,
  `type_id` bigint NOT NULL,
  `model_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brand_id` (`brand_id`,`type_id`),
  UNIQUE KEY `brand_id_2` (`brand_id`,`type_id`,`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int unsigned NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `image_url` varchar(256) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `years` varchar(191) DEFAULT NULL,
  `is_active` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars` (
  `id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `make` varchar(50) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `trim` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` varchar(50) DEFAULT NULL,
  `msrp` varchar(50) DEFAULT NULL,
  `car_condition` varchar(50) DEFAULT NULL,
  `dealer_name` varchar(50) DEFAULT NULL,
  `dealer_address` varchar(50) DEFAULT NULL,
  `dealer_city` varchar(50) DEFAULT NULL,
  `dealer_state` varchar(50) DEFAULT NULL,
  `dealer_zip` varchar(10) DEFAULT NULL,
  `dealer_distance` varchar(50) DEFAULT NULL,
  `dealer_contact` varchar(50) DEFAULT NULL,
  `dealer_website` varchar(100) DEFAULT NULL,
  `mileage` int NOT NULL,
  `ext_color` varchar(50) DEFAULT NULL,
  `int_color` varchar(50) DEFAULT NULL,
  `transmission` varchar(50) DEFAULT NULL,
  `drive_train` varchar(10) DEFAULT NULL,
  `engine` varchar(50) DEFAULT NULL,
  `vin` varchar(50) DEFAULT NULL,
  `stock` varchar(50) DEFAULT NULL,
  `mpg` varchar(50) DEFAULT NULL,
  `fueltype` varchar(50) DEFAULT NULL,
  `ratings` int NOT NULL,
  `reviews` int NOT NULL,
  `car_options` text,
  `car_features` text,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cars_direct`
--

DROP TABLE IF EXISTS `cars_direct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars_direct` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `carsdata` text,
  `vehicle_id` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1027 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cars_direct_request`
--

DROP TABLE IF EXISTS `cars_direct_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars_direct_request` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cars_direct_id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT NULL,
  `vehicle_interest` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `vehicle_status` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `vehicle_id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `source` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `year` int DEFAULT NULL,
  `make` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `model` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `trim` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `exterior_colors` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `interior_colors` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `preference` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `invoice` int DEFAULT NULL,
  `msrp` int DEFAULT NULL,
  `quote` int DEFAULT NULL,
  `finance_method` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `first_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `middle_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `last_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `email_preferred_contact` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `phone_preferred_contact` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `phone_preferred_time` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `phone_preferred_type` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `street` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `apartment` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `city` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `regioncode` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `postalcode` int DEFAULT NULL,
  `timeframe` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `vendor` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `provider_id` int DEFAULT NULL,
  `provider_source` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `provider_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `provider_service` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `provider_url` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `contact_owner_email` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1006 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `image_url2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `color_exception`
--

DROP TABLE IF EXISTS `color_exception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color_exception` (
  `id` int NOT NULL AUTO_INCREMENT,
  `model_id` int unsigned NOT NULL,
  `external_colour` varchar(255) DEFAULT NULL,
  `vehicle_color_id` int unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `model_id` (`model_id`),
  KEY `vehicle_color_id` (`vehicle_color_id`),
  CONSTRAINT `color_exception_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`) ON DELETE CASCADE,
  CONSTRAINT `color_exception_ibfk_2` FOREIGN KEY (`vehicle_color_id`) REFERENCES `vehicle_colors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact_owners`
--

DROP TABLE IF EXISTS `contact_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_owners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) DEFAULT NULL,
  `last_assigned` tinyint(1) NOT NULL DEFAULT '0',
  `rr_days` text,
  `rr_source` text,
  `rr_limit` int DEFAULT '0',
  `rr_timeframe` varchar(191) DEFAULT NULL,
  `rr_total_assigned` int NOT NULL DEFAULT '0',
  `is_default` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `credit_applications`
--

DROP TABLE IF EXISTS `credit_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `middle_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `phone` varchar(14) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `date_of_birth` varchar(50) DEFAULT NULL,
  `residence_type` varchar(50) DEFAULT NULL,
  `monthly_rent` int DEFAULT NULL,
  `apt` varchar(50) DEFAULT NULL,
  `street_address` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zipcode` varchar(50) DEFAULT NULL,
  `employer_name` varchar(100) DEFAULT NULL,
  `employer_address` varchar(100) DEFAULT NULL,
  `employer_phone` varchar(14) DEFAULT NULL,
  `gross_monthly_income` int DEFAULT NULL,
  `driver_licence_number` varchar(50) DEFAULT NULL,
  `driver_licence_state` varchar(50) DEFAULT NULL,
  `social_security_number` varchar(50) DEFAULT NULL,
  `user_id` int NOT NULL,
  `vehicle_request_id` int unsigned DEFAULT NULL,
  `primary_application_id` int DEFAULT NULL,
  `is_exported` tinyint NOT NULL DEFAULT '0',
  `filename` varchar(255) DEFAULT NULL,
  `source_utm` tinyint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `credit_applications_ibfk_1` (`user_id`),
  KEY `credit_applications_ibfk_2` (`vehicle_request_id`),
  KEY `credit_applications_ibfk_3` (`primary_application_id`),
  CONSTRAINT `credit_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `credit_applications_ibfk_2` FOREIGN KEY (`vehicle_request_id`) REFERENCES `vehicle_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `credit_applications_ibfk_3` FOREIGN KEY (`primary_application_id`) REFERENCES `credit_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `deal_stage`
--

DROP TABLE IF EXISTS `deal_stage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deal_stage` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `stage_id` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) DEFAULT NULL,
  `order` tinyint(1) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pipeline_name` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealers`
--

DROP TABLE IF EXISTS `dealers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `mscan_account_number` varchar(10) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `state` varchar(20) DEFAULT NULL,
  `city` varchar(20) DEFAULT NULL,
  `zip` varchar(10) DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `lead_gen_system` varchar(255) DEFAULT NULL,
  `lead_gen_email` varchar(255) DEFAULT NULL,
  `status` int DEFAULT '1',
  `feed_source` varchar(255) DEFAULT NULL,
  `provider_dealer_id` varchar(255) DEFAULT NULL,
  `dealer_primary` int DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_inventory_id` int NOT NULL,
  `user_id` int NOT NULL,
  `favorite` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fb_user`
--

DROP TABLE IF EXISTS `fb_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fb_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `phone` varchar(14) DEFAULT NULL,
  `facebook_id` varchar(100) DEFAULT NULL,
  `lease_captured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_address` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fb_user_lead`
--

DROP TABLE IF EXISTS `fb_user_lead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fb_user_lead` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fb_user_id` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `trim` varchar(100) DEFAULT NULL,
  `exterior_color` varchar(100) DEFAULT NULL,
  `interior_color` varchar(100) DEFAULT NULL,
  `vin` varchar(100) DEFAULT NULL,
  `mileage` int DEFAULT NULL,
  `vehicle_condition` tinyint(1) DEFAULT NULL,
  `lease_end_date` timestamp NULL DEFAULT NULL,
  `smoke_free` tinyint(1) DEFAULT NULL,
  `number_keys` tinyint(1) DEFAULT NULL,
  `bank_lender` varchar(100) DEFAULT NULL,
  `account` varchar(100) DEFAULT NULL,
  `payoff_amount` int DEFAULT NULL,
  `uri` varchar(255) DEFAULT NULL,
  `is_submitted` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fb_user_foreign_key` (`fb_user_id`),
  CONSTRAINT `fb_user_foreign_key` FOREIGN KEY (`fb_user_id`) REFERENCES `fb_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ftp_connections`
--

DROP TABLE IF EXISTS `ftp_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ftp_connections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `host` varchar(20) DEFAULT NULL,
  `user` varchar(20) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `file_name` varchar(100) DEFAULT NULL,
  `csv_parse_options` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `priority` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interior_colors`
--

DROP TABLE IF EXISTS `interior_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interior_colors` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int unsigned DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `simple_color` varchar(100) DEFAULT NULL,
  `oem_option_code` varchar(10) DEFAULT NULL,
  `color_hex_code` varchar(7) DEFAULT NULL,
  `msrp` double DEFAULT NULL,
  `invoice` double DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `interior_colors_ibfk_1` (`vehicle_id`,`oem_option_code`) USING BTREE,
  CONSTRAINT `interior_colors_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15925 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `model_category`
--

DROP TABLE IF EXISTS `model_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_category` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `model_id` int unsigned NOT NULL,
  `category_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `model_id` (`model_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `model_category_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`),
  CONSTRAINT `model_category_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `models` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `brand_id` int unsigned NOT NULL,
  `sub_brand_id` int NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `image_url` varchar(256) DEFAULT NULL,
  `image_url_320` varchar(256) DEFAULT NULL,
  `image_url_640` varchar(256) DEFAULT NULL,
  `image_url_1280` varchar(256) DEFAULT NULL,
  `image_url_2100` varchar(256) DEFAULT NULL,
  `year` int NOT NULL,
  `msrp` double DEFAULT NULL,
  `data_release_date` timestamp NULL DEFAULT NULL,
  `initial_price_date` timestamp NULL DEFAULT NULL,
  `data_effective_date` timestamp NULL DEFAULT NULL,
  `comment` text,
  `is_new` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_enable` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  CONSTRAINT `models_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50668 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phone_limit`
--

DROP TABLE IF EXISTS `phone_limit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_limit` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(50) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phone_otps`
--

DROP TABLE IF EXISTS `phone_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_otps` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(14) DEFAULT NULL,
  `otp` int DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_unique_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5004 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rebate_questions`
--

DROP TABLE IF EXISTS `rebate_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rebate_questions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question_image` varchar(200) DEFAULT NULL,
  `question_headline` varchar(200) DEFAULT NULL,
  `question_text` varchar(200) DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rebates`
--

DROP TABLE IF EXISTS `rebates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rebates` (
  `id` int NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `available_to_all` tinyint(1) NOT NULL DEFAULT '1',
  `ccr_incrementals` varchar(256) DEFAULT NULL,
  `cash_can_be_used_as_ccr` tinyint(1) NOT NULL DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `certificate_base_value` int DEFAULT NULL,
  `certificate_code_qtys` int DEFAULT NULL,
  `financial_institution` varchar(256) DEFAULT NULL,
  `financial_institution_id` int NOT NULL,
  `ipo_value` varchar(256) DEFAULT NULL,
  `ipo_value_type` varchar(256) DEFAULT NULL,
  `ident_code` varchar(256) DEFAULT NULL,
  `info_purpose_only` tinyint(1) NOT NULL DEFAULT '0',
  `is_generic` tinyint(1) NOT NULL DEFAULT '0',
  `lender_code` varchar(256) DEFAULT NULL,
  `manual_value_input_required` tinyint(1) NOT NULL DEFAULT '0',
  `max_credit_score` int NOT NULL,
  `max_term` int DEFAULT NULL,
  `min_credit_score` int NOT NULL,
  `name_display` varchar(256) DEFAULT NULL,
  `number` varchar(256) DEFAULT NULL,
  `receipient_type` int NOT NULL,
  `selected` tinyint(1) NOT NULL DEFAULT '1',
  `start_date` varchar(256) DEFAULT NULL,
  `stop_date` varchar(256) DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `tiers` varchar(256) DEFAULT NULL,
  `transaction_type` int NOT NULL,
  `type` int NOT NULL,
  `update_ts` varchar(256) DEFAULT NULL,
  `use_cash_as_ccr` tinyint(1) NOT NULL DEFAULT '0',
  `vin_specific` tinyint(1) NOT NULL DEFAULT '0',
  `value_type` int NOT NULL,
  `vehicle_start_date` varchar(256) DEFAULT NULL,
  `vehicle_stop_date` varchar(256) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scrapers_logs`
--

DROP TABLE IF EXISTS `scrapers_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scrapers_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` int DEFAULT NULL,
  `status_type` int NOT NULL DEFAULT '0',
  `is_running` int NOT NULL DEFAULT '0',
  `scraper_type` int DEFAULT NULL COMMENT '0=year, 1= Brand, 2=model, 3= Trim,4=media',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `types`
--

DROP TABLE IF EXISTS `types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(256) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `contact_owner_email` varchar(255) DEFAULT NULL,
  `app_version` varchar(10) DEFAULT NULL,
  `facebook_id` varchar(100) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `device_token` varchar(512) DEFAULT NULL,
  `access_token` mediumtext,
  `status` tinyint(1) DEFAULT '1',
  `phone` varchar(14) DEFAULT NULL,
  `otp` int DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `phone_tmp` varchar(14) DEFAULT NULL,
  `otp_tmp` int DEFAULT NULL,
  `zipcode` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `login_verify_code` varchar(255) DEFAULT NULL,
  `lease_captured` tinyint(1) NOT NULL DEFAULT '0',
  `lease_information_id` int unsigned DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `appsflyer_id` varchar(255) DEFAULT NULL,
  `idfa` varchar(255) DEFAULT NULL,
  `idfv` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `phone_preferred_contact` int DEFAULT NULL,
  `phone_preferred_time` varchar(50) DEFAULT NULL,
  `phone_preferred_type` varchar(50) DEFAULT NULL,
  `street_address` varchar(225) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zip` varchar(50) DEFAULT NULL,
  `source` int DEFAULT NULL,
  `type` int DEFAULT NULL COMMENT '0=none,1=Concierge',
  `concierge_state` varchar(191) DEFAULT NULL,
  `over18` int DEFAULT '0' COMMENT '0=none,1=yes,2=no',
  `linkedin_profile` varchar(191) DEFAULT NULL,
  `concierge_source` varchar(191) DEFAULT NULL,
  `interview_scheduled` varchar(191) DEFAULT NULL,
  `sales_license_status` varchar(191) DEFAULT NULL,
  `sales_license` varchar(191) DEFAULT NULL,
  `intake_questionaire_1` text,
  `intake_questionaire_2` text,
  `intake_questionaire_3` text,
  `w2_sgned_date` varchar(191) DEFAULT NULL,
  `onboarded_date` varchar(191) DEFAULT NULL,
  `works_at_dealership` varchar(191) DEFAULT NULL,
  `physical_sales_license_received` varchar(191) DEFAULT NULL,
  `fico_score` varchar(191) DEFAULT NULL,
  `hhi` varchar(191) DEFAULT NULL,
  `sex` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8511 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_car_information`
--

DROP TABLE IF EXISTS `user_car_information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_car_information` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `buying_time` tinyint(1) DEFAULT NULL,
  `buying_method` tinyint(1) DEFAULT NULL,
  `will_trade` tinyint(1) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `brand_id` int unsigned DEFAULT NULL,
  `model_id` int unsigned DEFAULT NULL,
  `miles` int DEFAULT NULL,
  `term_in_months` int DEFAULT NULL,
  `down_payment` double DEFAULT NULL,
  `annual_milage` double DEFAULT NULL,
  `credit_score` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_car_information_ibfk_1` (`user_id`),
  KEY `user_car_information_ibfk_5` (`model_id`),
  KEY `user_car_information_ibfk_4` (`brand_id`),
  CONSTRAINT `user_car_information_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_car_information_ibfk_2` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`),
  CONSTRAINT `user_car_information_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1674 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_education`
--

DROP TABLE IF EXISTS `user_education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_education` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `facebook_id` varchar(45) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `school_name` varchar(45) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `concentration_name` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_education_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_inventory_lease`
--

DROP TABLE IF EXISTS `user_inventory_lease`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_inventory_lease` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_inventory_id` int NOT NULL,
  `user_id` int NOT NULL,
  `isleaseselected` tinyint(1) NOT NULL DEFAULT '0',
  `terminmonths_lease` int NOT NULL,
  `cashdownpayment_lease` int NOT NULL,
  `tradeinvalue_lease` int NOT NULL,
  `annualmileage_lease` int DEFAULT NULL,
  `terminmonths_loan` int DEFAULT NULL,
  `cashdownpayment_loan` int DEFAULT NULL,
  `tradeinvalue_loan` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_push_count`
--

DROP TABLE IF EXISTS `user_push_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_push_count` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `push_count` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_rebates`
--

DROP TABLE IF EXISTS `user_rebates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_rebates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `rebate_question_id` int unsigned NOT NULL,
  `user_id` int NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `rebate_question_id` (`rebate_question_id`),
  CONSTRAINT `user_rebates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `user_rebates_ibfk_2` FOREIGN KEY (`rebate_question_id`) REFERENCES `rebate_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `utoken` varchar(255) DEFAULT NULL,
  `expiry` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7731 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_work_history`
--

DROP TABLE IF EXISTS `user_work_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_work_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `facebook_id` varchar(45) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `employer_name` varchar(45) DEFAULT NULL,
  `position` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_work_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_colors`
--

DROP TABLE IF EXISTS `vehicle_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_colors` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int unsigned NOT NULL,
  `color` varchar(100) DEFAULT NULL,
  `simple_color` varchar(100) DEFAULT NULL,
  `oem_option_code` varchar(10) DEFAULT NULL,
  `color_hex_code` varchar(7) DEFAULT NULL,
  `msrp` double DEFAULT NULL,
  `invoice` double DEFAULT NULL,
  `color_type` enum('External') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_id` (`vehicle_id`,`oem_option_code`) USING BTREE,
  CONSTRAINT `vehicle_colors_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88211 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_colors_media`
--

DROP TABLE IF EXISTS `vehicle_colors_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_colors_media` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_color_id` int unsigned NOT NULL,
  `url_2100` varchar(255) DEFAULT NULL,
  `url_1280` varchar(255) DEFAULT NULL,
  `url_640` varchar(255) DEFAULT NULL,
  `url_320` varchar(255) DEFAULT NULL,
  `shot_code` int NOT NULL,
  `type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_color_id` (`vehicle_color_id`),
  CONSTRAINT `vehicle_colors_media_ibfk_1` FOREIGN KEY (`vehicle_color_id`) REFERENCES `vehicle_colors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80777 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_inventory`
--

DROP TABLE IF EXISTS `vehicle_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_inventory` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int unsigned DEFAULT NULL,
  `dealer_id` int unsigned DEFAULT NULL,
  `year` year DEFAULT NULL,
  `model_number` varchar(20) DEFAULT NULL,
  `brand_id` int unsigned NOT NULL,
  `model_id` int unsigned NOT NULL,
  `trim` varchar(40) DEFAULT NULL,
  `vehicle_media_id` int unsigned DEFAULT NULL,
  `ms_code` varchar(20) DEFAULT NULL,
  `shipping` int DEFAULT NULL,
  `invoice` int DEFAULT NULL,
  `msrp` int DEFAULT NULL,
  `short_description` text,
  `year_display` varchar(50) DEFAULT NULL,
  `base_msrp_amount` int DEFAULT NULL,
  `current_mileage` int DEFAULT NULL,
  `miles` int DEFAULT NULL,
  `transmission` varchar(50) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `engine` varchar(50) DEFAULT NULL,
  `drive_train` varchar(20) DEFAULT NULL,
  `mpg` varchar(50) DEFAULT NULL,
  `exterior_color` varchar(100) DEFAULT NULL,
  `interior_color` varchar(100) DEFAULT NULL,
  `ext_color_generic` varchar(100) DEFAULT NULL,
  `int_color_generic` varchar(100) DEFAULT NULL,
  `lot_age` int DEFAULT NULL,
  `price` varchar(20) DEFAULT NULL,
  `stock_no` varchar(100) DEFAULT NULL,
  `vin` varchar(100) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT NULL,
  `ext_color_code` varchar(10) DEFAULT NULL,
  `int_color_code` varchar(10) DEFAULT NULL,
  `ext_color_hex_code` varchar(10) DEFAULT NULL,
  `int_color_hex_code` varchar(10) DEFAULT NULL,
  `source` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `vehicle_color_id` int unsigned DEFAULT NULL,
  `details` text,
  `sold` tinyint(1) DEFAULT '0',
  `archived` tinyint(1) DEFAULT '0',
  `interior_color_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vin` (`vin`),
  KEY `brand_id` (`brand_id`),
  KEY `model_id` (`model_id`),
  KEY `dealer_id` (`dealer_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `vehicle_media_id` (`vehicle_media_id`),
  KEY `vehicle_color_id` (`vehicle_color_id`),
  KEY `year` (`year`),
  KEY `msrp` (`msrp`),
  KEY `invoice` (`invoice`),
  KEY `is_completed` (`is_completed`),
  KEY `updated_at` (`updated_at`),
  KEY `interior_color_id` (`interior_color_id`),
  CONSTRAINT `vehicle_inventory_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `vehicle_inventory_ibfk_3` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`),
  CONSTRAINT `vehicle_inventory_ibfk_5` FOREIGN KEY (`vehicle_media_id`) REFERENCES `vehicle_media` (`vehicle_id`),
  CONSTRAINT `vehicle_inventory_ibfk_6` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`),
  CONSTRAINT `vehicle_inventory_ibfk_8` FOREIGN KEY (`interior_color_id`) REFERENCES `interior_colors` (`id`),
  CONSTRAINT `vehicle_inventory_ibfk_9` FOREIGN KEY (`vehicle_color_id`) REFERENCES `vehicle_colors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_media`
--

DROP TABLE IF EXISTS `vehicle_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_media` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int unsigned DEFAULT NULL,
  `url` text,
  `primary_color_option_code` varchar(20) DEFAULT NULL,
  `secondary_color_option_code` varchar(20) DEFAULT NULL,
  `primary_rgb` varchar(6) DEFAULT NULL,
  `secondary_rgb` varchar(6) DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `shot_code` tinyint DEFAULT NULL,
  `background_type` tinyint(1) DEFAULT NULL,
  `type` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_id` (`vehicle_id`,`primary_color_option_code`,`width`,`shot_code`,`background_type`),
  KEY `vehicle_media_id` (`vehicle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1772430 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_offer_conversations`
--

DROP TABLE IF EXISTS `vehicle_offer_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_offer_conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_offer_id` int unsigned NOT NULL,
  `price` int NOT NULL,
  `offered_by` enum('dealer','user') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_offer_id` (`vehicle_offer_id`),
  CONSTRAINT `vehicle_offer_conversations_ibfk_1` FOREIGN KEY (`vehicle_offer_id`) REFERENCES `vehicle_offers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_offers`
--

DROP TABLE IF EXISTS `vehicle_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_offers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_inventory_id` int unsigned NOT NULL,
  `user_id` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `last_offered_price` int DEFAULT NULL,
  `last_offer_made_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `premium` tinyint(1) NOT NULL DEFAULT '0',
  `order_number` char(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_offers_ibfk_1` (`vehicle_inventory_id`),
  KEY `vehicle_offers_ibfk_2` (`user_id`),
  CONSTRAINT `vehicle_offers_ibfk_1` FOREIGN KEY (`vehicle_inventory_id`) REFERENCES `vehicle_inventory` (`id`),
  CONSTRAINT `vehicle_offers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_options`
--

DROP TABLE IF EXISTS `vehicle_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_options` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int unsigned DEFAULT NULL,
  `chrome_option_code` varchar(20) DEFAULT NULL,
  `oem_option_code` varchar(20) DEFAULT NULL,
  `header_id` int DEFAULT NULL,
  `header_name` varchar(50) DEFAULT NULL,
  `consumer_friendly_header_id` int DEFAULT NULL,
  `consumer_friendly_header_name` varchar(50) DEFAULT NULL,
  `option_kind_id` int DEFAULT NULL,
  `description` text,
  `msrp` double DEFAULT NULL,
  `invoice` double DEFAULT NULL,
  `front_weight` double DEFAULT NULL,
  `rear_weight` double DEFAULT NULL,
  `price_state` varchar(50) DEFAULT NULL,
  `affecting_option_code` varchar(50) DEFAULT NULL,
  `special_equipment` tinyint(1) DEFAULT NULL,
  `extended_equipment` tinyint(1) DEFAULT NULL,
  `custom_equipment` tinyint(1) DEFAULT NULL,
  `option_package` tinyint DEFAULT NULL,
  `option_package_content_only` tinyint DEFAULT NULL,
  `discontinued` tinyint DEFAULT NULL,
  `option_family_code` varchar(50) DEFAULT NULL,
  `option_family_name` varchar(50) DEFAULT NULL,
  `selection_state` varchar(50) DEFAULT NULL,
  `unique_type_filter` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_options_ibfk_1` (`vehicle_id`),
  CONSTRAINT `vehicle_options_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=219543 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_rebate`
--

DROP TABLE IF EXISTS `vehicle_rebate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_rebate` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int DEFAULT NULL,
  `rebate_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_id` (`vehicle_id`,`rebate_id`),
  KEY `rebate_id` (`rebate_id`),
  CONSTRAINT `vehicle_rebate_ibfk_2` FOREIGN KEY (`rebate_id`) REFERENCES `rebates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_request_colors`
--

DROP TABLE IF EXISTS `vehicle_request_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_request_colors` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_request_id` int unsigned NOT NULL,
  `exterior_color_id` int unsigned DEFAULT NULL,
  `interior_color_id` int unsigned DEFAULT NULL,
  `color_type` enum('External','Internal') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_request_colors_ibfk_1` (`vehicle_request_id`),
  KEY `vehicle_request_colors_ibfk_2` (`exterior_color_id`),
  KEY `vehicle_request_colors_ibfk_3` (`interior_color_id`),
  CONSTRAINT `vehicel_request_colors_ibfk_2` FOREIGN KEY (`exterior_color_id`) REFERENCES `vehicle_colors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vehicle_request_color_ibfk_1` FOREIGN KEY (`vehicle_request_id`) REFERENCES `vehicle_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vehicle_request_colors_ibfk_4` FOREIGN KEY (`interior_color_id`) REFERENCES `interior_colors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_request_options`
--

DROP TABLE IF EXISTS `vehicle_request_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_request_options` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_request_id` int unsigned NOT NULL,
  `option_value` varchar(255) DEFAULT NULL,
  `option_code` varchar(50) DEFAULT NULL,
  `option_type` enum('Exterior','Interior','Option') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_request_colors_ibfk_1` (`vehicle_request_id`),
  CONSTRAINT `vehicle_request_options_ibfk_2` FOREIGN KEY (`vehicle_request_id`) REFERENCES `vehicle_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19350 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_request_preferences`
--

DROP TABLE IF EXISTS `vehicle_request_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_request_preferences` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `preferences` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6859 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_requests`
--

DROP TABLE IF EXISTS `vehicle_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `vehicle_id` int unsigned DEFAULT NULL,
  `vehicle_type` tinyint DEFAULT NULL,
  `price_type` tinyint(1) DEFAULT '1',
  `user_id` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `request_made_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_price` int DEFAULT NULL,
  `credit_score` tinyint(1) DEFAULT NULL,
  `order_number` char(40) DEFAULT NULL,
  `vehicle_req_preferences_id` int unsigned DEFAULT NULL,
  `buying_method` tinyint(1) DEFAULT NULL,
  `buying_time` tinyint(1) DEFAULT NULL,
  `min_price` int DEFAULT NULL,
  `max_price` int DEFAULT NULL,
  `referral_code` varchar(100) DEFAULT NULL,
  `is_complete` tinyint unsigned NOT NULL DEFAULT '1',
  `source_utm` tinyint DEFAULT NULL,
  `configuration_state_id` text,
  `request_type` tinyint DEFAULT NULL,
  `deal_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `car_direct_id` varchar(50) DEFAULT NULL,
  `style` varchar(50) DEFAULT NULL,
  `color_preference` varchar(50) DEFAULT NULL,
  `price_comment` varchar(255) DEFAULT NULL,
  `finance_method` varchar(50) DEFAULT NULL,
  `finance_type` varchar(50) DEFAULT NULL,
  `finance_amount` int DEFAULT NULL,
  `provider_id` int DEFAULT NULL,
  `provider_name` varchar(50) DEFAULT NULL,
  `deal_stage` varchar(191) DEFAULT NULL,
  `deposit_status` varchar(191) DEFAULT NULL,
  `credit_application_status` varchar(191) DEFAULT NULL,
  `insurance_status` varchar(191) DEFAULT NULL,
  `send_tradein_form` varchar(191) DEFAULT NULL,
  `tradein_acv` varchar(191) DEFAULT NULL,
  `portal_deal_stage` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_offers_ibfk_1` (`vehicle_id`),
  KEY `vehicle_offers_ibfk_2` (`user_id`),
  KEY `vehicle_requests_ibfk_3` (`vehicle_req_preferences_id`),
  CONSTRAINT `vehicle_requests_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `vehicle_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vehicle_requests_ibfk_3` FOREIGN KEY (`vehicle_req_preferences_id`) REFERENCES `vehicle_request_preferences` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6898 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `brand_id` int unsigned NOT NULL,
  `model_id` int unsigned NOT NULL,
  `model_no` varchar(50) DEFAULT NULL,
  `trim` varchar(100) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `friendly_model_name` varchar(100) DEFAULT NULL,
  `friendly_style_name` varchar(100) DEFAULT NULL,
  `friendly_drivetrain` varchar(100) DEFAULT NULL,
  `friendly_body_type` varchar(100) DEFAULT NULL,
  `base_invoice` double DEFAULT NULL,
  `destination` double DEFAULT NULL,
  `year` int DEFAULT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  `image_url_320` varchar(256) DEFAULT NULL,
  `image_url_640` varchar(256) DEFAULT NULL,
  `image_url_1280` varchar(256) DEFAULT NULL,
  `image_url_2100` varchar(256) DEFAULT NULL,
  `media_status` tinyint(1) DEFAULT NULL,
  `media_update_at` timestamp NULL DEFAULT NULL,
  `is_supported` tinyint(1) NOT NULL DEFAULT '1',
  `is_new` tinyint NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_enable` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  KEY `model_id` (`model_id`),
  CONSTRAINT `vehicles_ibfk_3` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=449795 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `years`
--

DROP TABLE IF EXISTS `years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `years` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `year` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '0',
  `is_scrapable` int NOT NULL DEFAULT '0',
  `is_default` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-30 20:10:49
