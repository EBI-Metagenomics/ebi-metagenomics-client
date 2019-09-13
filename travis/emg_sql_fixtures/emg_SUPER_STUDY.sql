-- MySQL dump 10.13  Distrib 5.7.26, for Linux (x86_64)
--
-- Host: 0.0.0.0    Database: emg
-- ------------------------------------------------------
-- Server version	5.6.44

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

LOCK TABLES `SUPER_STUDY` WRITE;
/*!40000 ALTER TABLE `SUPER_STUDY` DISABLE KEYS */;
INSERT INTO `SUPER_STUDY` VALUES (1,'Human microbiome','Prime number emerged into consciousness extraordinary claims require extraordinary evidence inconspicuous motes of rock and gas billions upon billions something incredible is waiting to be known. Dream of the mind\'s eye Euclid great turbulent clouds the only home we\'ve ever known Drake Equation the only home we\'ve ever known. The only home we\'ve ever known hearts of the stars the carbon in our apple pies with pretty stories for which there\'s little good evidence invent the universe made in the interiors of collapsing stars and billions upon billions upon billions upon billions upon billions upon billions upon billions.','test_6sWQrNG.jpg'),(2,'Cow gut microbime','Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.','');
/*!40000 ALTER TABLE `SUPER_STUDY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SUPER_STUDY_STUDY`
--

DROP TABLE IF EXISTS `SUPER_STUDY_STUDY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SUPER_STUDY_STUDY` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `STUDY_ID` int(11) NOT NULL,
  `SUPER_STUDY_ID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SUPER_STUDY_STUDY_STUDY_ID_SUPER_STUDY_ID_cb82f69c_uniq` (`STUDY_ID`,`SUPER_STUDY_ID`),
  KEY `SUPER_STUDY_STUDY_SUPER_STUDY_ID_e565be17_fk_SUPER_STU` (`SUPER_STUDY_ID`),
  CONSTRAINT `SUPER_STUDY_STUDY_STUDY_ID_e88aab2c_fk_STUDY_STUDY_ID` FOREIGN KEY (`STUDY_ID`) REFERENCES `STUDY` (`STUDY_ID`),
  CONSTRAINT `SUPER_STUDY_STUDY_SUPER_STUDY_ID_e565be17_fk_SUPER_STU` FOREIGN KEY (`SUPER_STUDY_ID`) REFERENCES `SUPER_STUDY` (`STUDY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SUPER_STUDY_STUDY`
--

LOCK TABLES `SUPER_STUDY_STUDY` WRITE;
/*!40000 ALTER TABLE `SUPER_STUDY_STUDY` DISABLE KEYS */;
INSERT INTO `SUPER_STUDY_STUDY` VALUES (1,256,1),(8,275,2),(10,277,2),(6,278,2),(5,339,2),(11,614,2),(7,830,2),(2,831,1),(9,1163,2),(3,1794,1),(4,2072,1);
/*!40000 ALTER TABLE `SUPER_STUDY_STUDY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SUPER_STUDY_BIOME`
--

DROP TABLE IF EXISTS `SUPER_STUDY_BIOME`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SUPER_STUDY_BIOME` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `BIOME_ID` smallint(6) NOT NULL,
  `SUPER_STUDY_ID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SUPER_STUDY_BIOME_BIOME_ID_SUPER_STUDY_ID_a50d2ff6_uniq` (`BIOME_ID`,`SUPER_STUDY_ID`),
  KEY `SUPER_STUDY_BIOME_SUPER_STUDY_ID_94103583_fk_SUPER_STU` (`SUPER_STUDY_ID`),
  CONSTRAINT `SUPER_STUDY_BIOME_BIOME_ID_a5aa1558_fk_BIOME_HIE` FOREIGN KEY (`BIOME_ID`) REFERENCES `BIOME_HIERARCHY_TREE` (`BIOME_ID`),
  CONSTRAINT `SUPER_STUDY_BIOME_SUPER_STUDY_ID_94103583_fk_SUPER_STU` FOREIGN KEY (`SUPER_STUDY_ID`) REFERENCES `SUPER_STUDY` (`STUDY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SUPER_STUDY_BIOME`
--

LOCK TABLES `SUPER_STUDY_BIOME` WRITE;
/*!40000 ALTER TABLE `SUPER_STUDY_BIOME` DISABLE KEYS */;
INSERT INTO `SUPER_STUDY_BIOME` VALUES (5,17,2),(6,418,2),(4,466,1);
/*!40000 ALTER TABLE `SUPER_STUDY_BIOME` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-07-18 20:49:41
