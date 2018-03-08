import {openPage, waitForBiomesLoad, waitForStudiesLoad, assertTableIsCleared, stripWhitespace} from './util';

const origPage = 'biomes';
import Config from './config';
import GenericTableHandler from './genericTable';

const initialResultSize = 25;

describe('Biomes page', function () {
    function setSortBy(sortBySelector, numResults) {
        cy.get(sortBySelector).click();
        assertTableIsCleared();
        waitForBiomesLoad(numResults || initialResultSize);
    }

    beforeEach(function () {
        openPage(origPage);
        waitForBiomesLoad(initialResultSize);
    });

    it('Should have correct number of results.', function() {
        openPage(origPage);
        cy.wait(1000);
        cy.get('#pagesize').invoke('val').then((val) => {
            waitForBiomesLoad(val);
            cy.get('#pagesize').select('50');
            waitForBiomesLoad('50');
        });
    });


    it('Should respond to biome name alphabetical ordering', function(){
        const selector = "td.biome-name";

        setSortBy('th.biome-name');
        cy.get(selector).first().should(function($el){
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).to.be.gte(stripWhitespace($el.text().toLowerCase()));
        });

        setSortBy('th.biome-name');
        cy.get(selector).first().should(function($el){
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).to.be.lte(stripWhitespace($el.text().toLowerCase()));
        });
    });

    it('Should respond to num. samples ordering', function(){
            const selector = "td.samples_count";

            setSortBy('th.samples_count');
            cy.get(selector).first().should(function($el){
                expect(parseInt(stripWhitespace(Cypress.$(selector).last().text()))).to.be.gte(parseInt(stripWhitespace($el.text())));
            });

            setSortBy('th.samples_count');
            cy.get(selector).first().should(function($el){
                expect(parseInt(stripWhitespace(Cypress.$(selector).last().text()))).to.be.lte(parseInt(stripWhitespace($el.text())));
            });
    });

    // Assert result is different and ordering between first item in each page is correct
    it('Should respond to page change', function () {
        const pageSelector = '#pagination > ul > li:nth-child(4)'; // Second page button
        const selector = "td.samples_count";

        setSortBy('th.samples_count');
        cy.get(selector).first().then(function ($el) {
            cy.get(pageSelector).click();
            assertTableIsCleared();
            waitForBiomesLoad(initialResultSize);
            expect(parseInt(stripWhitespace(Cypress.$(selector).last().text()))).to.be.lte(parseInt(stripWhitespace($el.text())));
        });
    });

    it('Clicking on biome link should show only studies of that biome.', function () {
        openPage(origPage);
        cy.get('td.biome-name').first().find('span').then(($el) => {
            expect($el.text()).to.contain('root > Host-associated > Plants');
            cy.get('td.biome-name').first().find('a').click();
            let studiesTable = new GenericTableHandler('#studies-section', 25);
            cy.get('span.biome_icon').should('have.class', 'plant_host_b');
        });
    });
});


