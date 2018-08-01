import {openPage, changeTab, isValidLink, datatype, waitForPageLoad} from '../util/util';
import ClientSideTableHandler from '../util/clientSideTable';

const origPage = 'analyses/MGYA00011845';

/**
 * Fixtures:
 * Accession    Run         Study
 * MGYA00136035 ERR867655   ERP009703 (amplicon, SSU only)
 * MGYA00141547 ERR1022502  ERP012221 (metatranscriptomic, SSU + LSU)
 */

function verifyTabIsVisible(tabId) {
    // Verify correct tab button is active
    cy.get('[href=\'' + tabId + '\']').parent().should('have.class', 'is-active');
    // Verify tab content is active
    cy.get(tabId).should('have.class', 'active');
}

function checkTabWasRemoved(tabId) {
    cy.get('[href=\'' + tabId + '\']').should('not.exist', {timeout: 100000});
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
            cy.get('.run-qc-chart').should('be.visible');
        });
        it('Should resolve hash links correctly (taxonomic)', function() {
            openPage('analyses/MGYA00136035#taxonomic');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('.krona_chart').should('be.visible');
        });
        it('Should resolve hash links correctly (krona)', function() {
            openPage('analyses/MGYA00136035#krona');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('.krona_chart').should('be.visible');
        });
        it('Should resolve hash links correctly (pie)', function() {
            openPage('analyses/MGYA00136035#pie');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('#domain-composition-pie').should('be.visible');
        });
        it('Should resolve hash links correctly (column)', function() {
            openPage('analyses/MGYA00136035#column');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('#domain-composition-column').should('be.visible');
        });
        it('Should resolve hash links correctly (stacked-column)', function() {
            openPage('analyses/MGYA00136035#stacked-column');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('#phylum-composition-stacked-column').should('be.visible');
        });
        it('Should resolve hash links correctly (download)', function() {
            openPage('analyses/MGYA00136035#download');
            waitForPageLoad('Analysis MGYA00136035');
            cy.contains('Here you may download').should('be.visible');
        });
    });
    context('Download tab', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            changeTab('download');
        });

        it('Should display correct number of results', function() {
            cy.get('#download-list tbody > tr a', {timeout: 40000}).should('have.length', 64);
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
            cy.get('#download-list h3').should('have.length', 3).each(($el) => {
                expect($el).to.contain(headers[i++]);
            });
        });

        // TODO check download link validity
        it('Download links should be valid', function() {
            cy.get('#download-list a').first(($el) => {
                isValidLink($el);
            });
        });
    });
    context('Quality Control tab', function() {
        before(function() {
            openPage('analyses/MGYA00141547');
            waitForPageLoad('Analysis MGYA00141547');
            changeTab('qc');
        });

        function hoverAndValidateTooltip(series, tooltipText1, tooltipText2) {
            const chart = series.split(' ')[0];
            cy.get(series).first().trigger('mouseover', {force: true}).then(() => {
                cy.get(chart + ' svg g text').contains(tooltipText1);
                cy.get(chart + ' svg g.highcharts-tooltip text').contains(tooltipText2);
            });
            cy.get(series).first().trigger('mouseout', {force: true});
        }

        it('QC chart should display correctly', function() {
            // Verify graph via tooltip values

            const readsRemainingSeries =
                '#QC-step-chart .highcharts-series-group .highcharts-series-1 > .highcharts-point';
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
                '#QC-step-chart .highcharts-series-group .highcharts-series-0 > .highcharts-point:nth-child(3)';
            hoverAndValidateTooltip(filteredOutSeries, 'Length filtering',
                'Reads filtered out: 33 411 452');

            // Ambiguous base filtering
            const series4 = readsRemainingSeries + ':nth-child(4)';
            hoverAndValidateTooltip(series4, 'Ambiguous base filtering',
                'Reads remaining: 180 329 978');

            // Reads subsampled for QC analysis
            const series5 = readsRemainingSeries + ':nth-child(5)';
            hoverAndValidateTooltip(series5, 'Reads subsampled for QC analysis',
                'Reads remaining: 0');

            const readsAfterSampling =
                '#QC-step-chart .highcharts-series-group .highcharts-series-2 > .highcharts-point';
            hoverAndValidateTooltip(readsAfterSampling + ':nth-child(5)',
                'Reads subsampled for QC analysis',
                'Reads after sampling: 1 997 827');
        });
        it('Reads length hist should be present', function() {
            const series = '#readsLengthHist .highcharts-series-group .highcharts-markers .highcharts-point';
            cy.get(series).should('be.visible');
        });
        it('Reads length bar chart should be present', function() {
            let series0 = '#readsLengthBarChart svg .highcharts-series-0 > rect:nth-child(1)';
            hoverAndValidateTooltip(series0, 'Minimum', 'Minimum: 100');
            let series1 = '#readsLengthBarChart svg .highcharts-series-0 > rect:nth-child(2)';
            hoverAndValidateTooltip(series1, 'Average', 'Average: 100');
            let series2 = '#readsLengthBarChart svg .highcharts-series-0 > rect:nth-child(3)';
            hoverAndValidateTooltip(series2, 'Maximum', 'Maximum: 100');
        });
        it('Reads GC distribution chart should be present', function() {
            const series = '#readsGCHist .highcharts-series-group .highcharts-markers';
            cy.get(series).should('be.visible');
        });
        it('Reads GC bar chart should be present', function() {
            let series0 = '#readsGCBarChart svg .highcharts-series-0 > rect:nth-child(1)';
            hoverAndValidateTooltip(series0, 'Content', 'GC Content: 44.51%');
            let series1 = '#readsGCBarChart svg .highcharts-series-1 > rect:nth-child(1)';
            hoverAndValidateTooltip(series1, 'Content', 'AT Content: 55.49%');
        });
        it('Nucleotide position hist chart should be present', function() {
            const series = '#nucleotide .highcharts-series-2 .highcharts-point';
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
            index: 'first',
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
            cy.get('[data-cy=\'ssu-btn\']').should('be.checked', {timeout: 40000});
        });
        it('Should disable LSU', function() {
            cy.server();
            cy.route('GET', '/metagenomics/api/v1/analyses/MGYA00136035/taxonomy/ssu').as('apiSsu');
            openPage('analyses/MGYA00136035#taxonomic');
            cy.wait('@apiSsu');
            cy.get('[data-cy=\'lsu-btn\'][disabled=\'disabled\']', {timeout: 40000})
                .should('exist');
        });
        it('Should default to krona tab', function() {
            openPage('analyses/MGYA00136035#taxonomic');
            waitForPageLoad('Analysis MGYA00136035');
            cy.get('.krona_chart').should('be.visible');
        });
        it('Changing tabs should change visible content', function() {
            cy.get('.krona_chart').should('be.visible');
            changeTab('pie');
            cy.get('#pie').should('be.visible');
            changeTab('column');
            cy.get('#column').should('be.visible');
            changeTab('stacked-column');
            cy.get('#stacked-column').should('be.visible');
        });
        it('Should load krona chart correctly', function() {
            changeTab('krona');
            cy.get('.krona_chart').then(($krona) => {
                expect($krona.contents().find('body')).to.be.visible;
            });
        });
        it('Should load taxonomy pie charts', function() {
            changeTab('pie');
            cy.get('#domain-composition-pie').should('be.visible');
            cy.get('#phylum-composition-pie').should('be.visible');
            // Check elements in both charts
            cy.get('#domain-composition-pie svg text:nth-child(1):first').then(($label) => {
                expect(Cypress.$($label).text()).to.contain('Bacteria: 98.7 %');
            });
            cy.get('#phylum-composition-pie svg text:nth-child(1):first').then(($label) => {
                expect(Cypress.$($label).text()).to.contain('Proteobacteria: 67.5 %');
            });
        });
        it('Taxonomy pie chart table pagination', function() {
            changeTab('pie');
            taxonomyTable = new ClientSideTableHandler('#pie .phylum-table', 25, false);
            taxonomyTable.testPagination(25, taxonomyTablePagination);
        });
        it('Taxonomy pie chart table ordering', function() {
            changeTab('pie');
            taxonomyTable = new ClientSideTableHandler('#pie .phylum-table', 25, false);
            taxonomyTable.testSorting(25, taxonomyTableColumns);
        });
        it('Should load taxonomy bar charts', function() {
            changeTab('column');
            cy.get('#domain-composition-column').should('be.visible');
            cy.get('#phylum-composition-column').should('be.visible');
            // Check elements in both charts
            cy.get('#domain-composition-column svg .highcharts-point').should('have.length', 3);
            cy.get('#phylum-composition-column svg .highcharts-point')
                .should('have.length', 34);

        });
        it('Taxonomy column chart table pagination', function() {
            changeTab('column');
            taxonomyTable = new ClientSideTableHandler('#column .phylum-table', 25, false);
            taxonomyTable.testPagination(25, taxonomyTablePagination);
        });
        it('Taxonomy column chart table ordering', function() {
            changeTab('column');
            taxonomyTable = new ClientSideTableHandler('#column .phylum-table', 25, false);
            taxonomyTable.testSorting(25, taxonomyTableColumns);
        });
        it('Should load taxonomy stacked bar charts', function() {
            changeTab('stacked-column');
            cy.get('#phylum-composition-stacked-column').should('be.visible');
            cy.get('#phylum-composition-stacked-column svg .highcharts-point')
                .should('have.length', 34);
            cy.get('#phylum-composition-stacked-column svg .highcharts-series-0 text')
                .then(($label) => {
                    expect(Cypress.$($label).text()).to.contain('29 061');
                });
        });
        it('Taxonomy stacked-column chart table pagination', function() {
            changeTab('stacked-column');
            taxonomyTable = new ClientSideTableHandler('#stacked-column .phylum-table', 25,
                false);
            taxonomyTable.testPagination(25, taxonomyTablePagination);
        });
        it('Taxonomy stacked-column chart table ordering', function() {
            changeTab('stacked-column');
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
            changeTab('krona');
            cy.get(kronaChartClass).should('have.length', 1);

            cy.get('[data-cy=\'lsu-btn\']').click();
            cy.get('[data-cy=\'ssu-btn\']').click();

            cy.get(kronaChartClass).should('have.length', 1);
        });
        it('Changing analysis type should not duplicate taxonomic phylum table', function() {
            const tableClass = '#pie .phylum-table';
            changeTab('pie');

            cy.get(tableClass).should('have.length', 1);

            cy.get('[data-cy=\'lsu-btn\']').click();
            cy.get('[data-cy=\'ssu-btn\']').click();
            cy.get(tableClass).should('have.length', 1);
        });
    });
    context('Taxonomy analysis tab (pipeline <4.0)', function() {
        it('SSU/LSU buttons should appear/dissapear if pipeline version <4.0', function() {
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            changeTab('taxonomic');
            cy.get('#ssu-lsu-btns').should('not.exist');
            openPage('analyses/MGYA00141547');
            waitForPageLoad('Analysis MGYA00141547');
            changeTab('taxonomic');
            cy.get('#ssu-lsu-btns').should('be.visible', {timeout: 40000});
        });
    });
    context('Abundance tab', function() {
        it('Should be removed if no data available.', function() {
            cy.server();
            cy.route('GET', '**downloads**').as('apiDownloads');
            openPage(origPage);
            waitForPageLoad('Analysis MGYA00011845');
            cy.wait('@apiDownloads');
            checkTabWasRemoved('#abundance');
        });
        it('Should change to default if no data available.', function() {
            openPage(origPage + '#abundance');
            waitForPageLoad('Analysis MGYA00011845');
            // Check defaulted to overview tab
            cy.contains('Description', {timeout: 40000}).should('be.visible');
            cy.get('a[href=\'#abundance\']')
                .should('not.exist');
            cy.get('a[href=\'#overview\']')
                .should('have.attr', 'aria-selected', 'true')
                .parent()
                .should('have.class', 'is-active');
        });
    });
    context('Error handling', function() {
        it('Should display error message if invalid accession passed in URL', function() {
            const runId = 'MGYA00141547XXXX';
            const origPage = 'analyses/' + runId;
            openPage(origPage);
            cy.contains('Error: 404', {timeout: 40000});
            cy.contains('Could not retrieve analysis: ' + runId, {timeout: 40000});
        });
    });
    context('Embedded tabs', function() {
        it('Deep linking to embedded tabs should work', function() {
            openPage(origPage + '#pie');
            cy.get('#taxonomic').should('be.visible');
            cy.get('#overview').should('be.hidden');
            cy.get('#qc').should('be.hidden');
            cy.get('#functional').should('be.hidden');
            cy.get('#download').should('be.hidden');
            cy.get('#pie').should('be.visible');
            cy.get('#krona').should('be.hidden');
            cy.get('#column').should('be.hidden');
            cy.get('#stacked-column').should('be.hidden');
        });
    });
});
// TODO test all download links are valid/organised correctly

// TODO test abundance graphic is loaded correctly
