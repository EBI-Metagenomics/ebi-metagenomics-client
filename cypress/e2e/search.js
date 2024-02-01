import {
    openPage,
    changeTab,
    waitForSearchResults,
    setupDefaultSearchPageRouting
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = '';
const rowSelector = 'table tbody tr.vf-table__row';
const PAGE_SIZE = 25;


function goToSearchPage() {
    openPage(origPage);
    cy.get(`#text-search-section`).trigger('mouseover');
    cy.get(`#text-search-content-section a[href="/metagenomics/search"]`).click();
}

function routeWithTextQuery() {
    cy.intercept('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**query=Test**',
        {fixture: 'projectsTextQuery'}).as('textQueryProjects');

    cy.intercept('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=Test**',
        {fixture: 'samplesTextQuery'}).as('textQuerySamples');

    cy.intercept('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**',
        {fixture: 'analysesTextQuery'}).as('textQueryAnalyses');
}

function interceptWithBiomeFilter(biome) {
    let biomeParam = 'biome:' + biome;
    cy.intercept('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**' + biomeParam + '**',
        {fixture: 'search/projectsBiomeFilter.json'}).as('biomeQueryProjects');

    cy.intercept('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**' + biomeParam + '**',
        {fixture: 'search/samplesBiomeFilter.json'}).as('biomeQuerySamples');

    cy.intercept('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**' + biomeParam + '**',
        {fixture: 'search/analysesBiomeFilter.json'}).as('biomeQueryAnalyses');
}

function interceptWithFilter(value, param, fixture, searchType = 'projects') {
    let filterString = `${param}:${value}`;
    cy.intercept('GET',
        `**/ebisearch/ws/rest/metagenomics_${searchType}?**${filterString}**`,
        {fixture: fixture}).as(`${param}Query${searchType}`);
}

function testCheckboxNumberIsReflectedInTable(labelFor) {
    let facetCount = 0;
    cy.get(`label[for='${labelFor}'] .mg-number`)
        .invoke('text')
        .then((text) =>{
            facetCount=text;
            cy.get(`label[for='${labelFor}']`).click();
            waitForSearchResults(rowSelector, PAGE_SIZE);
            cy.get('.vf-tabs__item .is-active .mg-number').contains(facetCount)
        });
}

function testSliderFilter(selector) {
    cy.get(`${selector} input.original`).should('be.disabled');
    cy.get(`${selector} input.ghost`).should('be.disabled');
    cy.get(`${selector} .mg-switch`).click();
    cy.get(`${selector} input.original`).should('not.be.disabled');
    cy.get(`${selector} input.ghost`).should('not.be.disabled');
    // cy.get('.mg-temperature-filter input.original').as('range')
    //     .invoke('val', 25)
    //     .trigger('change'); // Doesn't work because the pointer-events: none 
    // TODO: maybe test with URL when nginx is well configured
}

function checkNumberOfResultsDecreaseAfterAction(action){
    cy.get(`.vf-tabs__item .is-active .mg-number`)
    .invoke('text')
    .then((text) =>{
        const count=Number(text);
        action();
        cy.wait(100);
        cy.get('.mg-loading-overlay-container > .mg-loading-overlay')
            .should('not.exist');
        
        cy.get('.vf-tabs__item .is-active .mg-number')
            .invoke('text')
            .then((text2) =>{
                const count2=Number(text2);
                assert.isTrue(count2<count, "The number of results should have decreased: ["+count2+"<"+count+"]")
            });
    });

}
describe('Search page', function() {
    context('Search Study Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            goToSearchPage();
        });

        it('Correct number of results.', function() {
            waitForSearchResults(rowSelector, PAGE_SIZE);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_projects?**query=Test**`,
              {fixture: 'search/projectsTestQuery'}).as(`testQueryProjects`);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_samples?**query=Test**`,
              {fixture: 'search/samplesTestQuery'}).as(`testQuerySamples`);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**`,
              {fixture: 'search/analysesTestQuery'}).as(`testQueryAnalyses`);

            checkNumberOfResultsDecreaseAfterAction(()=>{

                cy.get('.mg-text-search-textfield').type('Test');
                cy.get('.mg-text-search').contains('Search').click();
            });
        });

        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            interceptWithBiomeFilter(biome);
            testCheckboxNumberIsReflectedInTable(biome);
        });

        it.skip('Biome expanded filters should restrict results', function() {
            const biome = 'Environmental/Air';
            interceptWithBiomeFilter(biome);
            cy.get(`.mg-expander`).first().click()
            testCheckboxNumberIsReflectedInTable(biome);
        });

        it('Centre name filters should restrict results', function() {
            const centerName = 'EMG';
            interceptWithFilter(centerName, 'center_name', 'search/projectsCenterFilter');
            cy.get(`label[for='${centerName}']`).click();
            waitForSearchResults(rowSelector, PAGE_SIZE);
            cy.get('.mg-search-result tbody tr td:last-child').contains(centerName);
        });

        it('Clear button should reset search', function() {
            const biome = 'Environmental/Air';
            interceptWithBiomeFilter(biome);
            cy.get(`.mg-expander`).first().click()
            const studyTable = new GenericTableHandler('.mg-search-result', PAGE_SIZE, false);
            cy.get(`label[for='${biome}']`).click();
            studyTable.waitForTableLoad(25);
        });
    });

    context('Clicking tabs should reflect on table', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            goToSearchPage();
        });
        it('Changing tabs should update result view', function() {
            cy.get(`.mg-search-tabs li`).contains('Analyses').click();
            cy.get('.vf-tabs__item .is-active').should('contain', 'Analyses');
            cy.get(`.mg-search-tabs li`).contains('Samples').click();
            cy.get('.vf-tabs__item .is-active').should('contain', 'Samples');
            cy.get(`.mg-search-tabs li`).contains('Studies').click();
            cy.get('.vf-tabs__item .is-active').should('contain', 'Studies');
        });
    });

    context('Search Samples Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            goToSearchPage();
            cy.get(`.mg-search-tabs li`).contains('Samples').click();
        });


        it('Correct number of results.', function() {
            waitForSearchResults(rowSelector, PAGE_SIZE);
            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_projects?**query=Test**`,
              {fixture: 'search/projectsTestQuery'}).as(`testQueryProjects`);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_samples?**query=Test**`,
              {fixture: 'search/samplesTestQuery'}).as(`testQuerySamples`);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**`,
              {fixture: 'search/analysesTestQuery'}).as(`testQueryAnalyses`);

            checkNumberOfResultsDecreaseAfterAction(()=>{
                cy.get('.mg-text-search-textfield').type('Test');
                cy.get('.mg-text-search').contains('Search').click();        
            });
        });
        it('Temperature filter should work', function() {
            testSliderFilter('.mg-temperature-filter');
        });
        it('Depth filter should work', function() {
            testSliderFilter('.mg-depth-filter');
        });

        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            interceptWithBiomeFilter(biome);
            testCheckboxNumberIsReflectedInTable(biome);
        });
        it('Experiment type filters should restrict results', function() {
            const experimentType = 'amplicon';
            interceptWithFilter(experimentType, 'experiment_type', 'search/samplesExperimentTypeFilter', 'samples');
            interceptWithFilter(experimentType, 'experiment_type', 'search/analysesExperimentTypeFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(experimentType);
        });
        it('sequencing method filters should restrict results', function() {
            const method = 'illumina';
            interceptWithFilter(method, 'sequencing_method', 'search/samplesSequencingMethodFilter', 'samples');
            testCheckboxNumberIsReflectedInTable(method);
        });
        it('Location name filters should restrict results', function() {
            const location = 'Canada';
            interceptWithFilter(location, 'location_name', 'search/samplesLocationNameFilter', 'samples');
            testCheckboxNumberIsReflectedInTable(location);
        });
    });
    context('Search Analyses Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            goToSearchPage();
        });


        it('Correct number of results.', function() {
            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_projects?**query=Test**`,
              {fixture: 'search/projectsTestQuery'}).as(`testQueryProjects`);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_samples?**query=Test**`,
              {fixture: 'search/samplesTestQuery'}).as(`testQuerySamples`);

            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**`,
              {fixture: 'search/analysesTestQuery'}).as(`testQueryAnalyses`);

            waitForSearchResults(rowSelector, PAGE_SIZE);
            checkNumberOfResultsDecreaseAfterAction(()=>{
                cy.get('.mg-text-search-textfield').type('Test');
                cy.get('.mg-text-search').contains('Search').click();        
            });
        });
        it('Temperature filter should work', function() {
            testSliderFilter('.mg-temperature-filter');
        });
        it('Depth filter should work', function() {
            testSliderFilter('.mg-depth-filter');
        });
        it('Organism filters should restrict results', function() {
            const organism = 'Bacteria';
            interceptWithFilter(organism, 'organism', 'search/analysesOrganismFilter.json', 'analyses');
            testCheckboxNumberIsReflectedInTable(organism);
        });
        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            interceptWithBiomeFilter(biome);
            testCheckboxNumberIsReflectedInTable(biome);
        });
        it('Experiment type filters should restrict results', function() {
            const experimentType = 'amplicon';
            interceptWithFilter(experimentType, 'experiment_type', 'search/analysesExperimentTypeFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(experimentType);
        });
        it('Pipeline filters should restrict results', function() {
            const version = '4.1';
            interceptWithFilter(version, 'pipeline_version', 'search/analysesPipelineVersionFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(version);
        });
        it('GO filters should restrict results', function() {
            const go = 'GO:0003677';
            interceptWithFilter(go, 'GO', 'search/analysesGoFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(go);
        });
        it('InterPro filters should restrict results', function() {
            const ipro = 'IPR013785';
            interceptWithFilter(ipro, 'INTERPRO', 'search/analysesInterproFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(ipro);
        });
    });


    function setupDefaultSliderRouting() {
        cy.intercept('GET',
            '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**-20**to**110**]**',
            {fixture: 'samplesTempSliderDefaultQueyr'}).as('tempSliderSamples');

        cy.intercept('GET',
            '**/ebisearch/ws/rest/metagenomics_analyses?**query=temperature:**[**-20**to**110**]**',
            {fixture: 'analysesTempSliderDefaultQuery'}).as('tempSliderAnalyses');
    }

});
