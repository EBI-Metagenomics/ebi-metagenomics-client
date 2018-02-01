import {openPage} from './util';
const origPage = 'run/ERR771103';

//
// function assertTableIsCleared(){
//     cy.get("table tr.sample").should('not.exist');
// }
// function waitForSamplesLoad(results){
//     cy.get("table tr.sample", {timeout: 10000}).should("have.length", parseInt(results));
// }

// function setSortBy(sortBySelector){
//     cy.get(sortBySelector).click();
//     assertTableIsCleared();
//     waitForSamplesLoad(initialResultSize);
// }
//
// function setSelectOption(selector, option, num_results){
//     cy.get(selector).select(option);
//     assertTableIsCleared();
//     waitForSamplesLoad(num_results);
// }

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
    //
    // it('Should respond to last-updated ordering', function(){
    //     const selector = "td.updated";
    //
    //     setSortBy('th.updated');
    //     cy.get(selector).first().should(function($el){
    //         expect(new Date(Cypress.$(selector).last().text())).to.be.gte(new Date($el.text()));
    //     });
    //
    //     setSortBy('th.updated');
    //     cy.get(selector).first().should(function($el){
    //         expect(new Date(Cypress.$(selector).last().text())).to.be.lte(new Date($el.text()));
    //     });
    // });
    //
    // it('Should respond to study name ordering', function(){
    //     const selector = "td.sample-name";
    //
    //     setSortBy('th.sample-name');
    //     cy.get(selector).first().should(function($el){
    //         expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
    //     });
    //
    //     setSortBy('th.sample-name');
    //     cy.get(selector).first().should(function($el){
    //         expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
    //     });
    // });
    //
    // it('Should respond to num. samples ordering', function(){
    //     const selector = "td.sample-id";
    //
    //     setSortBy('th.sample-id');
    //     cy.get(selector).first().should(function($el){
    //         expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
    //     });
    //
    //     setSortBy('th.sample-id');
    //     cy.get(selector).first().should(function($el){
    //         expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
    //     });
    // });

    it('Should respond to biome selector', function(){
        const selector = "#biome-select";
        let biome = "root:Engineered";
        setSelectOption(selector, biome, initialResultSize);
        cy.get('.biome-icon > span').should('have.class', 'engineered_b');

        biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 4);
        cy.get('.biome-icon > span').should('have.class', 'air_b');
    });
});

// TODO test pagination works
// TODO test URL params are correctly set on every filter/search operation
// TODO test clear button functions correctly

