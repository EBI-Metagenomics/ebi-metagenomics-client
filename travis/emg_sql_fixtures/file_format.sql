-- MySQL dump 10.13  Distrib 5.6.33, for debian-linux-gnu (x86_64)
--
-- Host: mysql-vm-076.ebi.ac.uk    Database: emg
-- ------------------------------------------------------
-- Server version	5.6.33

--
-- Dumping data for table `FILE_FORMAT`
--
INSERT INTO `FILE_FORMAT` VALUES (1,'TSV','tsv',1);
INSERT INTO `FILE_FORMAT` VALUES (2,'TSV','tsv',0);
INSERT INTO `FILE_FORMAT` VALUES (3,'CSV','csv',0);
INSERT INTO `FILE_FORMAT` VALUES (4,'FASTA','fasta',1);
INSERT INTO `FILE_FORMAT` VALUES (5,'FASTA','fasta',0);
INSERT INTO `FILE_FORMAT` VALUES (6,'Biom','biom',0);
INSERT INTO `FILE_FORMAT` VALUES (7,'HDF5 Biom','biom',0);
INSERT INTO `FILE_FORMAT` VALUES (8,'JSON Biom','biom',0);
INSERT INTO `FILE_FORMAT` VALUES (9,'Newick format','tree',0);
-- Dump completed on 2018-03-20 15:59:03