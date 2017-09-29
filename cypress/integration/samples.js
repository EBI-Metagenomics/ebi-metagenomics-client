import {openPage} from './util';
const origPage = 'samples';

const initialResultSize = 25;
const sortBySelector = '#sortBy';

function waitForSamplesLoad(results){
    cy.get("table tr.sample", {timeout: 10000}).should("have.length", parseInt(results));
}

function setSortBy(sortBySelector, optionVal){
    cy.get(sortBySelector).select(optionVal);
    waitForSamplesLoad(initialResultSize);
}

/**
 * Verify number of results responds to selector
 */
describe('Samples page', function() {
    // it('Correct number of results.', function() {
    //     openPage(origPage);
    //     cy.wait(1000);
    //     cy.get('#pagesize').invoke('val').then((val) => {
    //         waitForSamplesLoad(val);
    //         cy.get('#pagesize').select('50');
    //         waitForSamplesLoad('50');
    //     });
    // });
    beforeEach(function(){
        openPage(origPage);
        waitForSamplesLoad(initialResultSize);

    });

    it('Should respond to last-updated ordering', function(){
        const selector = "td.updated";

        setSortBy(sortBySelector, '-last_update');
        cy.get(selector).first().should(function($el){
            expect(new Date(Cypress.$(selector).last().text())).to.be.lte(new Date($el.text()));
        });

        setSortBy(sortBySelector, 'last_update');
        cy.get(selector).first().should(function($el){
            expect(new Date(Cypress.$(selector).last().text())).to.be.gte(new Date($el.text()));
        });
    });

    it('Should respond to study name ordering', function(){
        const selector = "td.sample-name";

        setSortBy(sortBySelector, '-sample_name');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });

        setSortBy(sortBySelector, 'sample_name');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });
    });

    it('Should respond to num. samples ordering', function(){
        const selector = "td.sample-id";

        setSortBy(sortBySelector, '-accession');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });

        setSortBy(sortBySelector, 'accession');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });
    });
});

// TODO test pagination works
// TODO test URL params are correctly set on every filter/search operation
// TODO test clear button functions correctly

