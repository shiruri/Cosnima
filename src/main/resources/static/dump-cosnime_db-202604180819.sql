-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: cosnime_db
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `conventions`
--

DROP TABLE IF EXISTS `conventions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conventions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(200) NOT NULL,
  `location` varchar(300) DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_end_date` date DEFAULT NULL,
  `description` longtext,
  `website_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conventions`
--

LOCK TABLES `conventions` WRITE;
/*!40000 ALTER TABLE `conventions` DISABLE KEYS */;
/*!40000 ALTER TABLE `conventions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `listing_id` char(36) NOT NULL,
  `buyer_id` char(36) NOT NULL,
  `seller_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `listing_id` (`listing_id`,`buyer_id`),
  UNIQUE KEY `UK5qycpgo049rvswtcniqnodrwa` (`listing_id`,`buyer_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`),
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('0a105e34-84d5-4046-b0be-928e2fa35904','a173c194-3898-44d2-bc80-f15d087d20af','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-16 09:49:08.270'),('1293cab4-669c-4398-85ba-f4e1930fc1db','841766ec-561b-4f60-8f87-76d5b3c60697','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-17 08:51:34.455'),('1e9111f7-aa4d-4d94-82f7-edbe0e5daaeb','2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-17 08:56:23.114'),('28eb440f-06d0-4998-a8ce-239d6bd59668','527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','2026-04-15 03:46:51.980'),('4235bd83-57b4-41fe-a625-65a7fba22fd0','1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-14 05:32:07.887'),('503f8101-bae3-473f-ae5f-19db29ddc0ff','eaa3b03f-b5ba-4577-a433-36785806ef15','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','2026-04-16 05:16:04.319'),('51ac9551-e1d5-4ae3-b13e-522b08429336','7c03c650-5e04-4395-8428-f0642da8d06d','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-17 12:35:50.709'),('5473c915-3589-442b-a278-c27627179d81','6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','2026-04-14 05:34:37.312'),('80fdb9e8-2084-4eeb-8378-06abc27270ed','29ff9d9b-ea37-49ba-a384-48b99040b44d','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-17 10:27:09.316'),('9f2abda7-ec14-4608-8d9a-91f3411cb0c9','60e9b861-076f-4f49-82a9-f9550e1f1e03','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-18 12:14:11.036'),('ac380d70-5078-4d2e-b139-fbfbec7087bb','6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','815b7eed-c283-4d9b-b9e0-8d4743221106','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','2026-04-17 12:02:07.193'),('ccdf25c7-628c-42e8-9fd6-70d3227f3bf1','527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','815b7eed-c283-4d9b-b9e0-8d4743221106','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','2026-04-16 11:48:42.684'),('d2d49c6d-0d59-4dd5-8562-f9271507f228','0cbd6023-698a-46f9-ad59-d01009dc408b','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-14 05:21:11.347'),('d8998503-21d5-4407-9ab0-428ff3ba6a8f','9cda1029-1a8f-4513-95e6-eeb3bea10c69','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-16 07:33:35.634'),('d9877d2c-1be1-4617-911a-a0f6ab06c644','1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','815b7eed-c283-4d9b-b9e0-8d4743221106','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-16 09:53:25.633'),('e7f0e20f-f8cf-4d63-9c6c-d5fce808717a','a173c194-3898-44d2-bc80-f15d087d20af','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-17 08:33:09.997');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hibernate_sequences`
--

DROP TABLE IF EXISTS `hibernate_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hibernate_sequences` (
  `sequence_name` varchar(255) NOT NULL,
  `next_val` bigint DEFAULT NULL,
  PRIMARY KEY (`sequence_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hibernate_sequences`
--

LOCK TABLES `hibernate_sequences` WRITE;
/*!40000 ALTER TABLE `hibernate_sequences` DISABLE KEYS */;
INSERT INTO `hibernate_sequences` VALUES ('default',200);
/*!40000 ALTER TABLE `hibernate_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_images`
--

DROP TABLE IF EXISTS `listing_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` char(36) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `public_id` varchar(200) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_images_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_images`
--

LOCK TABLES `listing_images` WRITE;
/*!40000 ALTER TABLE `listing_images` DISABLE KEYS */;
INSERT INTO `listing_images` VALUES (5,'0cbd6023-698a-46f9-ad59-d01009dc408b','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775944177/listing_images/eiurjglbindypfsgqj9j.jpg','listing_images/eiurjglbindypfsgqj9j',1,0),(6,'0cbd6023-698a-46f9-ad59-d01009dc408b','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775944179/listing_images/oryawyjcr4ttrz8vj4cs.jpg','listing_images/oryawyjcr4ttrz8vj4cs',0,1),(7,'1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775979824/listing_images/okpbjwkskaksznm64g8s.jpg','listing_images/okpbjwkskaksznm64g8s',1,0),(8,'1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775979826/listing_images/xcobtpsyctffwqjgeq8j.jpg','listing_images/xcobtpsyctffwqjgeq8j',0,1),(9,'6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775984520/listing_images/awhloaoso17kbvvu9hxr.webp','listing_images/awhloaoso17kbvvu9hxr',0,0),(10,'6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775984522/listing_images/gqmbdkvbwnfbbufcdhgq.webp','listing_images/gqmbdkvbwnfbbufcdhgq',0,1),(11,'527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776178493/listing_images/ymjw8kj5wfewknoyrhmg.jpg','listing_images/ymjw8kj5wfewknoyrhmg',1,0),(12,'527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776178495/listing_images/tnsqs56cvmicyuuobzah.jpg','listing_images/tnsqs56cvmicyuuobzah',0,1),(13,'527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776178497/listing_images/gwohuzgcvyhwffemls6b.jpg','listing_images/gwohuzgcvyhwffemls6b',0,2),(15,'eaa3b03f-b5ba-4577-a433-36785806ef15','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776316526/listing_images/tnnb4z7xieygn7tddnq5.jpg','listing_images/tnnb4z7xieygn7tddnq5',1,0),(16,'eaa3b03f-b5ba-4577-a433-36785806ef15','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776316528/listing_images/a5mngafwm9obby40sqay.jpg','listing_images/a5mngafwm9obby40sqay',0,1),(17,'9cda1029-1a8f-4513-95e6-eeb3bea10c69','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776324734/listing_images/wx7wc48yysmij0xcncmd.jpg','listing_images/wx7wc48yysmij0xcncmd',1,0),(18,'9cda1029-1a8f-4513-95e6-eeb3bea10c69','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776324736/listing_images/ahm3h2hvfqdkahjqb7c8.jpg','listing_images/ahm3h2hvfqdkahjqb7c8',0,1),(19,'a173c194-3898-44d2-bc80-f15d087d20af','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776332878/listing_images/zrfybed02u4r53mv13oj.jpg','listing_images/zrfybed02u4r53mv13oj',1,0),(20,'a173c194-3898-44d2-bc80-f15d087d20af','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776332880/listing_images/uvjohvaozsz9rnqdssbn.jpg','listing_images/uvjohvaozsz9rnqdssbn',0,1),(21,'841766ec-561b-4f60-8f87-76d5b3c60697','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776415851/listing_images/ki08ihxt6alaxhrkzpkp.jpg','listing_images/ki08ihxt6alaxhrkzpkp',1,0),(22,'841766ec-561b-4f60-8f87-76d5b3c60697','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776415853/listing_images/fsuxemfday8milrywzmv.jpg','listing_images/fsuxemfday8milrywzmv',0,1),(23,'2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776416156/listing_images/bnmtnwuz9fj5mhppgjl4.jpg','listing_images/bnmtnwuz9fj5mhppgjl4',1,0),(24,'2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776416158/listing_images/d5g1demf4c1vseavzhex.jpg','listing_images/d5g1demf4c1vseavzhex',0,1),(25,'29ff9d9b-ea37-49ba-a384-48b99040b44d','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776421561/listing_images/w0krfci6bw1jkzk5fbux.jpg','listing_images/w0krfci6bw1jkzk5fbux',1,0),(26,'29ff9d9b-ea37-49ba-a384-48b99040b44d','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776421563/listing_images/yvkcrljamlveewdkgibg.jpg','listing_images/yvkcrljamlveewdkgibg',0,1),(27,'0210211d-9009-41d3-9347-efa7b0f6c932','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776428101/listing_images/zbbkfcrs3sisf1kjm28c.jpg','listing_images/zbbkfcrs3sisf1kjm28c',1,0),(28,'0210211d-9009-41d3-9347-efa7b0f6c932','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776428103/listing_images/mgffxw9nhcpgidxhoids.jpg','listing_images/mgffxw9nhcpgidxhoids',0,1),(29,'0210211d-9009-41d3-9347-efa7b0f6c932','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776428105/listing_images/r3pxftusfezknced0rax.jpg','listing_images/r3pxftusfezknced0rax',0,2),(30,'7c03c650-5e04-4395-8428-f0642da8d06d','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776429304/listing_images/mkvioukifguwkqipgyin.jpg','listing_images/mkvioukifguwkqipgyin',1,0),(31,'60e9b861-076f-4f49-82a9-f9550e1f1e03','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776514416/listing_images/egr4dtuwa4jgj1jaldeh.jpg','listing_images/egr4dtuwa4jgj1jaldeh',1,0);
/*!40000 ALTER TABLE `listing_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_tags`
--

DROP TABLE IF EXISTS `listing_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_tags` (
  `listing_id` char(36) NOT NULL,
  `tag_id` char(36) NOT NULL,
  PRIMARY KEY (`listing_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  KEY `idx_listing_tags` (`listing_id`),
  CONSTRAINT `listing_tags_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `listing_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_tags`
--

LOCK TABLES `listing_tags` WRITE;
/*!40000 ALTER TABLE `listing_tags` DISABLE KEYS */;
INSERT INTO `listing_tags` VALUES ('1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','1'),('0210211d-9009-41d3-9347-efa7b0f6c932','102'),('29ff9d9b-ea37-49ba-a384-48b99040b44d','102'),('2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','102'),('60e9b861-076f-4f49-82a9-f9550e1f1e03','102'),('841766ec-561b-4f60-8f87-76d5b3c60697','102'),('9cda1029-1a8f-4513-95e6-eeb3bea10c69','102'),('a173c194-3898-44d2-bc80-f15d087d20af','102'),('eaa3b03f-b5ba-4577-a433-36785806ef15','102'),('0210211d-9009-41d3-9347-efa7b0f6c932','103'),('29ff9d9b-ea37-49ba-a384-48b99040b44d','103'),('2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','103'),('60e9b861-076f-4f49-82a9-f9550e1f1e03','103'),('841766ec-561b-4f60-8f87-76d5b3c60697','103'),('9cda1029-1a8f-4513-95e6-eeb3bea10c69','103'),('a173c194-3898-44d2-bc80-f15d087d20af','103'),('eaa3b03f-b5ba-4577-a433-36785806ef15','103'),('1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','2'),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','52'),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','53'),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','54'),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','55');
/*!40000 ALTER TABLE `listing_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_views`
--

DROP TABLE IF EXISTS `listing_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_views` (
  `listing_id` varchar(255) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`listing_id`,`user_id`),
  CONSTRAINT `FK15ji4my6duv27jbv6n74g8a2c` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_views`
--

LOCK TABLES `listing_views` WRITE;
/*!40000 ALTER TABLE `listing_views` DISABLE KEYS */;
INSERT INTO `listing_views` VALUES ('0cbd6023-698a-46f9-ad59-d01009dc408b',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('1dd7cdea-d174-4dfe-8d65-bbef9c7e970a',_binary 'Å[~\Ì¬ÉMõπ\‡çGC\"'),('1dd7cdea-d174-4dfe-8d65-bbef9c7e970a',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('29ff9d9b-ea37-49ba-a384-48b99040b44d',_binary '¶œ°¥HK…Ü≤OWC•dõ'),('2e8ce7ed-06de-45c6-b1f0-fc476e5e9183',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684',_binary 'Å[~\Ì¬ÉMõπ\‡çGC\"'),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684',_binary '¶œ°¥HK…Ü≤OWC•dõ'),('60e9b861-076f-4f49-82a9-f9550e1f1e03',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9',_binary 'Å[~\Ì¬ÉMõπ\‡çGC\"'),('6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9',_binary '¶œ°¥HK…Ü≤OWC•dõ'),('7c03c650-5e04-4395-8428-f0642da8d06d',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('841766ec-561b-4f60-8f87-76d5b3c60697',_binary '¶œ°¥HK…Ü≤OWC•dõ'),('9cda1029-1a8f-4513-95e6-eeb3bea10c69',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('a173c194-3898-44d2-bc80-f15d087d20af',_binary '¶œ°¥HK…Ü≤OWC•dõ'),('a173c194-3898-44d2-bc80-f15d087d20af',_binary '\œ\r\‘\›vê@\„û\Ù˘¨aW,\¬'),('eaa3b03f-b5ba-4577-a433-36785806ef15',_binary '¶œ°¥HK…Ü≤OWC•dõ');
/*!40000 ALTER TABLE `listing_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listings` (
  `id` char(36) NOT NULL,
  `seller_id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` longtext,
  `price` decimal(38,2) NOT NULL,
  `type` enum('SELL','RENT') NOT NULL,
  `condition` enum('NEW','LIKE_NEW','USED','WORN') DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `character_name` varchar(100) DEFAULT NULL,
  `series_name` varchar(100) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `convention_pickup` tinyint(1) NOT NULL DEFAULT '0',
  `convention_id` char(36) DEFAULT NULL,
  `status` enum('AVAILABLE','SOLD','RENTED','ARCHIVED') NOT NULL DEFAULT 'AVAILABLE',
  `view_count` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `'condition'` enum('LIKE_NEW','NEW','USED','WORN') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `convention_id` (`convention_id`),
  KEY `idx_listings_seller` (`seller_id`),
  KEY `idx_listings_status` (`status`),
  KEY `idx_listings_type` (`type`),
  KEY `idx_listings_series` (`series_name`),
  KEY `idx_listings_character` (`character_name`),
  KEY `idx_listings_created_at` (`created_at` DESC),
  CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `listings_ibfk_2` FOREIGN KEY (`convention_id`) REFERENCES `conventions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listings`
--

LOCK TABLES `listings` WRITE;
/*!40000 ALTER TABLE `listings` DISABLE KEYS */;
INSERT INTO `listings` VALUES ('0210211d-9009-41d3-9347-efa7b0f6c932','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','Xiao For Sale','Xiao For Sale',4500.00,'SELL','LIKE_NEW','M','xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',0,1,NULL,'2026-04-17 12:15:05.331','2026-04-17 12:23:21.029',NULL),('0cbd6023-698a-46f9-ad59-d01009dc408b','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','Reze Cosplay','Reze Cosplay For Rent',500.00,'SELL','WORN','XS','Reze','Chainsawman','Quezon City',0,NULL,'ARCHIVED',1,1,NULL,'2026-04-11 21:49:39.676','2026-04-17 12:06:44.163',NULL),('1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','Sparxie','Sparxie cosplay Rent\n3 Days for 500\nMinimum rental: 1 day',500.00,'RENT','LIKE_NEW','S','Sparxie','Honkai Star Rail','Quezon City',1,NULL,'ARCHIVED',2,1,NULL,'2026-04-12 07:43:48.476','2026-04-17 12:06:54.049',NULL),('29ff9d9b-ea37-49ba-a384-48b99040b44d','815b7eed-c283-4d9b-b9e0-8d4743221106','Xiao Cosplay for Rent DOKI DOKI','Xiao cosplay for Rent\nMinimum rental: 2 days\nPricing Options:\n  - P600 for 3 days\n  - P800 for 4 days',500.00,'RENT','WORN','M','xiao','Genshin Impact','Quezon City',1,NULL,'ARCHIVED',1,1,NULL,'2026-04-17 10:26:03.713','2026-04-17 10:37:24.368',NULL),('2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','815b7eed-c283-4d9b-b9e0-8d4743221106','sdfsdfsdfs','sfsdfsdfsdf',5000.00,'SELL','LIKE_NEW','M','Xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',1,1,NULL,'2026-04-17 08:55:58.817','2026-04-17 10:22:28.446',NULL),('527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','Lumiere / Love and Deepspace Cosplay Set','FOR RENT: Lumiere / Love and Deepspace Cosplay Set\n\nAvailable for short-term rental. Carefully maintained and stored in clean condition between uses. Suitable for conventions, photoshoots, and themed events.\n\nCondition:\nExcellent / Lightly Used\n\nNo major damage or defects\nFabric and accessories fully intact\nMinor signs of wear may be present due to prior use, but does not affect appearance or usability\n\nIncluded Items:\n\nFull costume set (top, bottom, accessories as applicable)\nAny listed props or add-ons shown in reference photos\nStorage bag (if applicable)\n\nRental Terms:\n\nRental duration is flexible depending on agreement\nSecurity deposit may be required\nLate returns may incur additional fees\nItem must be returned in the same condition as received\n\nAvailability:\nPlease check listing calendar or contact seller before booking to confirm available dates.\n\nImportant Notes:\n\nItem is sanitized and inspected before every rental\nAny damage during rental period is the responsibility of the renter\nStrictly no unauthorized modifications',400.00,'SELL','USED','M','Lumiere','Love and deepspace','Quezon City',0,NULL,'ARCHIVED',2,1,NULL,'2026-04-14 14:55:01.038','2026-04-17 12:00:39.638',NULL),('60e9b861-076f-4f49-82a9-f9550e1f1e03','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','erfwewerewrew','erfwewerewrew',5000.00,'SELL','LIKE_NEW','M','xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',1,1,NULL,'2026-04-18 12:13:37.366','2026-04-18 13:36:53.411',NULL),('6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','Phainon Cosplay','DOKI DOKI BRAND\nMinimum rental: 1 day\nPricing Options:\n  - P800 for 3 days',600.00,'RENT','NEW','M','Phainon','Honkai Star Rail','Quezon City',0,NULL,'ARCHIVED',57,1,NULL,'2026-04-11 15:28:32.023','2026-04-17 12:05:53.861',NULL),('7c03c650-5e04-4395-8428-f0642da8d06d','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','meow meoww','meow meowww',5000.00,'SELL','LIKE_NEW','S','xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',1,1,NULL,'2026-04-17 12:35:05.114','2026-04-17 13:16:24.615',NULL),('841766ec-561b-4f60-8f87-76d5b3c60697','815b7eed-c283-4d9b-b9e0-8d4743221106','dsgdsgsdgsgsdg','sdfsfsfsdfsfsd\nMinimum rental: 2 day(s)\nPricing Options:\n  - ‚Ç±1,000 for 5 days',500.00,'RENT','LIKE_NEW','M','xiao','Genshin Impact','Quezon City',1,NULL,'ARCHIVED',1,1,NULL,'2026-04-17 08:50:53.317','2026-04-17 08:54:09.087',NULL),('9cda1029-1a8f-4513-95e6-eeb3bea10c69','815b7eed-c283-4d9b-b9e0-8d4743221106','Xiao Cosplay','Xiao Cosplay For Sale',3400.00,'SELL','USED','M','Xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',1,1,NULL,'2026-04-16 07:32:17.054','2026-04-16 08:19:23.434',NULL),('a173c194-3898-44d2-bc80-f15d087d20af','815b7eed-c283-4d9b-b9e0-8d4743221106','Xiao Cosplay','mewoemwoemowmoew',500.00,'SELL','USED','M','Xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',2,1,NULL,'2026-04-16 09:48:01.021','2026-04-17 08:49:10.792',NULL),('eaa3b03f-b5ba-4577-a433-36785806ef15','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','Xiao cosplay','Xiao cosplay for sale \nSize: medium',3400.00,'SELL','LIKE_NEW','M','Xiao','Genshin Impact','Quezon City',0,NULL,'ARCHIVED',1,1,NULL,'2026-04-16 05:15:29.070','2026-04-16 05:56:03.377',NULL);
/*!40000 ALTER TABLE `listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(255) NOT NULL,
  `conversation_id` char(36) NOT NULL,
  `sender_id` char(36) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `sent_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_messages_convo` (`conversation_id`,`sent_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('020b207e-7229-4315-a884-35866ccac608','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve accepted your offer for \"erfwewerewrew\". Let\'s arrange the exchange!',1,'2026-04-18 12:28:28.190'),('0c6c3d86-ac09-4d13-a1bb-81c0470f654b','503f8101-bae3-473f-ae5f-19db29ddc0ff','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','yo',0,'2026-04-16 06:38:59.111'),('1367805e-73d6-4dfd-a35b-3c972b213a37','4235bd83-57b4-41fe-a625-65a7fba22fd0','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','Is the deposit negotiable?',1,'2026-04-14 18:30:50.720'),('165bcc79-050c-40fd-bb11-0ebdbb8ca90b','1e9111f7-aa4d-4d94-82f7-edbe0e5daaeb','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','I\'ve made an offer of ‚Ç±5,000 for \"sdfsdfsdfs\". Please review my offer.',1,'2026-04-17 08:56:29.419'),('1961c478-0a27-4fa3-8f22-b6067cf237a6','28eb440f-06d0-4998-a8ce-239d6bd59668','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','{\"type\":\"RENTAL\",\"listingId\":\"527d1f6f-9ff5-4ae4-aa33-0a42b97b5684\",\"startDate\":\"2026-04-25\",\"endDate\":\"2026-04-27\",\"deposit\":0}',1,'2026-04-15 07:02:47.016'),('1bf32792-b41b-4819-9c02-532cef7b2087','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve accepted your offer for \"erfwewerewrew\". Let\'s arrange the exchange!',1,'2026-04-18 12:16:18.334'),('1c3f5e40-5912-45ce-ab67-7422169d405a','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','this working',1,'2026-04-18 12:29:13.756'),('30024582-e460-4e7f-bf1b-1fcf7654379e','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','fg',1,'2026-04-14 11:38:43.946'),('33eb8e88-3a22-4d60-83ab-da6f152948d0','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','d',1,'2026-04-14 11:38:44.826'),('3485c90d-101e-4923-8595-99a001c5cd2b','d8998503-21d5-4407-9ab0-428ff3ba6a8f','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','I\'ve accepted your offer for \"Xiao Cosplay\". Let\'s arrange the exchange!',1,'2026-04-16 08:11:55.544'),('35bd25b1-6104-48a5-898d-eefea584a1b9','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','d',1,'2026-04-14 11:38:44.827'),('39bf777c-ac48-45b9-80c3-383890107d57','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','Hell yeah',1,'2026-04-18 12:29:29.349'),('3df90953-ae70-4bce-900e-21218e4de919','4235bd83-57b4-41fe-a625-65a7fba22fd0','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','helloww',1,'2026-04-14 19:10:50.856'),('3f7a1160-536e-483a-94e3-e62b30376bb9','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','I\'ve made an offer of ‚Ç±5,000 for \"erfwewerewrew\". Please review my offer.',1,'2026-04-18 12:14:23.444'),('4429207e-24fb-4ea5-b8e9-badc2897e78c','d8998503-21d5-4407-9ab0-428ff3ba6a8f','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','I\'ve made an offer of ‚Ç±3,400 for \"Xiao Cosplay\". Please review my offer.',1,'2026-04-16 07:33:45.876'),('4bb6ca3e-f6d3-414b-858d-8856dfc5443b','5473c915-3589-442b-a278-c27627179d81','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','{\"type\":\"OFFER\",\"listingId\":\"6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9\",\"price\":300,\"message\":\"78\"}',1,'2026-04-14 13:05:43.823'),('51bc9f17-86f2-4b53-9002-0edc8ec4e01a','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','d',1,'2026-04-14 11:38:45.189'),('5636d8d1-d125-4935-b033-431b8235afcb','d2d49c6d-0d59-4dd5-8562-f9271507f228','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','heo',1,'2026-04-14 05:34:28.901'),('59592262-fb70-4dc2-9af5-12e8baea644d','51ac9551-e1d5-4ae3-b13e-522b08429336','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','I\'ve made an offer of ‚Ç±5,000 for \"meow meoww\". Please review my offer.',1,'2026-04-17 12:36:02.872'),('59cda901-f439-4b72-b1b2-7ffd0e7ccdbb','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','df',1,'2026-04-14 11:38:44.229'),('63eafdb7-2558-4bd4-b94f-2fca553c957a','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','d',1,'2026-04-14 11:38:45.355'),('6491b423-18cc-4a26-a9a1-eb1b107fe0cf','d2d49c6d-0d59-4dd5-8562-f9271507f228','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','meow',1,'2026-04-14 06:40:16.817'),('64f565bc-bfd7-4228-ab39-d2bc61ae0012','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','d',1,'2026-04-14 11:38:44.429'),('65a11517-b4ec-4a13-a295-5d0f32139470','28eb440f-06d0-4998-a8ce-239d6bd59668','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','{\"type\":\"RENTAL\",\"listingId\":\"527d1f6f-9ff5-4ae4-aa33-0a42b97b5684\",\"startDate\":\"2026-04-25\",\"endDate\":\"2026-04-27\",\"deposit\":0}',1,'2026-04-15 07:08:46.566'),('686fde29-850a-4028-b72e-0c378843e0e7','28eb440f-06d0-4998-a8ce-239d6bd59668','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','hey',1,'2026-04-15 04:37:49.278'),('6b23dfeb-1eaa-475e-a26d-5bcf3ba267c6','d2d49c6d-0d59-4dd5-8562-f9271507f228','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','hello?',1,'2026-04-14 05:23:33.451'),('6be9f57b-35b4-440d-9947-bbd19d05b8d7','d9877d2c-1be1-4617-911a-a0f6ab06c644','815b7eed-c283-4d9b-b9e0-8d4743221106','I\'ve sent a rental request for \"Sparxie\". Please check your rental requests.',0,'2026-04-17 11:36:36.952'),('6d81d246-2cd6-4c0e-aa50-0a2006d2b69d','e7f0e20f-f8cf-4d63-9c6c-d5fce808717a','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve made an offer of ‚Ç±5,000 for \"Xiao Cosplay\". Please review my offer.',0,'2026-04-17 08:33:20.029'),('71948843-acce-4552-adf6-a7ddbc7b941b','28eb440f-06d0-4998-a8ce-239d6bd59668','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve sent a rental request for \"Lumiere / Love and Deepspace Cosplay Set\". Please check your rental requests.',1,'2026-04-15 07:33:43.616'),('72809e96-370e-470f-af58-44343b2f1338','d9877d2c-1be1-4617-911a-a0f6ab06c644','815b7eed-c283-4d9b-b9e0-8d4743221106','I\'ve made an offer of ‚Ç±500 for \"Sparxie\". Please review my offer.',1,'2026-04-16 09:53:51.400'),('7613bc3b-1001-4e73-8bc6-e891e8c97f3b','4235bd83-57b4-41fe-a625-65a7fba22fd0','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','hey',0,'2026-04-16 04:57:48.534'),('79098ac7-03b6-40ab-bec8-40fccf731d9d','5473c915-3589-442b-a278-c27627179d81','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','{\"type\":\"OFFER\",\"listingId\":\"6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9\",\"price\":550,\"message\":\"Please\"}',1,'2026-04-14 11:50:37.131'),('7c59d41c-c7bf-4ad1-944f-8a7bc63d5b8a','0a105e34-84d5-4046-b0be-928e2fa35904','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','I\'ve made an offer of ‚Ç±5,000 for \"Xiao Cosplay\". Please review my offer.',1,'2026-04-16 09:49:14.540'),('7eeed5a6-f3f0-48d2-87a4-8810936225ba','51ac9551-e1d5-4ae3-b13e-522b08429336','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve accepted your offer for \"meow meoww\". Let\'s arrange the exchange!',0,'2026-04-17 12:48:59.106'),('851564b3-beb6-416a-98fd-880ad8df2c75','503f8101-bae3-473f-ae5f-19db29ddc0ff','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','hey',0,'2026-04-16 06:14:18.853'),('8dacd820-a1e2-4799-b69e-351c59102883','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','yo',1,'2026-04-18 12:29:23.743'),('94aa505c-9328-428d-af87-142f5f9353a0','ccdf25c7-628c-42e8-9fd6-70d3227f3bf1','815b7eed-c283-4d9b-b9e0-8d4743221106','I\'ve sent a rental request for \"Lumiere / Love and Deepspace Cosplay Set\". Please check your rental requests.',1,'2026-04-16 11:48:55.826'),('94cf7549-41b6-4caf-bd75-b380931427e4','4235bd83-57b4-41fe-a625-65a7fba22fd0','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','hey',0,'2026-04-16 05:05:05.562'),('9815a72b-9a47-4d63-adae-27c8c14b545f','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','test',1,'2026-04-18 12:29:14.502'),('9b9ca847-bdd9-4ed5-aaef-65b415a9435b','4235bd83-57b4-41fe-a625-65a7fba22fd0','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','d',1,'2026-04-14 11:38:45.011'),('9bd17f18-fb88-4d81-b96e-0515104b1d65','1e9111f7-aa4d-4d94-82f7-edbe0e5daaeb','815b7eed-c283-4d9b-b9e0-8d4743221106','hey',0,'2026-04-17 09:00:20.798'),('a23a88bb-1cf7-4134-8e9a-90300c7206af','d2d49c6d-0d59-4dd5-8562-f9271507f228','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','hey',1,'2026-04-14 05:24:37.754'),('b14d9791-1f46-4571-917e-7fec6a11cc07','80fdb9e8-2084-4eeb-8378-06abc27270ed','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve sent a rental request for \"Xiao Cosplay for Sale DOKI DOKI\". Please check your rental requests.',1,'2026-04-17 10:27:28.176'),('beaa1bb1-7964-4ad4-8551-d89ed98279b3','ac380d70-5078-4d2e-b139-fbfbec7087bb','815b7eed-c283-4d9b-b9e0-8d4743221106','I\'ve sent a rental request for \"Phainon Cosplay\". Please check your rental requests.',1,'2026-04-17 12:02:22.452'),('c02d952d-be4c-4b12-86d8-e66f3fe2461e','503f8101-bae3-473f-ae5f-19db29ddc0ff','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','{\"type\":\"OFFER\",\"listingId\":\"eaa3b03f-b5ba-4577-a433-36785806ef15\",\"price\":3400,\"message\":\"Please\"}',1,'2026-04-16 05:19:19.617'),('c579ff91-6d4b-4e1e-a4e4-b9d0bbb96f22','5473c915-3589-442b-a278-c27627179d81','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','{\"type\":\"OFFER\",\"listingId\":\"6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9\",\"price\":45,\"message\":\"\"}',1,'2026-04-14 13:06:11.777'),('c57fef0c-6298-4d6a-b8bc-e96f0f9a9b63','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','test',1,'2026-04-18 12:29:15.042'),('cceef238-f8be-4cc3-aaf6-9db9d1d0bb72','1e9111f7-aa4d-4d94-82f7-edbe0e5daaeb','815b7eed-c283-4d9b-b9e0-8d4743221106','I\'ve accepted your offer for \"sdfsdfsdfs\". Let\'s arrange the exchange!',0,'2026-04-17 08:56:48.454'),('cf5878fa-d9c6-44e0-8f1f-e2f80bce4910','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','you there>',1,'2026-04-18 12:29:10.543'),('d5cc9d41-6f0a-4d80-87bc-552949267b21','503f8101-bae3-473f-ae5f-19db29ddc0ff','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve made an offer of ‚Ç±3,400 for \"Xiao cosplay\". Please review my offer.',1,'2026-04-16 05:23:32.220'),('dede92a8-dbef-4ba3-ba9e-ba32fd0e4b03','d2d49c6d-0d59-4dd5-8562-f9271507f228','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','its available',1,'2026-04-14 05:24:55.161'),('df0e46fa-c665-4b64-96c6-bb8127a2d88b','5473c915-3589-442b-a278-c27627179d81','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','yooo',1,'2026-04-14 11:14:15.856'),('e466c498-7ef2-4dc5-8cc6-d0fa9ff69142','1293cab4-669c-4398-85ba-f4e1930fc1db','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','I\'ve sent a rental request for \"dsgdsgsdgsgsdg\". Please check your rental requests.',1,'2026-04-17 08:52:19.698'),('e68ee67f-55a2-4b25-975d-96996489114c','4235bd83-57b4-41fe-a625-65a7fba22fd0','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','hey',1,'2026-04-14 11:08:53.072'),('e925c7bf-cb85-4d36-badc-176a3f1c554f','9f2abda7-ec14-4608-8d9a-91f3411cb0c9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','hey',1,'2026-04-18 12:29:04.829');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` char(36) NOT NULL,
  `listing_id` char(36) NOT NULL,
  `buyer_id` char(36) NOT NULL,
  `offered_price` decimal(10,2) NOT NULL,
  `message` text,
  `status` enum('PENDING','ACCEPTED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_offers_listing` (`listing_id`),
  KEY `idx_offers_buyer` (`buyer_id`),
  CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`),
  CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES ('07a7f263-7c8b-4650-bba8-cf027b5406ba','60e9b861-076f-4f49-82a9-f9550e1f1e03','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',5000.00,'meow','ACCEPTED','2026-04-18 12:14:23.329','2026-04-18 12:28:27.883'),('0af80d79-4b88-437e-974a-9da79ee78dc7','0cbd6023-698a-46f9-ad59-d01009dc408b','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',500.00,NULL,'ACCEPTED','2026-04-12 15:55:06.695','2026-04-12 15:56:56.545'),('1d6e5d3b-7db2-4bfd-b10b-75825b6bf7c0','7c03c650-5e04-4395-8428-f0642da8d06d','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',5000.00,'MEOWEOWEMWOE','PENDING','2026-04-17 12:36:02.723','2026-04-17 12:36:02.723'),('1e8a1487-4e12-4740-bfd6-4f933df70a78','eaa3b03f-b5ba-4577-a433-36785806ef15','a60ccfa1-b448-4bc9-86b2-4f5743a5649b',3400.00,'','ACCEPTED','2026-04-16 05:23:32.105','2026-04-16 05:26:18.233'),('33ae4289-b169-4577-9101-be9765a6c65c','a173c194-3898-44d2-bc80-f15d087d20af','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',5000.00,'','ACCEPTED','2026-04-16 09:49:14.413','2026-04-16 09:50:01.916'),('84e0939c-9bf4-4d63-806c-a83a075bf4d5','1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','815b7eed-c283-4d9b-b9e0-8d4743221106',500.00,'','ACCEPTED','2026-04-16 09:53:50.755','2026-04-16 09:54:25.395'),('a0ba7fd9-9359-4988-9fd4-0d9334ed7bf5','2e8ce7ed-06de-45c6-b1f0-fc476e5e9183','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',5000.00,'','ACCEPTED','2026-04-17 08:56:29.329','2026-04-17 08:56:54.152'),('c5ae49b8-0e9f-4601-b316-fe01a1cc3e0c','a173c194-3898-44d2-bc80-f15d087d20af','a60ccfa1-b448-4bc9-86b2-4f5743a5649b',5000.00,'','ACCEPTED','2026-04-17 08:33:19.651','2026-04-17 08:34:02.004'),('caec6dc8-0306-48ce-bdd4-10502b430898','1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',500.00,'Avail for lalamove?','REJECTED','2026-04-13 06:56:28.663','2026-04-13 06:57:43.760'),('daa26458-35da-41af-86d1-4cd979a9cdc0','6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','a60ccfa1-b448-4bc9-86b2-4f5743a5649b',300.00,'Hey Can I Rent This?','REJECTED','2026-04-12 18:07:26.202','2026-04-13 08:01:02.063'),('e231283e-e43a-44c8-af5e-7290d9685bc3','9cda1029-1a8f-4513-95e6-eeb3bea10c69','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2',3400.00,'','ACCEPTED','2026-04-16 07:33:45.423','2026-04-16 08:12:01.689');
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rater_id` char(36) NOT NULL,
  `rated_user_id` char(36) NOT NULL,
  `transaction_type` enum('SALE','RENTAL') DEFAULT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `stars` int NOT NULL,
  `comment` longtext,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rater_id` (`rater_id`,`transaction_type`,`transaction_id`),
  UNIQUE KEY `UKkmw90gwcvvw1y526qsyxu2c3h` (`rater_id`,`transaction_type`,`transaction_id`),
  KEY `rated_user_id` (`rated_user_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`rater_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`rated_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ratings_chk_1` CHECK ((`stars` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,'cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','SALE','07a7f263-7c8b-4650-bba8-cf027b5406ba',4,'Good seller','2026-04-18 13:13:39.305'),(2,'a60ccfa1-b448-4bc9-86b2-4f5743a5649b','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','SALE','07a7f263-7c8b-4650-bba8-cf027b5406ba',5,'Good buyer','2026-04-18 13:14:37.282');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rentals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` char(36) NOT NULL,
  `renter_id` char(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(38,2) DEFAULT NULL,
  `deposit` decimal(38,2) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `renter_id` (`renter_id`),
  KEY `idx_rentals_listing` (`listing_id`),
  CONSTRAINT `rentals_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`),
  CONSTRAINT `rentals_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `valid_dates` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` VALUES (1,'1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','2026-04-24','2026-04-26',1000.00,300.00,'REJECTED','2026-04-13 22:10:35.857','2026-04-13 23:45:11.014'),(2,'527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-25','2026-04-27',600.00,NULL,'APPROVED','2026-04-15 00:28:22.970','2026-04-15 01:21:20.843'),(4,'527d1f6f-9ff5-4ae4-aa33-0a42b97b5684','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-25','2026-04-27',600.00,NULL,'REJECTED','2026-04-16 04:48:55.656','2026-04-16 04:49:33.403'),(5,'841766ec-561b-4f60-8f87-76d5b3c60697','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-25','2026-04-27',1500.00,NULL,'APPROVED','2026-04-17 01:52:19.632','2026-04-17 01:52:47.450'),(6,'29ff9d9b-ea37-49ba-a384-48b99040b44d','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','2026-04-25','2026-04-27',600.00,300.00,'APPROVED','2026-04-17 03:27:28.022','2026-04-17 03:35:34.722'),(7,'1dd7cdea-d174-4dfe-8d65-bbef9c7e970a','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-25','2026-04-26',1000.00,NULL,'PENDING','2026-04-17 04:36:36.723','2026-04-17 04:36:36.723'),(8,'6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','815b7eed-c283-4d9b-b9e0-8d4743221106','2026-04-25','2026-04-27',800.00,NULL,'APPROVED','2026-04-17 05:02:22.312','2026-04-17 05:02:40.462');
/*!40000 ALTER TABLE `rentals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` binary(16) NOT NULL,
  `reporter_id` char(36) NOT NULL,
  `target_type` enum('USER','LISTING','MESSAGE') NOT NULL,
  `target_id` varchar(255) NOT NULL,
  `reason` enum('SCAM','HARASSMENT','FAKE_ITEM','INAPPROPRIATE','SPAM','OTHER') NOT NULL,
  `description` longtext,
  `status` enum('PENDING','UNDER_REVIEW','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `admin_note` longtext,
  `reviewed_by` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `resolved_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reporter_id` (`reporter_id`,`target_type`,`target_id`),
  UNIQUE KEY `UK3ayy8adjaycljvgha7pded976` (`reporter_id`,`target_type`,`target_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_reports_status` (`status`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (_binary '2\»qüD\Ì¨C\…I~','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','USER','a60ccfa1-b448-4bc9-86b2-4f5743a5649b','HARASSMENT',NULL,'PENDING',NULL,NULL,'2026-04-16 05:11:46.155',NULL),(_binary '∞¸\‚H¡SNöò:+PÑ˚\Ù]','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','MESSAGE','63eafdb7-2558-4bd4-b94f-2fca553c957a','HARASSMENT',NULL,'PENDING',NULL,NULL,'2026-04-16 04:55:12.646',NULL),(_binary '—ÇmA±H∂µ™\s%†•','cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','MESSAGE','94aa505c-9328-428d-af87-142f5f9353a0','HARASSMENT',NULL,'PENDING',NULL,NULL,'2026-04-16 11:49:59.758',NULL);
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES ('103','Genshin Impact'),('1','Honkai Star Rail'),('52','Lads'),('53','Love and deepspace'),('55','Lumiere'),('2','Sparxie'),('54','Xavier'),('102','Xiao');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `bio` longtext,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('USER','MODERATOR','ADMIN') NOT NULL DEFAULT 'USER',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_banned` tinyint(1) NOT NULL DEFAULT '0',
  `ban_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `avatar_public_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('13d823c4-dc9f-4cd2-a0bf-3e56b931849c','Shirororo23','meow2134@gmail.com','$2a$10$oOzesKAlLKeXwWamoiDvRuj.sEP3gZwW.19OeFgcjUhPZQLwlP2PK',NULL,NULL,'USER',1,0,NULL,'2026-04-08 09:40:07.806','2026-04-08 09:40:07.806',NULL),('1b9a820e-831d-414c-88ed-5c19b27d71e1','shirosora','jem123@gmai.com','$2a$10$Oo5x9ERE.qwYEqOUnWzJXOiTWfkVR4rx.0Ng5kxCee5urzn.B6XWe',NULL,NULL,'USER',1,0,NULL,'2026-04-08 05:19:46.101','2026-04-08 05:19:46.101',NULL),('1e31ee96-3dd4-4d16-b6ce-4660a32dbad3','meow','moew@gmail.com','$2a$10$5k8QzOJaVfFydKOiv.kNte.N81dRIY7V5NqdLZAo32qKL9iHh72Ue',NULL,NULL,'USER',1,0,NULL,'2026-04-07 16:25:55.676','2026-04-07 16:25:55.676',NULL),('232f20b5-8e18-45bf-ad86-7c172ef87eac','shiroi76265','akirayori232ewr1@gmail.com','$2a$10$zcXbZdH19/KncqLdEyg1petqd2rdZ/XnL6veXuj3cENcsQwFJA/hy',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:39:48.854','2026-04-09 12:39:48.854',NULL),('249de037-1046-430c-9752-8299a8c2d898','Shirororo2323','meo23w21@gmail.com','$2a$10$aoy6HssjqgBmPsrh/ma3h.htThWbH4Lo6mEpgz6.st8pxlJhwxtJK',NULL,NULL,'USER',1,0,NULL,'2026-04-08 09:41:21.174','2026-04-08 09:41:21.174',NULL),('2642fb2a-15b1-4828-8533-6e1673574b17','shiroi26523','akirayori2321@gmail.com','$2a$10$OgOOUpvOW4BZKOjvSxwKg.3gCNRCEcBesmQBz0dPZhED5XKkMRiX.',NULL,NULL,'USER',1,0,NULL,'2026-04-08 09:42:30.286','2026-04-08 09:42:30.286',NULL),('264a5774-8691-4e41-a9ac-19b12d16fa24','shiroisd76342455er3','akirayori2ds3e43452erewr134@gmail.com','$2a$10$rbz5M57QY61UKKeKuAt/ueLGtWuyV8JZ1YeGQB942ldQqvSvxC0sq',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:44:42.907','2026-04-09 12:44:42.907',NULL),('40008d4d-d637-4f6e-96ac-be6b2a9dce64','IvyRei12','meowmeow@gmail.com','$2a$10$WKtFNPTMr1s7SDiKU/i8zeaFTtl1fg99pyV6q0U91n1vZw4X/14fq',NULL,NULL,'USER',1,0,NULL,'2026-04-08 05:20:09.015','2026-04-08 05:20:09.016',NULL),('50c7345d-7a72-476f-b2f7-86d46d5c916d','Shiroi','jemmeralmoneda538@gmail.com','$2a$10$v6e/0Uk4J8Ko4WseYuC3Qe7XwnVcqC0XG/fkwZzsb9PjEf7ohmVW2',NULL,NULL,'USER',1,0,NULL,'2026-04-07 18:28:45.736','2026-04-07 18:28:45.736',NULL),('584d12c8-5af9-470f-ad8f-51925c80b5bf','IvyReii','meowmeoww@gmail.com','$2a$10$/g9RKUS15vy5fSJxdQ2kguN0THktl2Asd4kqieX7Tv6aCrLQa0rDi',NULL,NULL,'USER',1,0,NULL,'2026-04-08 09:32:43.730','2026-04-08 09:32:43.730',NULL),('5aa74d12-0c02-4664-af58-b93cfbdff775','shiroisd76265','akirayori2ds32ewr1@gmail.com','$2a$10$AVODM5qed8VeLn1I2Rf55OBnsS1uC.Gcs8rypuRhvMruNWBj63PNS',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:41:09.819','2026-04-09 12:41:09.819',NULL),('5c9c8555-43f8-43f9-b0aa-cd79698cc8ee','shiroisd762634455er3','akirayori2ds3e452erewr134@gmail.com','$2a$10$93SCPwG4uOiai3yKZlKjpOvhNk2UoEiVNSGLJpzxkpVoy9yT7cyXC',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:44:20.286','2026-04-09 12:44:20.286',NULL),('74624f46-5ffb-46b6-8af9-87bcf02eb01a','IvyRei','meowmeow@gmailxxc','$2a$10$QPP73mjyrRHT.39/5yy8Ze9/BIUyF/wKxYuHuEElgWaMfhxKIpZQu',NULL,NULL,'USER',1,0,NULL,'2026-04-08 05:06:01.041','2026-04-08 05:06:01.041',NULL),('815b7eed-c283-4d9b-b9e0-8d4743221106','Meowww','meoewmeow2@gmail.com','$2a$10$xIskbeAJWCE/ii1.uAJxNuYQU17vCdFlPyw62QXB8ChihUE6WIqsu','','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1776422096/profiles/ageurzobjonne0mrvf2a.jpg','USER',0,0,NULL,'2026-04-16 07:30:34.198','2026-04-18 05:15:23.034','profiles/ageurzobjonne0mrvf2a'),('830b7e7b-4ed9-40e1-a2fd-21dc2129d36b','shiroisd762634455','akirayori2ds3e452ewr1@gmail.com','$2a$10$3.12h2rEzbBE80nR7bR1w.AhUzkXhO5D5Iv4VxUqnOInu1XeGJuVe',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:42:52.522','2026-04-09 12:42:52.522',NULL),('8a1e35a5-8015-4783-ad4d-593a4fe540b5','Shirororowe','meow21@gmail.com','$2a$10$tPFahQRYcAnzzNmQxT5oMeroJRpkP7Qq27NOMrT0ky/MmI6txCsJS',NULL,NULL,'USER',1,0,NULL,'2026-04-08 09:38:50.013','2026-04-08 09:38:50.013',NULL),('8afe98a8-629d-4741-accb-9d55e166ec02','shiroisd762634455er','akirayori2ds3e452erewr1@gmail.com','$2a$10$NzDkRAul/G9voabeSKbKrOixWCRVWtqSl.3XRnomDGrI8MdOWvlka',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:43:13.129','2026-04-09 12:43:13.129',NULL),('9852db54-0460-4231-82ae-6e97fe491839','shiroisd7626345','akirayori2ds3e2ewr1@gmail.com','$2a$10$x4RcovcKW3xVdC5Xpbp04OiKb5lpEGG0NsNf/8/nEa701puOd/xXi',NULL,NULL,'USER',1,0,NULL,'2026-04-09 12:41:42.202','2026-04-09 12:41:42.202',NULL),('a60ccfa1-b448-4bc9-86b2-4f5743a5649b','len0201','kathleneabairo@gmail.com','$2a$10$sAKtejITuUUB6RWuFtGEoOymD1M9JlNWQMumu/59W5IgaR4YvpjCe','Cosplayer / Seller','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775922744/profiles/qd3l57yogke0zim0vwb9.jpg','USER',1,0,NULL,'2026-04-11 15:50:18.891','2026-04-18 06:34:36.778','profiles/qd3l57yogke0zim0vwb9'),('cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','Shiro','jemmeralmoneda58@gmail.com','$2a$10$bjvtWrAINy4pH/N7PAow4es6qIEYBUPrsu92utNcMxth9pFC4onfa','Cosplayer','https://res.cloudinary.com/dkeg8l5uf/image/upload/v1775902524/profiles/bfr1he3duyteowa2fjff.jpg','USER',1,0,NULL,'2026-04-07 17:00:34.992','2026-04-18 05:14:26.434','profiles/bfr1he3duyteowa2fjff'),('e7f52dec-e940-4693-b8c6-99bc461c2be4','shiroi@26','yoisakisora16@gmail.com','$2a$10$JbM3DWuoYZxYgbqzk17ZRuRnfIq2/j8ndeZuOkG2eL8SCjueqk99y',NULL,NULL,'USER',1,0,NULL,'2026-04-08 04:20:13.976','2026-04-08 04:20:13.976',NULL),('fee5aa25-da48-4aba-a91b-0edf0cefccfb','Shirororo','meow@gmail.com','$2a$10$k0m7BeBBhpz0edRiwAk.yO9LDWyrEdxwTA3pEgVimNtRDxTYpYL2C',NULL,NULL,'USER',1,0,NULL,'2026-04-08 09:37:56.417','2026-04-08 09:37:56.417',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `user_id` char(36) NOT NULL,
  `listing_id` char(36) NOT NULL,
  `saved_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `id` binary(16) NOT NULL,
  PRIMARY KEY (`user_id`,`listing_id`),
  UNIQUE KEY `UK6t5xf2bga4y9gsl8xuiiadp36` (`user_id`,`listing_id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES ('815b7eed-c283-4d9b-b9e0-8d4743221106','6c19ea7e-46c9-4db0-ae94-2cb50cb7ece9','2026-04-17 08:28:04.661',_binary '>Vû4ÅH¿û\n~«≤áàG'),('cf0dd4dd-7690-40e3-9ef4-f9ac61572cc2','60e9b861-076f-4f49-82a9-f9550e1f1e03','2026-04-18 12:14:01.672',_binary '∂3ùqM|≠π¸Ä®n:\Ò');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'cosnime_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18  8:19:54
