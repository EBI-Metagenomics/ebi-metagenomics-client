import {openPage, changeTab} from './util';

const origPage = 'analyses/MGYA00011845';

function waitForPageLoad() {
    cy.get('#overview', {timeout: 20000}).children().should('have.length', 2);
}

function verifyTabIsVisible(tabId) {
    // Verify correct tab button is active
    cy.get('[href=\'' + tabId + '\']').parent().should('have.class', 'is-active');
    // Verify tab content is active
    cy.get(tabId).should('have.class', 'active');
}

function openTab(tabId) {
    cy.get('[href=\'' + tabId + '\']').parent().click();
}

function checkTabIsDisabled(tabId) {
    cy.get('[href=\'' + tabId + '\']').parent('li.disabled', {timeout: 40000});
}

function selectAnalysis(analysis) {
    cy.get('#analysisSelect').select(analysis);
    waitForPageLoad();
}

// function verifyTabsEnabled(tabs) {
//     for (let i in tabs) {
//         if (Object.prototype.hasOwnProperty.call(tabs, i)) {
//             const tabId = tabs[i];
//             openTab(tabId);
//             verifyTabIsVisible(tabId);
//         }
//     }
// }

/**
 * Verify number of results responds to selector
 */
describe('Analysis page - general', function() {
    // it('Should display overview if no deeplink is provided', function() {
    //     openPage(origPage);
    //     waitForPageLoad();
    //     verifyTabIsVisible('#overview');
    // });
    // it('Should only display available tabs', function() {
    //     openPage(origPage);
    //     waitForPageLoad();
    //     verifyTabIsVisible('#overview');
    //     let tabs = ['#qc', '#functional', '#taxonomic', '#download', '#overview'];
    //     verifyTabsEnabled(tabs);
    //
    //     openPage('analysis/MGYA00141547');
    //     waitForPageLoad();
    //     verifyTabIsVisible('#overview');
    //     let tabs2 = ['#qc', '#functional', '#abundance', '#taxonomic', '#download', '#overview'];
    //     verifyTabsEnabled(tabs2);
    // });

    it('Should display metadata if available', function() {
        openPage('analysis/MGYA00141547');
        waitForPageLoad();
        verifyTabIsVisible('#overview');
        cy.contains('Study:').next().should('contain', 'MGYS00000553');
        cy.contains('Sample:').next().should('contain', 'ERS853149');
        cy.contains('Run:').next().should('contain', 'ERR1022502');
        cy.contains('Pipeline version:').next().should('contain', '4.0');
        cy.contains('Experiment type:').next().should('contain', 'metatranscriptomic');
        cy.contains('Instrument model:').next().should('contain', 'Illumina HiSeq 2500');
        cy.contains('Instrument platform:').next().should('contain', 'ILLUMINA');
    });
    it('SSU/LSU buttons should appear/dissapear if pipeline version <4.0', function() {
        openPage('analysis/MGYA00011845');
        waitForPageLoad();
        changeTab('taxonomic');
        cy.get('#ssu-lsu-btns').should('not.exist');
        openPage('analysis/MGYA00141547');
        waitForPageLoad();
        changeTab('taxonomic');
        cy.get('#ssu-lsu-btns').should('be.visible', {timeout: 40000});
    });
});

describe('Analysis page - download tab', function() {
    beforeEach(function() {
        openPage(origPage);
        waitForPageLoad();
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
    // it('Download links should be valid', function () {
    //     cy.get('#download-list a').first().then(($el) => {
    //         cy.request(Cypress.$($el).attr('href'));
    //     });
    // });
});

// describe('Analysis page - charts', function() {
// it('QC chart should display correctly', function() {
//     openPage('analysis/ERR867655');
//     waitForPageLoad();
//     changeTab('qc');
//
//     // Verify graph via tooltip values
//
//     function hoverAndValidateTooltip(series, tooltipText1, tooltipText2) {
//         cy.get(series).first().trigger('mouseover', {force: true}).then(() => {
//             cy.get('svg g text').contains(tooltipText1);
//             cy.get('svg g.highcharts-tooltip text').contains(tooltipText2);
//         });
//         cy.get(series).first().trigger('mouseout', {force: true});
//     }
//
//     const readsRemainingSeries =
//         '.highcharts-series-group .highcharts-series-1 > .highcharts-point';
//     // Initial reads
//     const series1 = readsRemainingSeries + ':nth-child(1)';
//     hoverAndValidateTooltip(series1, 'Initial reads', 'Reads remaining: 43 947');
//
//     // Trimming
//     const series2 = readsRemainingSeries + ':nth-child(2)';
//     hoverAndValidateTooltip(series2, 'Trimming', 'Reads remaining: 43 933');
//
//     // Length filtering
//     const series3 = readsRemainingSeries + ':nth-child(3)';
//     hoverAndValidateTooltip(series3, 'Length filtering', 'Reads remaining: 43 045');
//
//     // Length filtering (reads filtered out)
//     const filteredOutSeries =
//         '.highcharts-series-group .highcharts-series-0 > .highcharts-point:nth-child(3)';
//     hoverAndValidateTooltip(filteredOutSeries, 'Length filtering', 'Reads filtered out: 888');
//
//     // Ambiguous base filtering
//     const series4 = readsRemainingSeries + ':nth-child(4)';
//     hoverAndValidateTooltip(series4, 'Ambiguous base filtering', 'Reads remaining: 43 045');
//
//     // Reads subsampled for QC analysis
//     const series5 = readsRemainingSeries + ':nth-child(5)';
//     hoverAndValidateTooltip(series5, 'Reads subsampled for QC analysis', 'Reads remaining: 0');
// });
// });

describe('Analysis page - Abundance tab', function() {
    it('Tab should be disabled if no data available.', function() {
        openPage(origPage);
        waitForPageLoad();
        checkTabIsDisabled('#abundance');
    });
    it('Tab should change to default if no data available.', function() {
        openPage(origPage + '#abundance');
        waitForPageLoad();
        // Check defaulted to overview tab
        cy.contains('Description', {timeout: 40000}).should('be.visible');
        cy.get('a[href=\'#abundance\']')
            .should('have.attr', 'aria-selected', 'false')
            .parent()
            .should('not.have.class', 'is-active');
        cy.get('a[href=\'#overview\']')
            .should('have.attr', 'aria-selected', 'true')
            .parent()
            .should('have.class', 'is-active');
    });
});

describe('Analysis page - Changing pipeline version', function() {
    it('Should not duplicate krona chart', function() {
        const kronaChartClass = '.krona_chart';
        openPage('analyses/MGYA00141547');
        waitForPageLoad();
        changeTab('taxonomic');
        changeTab('krona');
        cy.get(kronaChartClass).should('have.length', 1);

        cy.get('[data-cy=\'lsu-btn\']').click();
        cy.get('[data-cy=\'ssu-btn\']').click();

        cy.get(kronaChartClass).should('have.length', 1);
    });
});

describe('Analysis page - Changing analysis version', function() {
    it('Should not duplicate taxonomic phylum table', function() {
        const tableClass = '#pie .phylum-table';
        openPage('analyses/MGYA00141547');
        waitForPageLoad();
        changeTab('taxonomic');
        changeTab('pie');

        cy.get(tableClass).should('have.length', 1);

        cy.get('[data-cy=\'lsu-btn\']').click();
        cy.get('[data-cy=\'ssu-btn\']').click();
        cy.get(tableClass).should('have.length', 1);
    });
});

describe('Analysis page - Error handling', function() {
    it('Should display error message if invalid accession passed in URL', function() {
        const runId = 'MGYA00141547XXXX';
        const origPage = 'analyses/' + runId;
        openPage(origPage);
        cy.contains('Error: 404', {timeout: 40000});
        cy.contains('Could not retrieve analysis: ' + runId, {timeout: 40000});
    });
});

// TODO test version selector
// TODO test all download links are valid/organised correctly

// TODO test abundance graphic is loaded correctly

// TODO test specifying pipeline version by URL parameter


