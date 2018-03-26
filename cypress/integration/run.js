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
describe('Run page', function () {
    it('Should display overview if no deeplink is provided', function () {
        openPage(origPage);
        waitForPageLoad();
        verifyTabIsVisible('#overview')
    });
    it('Should only display available tabs', function () {
        openPage(origPage);
        waitForPageLoad();
        verifyTabIsVisible('#overview');
        // const tabs = ['#qc', '#functional', '#taxonomic', '#abundance', '#download', '#overview'];
        const tabs = ['#qc', '#taxonomic', '#download', '#overview'];
        for (var i in tabs) {
            const tabId = tabs[i];
            openTab(tabId);
            verifyTabIsVisible(tabId);
        }
    });

});

describe('Run page - url parameters', function () {
    it('Should load correct analysis version', function () {
        const pipeline_version = '4.0';
        openPage(origPage + '?version=' + pipeline_version);
        waitForPageLoad();
        cy.get('#analysisSelect').then(($el) => {
            expect($el.val()).to.be.eq(pipeline_version);
        });
        //    TODO add check that data matches pipeline version, not just selector
    })
});

describe('Run page - download tab', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad();
        changeTab('#download')
    });

    it('Should display correct number of results', function () {

    })
});
// TODO test pagination works
// TODO test URL params are correctly set on every filter/search operation
// TODO test clear button functions correctly

