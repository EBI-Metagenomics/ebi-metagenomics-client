import {openPage, changeTab, waitForPageLoad, checkChartTooltip} from '../util/util';

/**
 * Fixtures:
 * Accession    Run         Study
 * MGYA00383254 ERR599003   ERS487899 (assembly v5)
 * MGYA00XXXXXX ERZXXXXXXX  ERPXXXXXX (amplicon, ITS/LSU/ITS, v5)
 */

/**
 * Verify if a tab is visible
 * @param {*} tabId Id
 */
function verifyTabIsVisible(tabId) {
    // Verify correct tab button is active
    cy.get('[href*=\'' + tabId + '\']').should('have.class', 'is-active');
    // Verify tab content is active
    cy.get(`#tab-${tabId.slice(1)}`).should('be.visible');
}

describe('Analysis V5', () => {
    context('Routing', () => {
        const analysisId = 'MGYA00000001';
        const pageUrl = 'analyses/' + analysisId;

        const tabs = [
            'Overview',
            'Quality control',
            'Taxonomic analysis',
            'Functional analysis',
            'Pathways/Systems',
            'Contig Viewer',
            'Download'
        ];

        it('Should have 7 tabs', () => {
            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
            cy.get('.mg-search-tabs .vf-tabs__link').should('have.length', 7);
            cy.get('.mg-search-tabs .vf-tabs__link').each(($li) => {
                expect($li.text().replace('\n', '').trim()).to.be.oneOf(tabs);
            });
        });

        it('If no route provided then #overview', () => {
            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
            verifyTabIsVisible('#overview');
        });

        it('QC', () => {
            openPage(pageUrl + '#qc');
            waitForPageLoad('Analysis ' + analysisId);
            verifyTabIsVisible('#qc');
        });

        it('Contigs Viewer', () => {
            openPage(pageUrl + '#contigs-viewer');
            waitForPageLoad('Analysis ' + analysisId);
            verifyTabIsVisible('#contigs-viewer');
        });
    });

    context('Overview tab', () => {
        const analysisId = 'MGYA00000001';
        const pageUrl = 'analyses/' + analysisId;
        before(() => {
            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
        });

        it('Should display assembly metadata', () => {
            cy.contains('Study:').next().should('contain', 'MGYS00000001');
            // TODO: fix data import
            // cy.contains('Sample:').next().should('contain', 'ERS487899');
            cy.contains('Assembly:').next().should('contain', 'ERZ8153470');
            cy.contains('Pipeline version:').next().should('contain', '5.0');

            cy.contains('Experiment type:').next().should('contain', 'assembly');
            cy.contains('Instrument model:').next().should('contain', 'BGISEQ-500');
            cy.contains('Instrument platform:').next().should('contain', 'BGISEQ');
        });

        it('Sections should be expandable', () => {
            cy.get('#tab-overview details').should('have.attr', 'open', 'open');

            cy.get('#tab-overview details:nth-child(1) > summary').click();
            cy.get('#tab-overview details:nth-child(1)').should('not.have.attr', 'open');
            cy.get('#tab-overview details:nth-child(1) > summary').click();
            cy.get('#tab-overview details:nth-child(1)').should('have.attr', 'open', 'open');

            cy.get('#tab-overview details:nth-child(2) > summary').click();
            cy.get('#tab-overview details:nth-child(2)').should('not.have.attr', 'open', 'closed');
            cy.get('#tab-overview details:nth-child(2) > summary').click();
            cy.get('#tab-overview details:nth-child(2)').should('have.attr', 'open', 'open');
        });
    });

    context('QC tab', () => {
        const analysisId = 'MGYA00000001';
        const pageUrl = 'analyses/' + analysisId;
        before(() => {
            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
            changeTab('qc');
        });

        it('Should load [Number of of contigs per QC] chart', () => {
            cy.get('#qc-step-chart .highcharts-series-1 > rect.highcharts-point')
               .should('have.length', 6); // there is one empty

            cy.get('#qc-step-chart g.highcharts-xaxis-labels > text:nth-child(1)')
              .should('contain', 'Initial contigs');
            cy.get('#qc-step-chart g.highcharts-xaxis-labels > text:nth-child(2)')
              .should('contain', 'Trimming');
            cy.get('#qc-step-chart g.highcharts-xaxis-labels > text:nth-child(3)')
              .should('contain', 'Length filtering');
            cy.get('#qc-step-chart g.highcharts-xaxis-labels > text:nth-child(4)')
              .should('contain', 'Ambiguous base filtering');
            cy.get('#qc-step-chart g.highcharts-xaxis-labels > text:nth-child(5)')
              .should('contain', 'Contigs subsampled for QC analysis');

            const tooltipValues = [
                {series: 1, tooltip: 'Initial contigs● Contigs remaining: 1 092 543'},
                {series: 2, tooltip: 'Trimming● Contigs remaining: 1 092 543'},
                {series: 3, tooltip: 'Length filtering● Contigs remaining: 148 992'},
                {series: 4, tooltip: 'Ambiguous base filtering● Contigs remaining: 148 992'},
                {
                    series: 5,
                    tooltip: 'Contigs subsampled for QC analysis● Contigs remaining: 0'
                }
            ];
            tooltipValues.forEach((element) => {
                checkChartTooltip(
                    `#qc-step-chart .highcharts-series-1 > rect:nth-child(${element.series})`,
                    element.tooltip
                );
            });
        });

        it('Should load [Contigs length hist] chart', () => {
            cy.get('#reads-length-hist .highcharts-series-group').should('be.visible');
        });

        it('Should load [Contigs length bar] chart', () => {
            cy.get('#reads-length-barchart g.highcharts-xaxis-labels > text:nth-child(1)')
              .should('contain', 'Minimum');
            cy.get('#reads-length-barchart g.highcharts-xaxis-labels > text:nth-child(2)')
              .should('contain', 'Average');
            cy.get('#reads-length-barchart g.highcharts-xaxis-labels > text:nth-child(3)')
              .should('contain', 'Maximum');
            checkChartTooltip(
                '#reads-length-barchart ' +
                'g.highcharts-series.highcharts-series-0.highcharts-bar-series' +
                '.highcharts-color-0.highcharts-tracker > rect:nth-child(3)',
                'Maximum● Maximum: 138181.00'
            );
        });

        it('Should load [Contigs GC distribution] chart', () => {
            cy.get('#reads-gc-hist .highcharts-series-group').should('be.visible');
        });

        it('Should load [Contigs GC distribution] chart', () => {
            cy.get('#reads-gc-barchart g.highcharts-xaxis-labels > text:nth-child(1)')
              .should('contain', 'Content');
            checkChartTooltip(
                '#reads-gc-barchart .highcharts-series-0 > rect:nth-child(1)',
                'Content● GC content: 38.13%'
            );
            checkChartTooltip(
                '#reads-gc-barchart .highcharts-series-1 > rect:nth-child(1)',
                'Content● AT content: 61.87%'
            );
        });

        it('Should load [Nucleotide position histogram] chart', () => {
            const series = '#nucleotide-chart .highcharts-series-group .highcharts-area-series';
            cy.get(series).should('be.visible');
        });
    });

    context('Functional tab', () => {
        const analysisId = 'MGYA00000001';
        const pageUrl = 'analyses/' + analysisId + '#functional';
        const tabs = [
            'InterPro',
            'GO Terms',
            'Pfam',
            'KO'
        ];
        it('Should have 4 inner tabs', () => {
            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
            cy.get('.mg-button-as-tab').should('have.length', 4);
            cy.get('.mg-button-as-tab').each(($li) => {
                expect($li.text().replace('\n', '').trim()).to.be.oneOf(tabs);
            });
        });
    });

    context('Contig viewer tab', () => {
    });

    context('Downloads tab', () => {
    });

    context('Error handling', () => {
        it('Should display error message if invalid accession passed in URL', () => {
            const assemblyId = 'MGYA00141547XXXX';
            const origPage = 'analyses/' + assemblyId;
            openPage(origPage);
            cy.contains('Status: 404');
            cy.contains('Error Fetching Data');
        });
    });
});
