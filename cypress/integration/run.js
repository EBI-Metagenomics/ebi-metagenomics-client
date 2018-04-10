import {openPage, changeTab} from './util';

const origPage = 'runs/ERR1022502';

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

/**
 * Verify number of results responds to selector
 */
describe('Run page - general', function() {
    it('Should display overview if no deeplink is provided', function() {
        openPage(origPage);
        waitForPageLoad();
        verifyTabIsVisible('#overview');
    });
    it('Should only display available tabs', function() {
        openPage(origPage);
        waitForPageLoad();
        verifyTabIsVisible('#overview');
        // const tabs =
        // ['#qc', '#functional', '#taxonomic', '#abundance', '#download', '#overview'];
        const tabs = ['#qc', '#taxonomic', '#download', '#overview'];
        for (let i in tabs) {
            if (Object.prototype.hasOwnProperty.call(tabs, i)) {
                const tabId = tabs[i];
                openTab(tabId);
                verifyTabIsVisible(tabId);
            }

        }
    });
    it('Should display metadata if available', function() {
        openPage('runs/ERR867946');
        waitForPageLoad();
        verifyTabIsVisible('#overview');
        cy.contains('Study:').next().should('contain', 'ERP009703');
        cy.contains('Sample:').next().should('contain', 'ERS667564');
        cy.contains('Experiment type:').next().should('contain', 'amplicon');
        cy.contains('Instrument model:').next().should('contain', 'Illumina MiSeq');
        cy.contains('Instrument platform:').next().should('contain', 'ILLUMINA');
    });
    it('SSU/LSU buttons should appear/dissapear if pipeline version >=4.0', function() {
        openPage('runs/ERR1022502');
        waitForPageLoad();
        changeTab('taxonomic');
        cy.get('#ssu-lsu-btns').should('be.hidden');
        selectAnalysis('V4.0');
        cy.get('#ssu-lsu-btns').should('be.visible', {timeout: 40000});
    });
})
;

describe('Run page - url parameters', function() {
    it('Should load correct analysis version', function() {
        const pipelineVersion = '4.0';
        openPage(origPage + '?version=' + pipelineVersion);
        waitForPageLoad();
        cy.get('#analysisSelect').should('have.value', pipelineVersion);
        //    TODO add check that data matches pipeline version, not just selector
    });
    it('Should load first analysis version if no URL parameter', function() {
        const pipelineVersion = '2.0';
        openPage(origPage);
        waitForPageLoad();
        cy.get('#analysisSelect').should('have.value', pipelineVersion);
    });
});

describe('Run page - download tab', function() {
    beforeEach(function() {
        openPage(origPage);
        waitForPageLoad();
        changeTab('download');
    });

    it('Should display correct number of results', function() {
        cy.get('#download-list tbody > tr a', {timeout: 40000}).should('have.length', 149);
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
        cy.get('#download-list h3').should('have.length', 6).each(($el) => {
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

describe('Run page - charts', function() {
    it('QC chart should display correctly', function() {
        openPage('runs/ERR867655');
        waitForPageLoad();
        changeTab('qc');

        // Verify graph via tooltip values

        function hoverAndValidateTooltip(series, tooltipText1, tooltipText2) {
            cy.get(series).first().trigger('mouseover', {force: true}).then(() => {
                cy.get('svg g text').contains(tooltipText1);
                cy.get('svg g.highcharts-tooltip text').contains(tooltipText2);
            });
            cy.get(series).first().trigger('mouseout', {force: true});
        }

        const readsRemainingSeries = '.highcharts-series-group .highcharts-series-1 > .highcharts-point';
        // Initial reads
        const series1 = readsRemainingSeries + ':nth-child(1)';
        hoverAndValidateTooltip(series1, 'Initial reads', 'Reads remaining: 43 947');

        // Trimming
        const series2 = readsRemainingSeries + ':nth-child(2)';
        hoverAndValidateTooltip(series2, 'Trimming', 'Reads remaining: 43 933');

        // Length filtering
        const series3 = readsRemainingSeries + ':nth-child(3)';
        hoverAndValidateTooltip(series3, 'Length filtering', 'Reads remaining: 43 045');

        // Length filtering (reads filtered out)
        const filtered_out_series = '.highcharts-series-group .highcharts-series-0 > .highcharts-point:nth-child(3)';
        hoverAndValidateTooltip(filtered_out_series, 'Length filtering', 'Reads filtered out: 888');

        // Ambiguous base filtering
        const series4 = readsRemainingSeries + ':nth-child(4)';
        hoverAndValidateTooltip(series4, 'Ambiguous base filtering', 'Reads remaining: 43 045');

        // Reads subsampled for QC analysis
        const series5 = readsRemainingSeries + ':nth-child(5)';
        hoverAndValidateTooltip(series5, 'Reads subsampled for QC analysis', 'Reads remaining: 0');
    });
});

describe('Run page - Abundance tab', function() {
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
        cy.get('a[href=\'#abundance\']').
            should('have.attr', 'aria-selected', 'false').
            parent().
            should('not.have.class', 'is-active');
        cy.get('a[href=\'#overview\']').
            should('have.attr', 'aria-selected', 'true').
            parent().
            should('have.class', 'is-active');
    });
});

describe('Run page - Changing pipeline version', function() {
    it('Should not duplicate krona chart', function() {
        const kronaChartClass = '.krona_chart';
        openPage(origPage);
        waitForPageLoad();
        changeTab('taxonomic');
        changeTab('krona');
        cy.get(kronaChartClass).should('have.length', 1);

        selectAnalysis('V2.0');

        selectAnalysis('V4.0');
        cy.get(kronaChartClass).should('have.length', 1);
    });
});
// TODO check taxonomy request does not have LSU/SSU if pipeline version < 4.0
// TODO test version selector
// TODO test all download links are valid/organised correctly

// TODO test abundance graphic is loaded correctly

// TODO test specifying pipeline version by URL parameter


