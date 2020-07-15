-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: 127.0.0.1    Database: emg
-- ------------------------------------------------------
-- Server version	5.7.20

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
-- Dumping data for table SUMMARY_VARIABLE_NAMES
--

LOCK TABLES SUMMARY_VARIABLE_NAMES WRITE;
/*!40000 ALTER TABLE SUMMARY_VARIABLE_NAMES DISABLE KEYS */;
INSERT INTO SUMMARY_VARIABLE_NAMES (VAR_NAME, DESCRIPTION) VALUES ('Nucleotide sequences after clustering',NULL),('Nucleotide sequences after format-specific filtering',NULL),('Nucleotide sequences after length filtering',NULL),('Nucleotide sequences after repeat masking and filtering',NULL),('Nucleotide sequences after undetermined bases filtering',NULL),('Reads with InterProScan match',NULL),('Reads with predicted CDS',NULL),('Reads with predicted RNA',NULL),('Reads with predicted RNA',NULL),('Predicted CDS',NULL),('Predicted CDS with InterProScan match',NULL),('Submitted nucleotide sequences',NULL),('Total InterProScan matches',NULL);
/*!40000 ALTER TABLE SUMMARY_VARIABLE_NAMES ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-10 12:11:50
