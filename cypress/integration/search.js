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



function routeWithTextQuery() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**query=Test**',
        'fixture:projectsTextQuery').as('textQueryProjects');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=Test**',
        'fixture:samplesTextQuery').as('textQuerySamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**',
        'fixture:analysesTextQuery').as('textQueryAnalyses');
}

function routeWithBiomeFilter(biome) {
    let biomeParam = 'biome:' + biome;
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**' + biomeParam + '**',
        'fixture:projectsBiomeFilter').as('biomeQueryProjects');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**' + biomeParam + '**',
        'fixture:samplesBiomeFilter').as('biomeQuerySamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**' + biomeParam + '**',
        'fixture:analysesBiomeFilter').as('biomeQueryAnalyses');
}

function routeWithCenterName(center) {
    let centerParam = 'centre_name:' + center;
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**' + centerParam + '**',
        'fixture:projectsCenterFilter').as('centerQueryProjects');
}

function testCheckboxNumberIsReflectedInTable(labelFor) {
    let facetCount = 0;
    cy.get(`label[for='${labelFor}'] .mg-number`)
        .invoke('text')
        .then((text) =>{
            facetCount=text;
            cy.get(`label[for='${labelFor}']`).click();
            waitForSearchResults(rowSelector, PAGE_SIZE);
            cy.get('.vf-table__caption').contains(facetCount)
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
    cy.get(`.vf-table__caption .mg-number`)
    .invoke('text')
    .then((text) =>{
        const count=Number(text);
        action();
        cy.wait(100);
        cy.get('.mg-table-overlay-container > .mg-table-overlay')
            .should('not.exist');
        
        cy.get('.vf-table__caption .mg-number')
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
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
        });


        it('Correct number of results.', function() {
            waitForSearchResults(rowSelector, PAGE_SIZE);
            checkNumberOfResultsDecreaseAfterAction(()=>{
                cy.get('.mg-text-search-textfield').type('Test');
                cy.get('.mg-text-search').contains('Search').click();        
            });
        });

        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            routeWithBiomeFilter(biome);
            testCheckboxNumberIsReflectedInTable(biome);
        });

        it('Biome expanded filters should restrict results', function() {
            const biome = 'Environmental/Air';
            routeWithBiomeFilter(biome);
            cy.get(`.mg-expander`).first().click()
            testCheckboxNumberIsReflectedInTable(biome);
        });

        it('Centre name filters should restrict results', function() {
            const centerName = 'EMG';
            routeWithCenterName(centerName);
            cy.get(`label[for='${centerName}']`).click();
            waitForSearchResults(rowSelector, PAGE_SIZE);
            cy.get('.mg-search-result tbody tr td:last-child').contains(centerName);
        });

        it('Clear button should reset search', function() {
            const biome = 'Environmental/Air';
            routeWithBiomeFilter(biome);
            cy.get(`.mg-expander`).first().click()
            const studyTable = new GenericTableHandler('.mg-search-result', PAGE_SIZE, false);
            cy.get(`label[for='${biome}']`).click();
            studyTable.waitForTableLoad(3);
        });
    });

    context('Clicking tabs should reflect on table', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
        });
        it('Changing tabs should update result view', function() {
            cy.get(`.mg-search-tabs li`).contains('Analyses').click();
            cy.get('.mg-search-result caption').should('contain', 'Analyses');
            cy.get(`.mg-search-tabs li`).contains('Samples').click();
            cy.get('.mg-search-result caption').should('contain', 'Samples');
            cy.get(`.mg-search-tabs li`).contains('Studies').click();
            cy.get('.mg-search-result caption').should('contain', 'Studies');
        });
    });

    context('Search Samples Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
            cy.get(`.mg-search-tabs li`).contains('Samples').click();
        });


        it('Correct number of results.', function() {
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

        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            routeWithBiomeFilter(biome);
            testCheckboxNumberIsReflectedInTable(biome);
        });
        it('Experiment type filters should restrict results', function() {
            const experimentType = 'amplicon';
            routeWithCenterName(experimentType);
            testCheckboxNumberIsReflectedInTable(experimentType);
        });
        it('sequencing method filters should restrict results', function() {
            const method = 'illumina';
            routeWithCenterName(method);
            testCheckboxNumberIsReflectedInTable(method);
        });
        it('Location name filters should restrict results', function() {
            const location = 'Canada';
            routeWithCenterName(location);
            testCheckboxNumberIsReflectedInTable(location);
        });
    });
    context('Search Analyses Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
            cy.get(`.mg-search-tabs li`).contains('Analyses').click();
        });


        it('Correct number of results.', function() {
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
            routeWithBiomeFilter(organism);
            testCheckboxNumberIsReflectedInTable(organism);
        });
        it('Biome filters should restrict results', function() {
            const biome = 'Environmental';
            routeWithBiomeFilter(biome);
            testCheckboxNumberIsReflectedInTable(biome);
        });
        it('Experiment type filters should restrict results', function() {
            const experimentType = 'amplicon';
            routeWithCenterName(experimentType);
            testCheckboxNumberIsReflectedInTable(experimentType);
        });
        it('Pipeline filters should restrict results', function() {
            const version = '4.1';
            routeWithCenterName(version);
            testCheckboxNumberIsReflectedInTable(version);
        });
        it('GO filters should restrict results', function() {
            const go = 'GO:0003677';
            routeWithCenterName(go);
            testCheckboxNumberIsReflectedInTable(go);
        });
        it('InterPro filters should restrict results', function() {
            const ipro = 'IPR013785';
            routeWithCenterName(ipro);
            testCheckboxNumberIsReflectedInTable(ipro);
        });
    });


    function setupDefaultSliderRouting() {
        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**-20**to**110**]**',
            'fixture:samplesTempSliderDefaultQuery').as('tempSliderSamples');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_analyses?**query=temperature:**[**-20**to**110**]**',
            'fixture:analysesTempSliderDefaultQuery').as('tempSliderAnalyses');
    }

});
