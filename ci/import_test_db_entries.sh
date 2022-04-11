#!/usr/bin/env bash
emgcli import_taxonomy ERR1022502 ~/results --pipeline 4.0
emgcli import_qc ERR1022502 ~/results --pipeline 4.0
emgcli import_summary ERR1022502 ~/results .ipr --pipeline 4.0
emgcli import_summary ERR1022502 ~/results .go_slim --pipeline 4.0
emgcli import_summary ERR1022502 ~/results .go --pipeline 4.0

emgcli import_taxonomy ERR1022502 ~/results --pipeline 2.0
emgcli import_qc ERR1022502 ~/results --pipeline 2.0
emgcli import_summary ERR1022502 ~/results .ipr --pipeline 2.0
emgcli import_summary ERR1022502 ~/results .go_slim --pipeline 2.0
emgcli import_summary ERR1022502 ~/results .go --pipeline 2.0

emgcli import_taxonomy ERR867655 ~/results --pipeline 4.0
emgcli import_qc ERR867655 ~/results --pipeline 4.0
emgcli import_summary ERR867655 ~/results .ipr --pipeline 4.0
emgcli import_summary ERR867655 ~/results .go_slim --pipeline 4.0
emgcli import_summary ERR867655 ~/results .go --pipeline 4.0

emgcli import_taxonomy ERP104236 ~/results --pipeline 4.0
emgcli import_qc ERP104236 ~/results --pipeline 4.0
emgcli import_summary ERP104236 ~/results .ipr --pipeline 4.0
emgcli import_summary ERP104236 ~/results .go_slim --pipeline 4.0
emgcli import_summary ERP104236 ~/results .go --pipeline 4.0

emgcli import_taxonomy ERZ477576 ~/results --pipeline 5.0
emgcli import_qc ERZ477576 ~/results --pipeline 5.0
emgcli import_contigs ERZ477576 ~/results --pipeline 5.0
emgcli import_summary ERZ477576 ~/results .ipr --pipeline 5.0
emgcli import_summary ERZ477576 ~/results .go --pipeline 5.0

emgcli import_summary ERZ477576 ~/results .go_slim --pipeline 5.0
emgcli import_summary ERZ477576 ~/results .pfam --pipeline 5.0
emgcli import_summary ERZ477576 ~/results .gprops --pipeline 5.0
emgcli import_summary ERZ477576 ~/results .antismash --pipeline 5.0

emgcli import_kegg_modules ${{ github.workspace }}/client-repo/ci/fixtures/kegg_module_orthology.json
emgcli import_kegg_classes ${{ github.workspace }}/client-repo/ci/fixtures/kegg_class_orthology.json
emgcli import_cog_descriptions ${{ github.workspace }}/client-repo/ci/fixtures/cog.csv
emgcli import_genomes ~/results/ genomes/uhgg/2.0/ Human\ Gut 2.0 root:Host-Associated:Human:Digestive\ System:Large\ intestine
