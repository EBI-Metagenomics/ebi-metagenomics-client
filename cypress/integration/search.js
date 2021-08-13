import {
    openPage,
    changeTab,
    waitForSearchResults,
    setupDefaultSearchPageRouting
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = '';

const initialResultSize = 3;

const rowSelector = 'table tbody tr.vf-table__row';

const textQueryInput = '[data-cy=\'text-search-input\']';
const submitTextQuery = '[data-cy=\'text-search-submit\']';

const pageSizeSelect = '[data-cy=\'page-size-select\']';

const PAGE_SIZE = 25;

function loadPage(page) {
    openPage(page);
    waitForSearchResults(rowSelector, initialResultSize);
}

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
describe('Search page', function() {
    context.only('Search Study Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
        });


        it('Correct number of results.', function() {
            waitForSearchResults(rowSelector, PAGE_SIZE);
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

    context.only('Clicking tabs should reflect on table', function() {
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

    context.only('Search Samples Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
            cy.get(`.mg-search-tabs li`).contains('Samples').click();
        });


        it('Correct number of results.', function() {
            waitForSearchResults(rowSelector, PAGE_SIZE);
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
    context.only('Search Analyses Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            openPage(origPage);
            cy.get(`.mg-main-menu`).contains('Text search').click();
            cy.get(`.mg-search-tabs li`).contains('Analyses').click();
        });


        it('Correct number of results.', function() {
            waitForSearchResults(rowSelector, PAGE_SIZE);
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

    function setupFilteredSliderRoutingTyped() {
        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**40**to**88**]**',
            'fixture:samplesTempSliderTypedQuery').as('tempSliderFilteredSamples');

        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_analyses?**query=temperature:**[**40**to**88**]**',
            'fixture:analysesTempSliderTypedQuery').as('tempSliderFilteredAnalyses');
    }

    context('Sliders - ', function() {
        const samplesTempSwitchToggle = '[for=\'samplesTemperatureSwitch\']';
        const samplesTempSliderContainer = '#samplesFiltersTemperature';
        const samplesTempCheckbox = '#samplesTemperatureSwitch';
        const samplesTempSlider = samplesTempSliderContainer + ' > .ui-slider-range';
        const samplesDisabledQueryText = 'You searched for samples with no parameters.';

        const analysesTempSwitchToggle = '[for=\'analysesTemperatureSwitch\']';
        const analysesTempSliderContainer = '#analysesFiltersTemperature';
        const analysesTempCheckbox = '#analysesTemperatureSwitch';
        const analysesDisabledQueryText = 'You searched for analyses with no parameters.';

        beforeEach(function() {
            setupDefaultSearchPageRouting();
            setupDefaultSliderRouting();
            setupFilteredSliderRoutingTyped();
            loadPage(origPage + '#samples');
            initTableHandlers();
        });

        function getContainerTextInputs(container) {
            return cy.get(container).siblings('div.row').find('input');
        }

        function enableSlider(toggle, checkbox, container) {
            cy.get(toggle).click();
            cy.get(checkbox).should('be.checked');
            cy.get(container).should('not.have.class', 'ui-state-disabled');
            getContainerTextInputs(container).should('not.be.disabled');
        }

        function checkSliderDisabled(container, checkbox, query) {
            cy.get(checkbox).should('not.be.checked');
            cy.get(container).should('have.class', 'ui-state-disabled');
            cy.contains(query).should('exist');
            getContainerTextInputs(container).should('be.disabled');
        }

        function getInputText(container, minOrMax) {
            return cy.get(container).parent().find('input[data-' + minOrMax + ']');
        }

        function validateQueryFromInputs(container, query) {
            getInputText(container, 'min').then(($min) => {
                const minVal = $min.val();
                getInputText(container, 'max').then(($max) => {
                    cy.contains(query + minVal + ' TO ' + $max.val() + '].').should('be.visible');
                });
            });
        }

        it('Slider toggling should apply to other facets', function() {
            enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
            cy.contains('You searched for samples with temperature:[-20 TO 110].')
                .should('be.visible');

            changeTab('analyses');

            cy.contains('You searched for analyses with temperature:[-20 TO 110].')
                .should('be.visible');

            cy.get(analysesTempSwitchToggle).click();
            checkSliderDisabled(analysesTempSliderContainer, analysesTempCheckbox,
                analysesDisabledQueryText);

            changeTab('samples');
            checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox,
                samplesDisabledQueryText);
        });

        it('Slider value should propagate to other facets', function() {
            enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
            // setupFilteredSliderRouting();
            cy.get(samplesTempSlider).click(50, 5).click(100, 5);

            validateQueryFromInputs(samplesTempSliderContainer,
                'You searched for samples with temperature:[');
            changeTab('analyses');
            validateQueryFromInputs(analysesTempSliderContainer,
                'You searched for analyses with temperature:[');
        });

        it('Changing textbox value should change slider value', function() {
            const min = '40';
            const max = '88';
            enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);

            getInputText(samplesTempSliderContainer, 'min').clear().type(min);
            getInputText(samplesTempSliderContainer, 'max').clear().type(max).trigger('change');

            cy.contains('You searched for samples with temperature:[' + min + ' TO ' + max + '].');
            changeTab('analyses');
            cy.contains('You searched for analyses with temperature:[' + min + ' TO ' + max + '].');
        });
    });
});
