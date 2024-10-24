import {
    openPage,
    waitForSearchResults,
    setupDefaultSearchPageRouting
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = '';
const rowSelector = 'table tbody tr.vf-table__row';
const PAGE_SIZE = 25;

function goToSearchPage(subpage="") {
  openPage(origPage);
  cy.get(`#text-search-section`).trigger('click');
  cy.get(`#text-search-content-section a[href="/metagenomics/search${subpage}"]`).click();
}
conig
function interceptWithFilter(value, param, fixture, searchType = 'projects') {
    let filterString = `${param}:${value}`;
    cy.intercept('GET',
        `**/ebisearch/ws/rest/metagenomics_${searchType}?**${filterString}**`,
        {fixture: fixture}).as(`${param}Query${searchType}Fix${fixture}`);
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

function enterMultipleTextQueries(fieldName, queries, logicalOperator) {
    cy.get(`#${fieldName}-multi-query`).should('be.empty');

    // Type queries
    cy.get(`#${fieldName}-multi-query`).click();
    queries.forEach(query => {
        cy.get(`#${fieldName}-multi-query`).type(`${query}{enter}`);
    });

    // Check and set ANY/ALL switch
    cy.get(`#${fieldName}-logic-switch`).should('be.checked');
    cy.get(`#${fieldName}-logic-switch`).click();
    cy.get(`#${fieldName}-logic-switch`).should('not.be.checked');
    if (logicalOperator === 'AND') {
        cy.get(`#${fieldName}-logic-switch`).click();
        cy.get(`#${fieldName}-logic-switch`).should('be.checked');
    }
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
        cy.wait(1000);
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
              `**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**`,
              {fixture: 'search/analysesTestQuery'}).as(`testQueryAnalyses`);

            checkNumberOfResultsDecreaseAfterAction(()=>{
                cy.get('.mg-text-search-textfield').type('Test');
                cy.get('.mg-text-search').contains('Search').click();
            });
        });

        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            interceptWithFilter(biome, 'biome', 'search/projectsBiomeFilter', 'projects' );
            interceptWithFilter(biome, 'biome', 'search/analysesBiomeFilter', 'analyses' );
            testCheckboxNumberIsReflectedInTable(biome);
        });

        it('Biome expanded filters should restrict results', function() {
            const biome = 'Environmental/Aquatic';
            interceptWithFilter(biome, 'biome', 'search/projectsBiomeFilterMore', 'projects' );
            interceptWithFilter(biome, 'biome', 'search/analysesBiomeFilter', 'analyses' );
            cy.get(`.mg-expander`).first().click()
            testCheckboxNumberIsReflectedInTable(biome);
        });

        it('Centre name filters should restrict results', function() {
            const centerName = 'EMG';
            interceptWithFilter(centerName, 'centre_name', 'search/projectsCenterFilter');
            cy.get(`label[for='${centerName}']`).click();
            waitForSearchResults(rowSelector, PAGE_SIZE);
        });

        it('Clear button should reset search', function() {
            const biome = 'Environmental/Aquatic';
            interceptWithFilter(biome, 'biome', 'search/projectsBiomeFilterMore', 'projects' );
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
            cy.get(`.mg-search-tabs li`).contains('Sample analyses').click();
            cy.get('.vf-tabs__item .is-active').should('contain', 'Sample analyses');
            cy.get(`.mg-search-tabs li`).contains('Studies').click();
            cy.get('.vf-tabs__item .is-active').should('contain', 'Studies');
        });
    });

    context('Search Analyses Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            goToSearchPage("/analyses");
        });


        it('Correct number of results.', function() {
            cy.intercept('GET',
              `**/ebisearch/ws/rest/metagenomics_projects?**query=Test**`,
              {fixture: 'search/projectsTestQuery'}).as(`testQueryProjects`);

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
            interceptWithFilter(biome, 'biome', 'search/projectsBiomeFilter', 'projects' );
            interceptWithFilter(biome, 'biome', 'search/analysesBiomeFilter', 'analyses' );
            testCheckboxNumberIsReflectedInTable(biome);
        });
        it('Experiment type filters should restrict results', function() {
            const experimentType = 'amplicon';
            interceptWithFilter(experimentType, 'experiment_type', 'search/analysesExperimentTypeFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(experimentType);
        });
        it('Pipeline filters should restrict results', function() {
            const version = '2.0';
            interceptWithFilter(version, 'pipeline_version', 'search/analysesPipelineVersionFilter', 'analyses');
            testCheckboxNumberIsReflectedInTable(version);
        });
        it('GO filters should restrict results', function() {
            interceptWithFilter('0003677)', 'GO', 'search/analysesGoFiltered0003677', 'analyses');
            interceptWithFilter('0003677%20AND%20GO:0003678', 'GO', 'search/analysesGoFiltered0003677AND0003678', 'analyses');
            interceptWithFilter('0003677%20OR%20GO:0003678', 'GO', 'search/analysesGoFiltered0003677OR0003678', 'analyses');
            checkNumberOfResultsDecreaseAfterAction(()=> {
                enterMultipleTextQueries('go', ["GO:0003677", "GO:0003678"], 'OR');
            });
            checkNumberOfResultsDecreaseAfterAction(()=> {
                cy.get('#go-logic-switch').check();
            });

            interceptWithFilter('0003678)', 'GO', 'search/analysesGoFiltered0003677', 'analyses'); // not tested so using same fixture
        });
        it('INTERPRO filters should restrict results', function() {
            interceptWithFilter('IPR013785)', 'INTERPRO', 'search/analysesInterproFilteredIPR013785', 'analyses');
            interceptWithFilter('IPR013785%20AND%20INTERPRO:IPR013786', 'INTERPRO', 'search/analysesInterproFilteredIPR013785ANDIPR013786', 'analyses');
            interceptWithFilter('IPR013785%20OR%20INTERPRO:IPR013786', 'INTERPRO', 'search/analysesInterproFilteredIPR013785ORIPR013786', 'analyses');
            checkNumberOfResultsDecreaseAfterAction(()=> {
                enterMultipleTextQueries('inter-pro', ["IPR013785", "IPR013786"], 'OR');
            });
            checkNumberOfResultsDecreaseAfterAction(()=> {
                cy.get('#inter-pro-logic-switch').check();
            });

            interceptWithFilter('IPR013786)', 'INTERPRO', 'search/analysesInterproFilteredIPR013785', 'analyses');
        });
    });
});
