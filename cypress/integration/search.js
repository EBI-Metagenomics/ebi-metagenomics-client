import {
    openPage,
    changeTab,
    waitForSearchResults,
    setupDefaultSearchPageRouting
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = 'search';

const initialResultSize = 3;

const rowSelector = 'table tr.search-row:visible';

const textQueryInput = '[data-cy=\'text-search-input\']';
const submitTextQuery = '[data-cy=\'text-search-submit\']';

const pageSizeSelect = '[data-cy=\'page-size-select\']';

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

function filterByText(testString) {
    cy.get(textQueryInput).type(testString);
    cy.get(submitTextQuery).click();
}

/**
 * Verify number of results responds to selector
 */

let studyTable;
let sampleTable;
let analysisTable;

function initTableHandlers() {
    studyTable = new GenericTableHandler('#projectsResults', 3, false);
    sampleTable = new GenericTableHandler('#samplesResults', 3, false);
    analysisTable = new GenericTableHandler('#analysesResults', 3, false);
}

function testResultsAreFilteredByString() {
    routeWithTextQuery();
    const testString = 'Test';
    filterByText(testString);
    // Tables have hidden columns
    studyTable.checkRowData(0,
        ['MGYS00001105', 'PRJEB14421', 'Sediment', '', '', '', '', 'UNIVERSITY OF CAMBRIDGE']);
    changeTab('samples');
    sampleTable.checkRowData(0, ['ERS782465', 'MGYS00001332', 'Test Brassicae', 'Test Brassicae']);
    changeTab('analyses');
    analysisTable.checkRowData(0,
        ['MGYA00087095', '3.0', 'ERS782465', 'MGYS00001332', 'amplicon', '', '', '']);
}

describe('Search page', function() {
    context('general Functionality', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
            loadPage(origPage);
            initTableHandlers();
        });

        it('Text query should apply to all facets', function() {
            testResultsAreFilteredByString();
        });

        it('Correct number of results.', function() {
            openPage(origPage);
            cy.wait(1000);
            cy.get(pageSizeSelect).select('50');
            waitForSearchResults(rowSelector, 50);
        });

        it('Biome filters should restrict results', function() {
            const biome = 'Environmental/Air';
            routeWithBiomeFilter(biome);
            cy.get('.toggle-tree-node').first().click();
            cy.get('input[value="biome/' + biome + '"]').check({force: true});
            waitForSearchResults(rowSelector, 2);
            cy.get(studyTable.getColumnSelector(2)).contains('Air');
        });

        it('Centre name filters should restrict results', function() {
            const centerName = 'BioProject';
            routeWithCenterName(centerName);
            cy.get('input[value="centre_name/BioProject"]').check({force: true});
            waitForSearchResults(rowSelector, 25);
            cy.get(studyTable.getColumnSelector(7)).contains(centerName);
            cy.get('tbody > tr > td[data-column=\'project-centre-name\']').contains(centerName);
        });

        it('Clear button should reset search', function() {
            const biome = 'Environmental/Air';
            routeWithBiomeFilter(biome);
            cy.get('.toggle-tree-node').first().click();
            cy.get('input[value="biome/' + biome + '"]').check({force: true});
            studyTable.waitForTableLoad(2);
            cy.get(studyTable.getColumnSelector(2)).contains('Air');
            cy.get('#search-reset').click();
            studyTable.waitForTableLoad(3);
        });

        // it('Should pre-fill cached search query', function() {
            // FIXME: this has to be fixed with the querystring parameters feature
            //     testResultsAreFilteredByString();
            //     // Navigate to another page, then return and verify string was pre-loaded
            //     openPage('');
            //     openPage(origPage);
            //     studyTable.waitForTableLoad(25);
            //     sampleTable.waitForTableLoad(25);
            //     analysisTable.waitForTableLoad(25);
            //     studyTable.checkRowData(0,
            //         [
            //             'MGYS00001105',
            //             'PRJEB14421',
            //             'Sediment',
            //             '',
            //             '',
            //             '',
            //             '',
            //             'UNIVERSITY OF CAMBRIDGE']);
            //     changeTab('samples');
            //     sampleTable.checkRowData(0,
            //         ['ERS782465', 'MGYS00001332', 'Test Brassicae', 'Test Brassicae']);
            //     changeTab('analyses');
            //     analysisTable.checkRowData(0,
            //         ['MGYA00087095', '3.0', 'ERS782465', 'MGYS00001332', 'amplicon', '', '', '']);
        // });
    });

    context('Navigate hierarchy', function() {
        // FIXME: implement
    });

    context('Filter facet list', function() {
        // FIXME: implement
    });

    context('Deep linking', function() {
        beforeEach(function() {
            setupDefaultSearchPageRouting();
        });
        it('Changing tabs should update result view', function() {
            loadPage(origPage + '#projects');
            cy.get('#projectsResults > div > div > h5').should('contain', 'studies');
            loadPage(origPage + '#samples');
            cy.get('#samplesResults > div > div > h5').should('contain', 'samples');
            loadPage(origPage + '#analyses');
            cy.get('#analysesResults > div > div > h5').should('contain', 'analyses');
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
