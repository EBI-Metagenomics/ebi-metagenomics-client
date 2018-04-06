import {openPage, changeTab} from './util';

const origPage = 'search';

const initialResultSize = 10;

const rowSelector = 'table tr.search-row:visible';

const textQueryInput = '[data-cy=\'text-search-input\']';
const submitTextQuery = '[data-cy=\'text-search-submit\']';

const pageSizeSelect = '[data-cy=\'page-size-select\']';

function waitForResultsLoad(results) {
    cy.get(rowSelector, {timeout: 20000}).should('have.length', parseInt(results));
}

function waitForFacetFilters(facetName) {
    cy.wait('@' + facetName, {timeout: 20000}).its('url').should('include', 'size=1');
}

function validateFacetQuery(facetName, testString) {
    const timeout = 10000;
    if (testString) {
        cy.wait('@' + facetName, {timeout}).
            its('url').
            should('include', 'size=' + initialResultSize).
            should('include', 'query=' + encodeURIComponent(testString));
    } else {
        cy.wait('@' + facetName, {timeout}).
            its('url').
            should('include', 'size=' + initialResultSize);
    }
}

const facetRequests = [
    'projectsFacet',
    'projectsQuery',
    'samplesFacet',
    'samplesQuery',
    'runsFacet',
    'runsQuery'];

function loadPage(page) {
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

function waitForAllFacets() {
    waitForFacetFilters(facetRequests[0]);
    waitForFacetFilters(facetRequests[2]);
    waitForFacetFilters(facetRequests[4]);

    validateFacetQuery(facetRequests[1]);
    validateFacetQuery(facetRequests[3]);
    validateFacetQuery(facetRequests[5]);
}

function filterByText(testString) {
    cy.get(textQueryInput).type(testString);
    cy.get(submitTextQuery).click();
}

function validatePropagation(testString) {
    validateFacetQuery(facetRequests[1], encodeURIComponent(testString));
    validateFacetQuery(facetRequests[3], encodeURIComponent(testString));
    validateFacetQuery(facetRequests[5], encodeURIComponent(testString));
}

/**
 * Verify number of results responds to selector
 */

describe('Search page - general Functionality', function() {
    beforeEach(function() {
        loadPage(origPage);
    });

    // Text search should apply to all facets
    it('Text query should apply to all facets', function() {
        waitForAllFacets();

        const testString = 'Test';
        filterByText(testString);
        validatePropagation(testString);
        // Check requests includes testString correctly
    });

    it('Correct number of results.', function() {
        openPage(origPage);
        cy.wait(1000);
        cy.get(pageSizeSelect).invoke('val').then((val) => {
            waitForResultsLoad(val);
            cy.get(pageSizeSelect).select('50');
            waitForResultsLoad(50);
        });
    });

    it('Biome filters should restrict results', function() {
        cy.get('button.disp-children').first().click();
        cy.get('input[value=\'Environmental/Air\']').check({force: true});
        waitForResultsLoad(2);
        cy.get('tbody > tr > td[data-column=\'project-biome\']').contains('Air');
    });

    it('Centre name filters should restrict results', function() {
        cy.get('input[value=\'BioProject\']').check({force: true});
        waitForResultsLoad(10);
        cy.get('tbody > tr > td[data-column=\'project-centre-name\']').contains('BioProject');
    });

    it('Clear button should reset search completely', function() {
        cy.get('button.disp-children').first().click();
        cy.get('input[value=\'Environmental/Air\']').check({force: true});
        cy.get('input[value=\'BGI\']').check({force: true});
        waitForResultsLoad(1);
        cy.get('#search-reset').click();
        waitForResultsLoad(initialResultSize);
    });

    it('Should pre-fill cached search query', function() {
        waitForAllFacets();

        const testString = 'Test';
        filterByText(testString);
        validatePropagation(testString);

        // Navigate to another page, then return and verify string was pre-loaded
        openPage('');
        openPage(origPage);
        waitForAllFacets();

        waitForResultsLoad(initialResultSize);
    });
    it('Pagination - double page change', function() {
        loadPage(origPage + '#runs');
        waitForAllFacets();

        cy.get('#projects-pagination > ul > li.page-item.next a').click({force: true});
        waitForResultsLoad(initialResultSize);
        cy.get('#projects-pagination > ul > li.page-item.first a').click({force: true});
        waitForResultsLoad(initialResultSize);
    });
});

describe('Search page - Display additional columns', function() {
    const projectsModal = 'projectsModal';
    const column = 'project-name';
    beforeEach(function() {
        loadPage(origPage + '#projects');
    });

    function openExtraColumnModal() {
        cy.get('a[data-open=\'' + projectsModal + '\']').click({force: true});
        cy.get('#' + projectsModal).should('be.visible');
    }

    function closeExtraColumnModal() {
        cy.get('#projectsModal button.close-button').click();
        cy.get('#' + projectsModal).should('be.hidden');
    }

    it('Modal should open for extra column selection', function() {
        openExtraColumnModal();
    });

    it('Added column should be visible', function() {
        cy.get('td[data-column=\'' + column + '\']').should('be.hidden');

        openExtraColumnModal();
        cy.get('input[data-column=\'' + column + '\']').check();
        closeExtraColumnModal();

        cy.get('td[data-column=\'' + column + '\']').should('be.visible');
    });

    it('Removed column should be hidden', function() {
        const column = 'project-biome';
        cy.get('td[data-column=\'' + column + '\']').should('be.visible');

        openExtraColumnModal();
        cy.get('input[data-column=\'' + column + '\']').uncheck();
        closeExtraColumnModal();

        cy.get('td[data-column=\'' + column + '\']').should('be.hidden');
    });
});

describe('Search page - Deep linking', function() {
    it('Changing tabs should update result view', function() {
        loadPage(origPage + '#projects');
        cy.get('#projectsResults > div > div > h5').should('contain', 'projects');
        loadPage(origPage + '#samples');
        cy.get('#samplesResults > div > div > h5').should('contain', 'samples');
        loadPage(origPage + '#runs');
        cy.get('#runsResults > div > div > h5').should('contain', 'runs');
    });
});

describe('Search page - Sliders - ', function() {
    const samplesTempSwitchToggle = '[for=\'samplesTemperatureSwitch\']';
    const samplesTempSliderContainer = '#samplesFiltersTemperature';
    const samplesTempCheckbox = '#samplesTemperatureSwitch';
    const samplesTempSlider = samplesTempSliderContainer + ' > .ui-slider-range';
    const samplesDisabledQueryText = 'You searched for samples with no parameters.';

    const runsTempSwitchToggle = '[for=\'runsTemperatureSwitch\']';
    const runsTempSliderContainer = '#runsFiltersTemperature';
    const runsTempCheckbox = '#runsTemperatureSwitch';
    const runsDisabledQueryText = 'You searched for runs with no parameters.';

    beforeEach(function() {
        loadPage(origPage + '#samples');
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

    it('Disabling slider switch should disable slider and remove filter', function() {
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        cy.contains('You searched for samples with temperature:[-20 TO 110].').should('be.visible');

        cy.get(samplesTempSwitchToggle).click();
        checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox,
            samplesDisabledQueryText);
    });

    it('Clicking filter button should should disable slider and remove filter', function() {
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        cy.contains('You searched for samples with temperature:[-20 TO 110].').should('be.visible');

        cy.get('#samples [data-facet=\'Temperature\'] button').click();
        checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox,
            samplesDisabledQueryText);
    });

    it('Slider toggling should apply to other facets', function() {
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        cy.contains('You searched for samples with temperature:[-20 TO 110].').should('be.visible');

        changeTab('runs');
        cy.contains('You searched for runs with temperature:[-20 TO 110].').should('be.visible');
        cy.get(runsTempSwitchToggle).click();
        checkSliderDisabled(runsTempSliderContainer, runsTempCheckbox, runsDisabledQueryText);

        changeTab('samples');
        checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox,
            samplesDisabledQueryText);
    });

    it('Slider value should propagate to other facets', function() {
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        cy.get(samplesTempSlider).click(50, 5).click(100, 5);

        validateQueryFromInputs(samplesTempSliderContainer,
            'You searched for samples with temperature:[');
        changeTab('runs');
        validateQueryFromInputs(runsTempSliderContainer,
            'You searched for runs with temperature:[');
    });

    it('Depth slider should not affect temp slider', function() {
        const samplesDepthSwitchToggle = '[for=\'samplesDepthSwitch\']';
        const samplesDepthSliderContainer = '#samplesFiltersDepth';
        const samplesDepthCheckbox = '#samplesDepthSwitch';
        const samplesDepthSlider = samplesDepthSliderContainer + ' > .ui-slider-range';
        const runsDepthSliderContainer = '#runsFiltersDepth';

        enableSlider(samplesDepthSwitchToggle, samplesDepthCheckbox, samplesDepthSliderContainer);
        const queryText = 'You searched for samples with depth:[0 TO 2000].';
        cy.contains(queryText).should('be.visible');

        checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox, queryText);

        cy.get(samplesDepthSlider).click(50, 5).click(100, 5);
        validateQueryFromInputs(samplesDepthSliderContainer,
            'You searched for samples with depth:[');
        changeTab('runs');
        validateQueryFromInputs(runsDepthSliderContainer, 'You searched for runs with depth:[');
    });

    it('Changing textbox value should change slider value', function() {
        const minVal = '20';
        const maxVal = '40';
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        getInputText(samplesTempSliderContainer, 'min').clear().type(minVal).trigger('change');
        getInputText(samplesTempSliderContainer, 'max').clear().type(maxVal).trigger('change');
        cy.contains('You searched for samples with temperature:[' + minVal + ' TO ' + maxVal +
            '].').should('be.visible');

        changeTab('runs');
        cy.contains('You searched for runs with temperature:[' + minVal + ' TO ' + maxVal + '].').
            should('be.visible');
    });
});
// describe("Search page - CSV fetching", function () {
//     it("Download csv button should be disabled after click", function () {
//         loadPage(origPage + "#projects");
//         cy.get("#projectsResults button[name="download"]").click()
// .should("have.attr", "disabled");
//     });
// //    TODO avoid download dialog box
// });
