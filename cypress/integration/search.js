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
    cy.get(rowSelector, {timeout: 10000}).should("have.length", parseInt(results));
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
    cy.wait('@' + facetName).its('url').should('include', 'size=1');
}

function waitForFacetQuery(facetName, testString) {
    cy.wait('@' + facetName).its('url').should('include', 'size=' + initialResultSize).should('include', 'query=' + encodeURIComponent(testString))
}

/**
 * Verify number of results responds to selector
 */

// const facetRequests = ['projectsSearch', 'samplesSearch', 'runsSearch'];
const facetRequests = ['samplesFacet', 'samplesQuery'];
describe('Search page', function () {
    it('Correct number of results.', function () {
        openPage(origPage);
        cy.wait(1000);
        cy.get('#pagesize').invoke('val').then((val) => {
            waitForResultsLoad(val);
            cy.get('#pagesize').select('50');
            waitForResultsLoad('50');
        });
    });
    beforeEach(function () {
        openPage(origPage);
        waitForResultsLoad(initialResultSize);
        cy.server();
        // cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_projects?*').as(facetRequests[0]);
        cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_samples?*size=1&*').as(facetRequests[0]);
        cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_samples?*size=10&*').as(facetRequests[1]);
        // cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_runs?*').as(facetRequests[2]);

    });

    // Text search should apply to all facets
    it('Text query should apply to all facets', function () {
        const testString = "Test";
        cy.get(textQueryInput).type(testString);
        cy.get(submitTextQuery).click();

        // Check requests includes testString correctly
        waitForFacetFilters(facetRequests[0]);
        waitForFacetQuery(facetRequests[1], encodeURIComponent(testString));
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

    it('Clear button should reset search completely', function(){
        cy.get('button.disp-children').first().click();
        cy.get("input[value='Environmental/Air']").check({force: true});
        cy.get("input[value='BGI']").check({force: true});
        waitForResultsLoad(1);
        cy.get("#search-reset").click();
        waitForResultsLoad(initialResultSize);
    });
});


