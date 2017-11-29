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


function assertTableIsCleared(){
    cy.get(rowSelector).should('not.exist');
}
function waitForResultsLoad(results){
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

/**
 * Verify number of results responds to selector
 */
describe('Search page', function() {
    // it('Correct number of results.', function() {
    //     openPage(origPage);
    //     cy.wait(1000);
    //     cy.get('#pagesize').invoke('val').then((val) => {
    //         waitForResultsLoad(val);
    //         cy.get('#pagesize').select('50');
    //         waitForResultsLoad('50');
    //     });
    // });
    beforeEach(function(){
        openPage(origPage);
        waitForResultsLoad(initialResultSize);

        cy.server();
        cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_projects?*').as('projectsSearch');
        cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_samples?*').as('samplesSearch');
        cy.route('https://wwwdev.ebi.ac.uk/ebisearch/ws/rest/metagenomics_runs?*').as('runsSearch');


    });

    // Text search should apply to all facets
    it('Text query should apply to all facets', function(){
        const testString = "Test";
        cy.get(textQueryInput).type(testString);
        cy.get(submitTextQuery).click();

        // Check requests includes testString correctly
        cy.wait('@projectsSearch').its('url').should('include', 'query='+encodeURIComponent(testString));

        cy.wait('@samplesSearch').its('url').should('include', 'query='+encodeURIComponent(testString));

        // cy.wait('@runsSearch').then((xhr) => {
        //     console.log(xhr);
        // }).its('url').should('include', 'query='+encodeURIComponent(testString));

        waitForResultsLoad(initialResultSize);

        // Test UI has correctly included queryString in search summary
        cy.get(projectsTabButton).click();
        cy.get("#projects").find(".columns > h5").then(($elem) => {
            expect($elem).to.contain(testString);
        });
        cy.get(samplesTabButton).click();
        cy.get("#samples").find(".columns > h5").then(($elem) => {
            expect($elem).to.contain(testString);
        });

        // Reset and check it has finished
        cy.get(resetTextQuery).click();
        cy.wait('@projectsSearch').its('url').should.not('include', 'query='+encodeURIComponent(testString));

        cy.wait('@samplesSearch').its('url').should.not('include', 'query='+encodeURIComponent(testString));

        waitForResultsLoad(initialResultSize);

        // Test UI has correctly included queryString in search summary
        cy.get(projectsTabButton).click();
        cy.get("#projects").find(".columns > h5").then(($elem) => {
            expect($elem).should('not.contain', testString);
        });
        cy.get(samplesTabButton).click();
        cy.get("#samples").find(".columns > h5").then(($elem) => {
            expect($elem).should('not.contain', testString);
        });



        // cy.get(runsTabButton).click();
        // cy.get("#runs").find(".columns > h5").then(($elem) => {
        //     expect($elem).to.contain(testString);
        // });
    });
    //



});


