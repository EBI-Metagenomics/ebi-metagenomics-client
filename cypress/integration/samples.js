import {openPage, waitForSamplesLoad, assertTableIsCleared, stripWhitespace} from './util';

const origPage = 'samples';
import Config from './config';

const initialResultSize = 25;

describe('Samples page', function () {

    function setSortBy(sortBySelector, numResults) {
        cy.get(sortBySelector).click();
        assertTableIsCleared();
        waitForSamplesLoad(numResults || initialResultSize);
    }

    function setSelectOption(selector, option, num_results) {
        cy.get(selector).select(option);
        assertTableIsCleared();
        waitForSamplesLoad(num_results);
    }

    beforeEach(function () {
        openPage(origPage);
        waitForSamplesLoad(initialResultSize);
    });

    it('Should have correct number of results.', function() {
        openPage(origPage);
        cy.wait(1000);
        cy.get('#pagesize').invoke('val').then((val) => {
            waitForSamplesLoad(val);
            cy.get('#pagesize').select('50');
            waitForSamplesLoad('50');
        });
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
        const selector = "td.sample-name";

        setSortBy('th.sample-name');
        cy.get(selector).first().should(function($el){
            expect(stripWhitespace(Cypress.$(selector).last().text().toLowerCase())).to.be.gte(stripWhitespace($el.text().toLowerCase()));
        });

        setSortBy('th.sample-name');
        cy.get(selector).last().should(function($el){
            expect(stripWhitespace(Cypress.$(selector).first().text().toLowerCase())).to.be.gte(stripWhitespace($el.text().toLowerCase()));
        });
    });

    it('Should respond to num. samples ordering', function(){
        const selector = "td.sample-id";

        setSortBy('th.sample-id');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.gte($el.text());
        });

        setSortBy('th.sample-id');
        cy.get(selector).first().should(function($el){
            expect(Cypress.$(selector).last().text()).to.be.lte($el.text());
        });
    });
    // Assert result is different and ordering between first item in each page is correct
    it('Should respond to page change', function () {
        const pageSelector = '#pagination > ul > li:nth-child(4)'; // Second page button
        const sampleDateSelector = 'td.updated';
        setSortBy('th.updated');
        cy.get(sampleDateSelector).first().then(function ($el) {
            const sampleDate = $el.text();
            cy.get(pageSelector).click();
            assertTableIsCleared();
            waitForSamplesLoad(initialResultSize);
            expect(new Date(Cypress.$(sampleDateSelector).last().text())).to.be.lte(new Date(sampleDate));
        });
    });

    it('Should pass text query as parameter to API', function () {
        const inputSelector = '#search-input';
        const searchQuery = 'abc';

        waitForSamplesLoad(initialResultSize);
        cy.server();
        cy.route({
            method: 'GET',
            url: Config.API_URL + 'samples*',
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
        setSelectOption(selector, biome, 4);
        cy.get('.biome-icon > span').should('have.class', 'air_b');

        const clearButtonSelector = '#clear-filter';
        cy.get(clearButtonSelector).click();
        waitForSamplesLoad(initialResultSize);
        cy.get('.biome-icon > span').should('have.class', 'human_host_b');
    });

    it('Download link should change with changes in filtering or ordering', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 4);
        cy.get('.biome-icon > span').should('have.class', 'air_b');

        const downloadLinkSelector = '#download-results';
        cy.get(downloadLinkSelector).then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
        });

        const inputSelector = '#search-input';
        const searchQuery = 'windshield';
        cy.get(inputSelector).type(searchQuery);
        waitForSamplesLoad(2);

        cy.get(downloadLinkSelector).then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
            expect($el[0].href).to.include(encodeURIComponent(searchQuery));
        });

        const resultSelector = "td.sample-name";

        setSortBy('th.sample-name', 2);
        cy.get(resultSelector).first().should(function ($el) {
            expect(Cypress.$(resultSelector).last().text()).to.be.gte($el.text());
        });

        cy.get(downloadLinkSelector).then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
            expect($el[0].href).to.include(encodeURIComponent(searchQuery));
            expect($el[0].href).to.include(encodeURIComponent('sample_name'));
        });
    });
    it('Typing larger search query should cancel previous request.', function () {
        const inputSelector = '#search-input';
        const searchQuery = 'cone';

        waitForSamplesLoad(initialResultSize);
        cy.server();
        //TODO improve specificity of routing to avoid conflict with additional features
        cy.route('*/samples?*').as('apiQuery');
        // Typing text incrementally causes multiple requests to be made, resulting in a results table concatenating the response of all requests
        for(var i in searchQuery){
            cy.get(inputSelector).type(searchQuery[i]);
            cy.wait('@apiQuery');
        }
        // Actual result set for query 'cone' should have size 1
        waitForSamplesLoad(1);
    });
});

// TODO test pagination works
// TODO test URL params are correctly set on every filter/search operation
// TODO test clear button functions correctly

