#!/usr/bin/env bash
mkdir -p  ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary;
mkdir -p  ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/google-map-sample-data.json;

touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/BP_GO_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/BP_GO-slim_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/CC_GO_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/CC_GO-slim_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/GO_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/GO-slim_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/IPR_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/MF_GO_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/MF_GO-slim_abundances_v2.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/phylum_taxonomy_abundances_v2.0.tsv;

touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_2.0/project-summary/taxonomy_abundances_v2.0.tsv
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/BP_GO_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/BP_GO-slim_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/CC_GO_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/CC_GO-slim_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/GO_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/GO-slim_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/IPR_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/LSU_diversity.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/MF_GO_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/MF_GO-slim_abundances_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/phylum_taxonomy_abundances_LSU_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/phylum_taxonomy_abundances_SSU_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/SSU_diversity.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/taxonomy_abundances_LSU_v4.0.tsv;
touch ci/emg_api_datafiles/results/2015/03/ERP009703/version_4.0/project-summary/taxonomy_abundances_SSU_v4.0.tsv

ls ci/emg_api_datafiles/results
mv ci/emg_api_datafiles/results ~/results
ls ~/
ls ~/results