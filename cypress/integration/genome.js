/* eslint-disable security/detect-object-injection */
import {waitForPageLoad, openPage, datatype, checkChartTooltip} from '../util/util';
import ClientSideTableHandler from '../util/clientSideTable';


describe('Genome page', () => {
    const accessionValid = 'MGYG000000001';
    const accessionInvalid = 'MGYG000000000';

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
                ['Length (bp):', '3219617'],
                ['Contamination:', '0.7%'],
                ['Completeness:', '98.59%'],
                ['Num. of contigs:', '137'],
                ['Total number of genomes in species:', '4'],
                ['Number of proteins:', '3182'],
                ['GC content:', '28.26%'],
                ['Taxonomic lineage:', 'Bacteria > Firmicutes_A > Clostridia > ' +
                'Peptostreptococcales > Peptostreptococcaceae > GCA-900066495 > ' +
                'GCA-900066495 sp902362365'],
                ['N50 :', '47258']
            ];
            assertSection(1, 'Genome statistics', gsValues);

            const gaValues = [
                ['InterPro coverage:', '86.42%'],
                ['EggNog coverage:', '93.78%']
            ];
            assertSection(2, 'Genome annotations', gaValues);

            const pgValues = [
                ['Pan-genome size:', '3154'],
                ['Pan-genome core size:', '1350'],
                ['Pan-genome accessory size:', '1804']
            ];
            assertSection(3, 'Pan-genome statistics', pgValues);

            const grcValues = [
                ['rRNA 5s total gene length coverage:', '88.24%'],
                ['rRNA 16s total gene length coverage:', '99.74%'],
                ['rRNA 23s total gene length coverage:', '99.83%'],
                ['tRNAs:', '20'],
                ['ncRNA:', '63']
            ];
            assertSection(4, 'Genome RNA coverage', grcValues);

            const gmValues = [
                ['Origin of representative genome:', 'Europe'],
                ['Geographic range of pan-genome:', 'Europe, North America']
            ];
            assertSection(5, 'Geographic metadata', gmValues);

            const elValues = [
                ['ENA sample accession:', 'ERS370061',
                 'https://www.ebi.ac.uk/ena/browser/view/ERS370061'],
                ['ENA study accession:', 'ERP105624',
                 'https://www.ebi.ac.uk/ena/browser/view/ERP105624']
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
              .should('contain', 'Total: 3141 Genome COG matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            // Table
            cy.get('.cog-column-table').should('be.visible');
            cy.get('.cog-column-table table tbody > tr').should('have.length', 21);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 656'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 187'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 149'}
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
            const table = new ClientSideTableHandler('.cog-column-table', 21, false);
            table.checkLoadedCorrectly(1, 21, 21);
            table.checkRowData(0, 1, 21, [
                'S',
                'Function unknown',
                '656'
            ]);
            table.checkRowData(5, 1, 21, [
                'C',
                'Energy production and conversion',
                '185'
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
              .should('contain', 'Total: 2895 KEGG matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            // Table
            cy.get('.kegg-class-column-table').should('be.visible');
            cy.get('.kegg-class-column-table table tbody > tr').should('have.length', 48);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 493'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 172'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 83'}
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
            table.checkLoadedCorrectly(1, 25, 48);
            table.checkRowData(0, 1, 25, [
                '09182',
                '',
                '493'
            ]);
            table.checkRowData(7, 1, 25, [
                '09191',
                '',
                '88'
            ]);
            let paginationData = [
                {
                    index: 1,
                    data: [
                        '09182',
                        '',
                        '493'
                    ]
                }, {
                    index: 'Last',
                    data: [
                        '09109',
                        '',
                        '18'
                    ],
                    pageNum: 2,
                    pageSize: 23
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
                    data: ['493', '1'],
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
              .should('contain', 'Total: 955 KEGG module matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            // Table
            cy.get('.kegg-module-column-table').should('be.visible');
            cy.get('.kegg-module-column-table table tbody > tr').should('have.length', 198);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 55'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 22'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 12'}
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `#kegg-module-column .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        // TODO: test KEGG module table

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
                 '/genomes/MGYG000000001/downloads/MGYG000000001.faa'],
                ['DNA sequence FASTA file of the genome assembly of the species representative',
                 '-', 'FASTA', '/genomes/MGYG000000001/downloads/MGYG000000001.fna'],
                ['DNA sequence FASTA file index of the genome assembly of the species ' +
                 'representative',
                 '-', 'FAI', '/genomes/MGYG000000001/downloads/MGYG000000001.fna.fai'],
                ['Genome GFF file with various sequence annotations', '-', 'GFF',
                 '/genomes/MGYG000000001/downloads/MGYG000000001.gff'],
                ['eggNOG annotations of the protein coding sequences', '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_eggNOG.tsv'],
                ['InterProScan annotation of the protein coding sequences', '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_InterProScan.tsv'],
                ['rRNA sequence of the genome species representative', '-', 'FASTA',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_rRNAs.fasta']
            ];
            cy.get('.genome-downloads-table').first().then((table) => {
                compareTable(table, data);
            });
        });
        it('Pan-genome analysis', () => {
            const data = [
                ['List of core genes in the entire pangenome',
                 '-', 'TAB',
                 '/genomes/MGYG000000001/downloads/core_genes.txt'],
                ['Presence/absence binary matrix of the pan-genome across all conspecific genomes',
                 '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/gene_presence_absence.Rtab'],
                ['Tree generated from the pairwise Mash distances of conspecific genomes', '-',
                 'Newick format',
                 '/genomes/MGYG000000001/downloads/mashtree.nwk'],
                ['DNA sequence FASTA file of the pangenome', '-', 'FASTA',
                 '/genomes/MGYG000000001/downloads/pan-genome.fna']
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
