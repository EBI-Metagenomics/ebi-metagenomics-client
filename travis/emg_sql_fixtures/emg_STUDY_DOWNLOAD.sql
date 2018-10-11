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
-- Dumping data for table STUDY_DOWNLOAD
--

LOCK TABLES STUDY_DOWNLOAD WRITE;
/*!40000 ALTER TABLE STUDY_DOWNLOAD DISABLE KEYS */;
INSERT INTO STUDY_DOWNLOAD VALUES (1,'GO-slim_abundances_v1.0.tsv','SRP001743_GO-slim_abundances_v1.0.tsv',22,2,2,NULL,1,256,1),(2,'phylum_taxonomy_abundances_v1.0.tsv','SRP001743_phylum_taxonomy_abundances_v1.0.tsv',24,2,3,NULL,1,256,1),(3,'IPR_abundances_v1.0.tsv','SRP001743_IPR_abundances_v1.0.tsv',20,2,2,NULL,1,256,1),(4,'GO_abundances_v1.0.tsv','SRP001743_GO_abundances_v1.0.tsv',21,2,2,NULL,1,256,1),(5,'taxonomy_abundances_v1.0.tsv','SRP001743_taxonomy_abundances_v1.0.tsv',25,2,3,NULL,1,256,1),(738,'GO-slim_abundances_v2.0.tsv','ERP009703_GO-slim_abundances_v2.0.tsv',22,2,2,NULL,2,462,2),(739,'taxonomy_abundances_v2.0.tsv','ERP009703_taxonomy_abundances_v2.0.tsv',25,2,3,NULL,2,462,2),(740,'GO_abundances_v2.0.tsv','ERP009703_GO_abundances_v2.0.tsv',21,2,2,NULL,2,462,2),(741,'phylum_taxonomy_abundances_v2.0.tsv','ERP009703_phylum_taxonomy_abundances_v2.0.tsv',24,2,3,NULL,2,462,2),(742,'IPR_abundances_v2.0.tsv','ERP009703_IPR_abundances_v2.0.tsv',20,2,2,NULL,2,462,2),(743,'taxonomy_abundances_SSU_v4.0.tsv','ERP009703_taxonomy_abundances_SSU_v4.0.tsv',31,2,4,NULL,4,462,4),(744,'phylum_taxonomy_abundances_SSU_v4.0.tsv','ERP009703_phylum_taxonomy_abundances_SSU_v4.0.tsv',29,2,4,NULL,4,462,4),(745,'taxonomy_abundances_LSU_v4.0.tsv','ERP009703_taxonomy_abundances_LSU_v4.0.tsv',32,2,5,NULL,4,462,4),(746,'phylum_taxonomy_abundances_LSU_v4.0.tsv','ERP009703_phylum_taxonomy_abundances_LSU_v4.0.tsv',30,2,5,NULL,4,462,4),(747,'IPR_abundances_v4.0.tsv','ERP009703_IPR_abundances_v4.0.tsv',20,2,2,NULL,4,462,4),(748,'GO-slim_abundances_v4.0.tsv','ERP009703_GO-slim_abundances_v4.0.tsv',22,2,2,NULL,4,462,4),(749,'GO_abundances_v4.0.tsv','ERP009703_GO_abundances_v4.0.tsv',21,2,2,NULL,4,462,4),(750,'LSU_diversity.tsv','ERP009703_diversity_LSU_v4.0.tsv',28,2,6,NULL,4,462,4),(751,'SSU_diversity.tsv','ERP009703_diversity_SSU_v4.0.tsv',27,2,6,NULL,4,462,4),(1265,'GO_abundances_v2.0.tsv','SRP002480_GO_abundances_v2.0.tsv',21,2,2,NULL,2,604,2),(1266,'IPR_abundances_v2.0.tsv','SRP002480_IPR_abundances_v2.0.tsv',20,2,2,NULL,2,604,2),(1267,'phylum_taxonomy_abundances_v2.0.tsv','SRP002480_phylum_taxonomy_abundances_v2.0.tsv',24,2,3,NULL,2,604,2),(1268,'GO-slim_abundances_v2.0.tsv','SRP002480_GO-slim_abundances_v2.0.tsv',22,2,2,NULL,2,604,2),(1269,'taxonomy_abundances_v2.0.tsv','SRP002480_taxonomy_abundances_v2.0.tsv',25,2,3,NULL,2,604,2),(5108,'diversity.tsv','ERP022958_diversity_v3.0.tsv',26,2,6,NULL,3,1818,3),(5109,'phylum_taxonomy_abundances_v3.0.tsv','ERP022958_phylum_taxonomy_abundances_v3.0.tsv',24,2,3,NULL,3,1818,3),(5110,'taxonomy_abundances_v3.0.tsv','ERP022958_taxonomy_abundances_v3.0.tsv',25,2,3,NULL,3,1818,3),(6285,'taxonomy_abundances_SSU_v4.0.tsv','ERP104236_taxonomy_abundances_SSU_v4.0.tsv',31,2,4,NULL,4,2062,4),(6286,'phylum_taxonomy_abundances_SSU_v4.0.tsv','ERP104236_phylum_taxonomy_abundances_SSU_v4.0.tsv',29,2,4,NULL,4,2062,4),(6287,'taxonomy_abundances_LSU_v4.0.tsv','ERP104236_taxonomy_abundances_LSU_v4.0.tsv',32,2,5,NULL,4,2062,4),(6288,'phylum_taxonomy_abundances_LSU_v4.0.tsv','ERP104236_phylum_taxonomy_abundances_LSU_v4.0.tsv',30,2,5,NULL,4,2062,4),(6289,'IPR_abundances_v4.0.tsv','ERP104236_IPR_abundances_v4.0.tsv',20,2,2,NULL,4,2062,4),(6290,'GO-slim_abundances_v4.0.tsv','ERP104236_GO-slim_abundances_v4.0.tsv',22,2,2,NULL,4,2062,4),(6291,'GO_abundances_v4.0.tsv','ERP104236_GO_abundances_v4.0.tsv',21,2,2,NULL,4,2062,4),(6292,'LSU_diversity.tsv','ERP104236_diversity_LSU_v4.0.tsv',28,2,6,NULL,4,2062,4),(6293,'SSU_diversity.tsv','ERP104236_diversity_SSU_v4.0.tsv',27,2,6,NULL,4,2062,4),(6362,'taxonomy_abundances_SSU_v4.0.tsv','ERP019566_taxonomy_abundances_SSU_v4.0.tsv',31,2,4,NULL,4,2072,4),(6363,'phylum_taxonomy_abundances_SSU_v4.0.tsv','ERP019566_phylum_taxonomy_abundances_SSU_v4.0.tsv',29,2,4,NULL,4,2072,4),(6364,'SSU_diversity.tsv','ERP019566_diversity_SSU_v4.0.tsv',27,2,6,NULL,4,2072,4);
/*!40000 ALTER TABLE STUDY_DOWNLOAD ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-10 12:11:57
