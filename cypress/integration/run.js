import {openPage, changeTab} from './util';

const origPage = 'runs/ERR1022502';

function waitForPageLoad() {
    cy.get('#overview', {timeout: 20000}).children().should('have.length', 2)
}

function verifyTabIsVisible(tagId) {
    // Verify correct tab button is active
    cy.get("[href='" + tagId + "']").parent().should('have.class', 'is-active');
    // Verify tab content is active
    cy.get(tagId).should('have.class', 'active')
}

function openTab(tagId) {
    cy.get("[href='" + tagId + "']").parent().click()
}

/**
 * Verify number of results responds to selector
 */
// describe('Run page - general', function () {
//     it('Should display overview if no deeplink is provided', function () {
//         openPage(origPage);
//         waitForPageLoad();
//         verifyTabIsVisible('#overview')
//     });
//     it('Should only display available tabs', function () {
//         openPage(origPage);
//         waitForPageLoad();
//         verifyTabIsVisible('#overview');
//         // const tabs = ['#qc', '#functional', '#taxonomic', '#abundance', '#download', '#overview'];
//         const tabs = ['#qc', '#taxonomic', '#download', '#overview'];
//         for (var i in tabs) {
//             const tabId = tabs[i];
//             openTab(tabId);
//             verifyTabIsVisible(tabId);
//         }
//     });
//     it('Should display metadata if available', function(){
//         openPage('runs/ERR867946');
//         waitForPageLoad();
//         verifyTabIsVisible('#overview');
//         cy.contains('Study:').next().should('contain', 'ERP009703');
//         cy.contains('Sample:').next().should('contain', 'ERS667564');
//         cy.contains('Experiment type:').next().should('contain', 'amplicon');
//         cy.contains('Instrument model:').next().should('contain', 'Illumina MiSeq');
//         cy.contains('Instrument platform:').next().should('contain', 'ILLUMINA');
//     })
// });
//
//
// describe('Run page - url parameters', function () {
//     it('Should load correct analysis version', function () {
//         const pipeline_version = '4.0';
//         openPage(origPage + '?version=' + pipeline_version);
//         waitForPageLoad();
//         cy.get('#analysisSelect').should('have.value', pipeline_version);
//         //    TODO add check that data matches pipeline version, not just selector
//     });
//     it('Should load first analysis version if no URL parameter', function () {
//         const pipeline_version = '2.0';
//         openPage(origPage);
//         waitForPageLoad();
//         cy.get('#analysisSelect').should('have.value', pipeline_version);
//     });
// });

describe('Run page - download tab', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad();
        changeTab('download')
    });

    it('Should display correct number of results', function () {
        cy.get('#download-list tbody > tr').should('have.length', 149);
    });
    it('Should display download groups correctly', function(){
        const headers = ['Sequence data', 'Functional analysis', 'Taxonomic analysis', 'Taxonomic analysis SSU rRNA', 'Taxonomic analysis LSU rRNA', 'non-coding RNAs'];
        let i = 0;
        cy.get('#download-list h3').each(($el) =>{
            expect($el).to.contain(headers[i++]);
        });
    });

    it('Download links should be valid', function () {
        cy.get('#download-list a').first().then(($el) => {
            cy.request(Cypress.$($el).attr('href'));
        });
    });

});


// TODO test all download links are valid/organised correctly

// TODO test abundance graphic is loaded correctly

// TODO test tab disabling

// TODO test specifying pipeline version by URL parameter


