import {openPage, changeTab, isValidLink, datatype, waitForPageLoad, changeSubTab} from '../util/util';
import ClientSideTableHandler from '../util/clientSideTable';

const origPage = 'analyses/MGYA00011845';

/**
 * Fixtures:
 * Accession    Run         Study
 * MGYA00136035 ERR867655   ERP009703 (amplicon, SSU only)
 * MGYA00141547 ERR1022502  ERP012221 (metatranscriptomic, SSU + LSU)
 * V5 studies
 * MGYA00XXXXXX ERZXXXXXXX  ERPXXXXXX (assembly v5)
 * MGYA00136035 ERR867655   ERP009703 (amplicon, ITS/LSU)
 */

function verifyTabIsVisible(tabId) {
    // Verify correct tab button is active
    cy.get('[href*=\'' + tabId + '\']').should('have.class', 'is-active');
    // Verify tab content is active
    cy.get(`#tab-${tabId.slice(1)}`).should('be.visible');
}

function checkTabWasRemoved(tabId) {
    cy.get('[href=\'' + tabId + '\']').should('not.exist', {timeout: 10000});
}

function hoverAndValidateTooltip(series, tooltipText1, tooltipText2) {
    const chart = series.split(' ')[0];
    cy.get(series).first().trigger('mouseover', {force: true}).then(() => {
        // TODO: make moveover event actually work...
        // cy.get(chart + ' svg g text').contains(tooltipText1);
        // cy.get(chart + ' svg g.highcharts-tooltip text').contains(tooltipText2);
    });
    cy.get(series).first().trigger('mouseout', {force: true});
}

function checkV4FunctionalTabs() {
    // V4 has: InterPro and Go Terms, nothing else
    cy.get('.mg-button-as-tab').should('have.length', 2);
    cy.get('.mg-button-as-tab').eq(0)
        .should('contain.text', 'InterPro');
    cy.get('.mg-button-as-tab').eq(1)
        .should('contain.text', 'GO Terms');
}

/**
 * Verify number of results responds to selector
 */
describe('Analysis page', function() {
    context('General', function() {
        it('Should display overview if no deeplink is provided', function() {
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            verifyTabIsVisible('#overview');
        });
        it('Should display metadata if available', function() {
            openPage('analyses/MGYA00136035');
            waitForPageLoad('Analysis MGYA00136035');
            verifyTabIsVisible('#overview');
            cy.contains('Study:').next().should('contain', 'MGYS00000462');
            cy.contains('Sample:').next().should('contain', 'ERS667575');
            cy.contains('Run:').next().should('contain', 'ERR867655');
            cy.contains('Pipeline version:').next().should('contain', '4.0');
            cy.contains('Experiment type:').next().should('contain', 'amplicon');
            cy.contains('Instrument model:').next().should('contain', 'Illumina MiSeq');
            cy.contains('Instrument platform:').next().should('contain', 'ILLUMINA');
        });
        it('Should resolve hash links correctly (overview)', function() {
            openPage('analyses/MGYA00136035#overview');
            waitForPageLoad('Analysis MGYA00136035');
            cy.contains('Experiment details').should('be.visible');
        });
        it('Should resolve hash links correctly (qc)', function() {
            openPage('analyses/MGYA00141547#qc');
            waitForPageLoad('Analysis MGYA00141547');
            cy.get('[data-cy=run-qc-chart]').should('be.visible');
        });
        it('Should resolve hash links correctly (taxonomic)', function() {
            openPage('analyses/MGYA00136035#taxonomic');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('.krona_chart').should('be.visible');
        });

        // FIXME: deeplinks are not completed
        //       fix tests when they are completed.
        // it('Should resolve hash links correctly (krona)', function() {
        //     openPage('analyses/MGYA00136035#krona');
        //     waitForPageLoad('Analysis MGYA00136035');
        //     cy.get('.krona_chart').should('be.visible');
        // });
        // it('Should resolve hash links correctly (pie)', function() {
        //     openPage('analyses/MGYA00136035#pie');
        //     waitForPageLoad('Analysis MGYA00136035');
        //     cy.get('#domain-composition-pie').should('be.visible');
        // });
        // it('Should resolve hash links correctly (column)', function() {
        //     openPage('analyses/MGYA00136035#column');
        //     waitForPageLoad('Analysis MGYA00136035');
        //     cy.get('#domain-composition-column').should('be.visible');
        // });
        // it('Should resolve hash links correctly (stacked-column)', function() {
        //     openPage('analyses/MGYA00136035#stacked-column');
        //     waitForPageLoad('Analysis MGYA00136035');
        //     cy.get('#phylum-composition-stacked-column').should('be.visible');
        // });

        it('Should resolve hash links correctly (download)', function() {
            openPage('analyses/MGYA00011845#download');
            waitForPageLoad('Analysis MGYA00011845');
            cy.contains('Sequence data').should('be.visible');
        });
    });

    context('Download tab', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            changeTab('download');
        });

        it('Should display correct number of results', function() {
            cy.get('#tab-download').find('tbody > tr > td > a', {timeout: 10000}).should('have.length', 64);
        });
        it('Should display download groups correctly', function() {
            const headers = [
                'Sequence data',
                'Functional analysis',
                'Taxonomic analysis',
                'Taxonomic analysis SSU rRNA',
                'Taxonomic analysis LSU rRNA',
                'non-coding RNAs'];
            let i = 0;
            cy.get('#tab-download').find('.mg-table-caption').should('have.length', 3).each(($el) => {
                expect($el).to.contain(headers[i++]);
            });
        });

        it('Download links should be valid', function() {
            cy.get('#tab-download a').first(($el) => {
                isValidLink($el);
            });
        });
    });

    context('Quality Control tab', function() {
        before(function() {
            openPage('analyses/MGYA00141547');
            waitForPageLoad('Analysis MGYA00141547');
            changeTab('qc');
            cy.get('.mg-loading-spinner').should('not.exist');
        });

        it('QC chart should display correctly', function() {
            // Verify graph via tooltip values
            const readsRemainingSeries =
                '.qc-step-chart .highcharts-series-group .highcharts-series-1 > .highcharts-point';
            // Initial reads
            const series1 = readsRemainingSeries + ':nth-child(1)';
            hoverAndValidateTooltip(series1, 'Initial reads', 'Reads remaining: 213 741 460');

            // Trimming
            const series2 = readsRemainingSeries + ':nth-child(2)';
            hoverAndValidateTooltip(series2, 'Trimming', 'Reads remaining: 213 741 430');

            // Length filtering
            const series3 = readsRemainingSeries + ':nth-child(3)';
            hoverAndValidateTooltip(series3, 'Length filtering', 'Reads remaining: 180 329 978');

            // Length filtering (reads filtered out)
            const filteredOutSeries =
                '.qc-step-chart .highcharts-series-group .highcharts-series-0 > ' +
                '.highcharts-point:nth-child(3)';
            hoverAndValidateTooltip(filteredOutSeries, 'Length filtering',
                'Reads filtered out: 33 411 452');

            // Ambiguous base filtering
            const series4 = readsRemainingSeries + ':nth-child(4)';
            hoverAndValidateTooltip(series4, 'Ambiguous base filtering',
                'Reads remaining: 180 329 978');

            const readsAfterSampling =
                '.qc-step-chart .highcharts-series-group .highcharts-series-2 > .highcharts-point';
            hoverAndValidateTooltip(readsAfterSampling + ':nth-child(5)',
                'Reads subsampled for QC analysis',
                'Reads after sampling: 1 997 827');
        });
        it('Reads length hist should be present', function() {
            const series = '.reads-length-hist .highcharts-series-group .highcharts-markers ' +
                '.highcharts-point';
            cy.get(series).should('be.visible');
        });
        it('Reads length bar chart should be present', function() {
            let series0 = '.reads-length-barchart svg .highcharts-series-0 > rect:nth-child(1)';
            hoverAndValidateTooltip(series0, 'Minimum', 'Minimum:');
            hoverAndValidateTooltip(series0, 'Minimum', '100');
            let series1 = '.reads-length-barchart svg .highcharts-series-0 > rect:nth-child(2)';
            hoverAndValidateTooltip(series1, 'Average', 'Average:');
            hoverAndValidateTooltip(series1, 'Average', '100');
            let series2 = '.reads-length-barchart svg .highcharts-series-0 > rect:nth-child(3)';
            hoverAndValidateTooltip(series2, 'Maximum', 'Maximum:');
            hoverAndValidateTooltip(series2, 'Maximum', '100');
        });
        it('Reads GC distribution chart should be present', function() {
            const series = '.reads-gc-hist .highcharts-series-group .highcharts-markers';
            cy.get(series).should('be.visible');
        });
        it('Reads GC bar chart should be present', function() {
            let series0 = '.reads-gc-barchart svg .highcharts-series-0 > rect:nth-child(1)';
            hoverAndValidateTooltip(series0, 'Content', 'GC content: 44.51%');
            let series1 = '.reads-gc-barchart svg .highcharts-series-1 > rect:nth-child(1)';
            hoverAndValidateTooltip(series1, 'Content', 'AT content: 55.49%');
        });
        it('Nucleotide position hist chart should be present', function() {
            const series = '.nucleotide-chart .highcharts-series-2 .highcharts-point';
            cy.get(series).should('be.visible');
        });
    });

    let taxonomyTable;
    let taxonomyTableColumns = {
        index: {
            data: [1, 25],
            type: datatype.NUM,
            sortable: true
        },
        phylum: {
            data: ['Proteobacteria', 'Candidatus_Omnitrophica'],
            type: datatype.STR,
            sortable: true
        },
        domain: {
            data: ['Bacteria', 'Bacteria'],
            type: datatype.STR,
            sortable: true
        },
        unitsOTUS: {
            data: [29061, 3],
            type: datatype.NUM,
            sortable: true
        },
        percentage: {
            data: [67.54, 0.01],
            type: datatype.NUM,
            sortable: true
        }
    };
    let taxonomyTablePagination = [
        {
            index: 1,
            data: ['1', 'Proteobacteria', 'Bacteria', '29061', '67.54']
        }, {
            index: 2,
            data: ['26', 'Gemmatimonadetes', 'Bacteria', '2', '0.00'],
            pageSize: 9
        }, {
            index: 'First',
            data: ['1', 'Proteobacteria', 'Bacteria', '29061', '67.54'],
            pageNum: 1
        }
    ];
    context('Taxonomy analysis tab (SSU only)', function() {
        before(function() {
            openPage('analyses/MGYA00136035#taxonomic');
            waitForPageLoad('Analysis MGYA00136035');
        });
        it('Should pre-select SSU', function() {
            cy.get('[data-cy=\'ssu-btn\']').should('be.checked');
        });
        it('Should disable LSU', function() {
            cy.server();
            openPage('analyses/MGYA00136035#taxonomic');
            cy.get('[data-cy=\'lsu-btn\']')
                .should('exist')
                .should('be.disabled');
        });
        it('Should default to krona tab', function() {
            openPage('analyses/MGYA00136035#taxonomic');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('.krona_chart').should('be.visible');
        });
        it('Changing tabs should change visible content', function() {
            cy.get('.krona_chart').should('be.visible');
            changeSubTab('Pie');
            cy.get('[data-cy="phylum-pie"]').should('be.visible');
            changeSubTab('Column');
            cy.get('[data-cy="phylum-column"]').should('be.visible');
            changeSubTab('Stacked Column');
            cy.get('[data-cy="phylum-stacked-column"]').should('be.visible');
        });
        it('Should load krona chart correctly', function() {
            changeSubTab('Krona');
            cy.get('.krona_chart').invoke('attr', 'data').then((url) => {
              cy.request(url).then((resp) => {
                  expect(resp['status']).to.eq(200);
              });
            })
        });
        it('Should load taxonomy pie charts', function() {
            changeSubTab('Pie');
            cy.get('#domain-composition-pie').should('be.visible');
            cy.get('#phylum-composition-pie').should('be.visible');
            // Check elements in both charts
            cy.get('#domain-composition-pie svg text:nth-child(1):first').then(($label) => {
                expect(Cypress.$($label).text()).to.contain('Bacteria: 98.73 %');
            });
            cy.get('#phylum-composition-pie svg text:nth-child(1):first').then(($label) => {
                expect(Cypress.$($label).text()).to.contain('Proteobacteria: 67.54 %');
            });
        });
        // TODO table tests
        it.skip('Taxonomy pie chart table pagination', function() {
            changeSubTab('Pie');
            taxonomyTable = new ClientSideTableHandler('#pie .phylum-table', 25, false);
            taxonomyTable.testPagination(25, taxonomyTablePagination);
        });
        // TODO table tests
        it.skip('Taxonomy pie chart table ordering', function() {
            changeSubTab('Pie');
            taxonomyTable = new ClientSideTableHandler('#pie .phylum-table', 25, false);
            taxonomyTable.testSorting(25, taxonomyTableColumns);
        });
        it('Should load taxonomy bar charts', function() {
            changeSubTab('Column');
            cy.get('#domain-composition-column').should('be.visible');
            cy.get('#phylum-composition-column').should('be.visible');
            // Check elements in both charts
            cy.get('#domain-composition-column svg .highcharts-point').should('have.length', 3);
            cy.get('#phylum-composition-column svg .highcharts-point')
                .should('have.length', 10);
        });
        // TODO table tests
        it.skip('Taxonomy column chart table pagination', function() {
            changeSubTab('Column');
            taxonomyTable = new ClientSideTableHandler('#column .phylum-table', 25, false);
            taxonomyTable.testPagination(25, taxonomyTablePagination);
        });
        // TODO table tests
        it.skip('Taxonomy column chart table ordering', function() {
            changeSubTab('Column');
            taxonomyTable = new ClientSideTableHandler('#column .phylum-table', 25, false);
            taxonomyTable.testSorting(25, taxonomyTableColumns);
        });
        it('Should load taxonomy stacked bar charts', function() {
            changeSubTab('Stacked Column');
            cy.get('#phylum-composition-stacked-column').should('be.visible');
            cy.get('#phylum-composition-stacked-column svg .highcharts-point')
                .should('have.length', 34);
            cy.get('#phylum-composition-stacked-column svg .highcharts-series-0 text')
                .then(($label) => {
                    expect(Cypress.$($label).text()).to.contain('29 061');
                });
        });
        // TODO table tests
        it.skip('Taxonomy stacked-column chart table pagination', function() {
            changeSubTab('Stacked Column');
            taxonomyTable = new ClientSideTableHandler('#stacked-column .phylum-table', 25,
                false);
            taxonomyTable.testPagination(25, taxonomyTablePagination);
        });
        // TODO table tests
        it.skip('Taxonomy stacked-column chart table ordering', function() {
            changeSubTab('Stacked Column');
            taxonomyTable = new ClientSideTableHandler('#stacked-column .phylum-table', 25,
                false);
            taxonomyTable.testSorting(25, taxonomyTableColumns);
        });
    });

    context('Taxonomy analysis tab (SSU & LSU)', function() {
        before(function() {
            openPage('analyses/MGYA00141547#taxonomic');
            waitForPageLoad('Analysis MGYA00141547');
        });

        it('Should pre-select SSU', function() {
            cy.get('[data-cy=\'ssu-btn\']').should('be.checked');
        });
        it('SSU and LSU radio should be enabled', function() {
            cy.get('[data-cy=\'lsu-btn\']').should('be.enabled');
            cy.get('[data-cy=\'ssu-btn\']').should('be.enabled');
        });
        it('Changing analysis type should not duplicate krona chart', function() {
            const kronaChartClass = '.krona_chart';
            changeSubTab('Krona');
            cy.get(kronaChartClass).should('have.length', 1);

            cy.get('[data-cy=\'lsu-btn\']').click();
            cy.get('[data-cy=\'ssu-btn\']').click();

            cy.get(kronaChartClass).should('have.length', 1);
        });
        it('Changing analysis type should not duplicate taxonomic phylum table', function() {
            const tableClass = '.phylum-table';
            changeSubTab('Pie');

            cy.get(tableClass).should('have.length', 1);

            cy.get('[data-cy=\'lsu-btn\']').click();
            cy.get('[data-cy=\'ssu-btn\']').click();
            cy.get(tableClass).should('have.length', 1);
        });
    });
    context('Taxonomy analysis tab (pipeline <4.0)', function() {
        it('SSU/LSU buttons should appear/disappear if pipeline version <4.0', function() {
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            changeTab('taxonomic');
            cy.get('[data-cy="ssu-lsu-btns"]').should('not.exist');
            openPage('analyses/MGYA00141547');
            waitForPageLoad('Analysis MGYA00141547');
            changeTab('taxonomic');
            cy.get('[data-cy="ssu-lsu-btns"]').should('be.visible', {timeout: 40000});
        });
    });
    context('Functional tab Interpro (pipeline < 5.0)', function() {
        beforeEach(function() {
            cy.server();
            cy.intercept('GET', '**/analyses/MGYA00141547/**').as('analysisQuery');
            cy.intercept('GET', '**/analyses/MGYA00141547/interpro-identifiers',
              {fixture: 'interproIdentifiersPage1.json'});
            cy.intercept('GET', '**/analyses/MGYA00141547/interpro-identifiers?page=2',
              {fixture: 'interproIdentifiersPage2.json'});
            openPage('analyses/MGYA00141547#functional');
            waitForPageLoad('Analysis MGYA00141547');
        });
        it('Should have the proper subtabs', function() {
            checkV4FunctionalTabs();
        });
        it('Should load seq feat summary correctly', function() {
            cy.wait('@analysisQuery');
            hoverAndValidateTooltip(
                '#seqfeat-chart .highcharts-series-group .highcharts-series-0 > ' +
                '.highcharts-point:nth-child(1)',
                'Reads with predicted CDS', '129 224 380');
            hoverAndValidateTooltip(
                '#seqfeat-chart .highcharts-series-group .highcharts-series-0 > ' +
                '.highcharts-point:nth-child(2)',
                'Reads with predicted RNA', '7 159 621');
            hoverAndValidateTooltip(
                '#seqfeat-chart .highcharts-series-group .highcharts-series-0 > ' +
                '.highcharts-point:nth-child(3)',
                'Reads with InterProScan match', '12 488 689');
            hoverAndValidateTooltip(
                '#seqfeat-chart .highcharts-series-group .highcharts-series-0 > ' +
                '.highcharts-point:nth-child(4)',
                'Predicted CDS', '129 224 380');
            hoverAndValidateTooltip(
                '#seqfeat-chart .highcharts-series-group .highcharts-series-0 > ' +
                '.highcharts-point:nth-child(5)',
                'Predicted CDS with InterProScan match', '12 488 689');
        });
        it('Should load interpro matches pie chart correctly', function() {
            cy.contains('Total: 9182157 InterPro matches').should('be.visible');
            hoverAndValidateTooltip(
                '#interpro-pie-chart .highcharts-series-group .highcharts-series-0 ' +
                '.highcharts-color-0',
                'Ferritin-related', '337 346 pCDS matched (3.67%)');
            hoverAndValidateTooltip(
                '#interpro-pie-chart .highcharts-series-group .highcharts-series-0 ' +
                '.highcharts-color-1',
                'Immunoglobulin-like fold', '201 381 pCDS matched (2.19%)');
            hoverAndValidateTooltip(
                '#interpro-pie-chart .highcharts-series-group .highcharts-series-0 ' +
                '.highcharts-color-10',
                'Other', '7 710 556 pCDS matched (83.97%)');
        });
        // TODO table tests
        it.skip('Toggling rows in table should toggle series visibility in chart', function() {
            let interproTable = new ClientSideTableHandler('#interpro-table', 25, false);
            const firstPieSeries = '#interpro-pie-chart .highcharts-series-group ' +
                                   '.highcharts-series-0 .highcharts-color-0';
            cy.get(firstPieSeries).should('be.visible');
            cy.get(interproTable.getTableSelector() + ' tbody tr:first').click();
            cy.get(firstPieSeries).should('be.hidden');
            cy.get(interproTable.getTableSelector() + ' tbody tr:first').click();
            cy.get(firstPieSeries).should('be.visible');
        });
        const interproMatchCols = {
            index: {
                data: ['1', '25'],
                type: datatype.INT,
                sortable: true
            },
            entry_name: {
                data: ['Ferritin-related', 'ATPase, F0 complex, subunit A'],
                type: datatype.STR,
                sortable: true
            },
            ID: {
                data: ['IPR012347', 'IPR000568'],
                type: datatype.STR,
                sortable: true
            },
            p_cds_match: {
                data: ['337346', '53833'],
                type: datatype.INT,
                sortable: true
            },
            perc: {
                data: ['13.12', '2.09'],
                type: datatype.NUM,
                sortable: true
            }
        };
        // TODO table tests
        it.skip('Should load interpro matches table correctly', function() {
            cy.contains('Total: 2571357 InterPro matches').should('be.visible');
            let interproTable = new ClientSideTableHandler('#interpro-table', 25, false);
            interproTable.checkLoadedCorrectly(1, 25, 50, interproMatchCols);
        });
        // TODO table tests
        it.skip('Interpro match pagination should work', function() {
            let interproTable = new ClientSideTableHandler('#interpro-table', 25, false);
            interproTable.testPagination(25, [
                {
                    index: 1,
                    data: ['1', 'Ferritin-related', 'IPR012347', '337346', '13.12']
                }, {
                    index: 2,
                    data: [
                        '26',
                        'ATPase, V0 complex, c/d subunit',
                        'IPR002843',
                        '1507',
                        '0.06']
                }, {
                    index: 'Previous',
                    data: ['1', 'Ferritin-related', 'IPR012347', '337346', '13.12'],
                    pageNum: 1
                }, {
                    index: 'Next',
                    data: [
                        '26',
                        'ATPase, V0 complex, c/d subunit',
                        'IPR002843',
                        '1507',
                        '0.06'],
                    pageNum: 2
                }, {
                    index: 'First',
                    data: ['1', 'Ferritin-related', 'IPR012347', '337346', '13.12'],
                    pageNum: 1
                }, {
                    index: 'Last',
                    data: [
                        '26',
                        'ATPase, V0 complex, c/d subunit',
                        'IPR002843',
                        '1507',
                        '0.06'],
                    pageNum: 2,
                    pageSize: 25
                }]);
        });
        // TODO table tests
        it.skip('Interpro match sorting should work', function() {
            let interproTable = new ClientSideTableHandler('#interpro-table', 25, false);
            interproTable.testSorting(25, interproMatchCols);
        });
    });

    context('Functional tab GO (pipeline < 5.0)', function() {
        beforeEach(function() {
            cy.server();
            cy.intercept('GET', '**/analyses/MGYA00141547/**').as('analysisQuery');
            openPage('analyses/MGYA00141547?type=go#functional');
            waitForPageLoad('Analysis MGYA00141547');
        });
        it('Should have the proper subtabs', function() {
            checkV4FunctionalTabs();
        });
        it('Go Term annotation tabs should work', function() {
            cy.get('#go-slim-bar-charts').should('be.visible');
            cy.get('#go-slim-pie-charts').should('not.exist');
            cy.get('.mg-button-as-tab').contains('Pie').click();
            cy.get('#go-slim-bar-charts').should('not.exist');
            cy.get('#go-slim-pie-charts').should('be.visible');
        });
        it('Go Term annotation bar charts should load correctly', function() {
            cy.get('#go-slim-bar-charts').should('be.visible');
            hoverAndValidateTooltip(
              '#biological-process-bar-chart .highcharts-series-0 > .highcharts-point:nth-child(1)',
              'biological process', '308 157 annotations');
            hoverAndValidateTooltip(
              '#molecular-function-bar-chart .highcharts-series-0 > .highcharts-point:nth-child(1)',
              'molecular function', '122 365 annotations');
            hoverAndValidateTooltip(
              '#cellular-component-bar-chart .highcharts-series-0 > .highcharts-point:nth-child(1)',
              'cellular component', '6 719 annotations');
        });
        it('Go Term annotation pie charts should load correctly', function() {
            cy.contains('[class*=mg-button-as-tab]', 'Pie').click();
            cy.get('#go-slim-pie-charts').should('be.visible');
            hoverAndValidateTooltip(
                '#biological-process-pie-chart .highcharts-series-0 .highcharts-color-0',
                'translation', '760 621 annotations (15.72%)');
            hoverAndValidateTooltip(
                '#molecular-function-pie-chart .highcharts-series-0 .highcharts-color-0',
                'ion binding', '762 866 annotations (10.44%)');
            hoverAndValidateTooltip(
                '#cellular-component-pie-chart .highcharts-series-0 .highcharts-color-0',
                'ribosome', '647 017 annotations (26.88%)');
        });
    });

    context('Abundance tab', function() {
        it('Should be removed if no data available.', function() {
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            checkTabWasRemoved('#abundance');
        });
        it('Should show warning message if no data available.', function() {
            openPage(origPage + '#abundance');
            waitForPageLoad('Analysis MGYA00011845');
            cy.contains('No abundance found', {timeout: 40000}).should('be.visible');
        });
    });

    context('Error handling', function() {
        it('Should display error message if invalid accession passed in URL', function() {
            const runId = 'MGYA00141547XXXX';
            const origPage = 'analyses/' + runId;
            openPage(origPage);
            cy.contains('Status: 404', {timeout: 40000});
            cy.contains('Error Fetching Data', {timeout: 40000});
        });
    });

    // FIXME: enable and fix after deeplinking routing is fixed for inner-inner tabs
    // context('Embedded tabs', function() {
    //     it('Deep linking to embedded tabs should work', function() {
    //         openPage(origPage + '#pie');
    //         cy.get('#taxonomic').should('be.visible');
    //         cy.get('#overview').should('be.hidden');
    //         cy.get('#qc').should('be.hidden');
    //         cy.get('#functional').should('be.hidden');
    //         cy.get('#download').should('be.hidden');
    //         cy.get('#pie').should('be.visible');
    //         cy.get('#krona').should('be.hidden');
    //         cy.get('#column').should('be.hidden');
    //         cy.get('#stacked-column').should('be.hidden');
    //     });
    // });
});
