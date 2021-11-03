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
    cy.get('[href=\'' + tabId + '\']').should('have.class', 'is-active');
    // Verify tab content is active
    cy.get(tabId).should('have.class', 'is-active');
}

describe('Analysis V5', () => {
    context('Routing', () => {
        const analysisId = 'MGYA00383254';
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
            cy.get('#analysis-tabs li').should('have.length', 7);
            cy.get('#analysis-tabs li').each(($li) => {
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
        const analysisId = 'MGYA00383254';
        const pageUrl = 'analyses/' + analysisId;
        before(() => {
            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
        });

        it('Should display assembly metadata', () => {
            cy.contains('Study:').next().should('contain', 'MGYS00002008');
            // TODO: fix data import
            // cy.contains('Sample:').next().should('contain', 'ERS487899');
            cy.contains('Assembly:').next().should('contain', 'ERZ477576');
            cy.contains('Pipeline version:').next().should('contain', '5.0');

            cy.contains('Experiment type:').next().should('contain', 'assembly');
            cy.contains('Instrument model:').next().should('contain', 'Illumina HiSeq 2000');
            cy.contains('Instrument platform:').next().should('contain', 'ILLUMINA');
        });

        it('Sections should be expandable', () => {
            cy.get('#overview > div:nth-child(1) .box').should('be.visible');
            cy.get('#overview > div:nth-child(1) > h4 > a').click();
            cy.get('#overview > div:nth-child(1) .box').should('be.hidden');

            cy.get('#overview > div:nth-child(2) .box').should('be.visible');
            cy.get('#overview > div:nth-child(2) > h4 > a').click();
            cy.get('#overview > div:nth-child(2) .box').should('be.hidden');
        });
    });

    context('Overview tab - hybrid assemblies', () => {
        const analysisId = 'MGYA00383254';
        const pageUrl = 'analyses/' + analysisId;

        before(() => {
            cy.server()
            cy.route('GET', '**/analyses/MGYA00383254?include=downloads,assembly', 'fixture:hybridAssemblyAnalysis');
            cy.route('GET', '**/assemblies/ERZ477576/runs**', 'fixture:hybridAssemblyAnalysisRuns');

            openPage(pageUrl);
            waitForPageLoad('Analysis ' + analysisId);
        });

        it('Should display hybrid', () => {
            cy.contains('Study:').next().should('contain', 'MGYS00002008');
            cy.contains('Assembly:').next().should('contain', 'ERZ477576');
            cy.contains('Pipeline version:').next().should('contain', '5.0');
            cy.contains('Experiment type:').next().should('contain', 'hybrid assembly');

            cy.get('[data-cy="instrument"]').should('have.length', 2);
            cy.get('[data-cy="instrument"]').eq(0).should('contain', 'platform: LS454, model: 454 GS FLX Titanium');
            cy.get('[data-cy="instrument"]').eq(1).should('contain', 'platform: ION_TORRENT, model: Ion Torrent PGM');
        });
    })
    
    context('QC tab', () => {
        const analysisId = 'MGYA00383254';
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
            const series = '#nucleotide .highcharts-series-group .highcharts-area-series';
            cy.get(series).should('be.visible');
        });
    });

    context('Functional tab', () => {
        const tabs = [
            'InterPro',
            'GO Terms',
            'Pfam',
            'KO'
        ];
        it('Should have 4 inner tabs', () => {
            const analysisId = 'MGYA00383254';
            openPage(`analyses/${analysisId}#functional`);
            waitForPageLoad('Analysis ' + analysisId);
            cy.get('#functional-analysis-tabs li').should('have.length', 4);
            cy.get('#functional-analysis-tabs li').each(($li) => {
                expect($li.text().replace('\n', '').trim()).to.be.oneOf(tabs);
            });
            // Long Read message
            cy.get('#functional .callout').should('not.exist');
        });
        it('Should display a message for long-read analysis', () => {
            const analysisId = 'MGYA00022366';
            openPage(`analyses/${analysisId}#functional`);
            waitForPageLoad('Analysis ' + analysisId);
            // V2.0 WGS analysis
            cy.get('#functional-analysis-tabs li').should('have.length', 2);
            // Long Read message
            cy.get('#functional .callout').should('contain',
                'The sequences in this sample are derived from long-read sequencing technology. Gene-prediction on this sequence data can be problematic, potentially resulting in fewer and/or truncated predictions.');
        });
    });

    context('Contigs Viewer', () => {
        
        context('Contigs table', () => {
            const analysisId = 'MGYA00383254';
            const pageUrl = 'analyses/' + analysisId + '#contigs-viewer';
            
            it('The contig table should have 4 headers', () => {
                openPage(pageUrl);
                waitForPageLoad('Analysis ' + analysisId);
                const headers = [
                    "Name",
                    "Length (bp)",
                    "Coverage",
                    "Features"
                ]
                cy.get('#contigs-table table thead tr th').should('have.length', headers.length);
                cy.get('#contigs-table table thead tr th').each(($li) => {
                    expect($li.text().replace('\n', '').trim()).to.be.oneOf(headers);
                });
            });
    
            it('The contig table should not have the "coverage" for long-reads', () => {
                // Fixture with patched experiment type to long_reads
                cy.server();
                cy.route('GET',
                '**/v1/analyses/MGYA00383254?include=downloads,assembly',
                'fixture:analysisAssemblyVersion5_LongReads');
    
                openPage(pageUrl);
                waitForPageLoad('Analysis ' + analysisId);

                const headers = [
                    "Name",
                    "Length (bp)",
                    "Features"
                ]

                cy.get('#contigs-table table thead tr th').should('have.length', headers.length);
                cy.get('#contigs-table table thead tr th').each(($li) => {
                    expect($li.text().replace('\n', '').trim()).to.be.oneOf(headers);
                });
            });
        });
    });

    context('Error handling', () => {
        it('Should display error message if invalid accession passed in URL', () => {
            const assemblyId = 'MGYA00141547XXXX';
            const origPage = 'analyses/' + assemblyId;
            openPage(origPage);
            cy.contains('Error: 404');
            cy.contains('Could not retrieve analysis: ' + assemblyId);
        });
    });
});
