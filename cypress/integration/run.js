import {openPage} from './util';

const origPage = 'runs/SRR035098';

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
    })
});


// TODO test pagination works
// TODO test URL params are correctly set on every filter/search operation
// TODO test clear button functions correctly

