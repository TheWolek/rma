-- MySQL dump 10.13  Distrib 5.5.62, for Win64 (AMD64)
--
-- Host: 51.83.128.108    Database: rma
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `shelve` int NOT NULL,
  `category` varchar(100) NOT NULL,
  `ticket_id` int NOT NULL,
  `sn` varchar(100) NOT NULL,
  `barcode` varchar(100) NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `items_un` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `packageCollect`
--

DROP TABLE IF EXISTS `packageCollect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packageCollect` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ref_name` varchar(100) NOT NULL,
  `status` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `packageCollect_FK` (`status`),
  CONSTRAINT `packageCollect_FK` FOREIGN KEY (`status`) REFERENCES `packageCollect_statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `packageCollect_items`
--

DROP TABLE IF EXISTS `packageCollect_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packageCollect_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collect_id` int NOT NULL,
  `waybill` varchar(100) NOT NULL,
  `ticket_id` int NOT NULL,
  `barcode` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `packageCollect_items_FK` (`collect_id`),
  CONSTRAINT `packageCollect_items_FK` FOREIGN KEY (`collect_id`) REFERENCES `packageCollect` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `packageCollect_statuses`
--

DROP TABLE IF EXISTS `packageCollect_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packageCollect_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shelves`
--

DROP TABLE IF EXISTS `shelves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shelves` (
  `shelve_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  PRIMARY KEY (`shelve_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spareparts`
--

DROP TABLE IF EXISTS `spareparts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts` (
  `part_id` int NOT NULL AUTO_INCREMENT,
  `cat_id` int NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`part_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spareparts_cat`
--

DROP TABLE IF EXISTS `spareparts_cat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_cat` (
  `part_cat_id` int NOT NULL AUTO_INCREMENT,
  `producer` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`part_cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spareparts_orders`
--

DROP TABLE IF EXISTS `spareparts_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_orders` (
  `part_order_id` int NOT NULL AUTO_INCREMENT,
  `expected_date` date NOT NULL,
  `status` int NOT NULL,
  `supplier_id` int NOT NULL,
  `recive_date` date DEFAULT NULL,
  PRIMARY KEY (`part_order_id`),
  KEY `spareparts_orders_FK` (`supplier_id`),
  CONSTRAINT `spareparts_orders_FK` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spareparts_orders_items`
--

DROP TABLE IF EXISTS `spareparts_orders_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_orders_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `part_cat_id` int NOT NULL,
  `amount` int NOT NULL,
  `order_id` int NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `spareparts_orders_items_FK` (`order_id`),
  CONSTRAINT `spareparts_orders_items_FK` FOREIGN KEY (`order_id`) REFERENCES `spareparts_orders` (`part_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spareparts_orders_statuses`
--

DROP TABLE IF EXISTS `spareparts_orders_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_orders_statuses` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spareparts_sn`
--

DROP TABLE IF EXISTS `spareparts_sn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_sn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codes` varchar(100) NOT NULL,
  `item_id` int NOT NULL,
  `part_id` int NOT NULL,
  `shelve` int NOT NULL,
  `isUsed` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `spareparts_orders_items_sn_FK` (`item_id`),
  CONSTRAINT `spareparts_orders_items_sn_FK` FOREIGN KEY (`item_id`) REFERENCES `spareparts_orders_items` (`order_item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `device_sn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `device_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `device_producer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` int NOT NULL,
  `issue` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lines` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `postCode` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `device_cat` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `lastStatusUpdate` datetime DEFAULT NULL,
  `inWarehouse` tinyint(1) NOT NULL DEFAULT '0',
  `damage_description` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `damage_type` int NOT NULL,
  `result_type` int DEFAULT NULL,
  `result_description` varchar(100) COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `diagnose` varchar(250) COLLATE utf8mb4_polish_ci DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `tickets_FK` (`damage_type`),
  CONSTRAINT `tickets_FK` FOREIGN KEY (`damage_type`) REFERENCES `tickets_damage_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_actions`
--

DROP TABLE IF EXISTS `tickets_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_actions` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `action_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `action_price` decimal(10,2) NOT NULL,
  `ticket_id` int NOT NULL,
  PRIMARY KEY (`action_id`),
  KEY `tickets_actions_FK` (`ticket_id`),
  CONSTRAINT `tickets_actions_FK` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_additionalAccessories`
--

DROP TABLE IF EXISTS `tickets_additionalAccessories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_additionalAccessories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tickets_additionalAccesories_FK_1` (`type_id`),
  KEY `tickets_additionalAccesories_FK` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_aditionalAccessories_types`
--

DROP TABLE IF EXISTS `tickets_aditionalAccessories_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_aditionalAccessories_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_comments`
--

DROP TABLE IF EXISTS `tickets_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `comment` varchar(100) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `tickets_comments_FK` (`ticket_id`),
  CONSTRAINT `tickets_comments_FK` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_damage_types`
--

DROP TABLE IF EXISTS `tickets_damage_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_damage_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_logs`
--

DROP TABLE IF EXISTS `tickets_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` varchar(100) NOT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int NOT NULL,
  `ticket_id` int NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `tickets_logs_FK` (`user_id`),
  CONSTRAINT `tickets_logs_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_result_types`
--

DROP TABLE IF EXISTS `tickets_result_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_result_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_spareparts`
--

DROP TABLE IF EXISTS `tickets_spareparts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_spareparts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `sparepart_sn` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `NewTable_FK` (`ticket_id`),
  CONSTRAINT `NewTable_FK` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_statuses_types`
--

DROP TABLE IF EXISTS `tickets_statuses_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets_statuses_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `user_role_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role` varchar(100) NOT NULL,
  PRIMARY KEY (`user_role_id`),
  KEY `user_roles_FK` (`user_id`),
  CONSTRAINT `user_roles_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(100) NOT NULL,
  `password` varchar(200) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_date` timestamp NULL DEFAULT NULL,
  `change_password` tinyint NOT NULL DEFAULT '0',
  `deleted` tinyint NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `warehouse_canceled_from_bufor_shelve_items`
--

DROP TABLE IF EXISTS `warehouse_canceled_from_bufor_shelve_items`;
/*!50001 DROP VIEW IF EXISTS `warehouse_canceled_from_bufor_shelve_items`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_canceled_from_bufor_shelve_items` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `warehouse_canceled_from_verification`
--

DROP TABLE IF EXISTS `warehouse_canceled_from_verification`;
/*!50001 DROP VIEW IF EXISTS `warehouse_canceled_from_verification`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_canceled_from_verification` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `warehouse_entry_shelve_items`
--

DROP TABLE IF EXISTS `warehouse_entry_shelve_items`;
/*!50001 DROP VIEW IF EXISTS `warehouse_entry_shelve_items`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_entry_shelve_items` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `warehouse_leave_diagnose`
--

DROP TABLE IF EXISTS `warehouse_leave_diagnose`;
/*!50001 DROP VIEW IF EXISTS `warehouse_leave_diagnose`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_leave_diagnose` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL,
  `shelve_id` tinyint NOT NULL,
  `code` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `warehouse_tasks_lists`
--

DROP TABLE IF EXISTS `warehouse_tasks_lists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouse_tasks_lists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `displayName` varchar(100) NOT NULL,
  `type` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `shelve_out` int NOT NULL,
  `shelve_in` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `warehouse_toBufor_shelve_items`
--

DROP TABLE IF EXISTS `warehouse_toBufor_shelve_items`;
/*!50001 DROP VIEW IF EXISTS `warehouse_toBufor_shelve_items`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_toBufor_shelve_items` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `warehouse_toDiagnose_fromBufor_shelve_items`
--

DROP TABLE IF EXISTS `warehouse_toDiagnose_fromBufor_shelve_items`;
/*!50001 DROP VIEW IF EXISTS `warehouse_toDiagnose_fromBufor_shelve_items`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_toDiagnose_fromBufor_shelve_items` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `warehouse_toDiagnose_shelve_items`
--

DROP TABLE IF EXISTS `warehouse_toDiagnose_shelve_items`;
/*!50001 DROP VIEW IF EXISTS `warehouse_toDiagnose_shelve_items`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `warehouse_toDiagnose_shelve_items` (
  `item_id` tinyint NOT NULL,
  `category` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `ticket_id` tinyint NOT NULL,
  `barcode` tinyint NOT NULL,
  `sn` tinyint NOT NULL,
  `shelve_id` tinyint NOT NULL,
  `code` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `waybills`
--

DROP TABLE IF EXISTS `waybills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `waybills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `waybill_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ticket_id` int NOT NULL,
  `status` varchar(100) NOT NULL,
  `type` varchar(100) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUpdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `waybills_FK` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'rma'
--

--
-- Final view structure for view `warehouse_canceled_from_bufor_shelve_items`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_canceled_from_bufor_shelve_items`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_canceled_from_bufor_shelve_items`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_canceled_from_bufor_shelve_items` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn` from ((`items` `i` join `tickets` `t` on((`i`.`ticket_id` = `t`.`ticket_id`))) join `shelves` `s` on((`i`.`shelve` = `s`.`shelve_id`))) where ((`t`.`status` = 11) and (`s`.`shelve_id` = 5)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `warehouse_canceled_from_verification`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_canceled_from_verification`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_canceled_from_verification`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_canceled_from_verification` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn` from ((`items` `i` join `tickets` `t` on((`t`.`ticket_id` = `i`.`ticket_id`))) join `shelves` `s` on((`i`.`shelve` = `s`.`shelve_id`))) where ((`t`.`status` = 11) and (`s`.`shelve_id` = 2)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `warehouse_entry_shelve_items`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_entry_shelve_items`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_entry_shelve_items`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_entry_shelve_items` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn` from `items` `i` where (`i`.`shelve` = 0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `warehouse_leave_diagnose`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_leave_diagnose`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_leave_diagnose`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_leave_diagnose` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn`,`s`.`shelve_id` AS `shelve_id`,`s`.`code` AS `code` from ((`items` `i` join `shelves` `s` on((`i`.`shelve` = `s`.`shelve_id`))) join `tickets` `t` on((`t`.`ticket_id` = `i`.`ticket_id`))) where (`s`.`shelve_id` = 4) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `warehouse_toBufor_shelve_items`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_toBufor_shelve_items`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_toBufor_shelve_items`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_toBufor_shelve_items` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn` from (`items` `i` join `tickets` `t` on((`t`.`ticket_id` = `i`.`ticket_id`))) where (`t`.`status` in (6,7)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `warehouse_toDiagnose_fromBufor_shelve_items`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_toDiagnose_fromBufor_shelve_items`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_toDiagnose_fromBufor_shelve_items`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_toDiagnose_fromBufor_shelve_items` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn` from (`items` `i` join `tickets` `t` on((`t`.`ticket_id` = `i`.`ticket_id`))) where (`t`.`status` = 6) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `warehouse_toDiagnose_shelve_items`
--

/*!50001 DROP TABLE IF EXISTS `warehouse_toDiagnose_shelve_items`*/;
/*!50001 DROP VIEW IF EXISTS `warehouse_toDiagnose_shelve_items`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dpp`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `warehouse_toDiagnose_shelve_items` AS select `i`.`item_id` AS `item_id`,`i`.`category` AS `category`,`i`.`name` AS `name`,`i`.`ticket_id` AS `ticket_id`,`i`.`barcode` AS `barcode`,`i`.`sn` AS `sn`,`s`.`shelve_id` AS `shelve_id`,`s`.`code` AS `code` from ((`items` `i` join `shelves` `s` on((`i`.`shelve` = `s`.`shelve_id`))) join `tickets` `t` on((`t`.`ticket_id` = `i`.`ticket_id`))) where ((`t`.`status` = 4) and (`s`.`shelve_id` = 2)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-18 14:56:43
