/* eslint-disable security/detect-object-injection */
import {waitForPageLoad, openPage, datatype, checkChartTooltip} from '../util/util';
import ClientSideTableHandler from '../util/clientSideTable';


describe('Genome page', () => {
    const accessionValid = 'MGYG-HGUT-00240';
    const accessionInvalid = 'MGYG-HGUT-00000';

    context('Overview', () => {
        before(() => {
            openPage('genomes/' + accessionValid);
            waitForPageLoad('Genome ' + accessionValid);
        });

        it('Should have the proper content', () => {
            const assertSection = (anchorIdx, anchorText, valuesArray) => {
                cy.get(`#genome-details > div:nth-child(${anchorIdx}) > h4 > a`)
                  .contains(anchorText)
                  .parent()
                  .next('.box')
                  .children('.row')
                  .each(($row, idx) => {
                    $row.children('.column').each((_, el) => {
                        const $el = Cypress.$(el);
                        const text = $el.text().replace(/\s+/g, ' ').replaceAll('\n', '');

                        if ($el.hasClass('detailList-key')) {
                            expect(text).to.contains(valuesArray[idx][0]);
                        }
                        if ($el.hasClass('detailList-value')) {
                            expect(text).to.contains(valuesArray[idx][1]);
                            if (valuesArray[idx][2]) {
                                expect($el.children('a')).to.have.prop('href', valuesArray[idx][2]);
                            }
                        }
                    });
                });
            };

            const gsValues = [
                ['Type:', 'Isolate'],
                ['Length (bp):', '2627858'],
                ['Contamination:', '0%'],
                ['Completeness:', '100%'],
                ['Num. of contigs:', '162'],
                ['Total number of genomes in species:', '44'],
                ['Non-redundant number of genomes in species:', '32'],
                ['Number of proteins:', '2583'],
                ['GC content:', '33.75%'],
                ['Taxonomic lineage:', 'Bacteria > Firmicutes > Bacilli > ' +
                                       'Erysipelotrichales > Erysipelotrichaceae > Absiella'],
                ['N50 :', '33474'],
                ['Taxonomic inconsistency (CAT):', '0']
            ];
            assertSection(1, 'Genome statistics', gsValues);

            const gaValues = [
                ['InterPro coverage:', '83.16%'],
                ['EggNog coverage:', '87.46%']
            ];
            assertSection(2, 'Genome annotations', gaValues);

            const pgValues = [
                ['Pan-genome size:', '15051'],
                ['Pan-genome core size:', '959'],
                ['Pan-genome accessory size:', '14092'],
                ['Pan-genome InterPro coverage:', '73.32%'],
                ['Pan-genome EggNOG coverage:', '79.96%']
            ];
            assertSection(3, 'Pan-genome statistics', pgValues);

            const grcValues = [
                ['rRNA 5s total gene length coverage:', '0%'],
                ['rRNA 16s total gene length coverage:', '99.67%'],
                ['rRNA 23s total gene length coverage:', '99.76%'],
                ['tRNAs:', '20'],
                ['ncRNA:', '92']
            ];
            assertSection(4, 'Genome RNA coverage', grcValues);

            const gmValues = [
                ['Origin of representative genome:', 'Asia'],
                ['Geographic range of pan-genome:', 'Asia, Europe, North America']
            ];
            assertSection(5, 'Geographic metadata', gmValues);

            const elValues = [
                ['NCBI genome accession:', 'GCA_003473755',
                 'https://www.ncbi.nlm.nih.gov/assembly/GCA_003473755'],
                ['NCBI sample accession:', 'SAMN09734867',
                 'https://www.ncbi.nlm.nih.gov/biosample/?term=SAMN09734867'],
                ['NCBI study accession:', 'PRJNA482748',
                 'https://www.ncbi.nlm.nih.gov/bioproject/PRJNA482748']
            ];
            assertSection(6, 'External links', elValues);
        });

        it('Sections should be collapsable', () => {
            for (let idx = 1; idx < 6; idx++) {
                const sectionSelector = `#genome-details > div:nth-child(${idx}) .box`;
                cy.get(sectionSelector).should('be.visible');
                cy.get(`#genome-details > div:nth-child(${idx}) > h4 > a`).click();
                cy.get(sectionSelector).should('be.hidden');
                cy.get(`#genome-details > div:nth-child(${idx}) > h4 > a`).click();
                cy.get(sectionSelector).should('be.visible');
            }
        });
    });

    // context('Browse genome', () => {
    // });

    context('COG analysis', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#cog-analysis');
        });

        it('Should load the chart and the table', () => {
            // Chart
            cy.get('#cog-column').should('be.visible');
            cy.get('#cog-column svg').should('be.visible');
            cy.get('#cog-column svg .highcharts-title')
              .should('contain', 'Top 10 COG categories');
            cy.get('#cog-column svg .highcharts-subtitle')
              .should('contain', 'Total: 2170 Genome COG matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            cy.get('.highcharts-legend-item.highcharts-series-1 text')
              .should('contain', 'Pan-genome');
            // Table
            cy.get('.cog-column-table').should('be.visible');
            cy.get('.cog-column-table table tbody > tr').should('have.length', 23);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 493'},
                {column: 1, series: 1, tooltip: 'Pan-genomeCount: 2854'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 162'},
                {column: 5, series: 1, tooltip: 'Pan-genomeCount: 596'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 81'},
                {column: 10, series: 1, tooltip: 'Pan-genomeCount: 271'}
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `#cog-column .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        it('Check table data', () => {
            const table = new ClientSideTableHandler('.cog-column-table', 23, false);
            table.checkLoadedCorrectly(1, 23, 23);
            table.checkRowData(0, 1, 23, [
                'S',
                '',
                '493',
                '2854'
            ]);
            table.checkRowData(7, 1, 23, [
                'C',
                '',
                '100',
                '315'
            ]);
        });
    });

    context('KEGG class analysis', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#kegg-class-analysis');
        });

        it('Should load the chart and the table', () => {
            // Chart
            cy.get('#kegg-class-column').should('be.visible');
            cy.get('#kegg-class-column svg').should('be.visible');
            cy.get('#kegg-class-column svg .highcharts-title')
              .should('contain', 'Top 10 KEGG brite categories');
            cy.get('#kegg-class-column svg .highcharts-subtitle')
              .should('contain', 'Total: 2978 KEGG matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            cy.get('.highcharts-legend-item.highcharts-series-1 text')
              .should('contain', 'Pan-genome');
            // Table
            cy.get('.kegg-class-column-table').should('be.visible');
            cy.get('.kegg-class-column-table table tbody > tr').should('have.length', 43);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 577'},
                {column: 1, series: 1, tooltip: 'Pan-genomeCount: 1742'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 144'},
                {column: 5, series: 1, tooltip: 'Pan-genomeCount: 407'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 86'},
                {column: 10, series: 1, tooltip: 'Pan-genomeCount: 345'}
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `#kegg-class-column .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        it('Check table data', () => {
            const table = new ClientSideTableHandler('.kegg-class-column-table', 25, false);
            table.checkLoadedCorrectly(1, 25, 43);
            table.checkRowData(0, 1, 25, [
                '09182',
                '',
                '577',
                '1742'
            ]);
            table.checkRowData(7, 1, 25, [
                '09124',
                '',
                '105',
                '350'
            ]);
            let paginationData = [
                {
                    index: 1,
                    data: [
                        '09182',
                        '',
                        '577',
                        '1742'
                    ]
                }, {
                    index: 'Last',
                    data: [
                        '09143',
                        '',
                        '17',
                        '56'
                    ],
                    pageNum: 2,
                    pageSize: 18
                }
            ];
            table.testPagination(25, paginationData);
            const tableColumns = {
                class_id: {
                    data: ['', ''],
                    type: datatype.STR,
                    sortable: false
                },
                description: {
                    data: ['', ''],
                    type: datatype.STR,
                    sortable: false
                },
                genome_count: {
                    data: ['577', '0'],
                    type: datatype.NUM,
                    sortable: true
                },
                pangenome_count: {
                    data: ['1742', '1'],
                    type: datatype.NUM,
                    sortable: true
                }
            };
            table.testSorting(25, tableColumns);
        });
    });

    context('KEGG module analysis', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#kegg-module-analysis');
        });

        it('Should load the chart and the table', () => {
            // Chart
            cy.get('#kegg-module-column').should('be.visible');
            cy.get('#kegg-module-column svg').should('be.visible');
            cy.get('#kegg-module-column svg .highcharts-title')
              .should('contain', 'Top 10 KEGG module categories');
            cy.get('#kegg-module-column svg .highcharts-subtitle')
              .should('contain', 'Total: 527 KEGG module matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            cy.get('.highcharts-legend-item.highcharts-series-1 text')
              .should('contain', 'Pan-genome');
            // Table
            cy.get('.kegg-module-column-table').should('be.visible');
            cy.get('.kegg-module-column-table table tbody > tr').should('have.length', 173);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 56'},
                {column: 1, series: 1, tooltip: 'Pan-genomeCount: 75'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 14'},
                {column: 5, series: 1, tooltip: 'Pan-genomeCount: 17'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 11'}
                // {column: 10, series: 1, tooltip: 'Pan-genomeCount: 19'} TODO: fix this one, for some reason it's failing in travis
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `#kegg-module-column .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        // FIXME: failing in Travis but working locally.
        // it('Check table data', () => {
        //     const table = new ClientSideTableHandler('.kegg-module-column-table', 25, false);
        //     table.checkLoadedCorrectly(1, 25, 173);
        //     table.checkRowData(0, 1, 25, [
        //         'M00178',
        //         '',
        //         '56',
        //         '75'
        //     ]);
        //     table.checkRowData(7, 1, 25, [
        //         'M00048',
        //         '',
        //         '12',
        //         '21'
        //     ]);
        //     let paginationData = [
        //         {
        //             index: 1,
        //             data: [
        //                 'M00178',
        //                 '',
        //                 '56',
        //                 '75'
        //             ]
        //         }, {
        //             index: 'Next',
        //             data: [
        //                 'M00006',
        //                 '',
        //                 '5',
        //                 '7'
        //             ],
        //             pageNum: 2,
        //             pageSize: 25
        //         }, {
        //             index: 'Last',
        //             data: [
        //                 'M00778',
        //                 '',
        //                 '0',
        //                 '2'
        //             ],
        //             pageNum: 7,
        //             pageSize: 23
        //         }
        //     ];
        //     table.testPagination(25, paginationData);
        //     const tableColumns = {
        //         module_id: {
        //             data: ['', ''],
        //             type: datatype.STR,
        //             sortable: false
        //         },
        //         description: {
        //             data: ['', ''],
        //             type: datatype.STR,
        //             sortable: false
        //         },
        //         genome_count: {
        //             data: ['57', '0'],
        //             type: datatype.NUM,
        //             sortable: true
        //         },
        //         pangenome_count: {
        //             data: ['78', '9'],
        //             type: datatype.NUM,
        //             sortable: true
        //         }
        //     };
        //     table.testSorting(25, tableColumns);
        // });
    });

    context('Downloads', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#downloads');
        });
        it('Should have 2 sections', () => {
            cy.get('#downloads-section h3').first().should('contain', 'Genome analysis');
            cy.get('#downloads-section h3').last().should('contain', 'Pan-genome analysis');
        });
        const compareTable = (table, data) => {
            data.sort((a,b) => a[0] > b[0] ? 1 : -1);
            const trs = table.find('tbody tr');
            trs.sort((a,b) => {
                const aStr = Cypress.$(a).find('td').first().html().trim();
                const bStr = Cypress.$(b).find('td').first().html().trim();
                return aStr > bStr ? 1 : -1;
            });
            trs.each((idx, el) => {
                const $el = Cypress.$(el);
                $el.children('td').each((tdIdx, td) => {
                    if (tdIdx !== 3) {
                        expect(Cypress.$(td).html().trim()).to.equal(data[idx][tdIdx]);
                    } else {
                        expect(Cypress.$(td).html()).to.have.string(data[idx][tdIdx]);
                    }
                });
            });
        };
        it('Genome analysis', () => {
            const data = [
                ['All predicted CDS', '-', 'FASTA',
                 '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240.faa'],
                ['DNA sequence FASTA file of the genome assembly of the species representative',
                 '-', 'FASTA', '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240.fna'],
                ['DNA sequence FASTA file index of the genome assembly of the species ' +
                 'representative',
                 '-', 'FAI', '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240.fna.fai'],
                ['Genome GFF file with various sequence annotations', '-', 'GFF',
                 '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240.gff'],
                ['Genome GFF file with antiSMASH geneclusters annotations', '-', 'GFF',
                 '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240_antismash.gff'],
                ['eggNOG annotations of the protein coding sequences', '-', 'TSV',
                 '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240_eggNOG.tsv'],
                ['InterProScan annotation of the protein coding sequences', '-', 'TSV',
                 '/genomes/MGYG-HGUT-00240/downloads/MGYG-HGUT-00240_InterProScan.tsv']
            ];
            cy.get('.genome-downloads-table').first().then((table) => {
                compareTable(table, data);
            });
        });
        it('Pan-genome analysis', () => {
            const data = [
                ['Protein sequence FASTA file of accessory genes', '-', 'FASTA',
                 '/genomes/MGYG-HGUT-00240/downloads/accessory_genes.faa'],
                ['Protein sequence FASTA file of core genes ' +
                 '(&gt;=90% of the genomes with &gt;=90% amino acid identity)',
                 '-', 'FASTA',
                 '/genomes/MGYG-HGUT-00240/downloads/core_genes.faa'],
                ['Presence/absence binary matrix of the pan-genome across all conspecific genomes',
                 '-', 'TSV',
                 '/genomes/MGYG-HGUT-00240/downloads/genes_presence-absence.tsv'],
                ['Tree generated from the pairwise Mash distances of conspecific genomes', '-',
                 'Newick format',
                 '/genomes/MGYG-HGUT-00240/downloads/mashtree.nwk'],
                ['Protein sequence FASTA file of core and accessory genes', '-', 'FASTA',
                 '/genomes/MGYG-HGUT-00240/downloads/pan-genome.faa'],
                ['eggNOG annotations of the core and accessory genes', '-', 'TSV',
                 '/genomes/MGYG-HGUT-00240/downloads/pan-genome_eggNOG.tsv'],
                ['InterProScan annotations of the core and accessory genes', '-', 'TSV',
                 '/genomes/MGYG-HGUT-00240/downloads/pan-genome_InterProScan.tsv']
            ];
            cy.get('.genome-downloads-table').last().then((table) => {
                compareTable(table, data);
            });
        });
    });

    context('Invalid accession', () => {
        it('Should show an error message', () => {
            openPage('genomes/' + accessionInvalid);
            cy.get('h2').should('contain', 'Oh no! An error has occurred!');
            cy.get('h3').should('contain', 'Error: 404');
            cy.get('#main-content-area > div > p')
              .should('contain', 'Could not retrieve genome: ' + accessionInvalid);
        });
    });
});
