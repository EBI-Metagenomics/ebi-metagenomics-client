import {openPage} from './util';
import Config from './config';

const origPage = 'studies';

const initialResultSize = 25;

function assertTableIsCleared() {
    cy.get("table tr.study").should('not.exist');
}

function waitForStudiesLoad(results) {
    cy.get("table tr.study", {timeout: 10000}).should("have.length", parseInt(results));
}

function setSortBy(sortBySelector, numResults) {
    cy.get(sortBySelector).click();
    waitForStudiesLoad(numResults || initialResultSize);
}

function setSelectOption(selector, option, num_results) {
    cy.get(selector).select(option);
    assertTableIsCleared();
    waitForStudiesLoad(num_results);
}

/**
 * NOTE: text filtering is not yet tested as it operates on fields not returned by the API, therefore results can be deceiving
 */
describe('Studies page', function () {


    beforeEach(function () {
        openPage(origPage);
        waitForStudiesLoad(initialResultSize);
    });

    it('Should respond to last-updated ordering', function () {
        const selector = "td.updated";

        setSortBy('th.updated');
        cy.get(selector).first().should(function ($el) {
            expect(new Date(Cypress.$(selector).last().text())).to.be.gte(new Date($el.text()));
        });

        setSortBy('th.updated');
        cy.get(selector).first().should(function ($el) {
            expect(new Date(Cypress.$(selector).last().text())).to.be.lte(new Date($el.text()));
        });
    });

    it('Should respond to study name ordering', function () {
        const selector = "td.name";

        setSortBy('th.name');
        cy.get(selector).first().should(function ($el) {
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });

        setSortBy('th.name');
        cy.get(selector).first().should(function ($el) {
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });
    });

    it('Should respond to num. samples ordering', function () {
        const selector = "td.samples";

        setSortBy('th.samples');
        cy.get(selector).first().should(function ($el) {
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });

        setSortBy('th.samples');
        cy.get(selector).first().should(function ($el) {
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });
    });

    it('Should respond to biome selector', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 2);
        cy.get('.biome-icon > span').should('have.class', 'air_b');

        biome = "root:Engineered:Biotransformation";
        setSelectOption(selector, biome, 7);
        cy.get('.biome-icon > span').should('have.class', 'engineered_b');
    });

    // Assert result is different and ordering between first item in each page is correct
    it('Should respond to page change', function () {
        const pageSelector = '#pagination > ul > li:nth-child(4)'; // Second page button
        const studyDateSelector = 'td.updated';
        setSortBy('th.updated');
        cy.get(studyDateSelector).first().then(function ($el) {
            const studyDate = $el.text();
            cy.get(pageSelector).click();
            assertTableIsCleared();
            waitForStudiesLoad(initialResultSize);
            expect(new Date(Cypress.$(studyDateSelector).last().text())).to.be.lte(new Date(studyDate));
        });
    });

    it('Should pass text query as parameter to API', function () {
        const inputSelector = '#search-input';
        const searchQuery = 'abc';

        waitForStudiesLoad(initialResultSize);
        cy.server();
        cy.route({
            method: 'GET',
            url: Config.API_URL + 'studies*',
            onRequest: (xhr) => {
                expect(xhr.url).to.contain(encodeURIComponent(searchQuery));
            },
            response: []
        });
        cy.get(inputSelector).type(searchQuery);
    });

    it('Clicking clear button should remove filters', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 2);
        cy.get('.biome-icon > span').should('have.class', 'air_b');

        const clearButtonSelector = '#clear-filter';
        cy.get(clearButtonSelector).click();
        waitForStudiesLoad(initialResultSize);
        cy.get('.biome-icon > span').should('have.class', 'non_human_host_b');
    });

    it('Download link should change with changes in filtering or ordering', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 2);
        cy.get('.biome-icon > span').should('have.class', 'air_b');

        const downloadLinkSelector = '#download-results';
        cy.get(downloadLinkSelector).then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
        });

        const inputSelector = '#search-input';
        const searchQuery = 'windshield';
        cy.get(inputSelector).type(searchQuery);
        waitForStudiesLoad(1);

        cy.get(downloadLinkSelector).then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
            expect($el[0].href).to.include(encodeURIComponent(searchQuery));
        });

        const resultSelector = "td.samples";

        setSortBy('th.samples', 1);
        cy.get(resultSelector).first().should(function ($el) {
            expect(Cypress.$(resultSelector).last().text()).to.be.gte($el.text());
        });

        cy.get(downloadLinkSelector).then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
            expect($el[0].href).to.include(encodeURIComponent(searchQuery));
            expect($el[0].href).to.include(encodeURIComponent('samples_count'));
        });
    });

    it('Typing larger search query should cancel previous request.', function () {
        const inputSelector = '#search-input';
        const searchQuery = 'abc';

        waitForStudiesLoad(initialResultSize);
        cy.server();
        cy.route(Config.API_URL+'*').as('apiQuery');
        // Typing text incrementally causes multiple requests to be made, resulting in a results table concatenating the response of all requests
        cy.get(inputSelector).type(searchQuery[0]);
        cy.wait('@apiQuery');
        cy.get(inputSelector).type(searchQuery[1]);
        cy.wait('@apiQuery');
        cy.get(inputSelector).type(searchQuery[2]);
        cy.wait('@apiQuery');

        // Actual result set for query 'abc' should have size 1
        waitForStudiesLoad(1);
    });

});


