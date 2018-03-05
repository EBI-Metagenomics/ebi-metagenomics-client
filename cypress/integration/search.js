import {openPage} from './util';

const origPage = 'search';

const initialResultSize = 10;

const rowSelector = "table tr.search-row:visible";

const textQueryInput = "#navbar-query";
const submitTextQuery = "#search";
const resetTextQuery = "#search-reset";


const projectsTabButton = "a[href='#projectsTab']";
const samplesTabButton = "a[href='#samplesTab']";
const runsTabButton = "a[href='#runsTab']";


function assertTableIsCleared() {
    cy.get(rowSelector).should('not.exist');
}

function waitForResultsLoad(results) {
    cy.get(rowSelector, {timeout: 20000}).should("have.length", parseInt(results));
}

// function setSortBy(sortBySelector){
//     cy.get(sortBySelector).click();
//     assertTableIsCleared();
//     waitForResultsLoad(initialResultSize);
// }
//
// function setSelectOption(selector, option, num_results){
//     cy.get(selector).select(option);
//     assertTableIsCleared();
//     waitForResultsLoad(num_results);
// }

function waitForFacetFilters(facetName) {
    cy.wait('@' + facetName, {timeout: 20000}).its('url').should('include', 'size=1');
}

function validateFacetQuery(facetName, testString) {
    const timeout = 10000;
    if (testString) {
        cy.wait('@' + facetName, {timeout: timeout}).its('url').should('include', 'size=' + initialResultSize).should('include', 'query=' + encodeURIComponent(testString))
    } else {
        cy.wait('@' + facetName, {timeout: timeout}).its('url').should('include', 'size=' + initialResultSize)
    }
}

// const facetRequests = ['projectsSearch', 'samplesSearch', 'runsSearch'];
const facetRequests = ['projectsFacet', 'projectsQuery', 'samplesFacet', 'samplesQuery', 'runsFacet', 'runsQuery'];

function loadPage(page){
    cy.server();
    cy.route('/ebisearch/ws/rest/metagenomics_projects?*size=1&*').as(facetRequests[0]);
    cy.route('/ebisearch/ws/rest/metagenomics_projects?*size=10&*').as(facetRequests[1]);
    cy.route('/ebisearch/ws/rest/metagenomics_samples?*size=1&*').as(facetRequests[2]);
    cy.route('/ebisearch/ws/rest/metagenomics_samples?*size=10&*').as(facetRequests[3]);
    cy.route('/ebisearch/ws/rest/metagenomics_runs?*size=1&*').as(facetRequests[4]);
    cy.route('/ebisearch/ws/rest/metagenomics_runs?*size=10&*').as(facetRequests[5]);
    openPage(page);
    waitForResultsLoad(initialResultSize);
}

/**
 * Verify number of results responds to selector
 */

describe('Search page - generalFunctionality', function () {
    beforeEach(function () {
        loadPage(origPage);
    });

    // Text search should apply to all facets
    it('Text query should apply to all facets', function () {
        waitForFacetFilters(facetRequests[0]);
        validateFacetQuery(facetRequests[1]);
        waitForFacetFilters(facetRequests[2]);
        validateFacetQuery(facetRequests[3]);
        waitForFacetFilters(facetRequests[4]);
        validateFacetQuery(facetRequests[5]);

        const testString = "Test";
        cy.get(textQueryInput).type(testString);
        cy.get(submitTextQuery).click();

        // Check requests includes testString correctly
        validateFacetQuery(facetRequests[1], encodeURIComponent(testString));
        validateFacetQuery(facetRequests[3], encodeURIComponent(testString));
        validateFacetQuery(facetRequests[5], encodeURIComponent(testString));

    });

    it('Correct number of results.', function () {
        openPage(origPage);
        cy.wait(1000);
        cy.get('#pagesize').invoke('val').then((val) => {
            waitForResultsLoad(val);
            cy.get('#pagesize').select('50');
            waitForResultsLoad('50');
        });
    });

    it('Biome filters should restrict results', function () {
        cy.get('button.disp-children').first().click();
        cy.get("input[value='Environmental/Air']").check({force: true});
        waitForResultsLoad(2);
        cy.get("tbody > tr > td[data-column='project-biome']").contains('Air')
    });

    it('Centre name filters should restrict results', function () {
        cy.get("input[value='BioProject']").check({force: true});
        waitForResultsLoad(10);
        cy.get("tbody > tr > td[data-column='project-centre-name']").contains('BioProject')
    });

    it('Clear button should reset search completely', function () {
        cy.get('button.disp-children').first().click();
        cy.get("input[value='Environmental/Air']").check({force: true});
        cy.get("input[value='BGI']").check({force: true});
        waitForResultsLoad(1);
        cy.get("#search-reset").click();
        waitForResultsLoad(initialResultSize);
    });

    it('Should pre-fill cached search query', function () {
        waitForFacetFilters(facetRequests[0]);
        validateFacetQuery(facetRequests[1]);
        waitForFacetFilters(facetRequests[2]);
        validateFacetQuery(facetRequests[3]);
        waitForFacetFilters(facetRequests[4]);
        validateFacetQuery(facetRequests[5]);

        const testString = "Test";
        cy.get(textQueryInput).type(testString);
        cy.get(submitTextQuery).click();

        // Check requests includes testString correctly
        validateFacetQuery(facetRequests[1], encodeURIComponent(testString));
        validateFacetQuery(facetRequests[3], encodeURIComponent(testString));
        validateFacetQuery(facetRequests[5], encodeURIComponent(testString));

        // Navigate to another page, then return and verify string was pre-loaded
        openPage('');
        openPage(origPage);
        waitForFacetFilters(facetRequests[0]);
        validateFacetQuery(facetRequests[1]);
        waitForFacetFilters(facetRequests[2]);
        validateFacetQuery(facetRequests[3]);
        waitForFacetFilters(facetRequests[4]);
        validateFacetQuery(facetRequests[5]);
        waitForResultsLoad(initialResultSize);
        cy.get(textQueryInput).then(($input) => {
            cy.log($input);
        });
    });
});

describe('Search page - Deep linking', function () {
    it('Changing tabs should update result view', function () {
        loadPage(origPage+'#projects');
        cy.get('#projectsResults > div > div > h5').should('contain', 'projects');
        loadPage(origPage+'#samples');
        cy.get('#samplesResults > div > div > h5').should('contain', 'samples');
        loadPage(origPage+'#runs');
        cy.get('#runsResults > div > div > h5').should('contain', 'runs');
    });
});


