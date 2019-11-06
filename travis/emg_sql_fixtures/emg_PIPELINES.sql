-- MySQL dump 10.13  Distrib 5.7.27, for Linux (x86_64)
--
-- Host: mysql-vm-022.ebi.ac.uk    Database: emg
-- ------------------------------------------------------
-- Server version	5.6.36-log

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
-- Table structure for table `PIPELINE_RELEASE`
--

DROP TABLE IF EXISTS `PIPELINE_RELEASE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PIPELINE_RELEASE` (
  `PIPELINE_ID` smallint(6) NOT NULL,
  `DESCRIPTION` text CHARACTER SET utf8,
  `CHANGES` text CHARACTER SET utf8 NOT NULL,
  `RELEASE_VERSION` varchar(20) CHARACTER SET utf8 NOT NULL,
  `RELEASE_DATE` date NOT NULL,
  PRIMARY KEY (`PIPELINE_ID`),
  UNIQUE KEY `PIPELINE_RELEASE_PIPELINE_ID_RELEASE_VERSION_d40fe384_uniq` (`PIPELINE_ID`,`RELEASE_VERSION`),
  FULLTEXT KEY `pipeline_description_ts_idx` (`DESCRIPTION`),
  FULLTEXT KEY `pipeline_changes_ts_idx` (`CHANGES`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PIPELINE_RELEASE`
--

LOCK TABLES `PIPELINE_RELEASE` WRITE;
/*!40000 ALTER TABLE `PIPELINE_RELEASE` DISABLE KEYS */;
INSERT INTO `PIPELINE_RELEASE` VALUES (1,'Initial version','N/A','1.0','2009-12-09'),(2,NULL,'Major upgrade. Updated the following binaries: InterProScan, FragGeneScan, QIIME','2.0','2015-02-15'),(3,'Release of version 3.0','Major upgrade. Updated the following binaries: InterProScan, FragGeneScan, QIIME, Trimmomatic. Added new steps for producing quality control statistics and for tRNA selection.','3.0','2016-06-30'),(4,'Release of version 4.0','Major upgrade. rRNASelector, which was previously used to identify 16S rRNA genes by the pipeline, was replaced with Infernal using a library of competing ribosomal RNA hidden Markov models. This allows accurate identification of both large and small subunit ribosomal ribonucleic acid genes, including the eukaryotic 18S rRNA gene. The QIIME taxonomic classification component was replaced with MapSeq. , which provides fast and accurate classification of reads, and provides corresponding confidence scores for assignment at each taxonomic level. The Greengenes reference database was replaced with SILVA SSU / LSU version 128, enabling classification of eukaryotes, remapped to a 7-level taxonomy. Prodigal version 2.6.3 was added to run alongside FragGeneScan as part of a combined gene caller when processing assembled sequences. InterProScan was updated to version 5.25 (based on InterPro release 64.0).','4.0','2017-09-04'),(5,'Release of version 4.1','Minor upgrade. Upgraded SeqPrep to v1.2. Upgraded MAPseq to v1.2.2. Rebuilt taxonomic reference database based on SILVA v132. Taxonomic assignments now also available in HDF5 format.','4.1','2018-01-17');
/*!40000 ALTER TABLE `PIPELINE_RELEASE` ENABLE KEYS */;
UNLOCK TABLES;

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
  `HOW_TOOL_USED_DESC` longtext CHARACTER SET utf8,
  PRIMARY KEY (`PIPELINE_ID`,`TOOL_ID`),
  UNIQUE KEY `pipeline_tool_group_uqidx` (`PIPELINE_ID`,`TOOL_GROUP_ID`),
  UNIQUE KEY `PIPELINE_RELEASE_TOOL_PIPELINE_ID_TOOL_ID_8b32b863_uniq` (`PIPELINE_ID`,`TOOL_ID`),
  UNIQUE KEY `PIPELINE_RELEASE_TOOL_PIPELINE_ID_TOOL_GROUP_ID_d3d9c1b2_uniq` (`PIPELINE_ID`,`TOOL_GROUP_ID`),
  KEY `PIPELINE_RELEASE_TOOL_TOOL_ID_cf450cf4_fk_PIPELINE_TOOL_TOOL_ID` (`TOOL_ID`),
  CONSTRAINT `PIPELINE_RELEASE_TOOL_PIPELINE_ID_2804b066_fk` FOREIGN KEY (`PIPELINE_ID`) REFERENCES `PIPELINE_RELEASE` (`PIPELINE_ID`),
  CONSTRAINT `PIPELINE_RELEASE_TOOL_TOOL_ID_cf450cf4_fk_PIPELINE_TOOL_TOOL_ID` FOREIGN KEY (`TOOL_ID`) REFERENCES `PIPELINE_TOOL` (`TOOL_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PIPELINE_RELEASE_TOOL`
--

LOCK TABLES `PIPELINE_RELEASE_TOOL` WRITE;
/*!40000 ALTER TABLE `PIPELINE_RELEASE_TOOL` DISABLE KEYS */;
INSERT INTO `PIPELINE_RELEASE_TOOL` VALUES (1,1,1.100,'Low quality trimming (low quality ends and sequences with > 10% undetermined nucleotides removed).'),(1,2,3.000,'Reads with predicted coding sequences (pCDS) above 60 nucleotides in length.'),(1,3,4.000,'Matches are generated against predicted CDS, using a sub set of databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from InterPro release 31.0. A summary of Gene Ontology (GO) terms derived from InterPro matches to your sample is provided. It is generated using a reduced list of GO terms called GO slim (version <a href=\"https://www.ebi.ac.uk/metagenomics/geneontology/subsets/goslim_metagenomics_may2012.obo\" class=\"ext\">goslim_goa 2012</a>).'),(1,4,1.300,'Duplicate sequences removed - clustered on 99% identity for LS454 or on 50 nucleotides prefix identity (using pick_otus.py script in Qiime v1.15).'),(1,5,1.400,'Repeat masked - removed reads with 50% or more nucleotides masked.'),(1,6,2.000,'Prokaryotic rRNA reads are filtered. We use the hidden Markov models to identify rRNA sequences.'),(1,7,5.000,'16s rRNA are annotated using the Greengenes reference database (default de novo OTU picking protocol with Greengenes 12.10 reference with reverse strand matching enabled).'),(1,8,1.200,'Sequences < 100 nucleotides in length removed.'),(2,1,1.100,'Low quality trimming (low quality ends and sequences with > 10% undetermined nucleotides removed).'),(2,2,3.000,'Reads with predicted coding sequences (pCDS) above 60 nucleotides in length.'),(2,9,2.000,'Prokaryotic rRNA reads are filtered. We use the hidden Markov models to identify rRNA sequences.'),(2,10,5.000,'16s rRNA are annotated using the Greengenes reference database (default closed-reference OTU picking protocol with Greengenes 13.8 reference with reverse strand matching enabled).'),(2,11,1.200,'Sequences < 100 nucleotides in length removed.'),(2,12,4.000,'Matches are generated against predicted CDS, using a sub set of databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from InterPro release 31.0. A summary of Gene Ontology (GO) terms derived from InterPro matches to your sample is provided. It is generated using a reduced list of GO terms called GO slim (version <a href=\"https://www.ebi.ac.uk/metagenomics/geneontology/subsets/goslim_metagenomics_may2012.obo\" class=\"ext\">goslim_goa 2012</a>).'),(3,11,1.200,'Sequences < 100 nucleotides in length removed.'),(3,13,5.000,'16s rRNA are annotated using the Greengenes reference database (default closed-reference OTU picking protocol with Greengenes 13.8 reference with reverse strand matching enabled).'),(3,14,4.000,'Matches are generated against predicted CDS, using a sub set of databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from InterPro release 58.0. A summary of Gene Ontology (GO) terms derived from InterPro matches to your sample is provided. It is generated using a reduced list of GO terms called GO slim (version <a href=\"http://www.geneontology.org/ontology/subsets/goslim_metagenomics.obo\" class=\"ext\">goslim_goa</a>).'),(3,15,1.100,'Low quality trimming (low quality ends and sequences with > 10% undetermined nucleotides removed).'),(3,16,3.000,'Reads with predicted coding sequences (pCDS) above 60 nucleotides in length.'),(3,17,0.000,'Paired-end overlapping reads are merged - we do not perform assembly.'),(3,18,2.000,'Identification and masking of ncRNAs.'),(4,11,1.200,'Sequences < 100 nucleotides in length removed.'),(4,15,1.100,'Low quality trimming (low quality ends and sequences with > 10% undetermined nucleotides removed). Adapter sequences removed using Biopython SeqIO package.'),(4,16,3.100,'Run as a combined gene caller component, giving priority to Prodigal predictions in the case of assembled sequences or FragGeneScan for short reads (all predictions from the higher priority caller are used, supplemented by any non-overlapping regions predicted by the other).'),(4,17,0.000,'Paired-end overlapping reads are merged - if you want your data assembled, email us.'),(4,19,4.000,'Matches are generated against predicted CDS, using a sub set of databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from InterPro release 64.0. A summary of Gene Ontology (GO) terms derived from InterPro matches to your sample is provided. It is generated using a reduced list of GO terms called GO slim (version <a href=\"http://www.geneontology.org/ontology/subsets/goslim_metagenomics.obo\" class=\"ext\">goslim_goa</a>).'),(4,20,3.200,''),(4,21,2.100,'Identification of ncRNAs.'),(4,22,5.000,'SSU and LSU rRNA are annotated using SILVAs SSU/LSU version 128 reference database, enabling classification of eukaryotes, remapped to a 8-level taxonomy.'),(4,23,2.200,'Removes lower scoring overlaps from cmsearch --tblout files.'),(5,11,1.200,'Sequences < 100 nucleotides in length removed.'),(5,15,1.100,'Low quality trimming (low quality ends and sequences with > 10% undetermined nucleotides removed). Adapter sequences removed using Biopython SeqIO package.'),(5,16,3.100,'Run as a combined gene caller component, giving priority to Prodigal predictions in the case of assembled sequences or FragGeneScan for short reads (all predictions from the higher priority caller are used, supplemented by any non-overlapping regions predicted by the other).'),(5,19,4.000,'Matches are generated against predicted CDS, using a sub set of databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from InterPro release 64.0. A summary of Gene Ontology (GO) terms derived from InterPro matches to your sample is provided. It is generated using a reduced list of GO terms called GO slim (version <a href=\"http://www.geneontology.org/ontology/subsets/goslim_metagenomics.obo\" class=\"ext\">goslim_goa</a>).'),(5,20,3.200,''),(5,21,2.100,'Identification of ncRNAs.'),(5,23,2.200,'Removes lower scoring overlaps from cmsearch --tblout files.'),(5,24,0.000,'Paired-end overlapping reads are merged - if you want your data assembled, email us.'),(5,25,5.000,'SSU and LSU rRNA are annotated using SILVAs SSU/LSU version 132 reference database, enabling classification of eukaryotes, remapped to a 8-level taxonomy.');
/*!40000 ALTER TABLE `PIPELINE_RELEASE_TOOL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PIPELINE_TOOL`
--

DROP TABLE IF EXISTS `PIPELINE_TOOL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PIPELINE_TOOL` (
  `TOOL_ID` smallint(6) NOT NULL AUTO_INCREMENT,
  `TOOL_NAME` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `DESCRIPTION` longtext CHARACTER SET utf8,
  `WEB_LINK` varchar(500) CHARACTER SET utf8 DEFAULT NULL,
  `VERSION` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `EXE_COMMAND` varchar(500) CHARACTER SET utf8 DEFAULT NULL,
  `INSTALLATION_DIR` varchar(200) CHARACTER SET utf8 DEFAULT NULL,
  `CONFIGURATION_FILE` longtext CHARACTER SET utf8,
  `NOTES` text CHARACTER SET utf8,
  PRIMARY KEY (`TOOL_ID`),
  UNIQUE KEY `PIPELINE_TOOL_TOOL_NAME_VERSION_97623d54_uniq` (`TOOL_NAME`,`VERSION`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PIPELINE_TOOL`
--

LOCK TABLES `PIPELINE_TOOL` WRITE;
/*!40000 ALTER TABLE `PIPELINE_TOOL` DISABLE KEYS */;
INSERT INTO `PIPELINE_TOOL` VALUES (1,'Trimmomatic','A flexible read trimming tool.','http://www.usadellab.org/cms/?page=trimmomatic','0.32','java -classpath {0}/Trimmomatic-0.32/trimmomatic-0.32.jar org.usadellab.trimmomatic.TrimmomaticSE  -phred33 {1} {2} LEADING:3 TRAILING:3 SLIDINGWINDOW:4:15','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/Trimmomatic-0.32/trimmomatic-0.32.jar',NULL,NULL),(2,'FragGeneScan','An application for finding fragmented genes in short reads.','http://omics.informatics.indiana.edu/FragGeneScan/','1.15','./FragGeneScan -s {0} -o {0}_CDS -w 0 -t 454_10','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/FragGeneScan1.15/FragGeneScan',NULL,NULL),(3,'InterProScan','A sequence analysis application (nucleotide and protein sequences) that combines different protein signature recognition methods into one resource.','https://github.com/ebi-pf-team/interproscan/wiki','5.0-beta','./interproscan.sh --appl PfamA,TIGRFAM-10.1,PRINTS,PrositePatterns,Gene3d -goterms -o {1}_out.tsv -i {1}','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/interproscan-5-dist.dir/',NULL,NULL),(4,'UCLUST','A high-performance clustering, alignment and search algorithm.','http://www.drive5.com/uclust/downloads1_1_579.html','1.1.579','./uclust1.1.579_i86linux64 --id 0.99 --usersort --nucleo --input {1} --uc {2}','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/uclust1.1.579_i86linux64',NULL,NULL),(5,'RepeatMasker','A program that screens DNA sequences for interspersed repeats and low complexity DNA sequences.','http://www.repeatmasker.org/','3.2.2','./RepeatMasker {0}','/sw/arch/bin/RepeatMasker',NULL,NULL),(6,'rRNASelector','A computer program for selecting ribosomal RNA encoding sequences from metagenomic and metatranscriptomic shotgun libraries.','http://www.ezbiocloud.net/sw/rrnaselector','1.0.0','HMMER3.0/hmmsearch --tblout {0} --cpu 4 -E 1.0E-5  {1}/rRNASelector/lib/all.hmm {2} > /dev/null','/ebi/production/interpro/binaries/64_bit_Linux/HMMER3.0/hmmsearch',NULL,NULL),(7,'QIIME','An open-source bioinformatics pipeline for performing taxonomic analysis from raw DNA sequencing data.','http://qiime.org/','1.5.0','./qiimeWrapper.sh  {1}  {2}','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/qiimeWrapper.sh',NULL,NULL),(8,'Biopython','A set of freely available tools for biological computation written in Python.','http://www.biopython.org/','1.54','N/A',NULL,NULL,NULL),(9,'rRNASelector','A computer program for selecting ribosomal RNA encoding sequences from metagenomic and metatranscriptomic shotgun libraries.','http://www.ezbiocloud.net/sw/rrnaselector','1.0.1','./pipelineDetectRRNA.sh {1} {2} {3}','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/bin/pipelineDetectRRNA.sh',NULL,NULL),(10,'QIIME','An open-source bioinformatics pipeline for performing taxonomic analysis from raw DNA sequencing data.','http://qiime.org/','1.9.0','./qiime190Wrapper.sh  {1} {2} {3}','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/bin/qiime190Wrapper.sh',NULL,NULL),(11,'Biopython','A set of freely available tools for biological computation written in Python.','http://biopython.org/wiki/Biopython','1.65','N/A',NULL,NULL,NULL),(12,'InterProScan','A sequence analysis application (nucleotide and protein sequences) that combines different protein signature recognition methods into one resource.','https://github.com/ebi-pf-team/interproscan/wiki','5.9-50.0','./interproscan.sh --appl PfamA,TIGRFAM-10.1,PRINTS,PrositePatterns,Gene3d -goterms -o {1}_out.tsv -i {1}','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/interproscan-5/interproscan-5.9-50.0/',NULL,NULL),(13,'QIIME','An open-source bioinformatics pipeline for performing taxonomic analysis from raw DNA sequencing data.','http://qiime.org/','1.9.1','./qiime-1.9.1-wrapper.sh {1} {2} {3} {4}','/panfs/nobackup/production/metagenomics/pipeline/tools/pipeline-version-3/qiime-1.9.1/qiime-1.9.1-wrapper.sh',NULL,NULL),(14,'InterProScan','A sequence analysis application (nucleotide and protein sequences) that combines different protein signature recognition methods into one resource.','https://github.com/ebi-pf-team/interproscan/wiki','5.19-58.0','./interproscan.sh --appl PfamA,TIGRFAM,PRINTS,PrositePatterns,Gene3d --goterms --pathways -f tsv -o {1}_out.tsv -i {1}','/panfs/nobackup/production/metagenomics/pipeline/tools/interproscan-5/interproscan-5.19-58.0',NULL,NULL),(15,'Trimmomatic','A flexible read trimming tool.','http://www.usadellab.org/cms/?page=trimmomatic','0.35','java -classpath {0}/Trimmomatic-0.35/trimmomatic-0.35.jar org.usadellab.trimmomatic.TrimmomaticSE -threads 8 -phred33 {1} {2} LEADING:3 TRAILING:3 SLIDINGWINDOW:4:15','/panfs/nobackup/production/metagenomics/pipeline/tools/pipeline-version-3/Trimmomatic-0.35/trimmomatic-0.35.jar',NULL,NULL),(16,'FragGeneScan','An application for finding (fragmented) genes in short reads.','https://sourceforge.net/projects/fraggenescan/','1.20','./FragGeneScan -s {1} -o {1}_CDS -w 0 -t illumina_5 -p 8','/panfs/nobackup/production/metagenomics/pipeline/tools/FragGeneScan1.20/FragGeneScan',NULL,NULL),(17,'SeqPrep','A program to merge paired end Illumina reads that are overlapping into a single longer read.','https://github.com/jstjohn/SeqPrep','1.1','?','/nfs/seqdb/production/interpro/development/metagenomics/pipeline/tools/bin/SeqPrep-1.1',NULL,NULL),(18,'HMMER','A computer program for biosequence analysis using profile hidden Markov models.','http://hmmer.org','v3.1b1','./nhmmer --tblout $outpath/${file}_tRNAselect.txt --cpu 4 -T 20 tRNA.hmm $outpath/${file}.fna > /dev/null','/panfs/nobackup/production/metagenomics/pipeline/releases/mgpipeline-v3.0-rc1/analysis-pipeline/python/tools/RNASelector-1.0/binaries/64_bit_Linux/HMMER3.1b1',NULL,NULL),(19,'InterProScan','A sequence analysis application (nucleotide and protein sequences) that combines different protein signature recognition methods into one resource.','https://github.com/ebi-pf-team/interproscan/wiki','5.25-64.0','./interproscan.sh -dp --appl PfamA,TIGRFAM,PRINTS,PrositePatterns,Gene3d --goterms --pathways -f tsv -o {1}_out.tsv -i {1}','/hps/nobackup/production/metagenomics/pipeline/tools-v4/interproscan-5.25-64.0/',NULL,NULL),(20,'Prodigal','Prodigal (Prokaryotic Dynamic Programming Genefinding Algorithm) is a microbial (bacterial and archaeal) gene finding program.','https://github.com/hyattpd/prodigal/wiki','2.6.3','./prodigal -i {0} -o {1} -f sco -d {1}.ffn -a {1}.faa','/hps/nobackup/production/metagenomics/pipeline/tools-v4/Prodigal-2.6.3/',NULL,NULL),(21,'Infernal','Infernal (\"INFERence of RNA ALignment\") is for searching DNA sequence databases for RNA structure and sequence similarities. It is an implementation of a special case of profile stochastic context-free grammars called covariance models (CMs). A CM is like a sequence profile, but it scores a combination of sequence consensus and RNA secondary structure consensus, so in many cases, it is more capable of identifying RNA homologs that conserve their secondary structure more than their primary sequence.','http://eddylab.org/infernal/','1.1.2','../infernal-1.1.2/src/cmsearch --hmmonly --noali --cut_ga --cpu 4 --tblout {1} -Z 1000 -o {2} {3} {4}','/hps/nobackup/production/metagenomics/pipeline/tools-v4/infernal-1.1.2/',NULL,NULL),(22,'MAPseq','MAPseq is a set of fast and accurate sequence read classification tools designed to assign taxonomy and OTU classifications to ribosomal RNA sequences.','https://github.com/jfmrod/MAPseq/','1.2','./mapseq -nthreads 8 -outfmt simple {1} <customref.fasta> <customref.tax>','/hps/nobackup/production/metagenomics/pipeline/tools-v4/mapseq-1.2-linux/',NULL,NULL),(23,'cmsearch deoverlap script','A tool, which removes lower scoring overlaps from cmsearch --tblout files.','https://github.com/nawrockie/cmsearch_tblout_deoverlap','0.01','./cmsearch_deoverlap.pl --clanin <claninfo-file> <matches-file>','/hps/nobackup/production/metagenomics/production-scripts/current/mgportal/analysis-pipeline/python/tools/RNASelection/scripts/',NULL,NULL),(24,'SeqPrep','A program to merge paired end Illumina reads that are overlapping into a single longer read.','https://github.com/jstjohn/SeqPrep','1.2','?','/hps/nobackup/production/metagenomics/pipeline/tools-v4/SeqPrep-1.2/',NULL,NULL),(25,'MAPseq','MAPseq is a set of fast and accurate sequence read classification tools designed to assign taxonomy and OTU classifications to ribosomal RNA sequences.','https://github.com/jfmrod/MAPseq/','1.2.2','./mapseq -nthreads 1 -outfmt simple {1} <customref.fasta> <customref.tax>','/hps/nobackup/production/metagenomics/pipeline/tools-v4/mapseq-1.2.2-linux/',NULL,NULL);
/*!40000 ALTER TABLE `PIPELINE_TOOL` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-11-06 12:51:00
