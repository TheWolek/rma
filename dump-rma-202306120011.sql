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
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `items_un` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (92,'Xiaomi',10,'smartwatch',49,'4812783712899');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `shelves`
--

LOCK TABLES `shelves` WRITE;
/*!40000 ALTER TABLE `shelves` DISABLE KEYS */;
INSERT INTO `shelves` VALUES (0,'PAL_ENT_0'),(1,'SH_GAB_1'),(2,'SH_GAB_2'),(3,'SH_GAB_3'),(4,'SH_GAB_4'),(5,'SH_GAB_5'),(6,'SH_NOTE_1'),(7,'SH_NOTE_2'),(8,'SH_NOTE_3'),(9,'SH_NOTE_4'),(10,'CONT_AB_1'),(11,'CONT_AB_2'),(12,'CONT_ALSO_1'),(13,'CONT_ALSO_2'),(14,'CONT_INCOM_1'),(15,'CONT_VERACOMP_1'),(16,'SH_AB_1'),(17,'SH_ALSO_1'),(18,'ABM_LS_1'),(19,'ABM_LS_2'),(20,'ABM_LS_3'),(21,'ABM_LS_4'),(22,'SH_LS_1'),(23,'SH_WIZ_1'),(24,'SH_WTIRP_1'),(25,'SH_DIN_1'),(26,'SH_OUTLET_1'),(27,'SH_QA_1');
/*!40000 ALTER TABLE `shelves` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `spareparts`
--

LOCK TABLES `spareparts` WRITE;
/*!40000 ALTER TABLE `spareparts` DISABLE KEYS */;
INSERT INTO `spareparts` VALUES (17,2,0);
/*!40000 ALTER TABLE `spareparts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `spareparts_cat`
--

LOCK TABLES `spareparts_cat` WRITE;
/*!40000 ALTER TABLE `spareparts_cat` DISABLE KEYS */;
INSERT INTO `spareparts_cat` VALUES (1,'TME','rezystor','rezystor R11'),(2,'TME','rezystor','rezystor R12'),(3,'DELL','klawiatura','klawiatura QWERTY'),(4,'Lenovo','klawiatura','klawiatura QWERTY'),(5,'HP','klawiatura','klawiatura QWERTY'),(6,'DELL','wyĹ›wietlacz 15\"','matryca LCD 15\"'),(8,'tajwanex','rezystor','rezystor R11'),(10,'HP','test','test');
/*!40000 ALTER TABLE `spareparts_cat` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts_orders`
--

LOCK TABLES `spareparts_orders` WRITE;
/*!40000 ALTER TABLE `spareparts_orders` DISABLE KEYS */;
INSERT INTO `spareparts_orders` VALUES (43,'2023-05-29',2,2,NULL);
/*!40000 ALTER TABLE `spareparts_orders` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts_orders_items`
--

LOCK TABLES `spareparts_orders_items` WRITE;
/*!40000 ALTER TABLE `spareparts_orders_items` DISABLE KEYS */;
INSERT INTO `spareparts_orders_items` VALUES (53,2,2,43);
/*!40000 ALTER TABLE `spareparts_orders_items` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `spareparts_orders_statuses`
--

LOCK TABLES `spareparts_orders_statuses` WRITE;
/*!40000 ALTER TABLE `spareparts_orders_statuses` DISABLE KEYS */;
INSERT INTO `spareparts_orders_statuses` VALUES (0,'nowy'),(1,'potwierdzony'),(2,'odebrany'),(3,'wstrzymany'),(4,'anulowany');
/*!40000 ALTER TABLE `spareparts_orders_statuses` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts_sn`
--

LOCK TABLES `spareparts_sn` WRITE;
/*!40000 ALTER TABLE `spareparts_sn` DISABLE KEYS */;
INSERT INTO `spareparts_sn` VALUES (23,'sn2',53,17,0,1),(24,'sn1',53,17,0,1);
/*!40000 ALTER TABLE `spareparts_sn` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'AB'),(2,'ALSO'),(3,'TMC'),(4,'Tajwanex');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

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
  `device_accessories` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
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
  PRIMARY KEY (`ticket_id`),
  KEY `tickets_FK` (`damage_type`),
  CONSTRAINT `tickets_FK` FOREIGN KEY (`damage_type`) REFERENCES `tickets_damage_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (50,'test@test.pl','Adam Nowak','666222333','923813','Vostro 3000','Dell',1,NULL,'Nie uruchamia się',1,'2023-06-11 20:39:00','Księżycowa 22/5','42-200','Częstochowa','laptopy',NULL,0,'widoczne zarysowania na obudowie',2,NULL,NULL),(51,'test@test.pl','Weronika Kot','636 127 381','9389128381','ideaPad 2330','lenovo',1,NULL,'nie uruchamia się. Przepalony rezystor',9,'2023-06-11 21:35:26','ulica 123/2','42-321','Częstochowa','laptopy','2023-06-11 22:01:00',0,'',1,1,'W laptopie wymieniono rezystor. Laptop uruchamia się i przechodzi testy.');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `tickets_additionalAccesories_FK` (`ticket_id`),
  KEY `tickets_additionalAccesories_FK_1` (`type_id`),
  CONSTRAINT `tickets_additionalAccesories_FK` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`),
  CONSTRAINT `tickets_additionalAccesories_FK_1` FOREIGN KEY (`type_id`) REFERENCES `tickets_aditionalAccessories_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets_additionalAccessories`
--

LOCK TABLES `tickets_additionalAccessories` WRITE;
/*!40000 ALTER TABLE `tickets_additionalAccessories` DISABLE KEYS */;
INSERT INTO `tickets_additionalAccessories` VALUES (114,50,1),(115,50,3),(116,50,4),(121,51,1),(122,51,4);
/*!40000 ALTER TABLE `tickets_additionalAccessories` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tickets_aditionalAccessories_types`
--

LOCK TABLES `tickets_aditionalAccessories_types` WRITE;
/*!40000 ALTER TABLE `tickets_aditionalAccessories_types` DISABLE KEYS */;
INSERT INTO `tickets_aditionalAccessories_types` VALUES (1,'Oryginalne opakowanie'),(2,'Opakowanie zastępcze'),(3,'Dokumenty'),(4,'Zasilacz'),(5,'Kabel usb'),(6,'Przejściówka usb'),(7,'Kabel jack'),(8,'Pokrowiec'),(9,'Folia ochronna');
/*!40000 ALTER TABLE `tickets_aditionalAccessories_types` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets_comments`
--

LOCK TABLES `tickets_comments` WRITE;
/*!40000 ALTER TABLE `tickets_comments` DISABLE KEYS */;
INSERT INTO `tickets_comments` VALUES (5,51,'Wymiana rezystora R12','2023-06-11 21:56:38');
/*!40000 ALTER TABLE `tickets_comments` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tickets_damage_types`
--

LOCK TABLES `tickets_damage_types` WRITE;
/*!40000 ALTER TABLE `tickets_damage_types` DISABLE KEYS */;
INSERT INTO `tickets_damage_types` VALUES (1,'Stan bardzo dobry'),(2,'Stan dobry'),(3,'Widoczne zarysowania'),(4,'lekko uszkodzony'),(5,'mocno uszkodzony');
/*!40000 ALTER TABLE `tickets_damage_types` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tickets_result_types`
--

LOCK TABLES `tickets_result_types` WRITE;
/*!40000 ALTER TABLE `tickets_result_types` DISABLE KEYS */;
INSERT INTO `tickets_result_types` VALUES (1,'Naprawa'),(2,'Płatna naprawa'),(3,'NTF - no trouble found'),(4,'Odmowa naprawy przez klienta'),(5,'Odmowa naprawy przez serwis'),(6,'Anulowanie');
/*!40000 ALTER TABLE `tickets_result_types` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets_spareparts`
--

LOCK TABLES `tickets_spareparts` WRITE;
/*!40000 ALTER TABLE `tickets_spareparts` DISABLE KEYS */;
INSERT INTO `tickets_spareparts` VALUES (15,51,'sn1');
/*!40000 ALTER TABLE `tickets_spareparts` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets_statuses_types`
--

LOCK TABLES `tickets_statuses_types` WRITE;
/*!40000 ALTER TABLE `tickets_statuses_types` DISABLE KEYS */;
INSERT INTO `tickets_statuses_types` VALUES (1,'Nowy'),(2,'Oczekuje na dostarczenie'),(3,'Przyjęto w serwisie'),(4,'Przekazano do diagnozy'),(5,'W realizacji'),(6,'Zleceno kontakt'),(7,'Oczekuje na częsci'),(8,'Przekazano do odesłania'),(9,'Zakończone'),(10,'Do anulowania'),(11,'Anulowane');
/*!40000 ALTER TABLE `tickets_statuses_types` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `waybills_FK` (`ticket_id`),
  CONSTRAINT `waybills_FK` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waybills`
--

LOCK TABLES `waybills` WRITE;
/*!40000 ALTER TABLE `waybills` DISABLE KEYS */;
INSERT INTO `waybills` VALUES (35,'1Z756415646',51,'odebrany','przychodzący','2023-06-11 21:47:30','2023-06-11 21:47:00'),(36,'31872371892',51,'potwierdzony','wychodzący','2023-06-11 22:01:19',NULL);
/*!40000 ALTER TABLE `waybills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'rma'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-12  0:11:31
