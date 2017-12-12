import {openPage} from './util';
const origPage = 'studies';

const initialResultSize = 25;

function assertTableIsCleared(){
    cy.get("table tr.study").should('not.exist');
}
function waitForStudiesLoad(results){
    cy.get("table tr.study", {timeout: 10000}).should("have.length", parseInt(results));
}

function setSortBy(sortBySelector){
    cy.get(sortBySelector).click();
    waitForStudiesLoad(initialResultSize);
}

function setSelectOption(selector, option, num_results){
    cy.get(selector).select(option);
    assertTableIsCleared();
    waitForStudiesLoad(num_results);
}

/**
 * Verify number of results responds to selector
 */
describe('Studies page', function() {
    // it('Correct number of results.', function() {
    //     openPage(origPage);
    //     cy.wait(1000);
    //     cy.get('#pagesize').invoke('val').then((val) => {
    //         waitForStudiesLoad(val);
    //         cy.get('#pagesize').select('50');
    //         waitForStudiesLoad('50');
    //     });
    // });
    beforeEach(function(){
        openPage(origPage);
        waitForStudiesLoad(initialResultSize);
    });

    it('Should respond to last-updated ordering', function(){
        const selector = "td.updated";

        setSortBy('th.updated');
        cy.get(selector).first().should(function($el){
            expect(new Date(Cypress.$(selector).last().text())).to.be.gte(new Date($el.text()));
        });

        setSortBy('th.updated');
        cy.get(selector).first().should(function($el){
            expect(new Date(Cypress.$(selector).last().text())).to.be.lte(new Date($el.text()));
        });
    });

    it('Should respond to study name ordering', function(){
        const selector = "td.name";

        setSortBy('th.name');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });

        setSortBy('th.name');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });
    });

    it('Should respond to num. samples ordering', function(){
        const selector = "td.samples";

        setSortBy('th.samples');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });

        setSortBy('th.samples');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });
    });

    it('Should respond to biome selector', function(){
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 2);
        cy.get('.biome-icon > span').should('have.class', 'air_b');

        biome = "root:Engineered:Biotransformation";
        setSelectOption(selector, biome, 7);
        cy.get('.biome-icon > span').should('have.class', 'engineered_b');
    });

    // Assert result is different and ordering between first item in each page is correct
    it('Should respond to page change', function(){
        const pageSelector = '#pagination > ul > li:nth-child(4)'; // Second page button
        const studyNameSelector = 'td.name';
        cy.get(studyNameSelector).first().then(function($el){
            const studyName = $el.text();
            cy.get(pageSelector).click();
            assertTableIsCleared();
            waitForStudiesLoad(initialResultSize);
            expect(Cypress.$(studyNameSelector).last().text()).to.be.gte(studyName);
        });

    });

});

// TODO test pagination works
// TODO test URL params are correctly set on every filter/search operation
// TODO test clear button functions correctly

