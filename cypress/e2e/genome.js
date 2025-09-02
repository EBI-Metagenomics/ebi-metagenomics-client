/* eslint-disable security/detect-object-injection */
import {openPage, openAndWait, checkChartTooltip} from '../util/util';
import ClientSideTableHandler from '../util/clientSideTable';


describe.skip('Genome page', () => {
    const accessionValid = 'MGYG000000001';
    const accessionInvalid = 'MGYG999999999';

    context('Overview', () => {
        it('Should have the proper content', () => {
            openAndWait('genomes/' + accessionValid);
            const assertSection = (anchorIdx, anchorText, valuesArray) => {
                cy.get(`#overview > div > details:nth-child(${anchorIdx}) > summary`)
                  .contains(anchorText)
                  .parent()
                  .next('.vf-grid')
                  .children('[data-cy="kvl-key"]')
                    .each(($keyEl, idx) => {
                        expect($keyEl).to.have.text(valuesArray[idx][0]);
                        const $valEl = $keyEl.next()
                        expect($valEl).to.have.text(valuesArray[idx][1]);
                        if (valuesArray[idx][2]) {
                            expect($valEl.children('a')).to.have.prop('href', valuesArray[idx][2]);
                        }
                    });
                  // .each(($row, idx) => {
                  //   $row.children('.column').each((_, el) => {
                  //       const $el = Cypress.$(el);
                  //       if ($el.hasClass('detailList-key')) {
                  //           expect($el).to.have.text(valuesArray[idx][0]);
                  //       }
                  //       if ($el.hasClass('detailList-value')) {
                  //           expect($el).to.have.text(valuesArray[idx][1]);
                  //           if (valuesArray[idx][2]) {
                  //               expect($el.children('a')).to.have.prop('href', valuesArray[idx][2]);
                  //           }
                  //       }
                  //   });
                // });
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
                ['Taxonomic lineage:', 'Bacteria > Firmicutes_A > Clostridia > Peptostreptococcales > Peptostreptococcaceae > GCA-900066495 > GCA-900066495 sp902362365'],
                ['N50:', '47258'],
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
                ['Pan-genome accessory size:', '1804'],
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
                ['ENA sample accession:', ' ERS370061',
                 'https://www.ebi.ac.uk/ena/browser/view/ERS370061'],
                ['ENA study accession:', ' ERP105624',
                 'https://www.ebi.ac.uk/ena/browser/view/ERP105624'],
            ];
            assertSection(6, 'External links', elValues);
        });

        it('Sections should be collapsable', () => {
            openAndWait('genomes/' + accessionValid);
            for (let idx = 1; idx < 6; idx++) {
                const sectionSelector = `#overview > div > details:nth-child(${idx})`;
                const sectionToggleSelector = `#overview > div > details:nth-child(${idx}) > summary`;
                cy.get(sectionSelector).should('have.attr', 'open');
                cy.get(sectionToggleSelector).click();
                cy.get(sectionSelector).should('not.have.attr', 'open');
                cy.get(sectionToggleSelector).click();
                cy.get(sectionSelector).should('have.attr', 'open');
            }
        });
    });

    context('Browse genome', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#genome-browser');
        });

        it('Should load IGV', () => {
            cy.get('h2').first().should('contain.text', `Genome ${accessionValid}`);
            cy.get('.igv-track-label').should('contain.text', 'Functional annotation');
            cy.get('.igv-search-input').type('{selectall}')
            cy.get('.igv-search-input').type('MGYG000000001_1:1-1000');
            cy.get('.igv-search-icon-container').click();
            cy.get('.igv-windowsize-panel-container').should('contain.text', '1,000 bp');
        });
    });

    context('COG analysis', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#cog-analysis');
        });

        it('Should load the chart and the table', () => {
            const cogTabSelector = '[data-cy="genome-cog-analysis"]';
            // Chart
            cy.get(cogTabSelector).should('be.visible');
            cy.get(cogTabSelector + ' svg').should('be.visible');
            cy.get(cogTabSelector + ' svg .highcharts-title')
              .should('contain', 'Top 10 COG categories');
            cy.get(cogTabSelector + ' svg .highcharts-subtitle')
              .should('contain', 'Total: 3141 Genome COG matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            cy.get('.highcharts-legend-item.highcharts-series-1 text')
              .should('contain', 'Pan-genome');
            // Table
            cy.get(cogTabSelector + ' table').should('be.visible');
            cy.get(cogTabSelector + ' table tbody > tr').should('have.length', 21);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 656'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 187'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 149'},
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `[data-cy="genome-cog-analysis"] .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        it('Check table data', () => {
            const table = new ClientSideTableHandler('[data-cy="genome-cog-analysis"]', 21, false);
            table.checkLoadedCorrectly(1, 21, 21, null, false);
            table.checkRowData(0, 1, 21, [
                'S',
                'Function unknown',
                '656',
                ''
            ]);
            table.checkRowData(5, 1, 21, [
                'C',
                'Energy production and conversion',
                '185',
            ]);
        });
    });

    context('KEGG class analysis', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#kegg-class-analysis');
        });

        it('Should load the chart and the table', () => {
            const keggTabSelector = '[data-cy="genome-kegg-analysis"]';
            // Chart
            cy.get(keggTabSelector).should('be.visible');
            cy.get(keggTabSelector + ' svg').should('be.visible');
            cy.get(keggTabSelector + ' svg .highcharts-title')
              .should('contain', 'Top 10 KEGG brite categories');
            cy.get(keggTabSelector + ' svg .highcharts-subtitle')
              .should('contain', 'Total: 2023 KEGG matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            cy.get('.highcharts-legend-item.highcharts-series-1 text')
              .should('contain', 'Pan-genome');
            // Table
            cy.get(keggTabSelector + ' table').should('be.visible');
            cy.get(keggTabSelector + ' table tbody > tr').should('have.length', 10);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 493'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 172'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 83'},
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `[data-cy="genome-kegg-analysis"] .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        it('Check table data', () => {
            const table = new ClientSideTableHandler('[data-cy="genome-kegg-analysis"] ', 10, false);
            table.checkLoadedCorrectly(1, 10, 48, null, false);
            table.checkRowData(0, 1, 10, [
                '09182',
                '',
                '493',
                ''
            ]);
            table.checkRowData(9, 1, 10, [
                '09124',
                '',
                '83',
                ''
            ]);
            let paginationData = [
                {
                    index: 1,
                    data: [
                        '09182',
                        '',
                        '493',
                        ''
                    ]
                }, {
                    index: '5',
                    data: [
                        '09141',
                        '',
                        '3',
                        ''
                    ],
                    pageNum: 5,
                    pageSize: 8
                }
            ];
            table.testPagination(10, paginationData);
        });
    });

    context('KEGG module analysis', () => {
        before(() => {
            openPage('genomes/' + accessionValid + '#kegg-module-analysis');
        });

        it('Should load the chart and the table', () => {
            const keggTabSelector = '[data-cy="genome-kegg-module-analysis"]';
            // Chart
            cy.get(keggTabSelector).should('be.visible');
            cy.get(keggTabSelector + ' svg').should('be.visible');
            cy.get(keggTabSelector + ' svg .highcharts-title')
              .should('contain', 'Top 10 KEGG module categories');
            cy.get(keggTabSelector + ' svg .highcharts-subtitle')
              .should('contain', 'Total: 231 KEGG module matches - Drag to zoom in/out');
            // Chart legend
            cy.get('.highcharts-legend-item.highcharts-series-0 text')
              .should('contain', 'Genome');
            cy.get('.highcharts-legend-item.highcharts-series-1 text')
              .should('contain', 'Pan-genome');
            // Table
            cy.get(keggTabSelector + ' table').should('be.visible');
            cy.get(keggTabSelector + ' table tbody > tr').should('have.length', 10);
        });

        it('Check chart data', () => {
            const tooltipValues = [
                {column: 1, series: 0, tooltip: 'GenomeCount: 55'},
                {column: 5, series: 0, tooltip: 'GenomeCount: 22'},
                {column: 10, series: 0, tooltip: 'GenomeCount: 12'}
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `[data-cy="genome-kegg-module-analysis"] .highcharts-series-${element.series} > ` +
                    `rect:nth-child(${element.column})`,
                    element.tooltip
                );
            });
        });

        it('Check table data', () => {
            const table = new ClientSideTableHandler('[data-cy="genome-kegg-module-analysis"] ', 10, false);
            table.checkLoadedCorrectly(1, 10, 198, null, false);
            table.checkRowData(0, 1, 10, [
                'M00178',
                '',
                '55',
                ''
            ]);
            table.checkRowData(9, 1, 10, [
                'M00377',
                '',
                '12',
                ''
            ]);
            let paginationData = [
                {
                    index: 1,
                    data: [
                        'M00178',
                        '',
                        '55',
                        ''
                    ]
                }, {
                    index: '20',
                    data: [
                        'M00842',
                        '',
                        '1',
                        ''
                    ],
                    pageNum: 20,
                    pageSize: 8
                }
            ];
            table.testPagination(10, paginationData);
        });
    });

    context.only('Downloads', () => {
        it('Should have 2 sections', () => {
            openPage('genomes/' + accessionValid + '#downloads');
            cy.get('section table .vf-table__caption').first().should('contain', 'Genome analysis');
            // cy.get('section table .vf-table__caption').last().should('contain', 'Pan-genome analysis');
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
                        // expect(Cypress.$(td).html()).to.have.string(data[idx][tdIdx]);
                    }
                });
            });
        };
        it('Genome analysis', () => {
            openPage('genomes/' + accessionValid + '#downloads');
            const data = [
                ['All predicted CDS', '-', 'FASTA',
                 '/genomes/MGYG000000001/downloads/MGYG000000001.faa'],
                ['DNA sequence FASTA file of the genome assembly of the species representative',
                 '-', 'FASTA', '/genomes/MGYG000000001/downloadsMGYG000000001.fna'],
                ['DNA sequence FASTA file index of the genome assembly of the species ' +
                 'representative',
                 '-', 'FAI', '/genomes/MGYG000000001/downloads/MGYG000000001.fna.fai'],
                ['Genome GFF file with SanntiS SMBGC annotations', '-', 'GFF',
                    '/genomes/MGYG000000001/downloads/MGYG000000001_sanntis.gff'],
                ['Genome GFF file with VIRify viral annotations', '-', 'GFF',
                    '/genomes/MGYG000000001/downloads/MGYG000000001_virify.gff'],
                ['Genome GFF file with various sequence annotations', '-', 'GFF',
                 '/genomes/MGYG000000001/downloads/MGYG000000001.gff'],
                ['Genome TSV file with VIRify viral regions', '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_virify_metadata.tsv'],
                ['InterProScan annotation of the protein coding sequences', '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_InterProScan.tsv'],
                ['eggNOG annotations of the protein coding sequences', '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_eggNOG.tsv'],
                ['rRNA sequence of the genome species representative', '-', 'FASTA',
                 '/genomes/MGYG000000001/downloads/MGYG000000001_rRNAs.fasta']
            ];
            cy.get('table').first().then((table) => {
                compareTable(table, data);
            });
        });
        it('Pan-genome analysis', () => {
            openPage('genomes/' + accessionValid + '#downloads');
            const data = [
                ['List of core genes in the entire pangenome', '-', 'TAB',
                    '/genomes/MGYG000000001/downloads/core_genes.txt'],
                ['Presence/absence binary matrix of the pan-genome across all conspecific genomes',
                 '-', 'TSV',
                 '/genomes/MGYG000000001/downloads/genes_presence-absence.tsv'],
                ['Tree generated from the pairwise Mash distances of conspecific genomes', '-',
                 'Newick format',
                 '/genomes/MGYG000000001/downloads/mashtree.nwk'],
                ['DNA sequence FASTA file of the pangenome', '-', 'FASTA',
                 '/genomes/MGYG000000001/downloads/pan-genome.fna']
            ];
            cy.get('table').last().then((table) => {
                compareTable(table, data);
            });
        });
    });

    context('Invalid accession', () => {
        it('Should show an error message', () => {
            openPage('genomes/' + accessionInvalid);
            cy.get('.vf-box__heading').should('contain', 'Error Fetching Data');
            cy.get('.vf-box__text').should('contain', '404');
        });
    });
});
