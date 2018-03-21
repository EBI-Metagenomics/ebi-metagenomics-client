-- MySQL dump 10.13  Distrib 5.7.18, for macos10.12 (x86_64)

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
-- Table structure for table `ANALYSIS_JOB`
--

DROP TABLE IF EXISTS `ANALYSIS_JOB`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ANALYSIS_JOB` (
  `JOB_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `JOB_OPERATOR` varchar(15) COLLATE utf8_unicode_ci NOT NULL,
  `PIPELINE_ID` smallint(6) NOT NULL,
  `SUBMIT_TIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `COMPLETE_TIME` datetime DEFAULT NULL,
  `ANALYSIS_STATUS_ID` tinyint(4) NOT NULL,
  `RE_RUN_COUNT` tinyint(4) DEFAULT '0',
  `INPUT_FILE_NAME` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `RESULT_DIRECTORY` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `EXTERNAL_RUN_IDS` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `SAMPLE_ID` int(11) DEFAULT NULL,
  `IS_PRODUCTION_RUN` bit(1) DEFAULT NULL,
  `EXPERIMENT_TYPE_ID` tinyint(4) DEFAULT NULL,
  `RUN_STATUS_ID` tinyint(4) DEFAULT NULL,
  `INSTRUMENT_PLATFORM` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `INSTRUMENT_MODEL` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `SECONDARY_ACCESSION` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `STUDY_ID` int(11) NOT NULL,
  PRIMARY KEY (`JOB_ID`),
  UNIQUE KEY `UC_ANALYSIS_JOB` (`PIPELINE_ID`,`EXTERNAL_RUN_IDS`),
  UNIQUE KEY `ANALYSIS_JOB_JOB_ID_EXTERNAL_RUN_IDS_b5a286e3_uniq` (`JOB_ID`,`EXTERNAL_RUN_IDS`),
  UNIQUE KEY `ANALYSIS_JOB_PIPELINE_ID_EXTERNAL_RUN_IDS_d48405ed_uniq` (`PIPELINE_ID`,`EXTERNAL_RUN_IDS`),
  KEY `ANALYSIS_JOB_E_TYPE_ID_IDX` (`EXPERIMENT_TYPE_ID`),
  KEY `ANALYSIS_JOB_ANALYSIS_STATUS_ID_1381ce70_fk_ANALYSIS_` (`ANALYSIS_STATUS_ID`),
  KEY `ANALYSIS_JOB_SAMPLE_ID_d0086595_fk_SAMPLE_SAMPLE_ID` (`SAMPLE_ID`),
  KEY `ANALYSIS_JOB_STUDY_ID_d8223610_fk_STUDY_STUDY_ID` (`STUDY_ID`),
  FULLTEXT KEY `run_instrument_platform_ts_idx` (`INSTRUMENT_PLATFORM`),
  FULLTEXT KEY `run_instrument_model_ts_idx` (`INSTRUMENT_MODEL`),
  CONSTRAINT `ANALYSIS_JOB_ANALYSIS_STATUS_ID_1381ce70_fk_ANALYSIS_` FOREIGN KEY (`ANALYSIS_STATUS_ID`) REFERENCES `ANALYSIS_STATUS` (`ANALYSIS_STATUS_ID`),
  CONSTRAINT `ANALYSIS_JOB_EXPERIMENT_TYPE_ID_be46185e_fk_EXPERIMEN` FOREIGN KEY (`EXPERIMENT_TYPE_ID`) REFERENCES `EXPERIMENT_TYPE` (`EXPERIMENT_TYPE_ID`),
  CONSTRAINT `ANALYSIS_JOB_PIPELINE_ID_b97b1941_fk_PIPELINE_` FOREIGN KEY (`PIPELINE_ID`) REFERENCES `PIPELINE_RELEASE` (`PIPELINE_ID`),
  CONSTRAINT `ANALYSIS_JOB_SAMPLE_ID_d0086595_fk_SAMPLE_SAMPLE_ID` FOREIGN KEY (`SAMPLE_ID`) REFERENCES `SAMPLE` (`SAMPLE_ID`),
  CONSTRAINT `ANALYSIS_JOB_STUDY_ID_d8223610_fk_STUDY_STUDY_ID` FOREIGN KEY (`STUDY_ID`) REFERENCES `STUDY` (`STUDY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=142320 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Table to track all analysis runs in production.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ANALYSIS_JOB_ANN`
--

DROP TABLE IF EXISTS `ANALYSIS_JOB_ANN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ANALYSIS_JOB_ANN` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `UNITS` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  `var_id` int(11) NOT NULL,
  `VAR_VAL_UCV` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `JOB_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ANALYSIS_JOB_ANN_JOB_ID_var_id_59085dcf_uniq` (`JOB_ID`,`var_id`),
  KEY `ANALYSIS_JOB_ANN_var_id_4c70c723_fk_SUMMARY_VARIABLE_NAMES_id` (`var_id`),
  CONSTRAINT `ANALYSIS_JOB_ANN_JOB_ID_001ee98f_fk_ANALYSIS_JOB_JOB_ID` FOREIGN KEY (`JOB_ID`) REFERENCES `ANALYSIS_JOB` (`JOB_ID`),
  CONSTRAINT `ANALYSIS_JOB_ANN_var_id_4c70c723_fk_SUMMARY_VARIABLE_NAMES_id` FOREIGN KEY (`var_id`) REFERENCES `SUMMARY_VARIABLE_NAMES` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=973622 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ANALYSIS_STATUS`
--

DROP TABLE IF EXISTS `ANALYSIS_STATUS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ANALYSIS_STATUS` (
  `ANALYSIS_STATUS_ID` tinyint(4) NOT NULL AUTO_INCREMENT,
  `ANALYSIS_STATUS` varchar(25) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`ANALYSIS_STATUS_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BIOME_HIERARCHY_TREE`
--

DROP TABLE IF EXISTS `BIOME_HIERARCHY_TREE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BIOME_HIERARCHY_TREE` (
  `BIOME_ID` smallint(6) NOT NULL DEFAULT '0',
  `BIOME_NAME` varchar(60) COLLATE utf8_unicode_ci NOT NULL,
  `LFT` smallint(6) NOT NULL,
  `RGT` smallint(6) NOT NULL,
  `DEPTH` tinyint(4) NOT NULL,
  `LINEAGE` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`BIOME_ID`),
  UNIQUE KEY `BIOME_HIERARCHY_TREE_BIOME_ID_BIOME_NAME_273ccaf6_uniq` (`BIOME_ID`,`BIOME_NAME`),
  FULLTEXT KEY `biome_biome_name_ts_idx` (`BIOME_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BLACKLISTED_STUDY`
--

DROP TABLE IF EXISTS `BLACKLISTED_STUDY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BLACKLISTED_STUDY` (
  `EXT_STUDY_ID` varchar(18) COLLATE utf8_unicode_ci NOT NULL COMMENT 'This is the external unique (non-EMG) ID for the study, e.g. SRPXXXXXX for SRA studies',
  `ERROR_TYPE_ID` tinyint(4) NOT NULL COMMENT 'Foreign key to the study error type table.',
  `ANALYZER` varchar(15) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Person who tried to analyse this study.',
  `PIPELINE_ID` smallint(6) DEFAULT NULL COMMENT 'Optional. The pipeline version used to run this study.',
  `DATE_BLACKLISTED` date NOT NULL COMMENT 'The date when the study has been marked as blacklisted.',
  `COMMENT` text COLLATE utf8_unicode_ci COMMENT 'Use this field to add more detailed information about the issue.',
  PRIMARY KEY (`EXT_STUDY_ID`),
  KEY `ERROR_TYPE_ID` (`ERROR_TYPE_ID`),
  CONSTRAINT `BLACKLISTED_STUDY_ibfk_1` FOREIGN KEY (`ERROR_TYPE_ID`) REFERENCES `STUDY_ERROR_TYPE` (`ERROR_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EXPERIMENT_TYPE`
--

DROP TABLE IF EXISTS `EXPERIMENT_TYPE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EXPERIMENT_TYPE` (
  `EXPERIMENT_TYPE_ID` tinyint(4) NOT NULL AUTO_INCREMENT,
  `EXPERIMENT_TYPE` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`EXPERIMENT_TYPE_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GSC_CV_CV`
--

DROP TABLE IF EXISTS `GSC_CV_CV`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GSC_CV_CV` (
  `VAR_NAME` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `VAR_VAL_CV` varchar(60) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`VAR_VAL_CV`),
  UNIQUE KEY `GSC_CV_CV_PK` (`VAR_VAL_CV`),
  UNIQUE KEY `GSC_CV_CV_U1` (`VAR_NAME`,`VAR_VAL_CV`),
  UNIQUE KEY `GSC_CV_CV_VAR_NAME_VAR_VAL_CV_3a82d86e_uniq` (`VAR_NAME`,`VAR_VAL_CV`),
  CONSTRAINT `GSC_CV_CV_ibfk_1` FOREIGN KEY (`VAR_NAME`) REFERENCES `VARIABLE_NAMES` (`VAR_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PIPELINE_RELEASE`
--

DROP TABLE IF EXISTS `PIPELINE_RELEASE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PIPELINE_RELEASE` (
  `PIPELINE_ID` smallint(6) NOT NULL AUTO_INCREMENT,
  `DESCRIPTION` text COLLATE utf8_unicode_ci,
  `CHANGES` text COLLATE utf8_unicode_ci NOT NULL,
  `RELEASE_VERSION` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `RELEASE_DATE` date NOT NULL,
  PRIMARY KEY (`PIPELINE_ID`),
  UNIQUE KEY `PIPELINE_RELEASE_PIPELINE_ID_RELEASE_VERSION_d40fe384_uniq` (`PIPELINE_ID`,`RELEASE_VERSION`),
  FULLTEXT KEY `pipeline_description_ts_idx` (`DESCRIPTION`),
  FULLTEXT KEY `pipeline_changes_ts_idx` (`CHANGES`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PIPELINE_RELEASE_TOOL`
--

DROP TABLE IF EXISTS `PIPELINE_RELEASE_TOOL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PIPELINE_RELEASE_TOOL` (
  `PIPELINE_ID` smallint(6) NOT NULL,
  `TOOL_ID` smallint(6) NOT NULL,
  `TOOL_GROUP_ID` decimal(6,3) NOT NULL,
  `HOW_TOOL_USED_DESC` longtext COLLATE utf8_unicode_ci,
  PRIMARY KEY (`PIPELINE_ID`,`TOOL_ID`),
  UNIQUE KEY `pipeline_tool_group_uqidx` (`PIPELINE_ID`,`TOOL_GROUP_ID`),
  UNIQUE KEY `PIPELINE_RELEASE_TOOL_PIPELINE_ID_TOOL_ID_8b32b863_uniq` (`PIPELINE_ID`,`TOOL_ID`),
  UNIQUE KEY `PIPELINE_RELEASE_TOOL_PIPELINE_ID_TOOL_GROUP_ID_d3d9c1b2_uniq` (`PIPELINE_ID`,`TOOL_GROUP_ID`),
  KEY `PIPELINE_RELEASE_TOOL_TOOL_ID_cf450cf4_fk_PIPELINE_TOOL_TOOL_ID` (`TOOL_ID`),
  CONSTRAINT `PIPELINE_RELEASE_TOOL_TOOL_ID_cf450cf4_fk_PIPELINE_TOOL_TOOL_ID` FOREIGN KEY (`TOOL_ID`) REFERENCES `PIPELINE_TOOL` (`TOOL_ID`),
  CONSTRAINT `PIPELINE_RELEASE_TOO_PIPELINE_ID_2804b066_fk_PIPELINE_` FOREIGN KEY (`PIPELINE_ID`) REFERENCES `PIPELINE_RELEASE` (`PIPELINE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PIPELINE_TOOL`
--

DROP TABLE IF EXISTS `PIPELINE_TOOL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PIPELINE_TOOL` (
  `TOOL_ID` smallint(6) NOT NULL AUTO_INCREMENT,
  `TOOL_NAME` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `DESCRIPTION` longtext COLLATE utf8_unicode_ci,
  `WEB_LINK` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `VERSION` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EXE_COMMAND` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `INSTALLATION_DIR` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CONFIGURATION_FILE` longtext COLLATE utf8_unicode_ci,
  `NOTES` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`TOOL_ID`),
  UNIQUE KEY `PIPELINE_TOOL_TOOL_NAME_VERSION_97623d54_uniq` (`TOOL_NAME`,`VERSION`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PUBLICATION`
--

DROP TABLE IF EXISTS `PUBLICATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PUBLICATION` (
  `PUB_ID` int(11) NOT NULL AUTO_INCREMENT,
  `AUTHORS` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `DOI` varchar(1500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ISBN` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `ISO_JOURNAL` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ISSUE` varchar(55) COLLATE utf8_unicode_ci DEFAULT NULL,
  `MEDLINE_JOURNAL` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `PUB_ABSTRACT` longtext COLLATE utf8_unicode_ci,
  `PUBMED_CENTRAL_ID` int(11) DEFAULT NULL,
  `PUBMED_ID` int(11) NOT NULL DEFAULT '0',
  `PUB_TITLE` varchar(740) COLLATE utf8_unicode_ci NOT NULL,
  `RAW_PAGES` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `URL` varchar(740) COLLATE utf8_unicode_ci DEFAULT NULL,
  `VOLUME` varchar(55) COLLATE utf8_unicode_ci DEFAULT NULL,
  `PUBLISHED_YEAR` smallint(6) DEFAULT NULL,
  `PUB_TYPE` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`PUB_ID`),
  FULLTEXT KEY `publication_publication_title_ts_idx` (`PUB_TITLE`),
  FULLTEXT KEY `publication_pub_abstract_ts_idx` (`PUB_ABSTRACT`)
) ENGINE=InnoDB AUTO_INCREMENT=700 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SAMPLE`
--

DROP TABLE IF EXISTS `SAMPLE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SAMPLE` (
  `SAMPLE_ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The unique identifier assigned by a trigger on the database that assignes the next number in the series. This is effectively an EMG accession number, but we have no intention of ever discolsing this to external users.',
  `ANALYSIS_COMPLETED` date DEFAULT NULL COMMENT 'This is the date that analysis was (last) completed on. It is the trigger used in the current web-app to display the analysis results page, if this is null there will never be the button on the sample page to be able to show the analsyis results.',
  `COLLECTION_DATE` date DEFAULT NULL COMMENT 'The date the sample was collected, this value is now also present in the sample_ann table, and so can be deleted from this table AFTER the web-app has been changed to get the date from the sample_ann table instead.',
  `GEO_LOC_NAME` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'The (country) name of the location the sample was collected from, this value is now also present in the sample_ann table, and so can be deleted from this table AFTER the web-app has been changed to get the data from the sample_ann table instead.',
  `IS_PUBLIC` tinyint(4) DEFAULT NULL,
  `METADATA_RECEIVED` datetime DEFAULT CURRENT_TIMESTAMP,
  `SAMPLE_DESC` longtext COLLATE utf8_unicode_ci,
  `SEQUENCEDATA_ARCHIVED` datetime DEFAULT NULL,
  `SEQUENCEDATA_RECEIVED` datetime DEFAULT NULL,
  `ENVIRONMENT_BIOME` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ENVIRONMENT_FEATURE` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ENVIRONMENT_MATERIAL` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `SAMPLE_NAME` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `SAMPLE_ALIAS` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `HOST_TAX_ID` int(11) DEFAULT NULL,
  `EXT_SAMPLE_ID` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `SPECIES` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `LATITUDE` decimal(7,4) DEFAULT NULL,
  `LONGITUDE` decimal(7,4) DEFAULT NULL,
  `LAST_UPDATE` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SUBMISSION_ACCOUNT_ID` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Defines which users do have permission to access that sample/study. It is a reference to ERAPRO''s submission_account table',
  `BIOME_ID` smallint(6) DEFAULT NULL,
  `PRIMARY_ACCESSION` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`SAMPLE_ID`),
  UNIQUE KEY `SAMPLE_SAMPLE_ID_EXT_SAMPLE_ID_cb53919e_uniq` (`SAMPLE_ID`,`EXT_SAMPLE_ID`),
  UNIQUE KEY `SAMPLE_EXT_SAMPLE_ID_07d2293e_uniq` (`EXT_SAMPLE_ID`),
  KEY `SAMPLE_BIOME_ID_b2075860_fk_BIOME_HIERARCHY_TREE_BIOME_ID` (`BIOME_ID`),
  FULLTEXT KEY `sample_sample_name_ts_idx` (`SAMPLE_NAME`),
  FULLTEXT KEY `sample_sample_desc_ts_idx` (`SAMPLE_DESC`),
  CONSTRAINT `SAMPLE_BIOME_ID_b2075860_fk_BIOME_HIERARCHY_TREE_BIOME_ID` FOREIGN KEY (`BIOME_ID`) REFERENCES `BIOME_HIERARCHY_TREE` (`BIOME_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=109458 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SAMPLE_ANN`
--

DROP TABLE IF EXISTS `SAMPLE_ANN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SAMPLE_ANN` (
  `SAMPLE_ID` int(11) NOT NULL COMMENT 'Internal sample ID from SAMPLE table',
  `VAR_VAL_CV` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'The value of the variable defined in VAR_ID where that variable must use a controlled vocabulary, this value must be in GSC_CV_CV',
  `UNITS` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'The UNITS of the value given in VAR_VAL_UCV',
  `VAR_ID` smallint(6) NOT NULL COMMENT 'The variable ID from the VARIABLE_NAMES table',
  `VAR_VAL_UCV` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'The value for the varible defined by VAR_ID',
  PRIMARY KEY (`SAMPLE_ID`,`VAR_ID`),
  UNIQUE KEY `SAMPLE_ANN_PK` (`SAMPLE_ID`,`VAR_ID`),
  UNIQUE KEY `SAMPLE_ANN_SAMPLE_ID_VAR_ID_934ec87c_uniq` (`SAMPLE_ID`,`VAR_ID`),
  KEY `VAR_ID` (`VAR_ID`),
  KEY `VAR_VAL_CV` (`VAR_VAL_CV`),
  FULLTEXT KEY `sample_ann_var_val_ucv_ts_idx` (`VAR_VAL_UCV`),
  CONSTRAINT `SAMPLE_ANN_ibfk_1` FOREIGN KEY (`VAR_ID`) REFERENCES `VARIABLE_NAMES` (`VAR_ID`),
  CONSTRAINT `SAMPLE_ANN_ibfk_2` FOREIGN KEY (`SAMPLE_ID`) REFERENCES `SAMPLE` (`SAMPLE_ID`),
  CONSTRAINT `SAMPLE_ANN_ibfk_3` FOREIGN KEY (`VAR_VAL_CV`) REFERENCES `GSC_CV_CV` (`VAR_VAL_CV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SAMPLE_PUBLICATION`
--

DROP TABLE IF EXISTS `SAMPLE_PUBLICATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SAMPLE_PUBLICATION` (
  `SAMPLE_ID` int(11) NOT NULL COMMENT 'sample_id from the sample table, of the sample associated with this publication',
  `PUB_ID` int(11) NOT NULL COMMENT 'publication ID from publication table',
  PRIMARY KEY (`SAMPLE_ID`,`PUB_ID`),
  UNIQUE KEY `SAMPLE_PUBLICATION_SAMPLE_ID_PUB_ID_8167fbc0_uniq` (`SAMPLE_ID`,`PUB_ID`),
  KEY `SAMPLE_PUBLICATION_PUB_ID_70cffbdb_fk_PUBLICATION_PUB_ID` (`PUB_ID`),
  CONSTRAINT `SAMPLE_PUBLICATION_PUB_ID_70cffbdb_fk_PUBLICATION_PUB_ID` FOREIGN KEY (`PUB_ID`) REFERENCES `PUBLICATION` (`PUB_ID`),
  CONSTRAINT `SAMPLE_PUBLICATION_SAMPLE_ID_aef56607_fk_SAMPLE_SAMPLE_ID` FOREIGN KEY (`SAMPLE_ID`) REFERENCES `SAMPLE` (`SAMPLE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STUDY`
--

DROP TABLE IF EXISTS `STUDY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STUDY` (
  `STUDY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `CENTRE_NAME` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'The center_name used by SRA, it must be in the SRA schema, table CV_CENTER_NAME, which also should contain the description of that acronym (but doesn''t always!)',
  `EXPERIMENTAL_FACTOR` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'This is metadata about the study, its to give an easy look up for time series studies or things where the study wass designed to test a particular variable, e.g. time, depth, disease etc...',
  `IS_PUBLIC` tinyint(4) DEFAULT NULL COMMENT '1 for public, 0 for private (As of Aug2012 this is set manually in both Production and Web databases)',
  `PUBLIC_RELEASE_DATE` date DEFAULT NULL COMMENT 'The date originally specified by the submitter of when their data should be released to public, can be changed by submitter in SRA and we should sync with SRA.',
  `STUDY_ABSTRACT` longtext COLLATE utf8_unicode_ci COMMENT 'The submitter provided description of the project/study.',
  `EXT_STUDY_ID` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `STUDY_NAME` varchar(300) COLLATE utf8_unicode_ci DEFAULT NULL,
  `STUDY_STATUS` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'not used, should be deprecated',
  `DATA_ORIGINATION` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Where did the data come from, this could be HARVESTED for stuff taken from SRA, or SUBMITTED for stuff that is brokered to SRA through EMG',
  `AUTHOR_EMAIL` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Email address of contact person for study, WILL be shown publicly on Study page',
  `AUTHOR_NAME` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of contact person for study, WILL be shown publicly on Study page',
  `LAST_UPDATE` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The date any update was made to the row, this is auto-updated in PROD by a trigger, but not in any others (e.g. web, test or dev)',
  `SUBMISSION_ACCOUNT_ID` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Defines which users do have permission to access that sample/study. It is a reference to ERAPRO''s submission_account table',
  `BIOME_ID` smallint(6) DEFAULT NULL COMMENT 'Links to an entry in the biome hierarchy table, which is a controlled vocabulary.',
  `RESULT_DIRECTORY` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Path to the results directory for this study',
  `FIRST_CREATED` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The date when the study has been created in EMG for the first time. Usually happens when a new study is loaded from ENA into EMG using the webuploader tool.',
  `PROJECT_ID` varchar(18) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`STUDY_ID`),
  UNIQUE KEY `STUDY_EXT_STUDY_ID_f6f37592_uniq` (`EXT_STUDY_ID`),
  UNIQUE KEY `STUDY_STUDY_ID_EXT_STUDY_ID_57cd9758_uniq` (`STUDY_ID`,`EXT_STUDY_ID`),
  KEY `STUDY_BIOME_ID_IDX` (`BIOME_ID`),
  FULLTEXT KEY `study_study_name_ts_idx` (`STUDY_NAME`),
  FULLTEXT KEY `study_study_abstract_ts_idx` (`STUDY_ABSTRACT`),
  CONSTRAINT `STUDY_BIOME_ID_232e46ec_fk_BIOME_HIERARCHY_TREE_BIOME_ID` FOREIGN KEY (`BIOME_ID`) REFERENCES `BIOME_HIERARCHY_TREE` (`BIOME_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2114 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STUDY_ERROR_TYPE`
--

DROP TABLE IF EXISTS `STUDY_ERROR_TYPE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STUDY_ERROR_TYPE` (
  `ERROR_ID` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'Primary key.',
  `ERROR_TYPE` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Represents the name of the issue.',
  `DESCRIPTION` text COLLATE utf8_unicode_ci NOT NULL COMMENT 'Describes the issue.',
  PRIMARY KEY (`ERROR_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STUDY_PUBLICATION`
--

DROP TABLE IF EXISTS `STUDY_PUBLICATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STUDY_PUBLICATION` (
  `STUDY_ID` int(11) NOT NULL COMMENT 'the study id of the study with this publication',
  `PUB_ID` int(11) NOT NULL COMMENT 'publication ID from the publication table',
  PRIMARY KEY (`STUDY_ID`,`PUB_ID`),
  UNIQUE KEY `STUDY_PUBLICATION_STUDY_ID_PUB_ID_25f2b6f8_uniq` (`STUDY_ID`,`PUB_ID`),
  KEY `STUDY_PUBLICATION_PUB_ID_7876a21d_fk_PUBLICATION_PUB_ID` (`PUB_ID`),
  CONSTRAINT `STUDY_PUBLICATION_PUB_ID_7876a21d_fk_PUBLICATION_PUB_ID` FOREIGN KEY (`PUB_ID`) REFERENCES `PUBLICATION` (`PUB_ID`),
  CONSTRAINT `STUDY_PUBLICATION_STUDY_ID_f1ddea67_fk_STUDY_STUDY_ID` FOREIGN KEY (`STUDY_ID`) REFERENCES `STUDY` (`STUDY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STUDY_SAMPLE`
--

DROP TABLE IF EXISTS `STUDY_SAMPLE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STUDY_SAMPLE` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `STUDY_ID` int(11) NOT NULL,
  `SAMPLE_ID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `STUDY_SAMPLE_STUDY_ID_SAMPLE_ID_8c7890ca_uniq` (`STUDY_ID`,`SAMPLE_ID`),
  KEY `STUDY_SAMPLE_SAMPLE_ID_910fcb8d_fk_SAMPLE_SAMPLE_ID` (`SAMPLE_ID`),
  CONSTRAINT `STUDY_SAMPLE_SAMPLE_ID_910fcb8d_fk_SAMPLE_SAMPLE_ID` FOREIGN KEY (`SAMPLE_ID`) REFERENCES `SAMPLE` (`SAMPLE_ID`),
  CONSTRAINT `STUDY_SAMPLE_STUDY_ID_5e6f0a9a_fk_STUDY_STUDY_ID` FOREIGN KEY (`STUDY_ID`) REFERENCES `STUDY` (`STUDY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=136234 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SUMMARY_VARIABLE_NAMES`
--

DROP TABLE IF EXISTS `SUMMARY_VARIABLE_NAMES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SUMMARY_VARIABLE_NAMES` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `VAR_NAME` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `DESCRIPTION` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VAR_NAME` (`VAR_NAME`),
  UNIQUE KEY `SUMMARY_VARIABLE_NAMES_VAR_NAME_DESCRIPTION_9476338b_uniq` (`VAR_NAME`,`DESCRIPTION`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `VARIABLE_NAMES`
--

DROP TABLE IF EXISTS `VARIABLE_NAMES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `VARIABLE_NAMES` (
  `VAR_ID` smallint(6) NOT NULL AUTO_INCREMENT COMMENT ' variable identifier, unique sequenctial number auto generated',
  `VAR_NAME` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Unique human readable name as given by GSC (or other authority)',
  `DEFINITION` longtext COLLATE utf8_unicode_ci COMMENT 'Definition of variable, as given by GSC (or other authority)',
  `VALUE_SYNTAX` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'how the GSC (or other authority) has defined the value for the term should be given',
  `ALIAS` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Short name, or INSDC name given by GSC, should be less than 20char and contain no spaces',
  `AUTHORITY` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'person or organisation that created/defined the variable (usualy GSC)',
  `SRA_XML_ATTRIBUTE` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Where the ATTRIBUTE should be in the SRA XML schema, (NB currently (Aug2012) almost everything goes in SRA.SAMPLE which is technically wrong!)',
  `REQUIRED_FOR_MIMARKS_COMPLIANC` varchar(1) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'If a value for the variable is required for GSC MIMARKS compliance (as of Aug2012)',
  `REQUIRED_FOR_MIMS_COMPLIANCE` varchar(1) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Is a value required for GSC MIMS compliance (as of Aug 2012)',
  `GSC_ENV_PACKAGES` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'which (if any) of the GSC environmental packages is this variable part of',
  `COMMENTS` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`VAR_ID`,`VAR_NAME`),
  UNIQUE KEY `VAR_NAME` (`VAR_NAME`),
  UNIQUE KEY `VAR_ID` (`VAR_ID`),
  UNIQUE KEY `VARIABLE_NAMES_PK` (`VAR_ID`,`VAR_NAME`),
  UNIQUE KEY `VARIABLE_NAMES_VAR_ID_VAR_NAME_e353e1f1_uniq` (`VAR_ID`,`VAR_NAME`)
) ENGINE=InnoDB AUTO_INCREMENT=938 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DOWNLOAD_DESCRIPTION_LABEL`
--
DROP TABLE IF EXISTS `DOWNLOAD_DESCRIPTION_LABEL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DOWNLOAD_DESCRIPTION_LABEL` (
  `DESCRIPTION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DESCRIPTION` varchar(255) NOT NULL,
  `DESCRIPTION_LABEL` varchar(100) NOT NULL,
  PRIMARY KEY (`DESCRIPTION_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DOWNLOAD_GROUP_TYPE`
--
DROP TABLE IF EXISTS `DOWNLOAD_GROUP_TYPE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DOWNLOAD_GROUP_TYPE` (
  `GROUP_ID` int(11) NOT NULL AUTO_INCREMENT,
  `GROUP_TYPE` varchar(30) NOT NULL,
  PRIMARY KEY (`GROUP_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DOWNLOAD_SUBDIR`
--
DROP TABLE IF EXISTS `DOWNLOAD_SUBDIR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DOWNLOAD_SUBDIR` (
  `SUBDIR_ID` int(11) NOT NULL AUTO_INCREMENT,
  `SUBDIR` varchar(100) NOT NULL,
  PRIMARY KEY (`SUBDIR_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FILE_FORMAT`
--
DROP TABLE IF EXISTS `FILE_FORMAT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FILE_FORMAT` (
  `FORMAT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FORMAT_NAME` varchar(30) NOT NULL,
  `FORMAT_EXTENSION` varchar(30) NOT NULL,
  `COMPRESSION` tinyint(1) NOT NULL,
  PRIMARY KEY (`FORMAT_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STUDY_DOWNLOAD`
--
DROP TABLE IF EXISTS `STUDY_DOWNLOAD`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STUDY_DOWNLOAD` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `REAL_NAME` varchar(255) NOT NULL,
  `ALIAS` varchar(255) NOT NULL,
  `DESCRIPTION_ID` int(11) DEFAULT NULL,
  `FORMAT_ID` int(11) DEFAULT NULL,
  `GROUP_ID` int(11) DEFAULT NULL,
  `PARENT_DOWNLOAD_ID` int(11) DEFAULT NULL,
  `PIPELINE_ID` smallint(6) DEFAULT NULL,
  `STUDY_ID` int(11) NOT NULL,
  `SUBDIR_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `STUDY_DOWNLOAD_REAL_NAME_ALIAS_PIPELINE_ID_1e3f93f5_uniq` (`REAL_NAME`,`ALIAS`,`PIPELINE_ID`),
  KEY `STUDY_DOWNLOAD_DESCRIPTION_ID_377695b0_fk_DOWNLOAD_` (`DESCRIPTION_ID`),
  KEY `STUDY_DOWNLOAD_FORMAT_ID_724ee865_fk_FILE_FORMAT_FORMAT_ID` (`FORMAT_ID`),
  KEY `STUDY_DOWNLOAD_GROUP_ID_b6e1f2b9_fk_DOWNLOAD_GROUP_TYPE_GROUP_ID` (`GROUP_ID`),
  KEY `STUDY_DOWNLOAD_PARENT_DOWNLOAD_ID_d1ff5d7f_fk_STUDY_DOWNLOAD_id` (`PARENT_DOWNLOAD_ID`),
  KEY `STUDY_DOWNLOAD_PIPELINE_ID_180ecd0d_fk_PIPELINE_` (`PIPELINE_ID`),
  KEY `STUDY_DOWNLOAD_STUDY_ID_2f6230ae_fk_STUDY_STUDY_ID` (`STUDY_ID`),
  KEY `STUDY_DOWNLOAD_SUBDIR_ID_2c096a97_fk_DOWNLOAD_SUBDIR_SUBDIR_ID` (`SUBDIR_ID`),
  CONSTRAINT `STUDY_DOWNLOAD_DESCRIPTION_ID_377695b0_fk_DOWNLOAD_` FOREIGN KEY (`DESCRIPTION_ID`) REFERENCES `DOWNLOAD_DESCRIPTION_LABEL` (`DESCRIPTION_ID`),
  CONSTRAINT `STUDY_DOWNLOAD_FORMAT_ID_724ee865_fk_FILE_FORMAT_FORMAT_ID` FOREIGN KEY (`FORMAT_ID`) REFERENCES `FILE_FORMAT` (`FORMAT_ID`),
  CONSTRAINT `STUDY_DOWNLOAD_GROUP_ID_b6e1f2b9_fk_DOWNLOAD_GROUP_TYPE_GROUP_ID` FOREIGN KEY (`GROUP_ID`) REFERENCES `DOWNLOAD_GROUP_TYPE` (`GROUP_ID`),
  CONSTRAINT `STUDY_DOWNLOAD_PARENT_DOWNLOAD_ID_d1ff5d7f_fk_STUDY_DOWNLOAD_id` FOREIGN KEY (`PARENT_DOWNLOAD_ID`) REFERENCES `STUDY_DOWNLOAD` (`id`),
  CONSTRAINT `STUDY_DOWNLOAD_PIPELINE_ID_180ecd0d_fk_PIPELINE_` FOREIGN KEY (`PIPELINE_ID`) REFERENCES `PIPELINE_RELEASE` (`PIPELINE_ID`),
  CONSTRAINT `STUDY_DOWNLOAD_STUDY_ID_2f6230ae_fk_STUDY_STUDY_ID` FOREIGN KEY (`STUDY_ID`) REFERENCES `STUDY` (`STUDY_ID`),
  CONSTRAINT `STUDY_DOWNLOAD_SUBDIR_ID_2c096a97_fk_DOWNLOAD_SUBDIR_SUBDIR_ID` FOREIGN KEY (`SUBDIR_ID`) REFERENCES `DOWNLOAD_SUBDIR` (`SUBDIR_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7060 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (4,'contenttypes','contenttype'),(6,'corsheaders','corsmodel'),(19,'emgapi','analysisjob'),(14,'emgapi','analysisjobann'),(18,'emgapi','analysismetadatavariablenames'),(12,'emgapi','analysisstatus'),(11,'emgapi','biome'),(13,'emgapi','blacklistedstudy'),(16,'emgapi','experimenttype'),(15,'emgapi','gsccvcv'),(8,'emgapi','pipeline'),(9,'emgapi','pipelinereleasetool'),(17,'emgapi','pipelinetool'),(27,'emgapi','publication'),(23,'emgapi','run'),(26,'emgapi','sample'),(22,'emgapi','sampleann'),(25,'emgapi','samplepublication'),(21,'emgapi','study'),(20,'emgapi','studyerrortype'),(10,'emgapi','studypublication'),(28,'emgapi','studysample'),(24,'emgapi','variablenames');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2017-09-26 10:22:15.022473'),(2,'contenttypes','0002_remove_content_type_name','2017-09-26 10:22:15.221210'),(13,'emgapi','0001_initial','2017-09-26 10:22:17.287011'),(14,'emgapi','0002_cleanup_and_rename','2017-09-26 10:23:21.217820'),(15,'emgapi','0003_annotations','2017-09-26 10:23:23.116513'),(16,'emgapi','0004_analysisjobann','2017-09-26 10:23:23.480379'),(18,'emgapi','0005_study_sample_optional','2017-10-31 12:43:39.918598');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

-- Dump completed on 2018-01-11 10:03:14
