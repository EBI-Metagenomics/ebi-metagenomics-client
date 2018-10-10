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
-- Dumping data for table `PIPELINE_RELEASE`
--

LOCK TABLES `PIPELINE_RELEASE` WRITE;
/*!40000 ALTER TABLE `PIPELINE_RELEASE` DISABLE KEYS */;
INSERT INTO `PIPELINE_RELEASE` VALUES (1,'Initial version','N/A','1.0','2009-12-09'),(2,NULL,'Major upgrade. Updated the following binaries: InterProScan, FragGeneScan, QIIME','2.0','2015-02-15'),(3,'Release of version 3.0','Major upgrade. Updated the following binaries: InterProScan, FragGeneScan, QIIME, Trimmomatic. Added new steps for producing quality control statistics and for tRNA selection.','3.0','2016-06-30'),(4,'Release of version 4.0','Major upgrade. rRNASelector, which was previously used to identify 16S rRNA genes by the pipeline, was replaced with Infernal using a library of competing ribosomal RNA hidden Markov models. This allows accurate identification of both large and small subunit ribosomal ribonucleic acid genes, including the eukaryotic 18S rRNA gene. The QIIME taxonomic classification component was replaced with MapSeq. , which provides fast and accurate classification of reads, and provides corresponding confidence scores for assignment at each taxonomic level. The Greengenes reference database was replaced with SILVA SSU / LSU version 128, enabling classification of eukaryotes, remapped to a 7-level taxonomy. Prodigal version 2.6.3 was added to run alongside FragGeneScan as part of a combined gene caller when processing assembled sequences. InterProScan was updated to version 5.25 (based on InterPro release 64.0).','4.0','2017-09-04'),(5,'Release of version 4.1','Minor upgrade. Upgraded SeqPrep to v1.2. Upgraded MAPseq to v1.2.2. Rebuilt taxonomic reference database based on SILVA v132. Taxonomic assignments now also available in HDF5 format.','4.1','2018-01-17');
/*!40000 ALTER TABLE `PIPELINE_RELEASE` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-10 12:11:51
