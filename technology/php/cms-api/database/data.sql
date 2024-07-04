-- MySQL dump 10.13  Distrib 8.1.0, for macos13.3 (x86_64)
--
-- Host: localhost    Database: cms-staging
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
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (6,'2019_09_13_143931_create_admins_table',1),(13,'2016_06_01_000001_create_oauth_auth_codes_table',2),(14,'2016_06_01_000002_create_oauth_access_tokens_table',2),(15,'2016_06_01_000003_create_oauth_refresh_tokens_table',2),(16,'2016_06_01_000004_create_oauth_clients_table',2),(17,'2016_06_01_000005_create_oauth_personal_access_clients_table',2),(18,'2019_09_13_143931_create_cms_users_table',2),(19,'2019_09_15_180011_create_password_resets_table',2),(20,'2019_09_30_021420_create_permission_tables',2),(21,'2019_11_25_100835_create_locations_table',2),(22,'2019_11_27_045743_add_location_id_to_cms_user_table',2),(23,'2019_11_28_050451_remove_user_from_cms_users_table',2),(24,'2019_12_18_135435_create_logs_table',3),(25,'2019_12_26_032928_create_file_tokens_table',4),(26,'2019_12_26_114404_add_expire_at_to_file_token_table',5),(27,'2019_12_29_204526_add_cms_user_to_file_token_table',5),(28,'2020_01_07_025903_add_deleted_at_to_cms_user_table',6),(29,'2020_01_07_033301_add_nullable_to_cms_user_last_name_field',6),(30,'2020_02_05_034452_add_cms_user_name_to_logs_table',7),(31,'2020_02_05_035536_update_log_relation',7),(32,'2020_02_07_061551_create_failed_jobs_table',8),(33,'2020_02_09_214709_create_m_makes_table',9),(34,'2020_02_09_221352_create_m_models_table',9),(35,'2020_02_10_020826_create_m_inventories_table',9),(36,'2020_02_10_043302_create_m_dealers_table',9),(37,'2020_02_10_055953_add_dealer_id_to_inventory',9),(38,'2020_03_16_063218_create_quotes_table',10),(39,'2020_03_17_085148_add_dealer_to_quote_table',11),(40,'2020_05_14_082245_create_dealers_table',12),(41,'2020_05_15_060640_create_dealer_contacts_table',13),(42,'2020_05_19_042715_add_address_to_quote_table',13),(43,'2020_06_18_090001_add_cms_user_to_quote',14),(44,'2020_07_15_134630_update_quote_table',15),(45,'2020_07_20_034547_add_fields_to_quote',16),(46,'2020_07_24_092647_add_total_customer_payment_to_qutoe',17),(47,'2020_08_17_092530_add_expense_charged_dealer_to_quote',18),(48,'2020_08_23_142316_update_quote_fields',19),(49,'2020_09_06_140243_add_invoice_to_client_to_quote_table',20),(50,'2020_10_09_141532_add_is_active_to_cms_user_table',21),(51,'2020_12_21_123250_create_vendors_table',22),(52,'2020_12_21_124246_create_contacts_table',22),(53,'2020_12_28_061855_create_purchase_order_table',23),(54,'2021_01_28_120501_change_amount_type_purchase_order_table',24),(55,'2021_01_29_052610_add_promocode_to_cms_users_table',25),(56,'2021_04_19_111403_create_wholesalequote_table',26),(57,'2021_04_20_062830_update_wholesalequote_table',26),(59,'2022_03_06_160240_add_source_to_user_table',27),(60,'2022_04_08_094955_update_contact_owners',28),(61,'2022_04_19_125948_update_wholesale_quote',29),(62,'2022_04_20_070714_update_stwholesale_quote',30),(63,'2022_04_26_090610_update_wholesale_quote_add_check_to_client_at_column',31),(64,'2022_05_04_061406_update_contact_owner',32),(65,'2022_11_07_102909_create_client_files_table',33),(66,'2022_12_13_140409_table_column_headings',34),(67,'2023_01_04_121737_update_cms_user',35),(68,'2023_01_09_125956_update_cms_users_table_columns',36),(69,'2023_02_03_124129_createjobsfor_zimbramail',37),(70,'2023_02_03_124604_create_zimbra_mail_box_table',37),(71,'2023_02_03_125154_create_twilio_sms_table',37),(72,'2023_02_03_140754_update_zimbra_token_column_in_cms_user',38),(73,'2023_02_27_120010_add_reset_required_column_in_cms_user_table',39),(74,'2023_03_14_080031_add_unique_message_id_to_mailbox_table',40),(75,'2023_03_16_102617_phone_numbers',40),(76,'2022_11_15_184719_create_websockets_statistics_entries_table',41),(77,'2023_03_21_103620_cms_deal_stage',41),(78,'2023_03_21_105318_hubspot_trigger_type',41),(79,'2023_03_21_105446_hubspot_workflow',41),(80,'2023_03_21_105735_workflow_event_history',41),(81,'2023_03_21_105911_sms_template',41),(82,'2023_03_21_110149_add_dealstage_column_in_vehicle_requests',41),(83,'2023_03_23_090401_update_workflow_table',42),(84,'2023_03_31_095525_update_contact_table',43),(85,'2023_04_19_094610_create_jobs_table',45),(86,'2023_04_26_101952_workflow_property',46),(87,'2023_05_19_125433_add_personal_email_column_in_cms_users_table',47),(88,'2023_04_04_124115_add_pipeline_column_in_cms_deal_stage',44),(89,'2023_05_16_055419_update_lead_column_in_quotes_table',1),(90,'2023_04_24_093414_workflow_property',1),(91,'2023_06_04_154719_create_task_table',48),(92,'2023_06_12_053802_update_quotes',48),(93,'2023_06_12_061640_update_vehicle_requests_table',48),(94,'2023_06_12_073551_update_user_table',48),(95,'2023_06_12_103928_update_cms_user_table',49),(96,'2023_06_20_113654_added_2factor_to_cms_user_table',50),(98,'2023_07_11_124446_update_task_due_date',50),(99,'2023_07_12_070246_add_last_active_column__cms_user',50),(100,'2023_07_12_140135_update_type_of_task_owner_column_in_task_table',51),(101,'2023_06_20_114125_cms_user_phone_otp',52),(102,'2023_07_21_073408_add__wholesalequoteid_column_purchase_order_table',53),(103,'2023_07_21_094805_add__totalexpensevendor_column_wholesale_quote_table',53),(104,'2023_07_26_113728_add__createby_column__task__table',53),(105,'2023_08_02_054032_update_wholesale_quote_mmr_column',54),(106,'2023_08_07_063633_update_wholesale_quote_sales_tax_column',54),(107,'2023_08_07_063707_update_quote_sales_tax_column',54),(108,'2023_08_09_071714_update_deal_id_in_workflow_event_history',54),(109,'2023_08_10_042705_rename_all_tables',54),(110,'2023_09_08_100021_create_years_table',54),(111,'2023_09_08_115639_create_scraper_logs_table',54),(112,'2023_09_08_121728_update_models_table',54),(113,'2023_09_08_122215_update_vehicles_table',54),(114,'2023_09_08_122426_update_brand_table',54),(120,'2023_09_20_143931_create_calls_table',55),(121,'2023_07_26_143931_create_last_indexed_page_table',55),(122,'2023_07_26_143931_create_messages_table',55),(123,'2023_07_28_143931_create_phone_sources_table',55),(124,'2023_07_28_143932_add__phonesourceid_column_phone_numbers_table',55),(128,'2023_09_20_143932_renamed__cms_user_id_column_phone_numbers_table',56),(129,'2023_07_26_143931_create_calls_table',56),(130,'2023_09_20_143931_create_last_indexed_page_table',55),(131,'2023_09_20_143931_create_messages_table',55),(132,'2023_09_20_143931_create_phone_sources_table',55),(133,'2023_09_20_143932_add__phonesourceid_column_phone_numbers_table',55),(134,'2023_10_03_090451_update_portal_user_table',57),(135,'2023_10_13_085800_add_mark_as_final_column_in_quotes_table',58),(136,'2023_10_13_090253_add_mark_as_final_column_in_wholesale_quotes_table',58),(137,'2023_10_27_060139_create_email_templates__table',59),(138,'2023_11_27_132119_add_current_enrollment_count_in_workflows_and_event_history',60),(139,'2023_11_27_155929_add_current_enrollment_count_in_workflows_and_event_history',61),(140,'2023_11_30_121947_add_portal_user_id_in_workflow_event_history',61),(141,'2023_12_05_122032_workflow_setting',62),(142,'2023_12_05_123024_workflow_verification',62),(143,'2023_12_12_094243_add_sid_in_phone_numbers',63),(144,'2023_12_19_121803_add_portal_deal_stage_column_vehicle_requests',64),(145,'2024_01_03_121449_update_deal_stages_table',65),(148,'2024_01_24_093924_add_uuid_in_workflow_event_history',66);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-30 20:10:49
