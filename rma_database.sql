-- MySQL dump 10.13  Distrib 5.5.62, for Win64 (AMD64)
--
-- Host: localhost    Database: rma
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.20-MariaDB

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
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `shelve` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `items_un` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (28,'DELL XPS 12',0,'laptopy',1),(31,'Lenovo Ideapad',0,'laptopy',2),(32,'Lenovo ThinkBook',0,'laptopy',3),(33,'HP 14s',0,'laptopy',4),(34,'Logitech G502',0,'mysz',5),(35,'Razer Blackwidow',0,'klawiatura',6);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shelves`
--

DROP TABLE IF EXISTS `shelves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shelves` (
  `shelve_id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  PRIMARY KEY (`shelve_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shelves`
--

LOCK TABLES `shelves` WRITE;
/*!40000 ALTER TABLE `shelves` DISABLE KEYS */;
INSERT INTO `shelves` VALUES (0,'PAL_ENT_0'),(1,'SH_GAB_1'),(2,'SH_GAB_2'),(3,'SH_GAB_3'),(4,'SH_GAB_4'),(5,'SH_GAB_5'),(6,'SH_NOTE_1'),(7,'SH_NOTE_2'),(8,'SH_NOTE_3'),(9,'SH_NOTE_4'),(10,'CONT_AB_1'),(11,'CONT_AB_2'),(12,'CONT_ALSO_1'),(13,'CONT_ALSO_2'),(14,'CONT_INCOM_1'),(15,'CONT_VERACOMP_1'),(16,'SH_AB_1'),(17,'SH_ALSO_1'),(18,'ABM_1'),(19,'ABM_2'),(20,'ABM_3'),(21,'ABM_4'),(22,'SH_LS_1'),(23,'SH_WIZ_1'),(24,'SH_WTIRP_1'),(25,'SH_DIN_1'),(26,'SH_OUTLET_1'),(27,'SH_QA_1');
/*!40000 ALTER TABLE `shelves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spareparts`
--

DROP TABLE IF EXISTS `spareparts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts` (
  `part_id` int(11) NOT NULL AUTO_INCREMENT,
  `cat_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `shelve` int(11) NOT NULL,
  PRIMARY KEY (`part_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts`
--

LOCK TABLES `spareparts` WRITE;
/*!40000 ALTER TABLE `spareparts` DISABLE KEYS */;
INSERT INTO `spareparts` VALUES (1,2,2,1),(2,2,2,2),(3,1,1,1),(4,8,2,3),(5,6,2,3),(6,6,2,2),(7,8,1,1);
/*!40000 ALTER TABLE `spareparts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spareparts_cat`
--

DROP TABLE IF EXISTS `spareparts_cat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_cat` (
  `part_cat_id` int(11) NOT NULL AUTO_INCREMENT,
  `producer` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`part_cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts_cat`
--

LOCK TABLES `spareparts_cat` WRITE;
/*!40000 ALTER TABLE `spareparts_cat` DISABLE KEYS */;
INSERT INTO `spareparts_cat` VALUES (1,'TME','rezystor','rezystor R11'),(2,'TME','rezystor','rezystor R12'),(3,'DELL','klawiatura','klawiatura QWERTY'),(4,'Lenovo','klawiatura','klawiatura QWERTY'),(5,'HP','klawiatura','klawiatura QWERTY'),(6,'DELL','wyświetlacz 15\"','matryca LCD 15\"'),(8,'tajwanex','rezystor','rezystor R11');
/*!40000 ALTER TABLE `spareparts_cat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spareparts_orders`
--

DROP TABLE IF EXISTS `spareparts_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_orders` (
  `part_order_id` int(11) NOT NULL AUTO_INCREMENT,
  `expected_date` date NOT NULL,
  `status` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  PRIMARY KEY (`part_order_id`),
  KEY `spareparts_orders_FK` (`supplier_id`),
  CONSTRAINT `spareparts_orders_FK` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts_orders`
--

LOCK TABLES `spareparts_orders` WRITE;
/*!40000 ALTER TABLE `spareparts_orders` DISABLE KEYS */;
INSERT INTO `spareparts_orders` VALUES (9,'2022-03-06',0,1),(10,'2022-03-07',1,1),(11,'2022-02-16',0,2),(12,'2022-02-18',0,1),(13,'2022-04-01',0,3),(14,'2022-04-01',0,4),(15,'2022-04-01',1,4),(23,'2022-04-03',0,2),(24,'2022-04-03',0,1),(25,'2022-04-04',0,4),(30,'2022-04-09',0,3);
/*!40000 ALTER TABLE `spareparts_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spareparts_orders_items`
--

DROP TABLE IF EXISTS `spareparts_orders_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_orders_items` (
  `order_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `part_cat_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `spareparts_orders_items_FK` (`order_id`),
  CONSTRAINT `spareparts_orders_items_FK` FOREIGN KEY (`order_id`) REFERENCES `spareparts_orders` (`part_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spareparts_orders_items`
--

LOCK TABLES `spareparts_orders_items` WRITE;
/*!40000 ALTER TABLE `spareparts_orders_items` DISABLE KEYS */;
INSERT INTO `spareparts_orders_items` VALUES (1,2,10,9),(2,2,3,10),(3,3,1,11),(4,2,2,12),(5,6,2,13),(6,1,1,14),(7,1,1,15),(8,6,5,23),(9,3,3,9),(10,2,3,14);
/*!40000 ALTER TABLE `spareparts_orders_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spareparts_orders_statuses`
--

DROP TABLE IF EXISTS `spareparts_orders_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spareparts_orders_statuses` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
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
  `ticket_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `device_sn` varchar(100) NOT NULL,
  `device_name` varchar(100) NOT NULL,
  `device_producer` varchar(100) NOT NULL,
  `type` int(11) NOT NULL,
  `device_accessories` varchar(100) DEFAULT NULL,
  `issue` varchar(250) NOT NULL,
  `status` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (10,'test@com.com','imie nazwisko','666666666','sn01','nazwa','Dell',1,'undefined','nie działa',1,'2022-02-05 20:24:13');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
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

-- Dump completed on 2022-04-10 13:03:07