import {openPage, waitForBiomesLoad, assertTableIsCleared, stripWhitespace} from './util';

const origPage = 'biomes';
import GenericTableHandler from './genericTable';

const initialResultSize = 25;

function setSortBy(sortBySelector, numResults) {
    cy.get(sortBySelector).click();
    assertTableIsCleared();
    waitForBiomesLoad(numResults || initialResultSize);
}

function checkTableOrderedBySampleCount(asc) {
    const selector = 'td.samples_count';

    cy.get(selector).first().should(function($el) {
        if (asc) {
            expect(parseInt(stripWhitespace(Cypress.$(selector).last().text()))).
                to.
                be.
                lte(parseInt(stripWhitespace($el.text())));
        } else {
            expect(parseInt(stripWhitespace(Cypress.$(selector).last().text()))).
                to.
                be.
                gte(parseInt(stripWhitespace($el.text())));
        }
    });
}

describe('Biomes page - General', function() {
    beforeEach(function() {
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
});

describe('Biomes page - Click actions', function() {
    beforeEach(function() {
        openPage(origPage);
        waitForBiomesLoad(initialResultSize);
    });
    it('Should respond to biome name alphabetical ordering', function() {
        const selector = 'td.biome-name';

        setSortBy('th.biome-name');
        cy.get(selector).first().should(function($el) {
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).
                to.
                be.
                gte(stripWhitespace($el.text().toLowerCase()));
        });

        setSortBy('th.biome-name');
        cy.get(selector).first().should(function($el) {
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).
                to.
                be.
                lte(stripWhitespace($el.text().toLowerCase()));
        });
    });

    it('Should respond to num. samples ordering', function() {
        setSortBy('th.samples_count');
        checkTableOrderedBySampleCount(false);

        setSortBy('th.samples_count');
        checkTableOrderedBySampleCount(true);
    });

    // Assert result is different and ordering between first item in each page is correct
    it('Should respond to page change', function() {
        const pageSelector = '#pagination > ul > li:nth-child(4)'; // Second page button
        const pageSelector2 = '#pagination > ul > li:nth-child(5)'; // Second page button
        const selector = 'td.biome-name';

        setSortBy('th.samples_count');
        cy.get(pageSelector).click();
        assertTableIsCleared();
        waitForBiomesLoad(initialResultSize);
        checkTableOrderedBySampleCount(false);
        cy.get(selector).first().then(($el) => {
            // Check ordering maintained on next page
            cy.get(pageSelector2).click();
            assertTableIsCleared();
            waitForBiomesLoad(initialResultSize);
            checkTableOrderedBySampleCount(false);
            // And check that a different element has appeared at the head of the table
            cy.get(selector).first().then(($el2) => {
                expect($el.text()).to.not.eq($el2.text());
            });
        });
    });
    it('Should respond to page size change', function() {
        waitForBiomesLoad(initialResultSize);
        const pageSize = 50;
        cy.get('#pagesize').select(pageSize.toString());
        waitForBiomesLoad(pageSize);
    });

    it('Clicking on biome link should show only studies of that biome.', function() {
        openPage(origPage);
        cy.get('td.biome-name').first().find('span').then(($el) => {
            expect($el.text()).to.contain('root > Host-associated > Plants');
            cy.get('td.biome-name').first().find('a').click();
            new GenericTableHandler('#studies-section', 25);
            cy.get('span.biome_icon').should('have.class', 'plant_host_b');
        });
    });

    // This may occur if race conditions are created by concurrent AJAX calls
    it('Successive ordering actions should not alter number of results displayed.', function() {
        cy.get('th.biome-name').click();
        cy.get('th.biome-name').click();
        waitForBiomesLoad(initialResultSize);
    });
});

describe('Biomes page - URL parameters', function() {
    it('Should order according to sample count', function() {
        openPage(origPage + '?ordering=samples_count');
        waitForBiomesLoad(initialResultSize);
        checkTableOrderedBySampleCount(false);

        openPage(origPage + '?ordering=-samples_count');
        waitForBiomesLoad(initialResultSize);
        checkTableOrderedBySampleCount(true);
    });

    it('Should order according to biome name', function() {
        const selector = 'td.biome-name';

        openPage(origPage + '?ordering=biome_name');
        waitForBiomesLoad(initialResultSize);

        cy.get(selector).first().should(function($el) {
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).
                to.
                be.
                gte(stripWhitespace($el.text().toLowerCase()));
        });

        openPage(origPage + '?ordering=-biome_name');
        waitForBiomesLoad(initialResultSize);

        cy.get(selector).first().should(function($el) {
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).
                to.
                be.
                lte(stripWhitespace($el.text().toLowerCase()));
        });
    });
});


