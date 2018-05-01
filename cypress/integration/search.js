import {openPage, changeTab, waitForSearchResults} from './util';
import GenericTableHandler from './genericTable';

const origPage = 'search';

const initialResultSize = 25;

const rowSelector = 'table tr.search-row:visible';

const textQueryInput = '[data-cy=\'text-search-input\']';
const submitTextQuery = '[data-cy=\'text-search-submit\']';

const pageSizeSelect = '[data-cy=\'page-size-select\']';

function loadPage(page) {
    openPage(page);
    waitForSearchResults(rowSelector, initialResultSize);
}

function setupDefaultRouting() {
    cy.server();
    // Basic page load
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?format=json&size=25&start=0&**facetcount=10&' +
        'facetsdepth=5&facets=&query=domain_source:metagenomics_projects',
        'fixture:projectsInitQuery.json').as('basicProjects');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?format=json&size=1&start=0&facetcount=10&' +
        'facetsdepth=3&query=domain_source:metagenomics_projects',
        'fixture:projectsInitFilters.json').as('basicProjectFilters');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?format=json&size=25&start=0&**facetcount=10&' +
        'facetsdepth=5&facets=&query=domain_source:metagenomics_samples',
        'fixture:samplesInitQuery.json').as('basicSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?format=json&size=1&start=0&facetcount=10&' +
        'facetsdepth=3&query=domain_source:metagenomics_samples',
        'fixture:samplesInitFilters.json').as('basicSampleFilters');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_runs?format=json&size=25&start=0&**facetcount=10&' +
        'facetsdepth=5&facets=&query=domain_source:metagenomics_runs',
        'fixture:runsInitQuery.json').as('basicRuns');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_runs?format=json&size=1&start=0&facetcount=10&' +
        'facetsdepth=3&query=domain_source:metagenomics_runs',
        'fixture:runsInitFilters.json').as('basicRunsFilters');
}

function routeWithTextQuery() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**query=Test**',
        'fixture:projectsTextQuery').as('textQueryProjects');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=Test**',
        'fixture:samplesTextQuery').as('textQuerySamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_runs?**query=Test**',
        'fixture:runsTextquery').as('textQueryRuns');
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
        '**/ebisearch/ws/rest/metagenomics_runs?**' + biomeParam + '**',
        'fixture:runsBiomeFilter').as('biomeQueryRuns');
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
let runTable;

function initTableHandlers() {
    studyTable = new GenericTableHandler('#projectsResults', 25, false);
    sampleTable = new GenericTableHandler('#samplesResults', 25, false);
    runTable = new GenericTableHandler('#runsResults', 25, false);
}

function testResultsAreFilteredByString() {
    routeWithTextQuery();
    const testString = 'Test';
    filterByText(testString);
    // Tables have hidden columns
    studyTable.checkRowData(0,
        ['PRJEB14421', 'ERP016063', 'Sediment', '', '', '', '', 'UNIVERSITY OF CAMBRIDGE']);
    sampleTable.checkRowData(0, ['ERS782466', 'ERP010900', 'Test Brassicae', 'Test Brassicae']);
    runTable.checkRowData(0, ['ERR950224', '3.0', 'ERS782466', 'ERP010900', 'amplicon']);
}

describe('Search page - general Functionality', function() {
    beforeEach(function() {
        setupDefaultRouting();
        loadPage(origPage);
        initTableHandlers();
    });

    it('Text query should apply to all facets', function() {
        testResultsAreFilteredByString();
    });

    it('Correct number of results.', function() {
        openPage(origPage);
        cy.wait(1000);
        cy.get(pageSizeSelect).invoke('val').then((val) => {
            waitForSearchResults(rowSelector, val);
            cy.get(pageSizeSelect).select('50');
            waitForSearchResults(rowSelector, 50);
        });
    });

    it('Biome filters should restrict results', function() {
        const biome = 'Environmental/Air';
        routeWithBiomeFilter(biome);
        cy.get('button.disp-children').first().click();
        cy.get('input[value=\'' + biome + '\']').check({force: true});
        waitForSearchResults(rowSelector, 2);
        cy.get(studyTable.getColumnSelector(2)).contains('Air');
    });

    it('Centre name filters should restrict results', function() {
        const centerName = 'BioProject';
        routeWithCenterName(centerName);
        cy.get('input[value=\'' + centerName + '\']').check({force: true});
        waitForSearchResults(rowSelector, 25);
        cy.get(studyTable.getColumnSelector(7)).contains(centerName);
        cy.get('tbody > tr > td[data-column=\'project-centre-name\']').contains(centerName);
    });

    it('Clear button should reset search', function() {
        const biome = 'Environmental/Air';
        routeWithBiomeFilter(biome);
        cy.get('button.disp-children').first().click();
        cy.get('input[value=\'' + biome + '\']').check({force: true});
        studyTable.waitForTableLoad(2);
        cy.get(studyTable.getColumnSelector(2)).contains('Air');
        cy.get('#search-reset').click();
        studyTable.waitForTableLoad(25);
    });

    it('Should pre-fill cached search query', function() {
        testResultsAreFilteredByString();
        // Navigate to another page, then return and verify string was pre-loaded
        openPage('');
        openPage(origPage);
        studyTable.waitForTableLoad(25);
        sampleTable.waitForTableLoad(25);
        runTable.waitForTableLoad(25);
        studyTable.checkRowData(0,
            ['PRJEB14421', 'ERP016063', 'Sediment', '', '', '', '', 'UNIVERSITY OF CAMBRIDGE']);
        sampleTable.checkRowData(0, ['ERS782466', 'ERP010900', 'Test Brassicae', 'Test Brassicae']);
        runTable.checkRowData(0, ['ERR950224', '3.0', 'ERS782466', 'ERP010900', 'amplicon']);
    });

    it('Pagination - double page change', function() {
        cy.route('**metagenomics_projects?**start=0**').as('fetchPage1');
        cy.route('**metagenomics_projects?**start=25**').as('fetchPage2');
        loadPage(origPage + '#projects');
        const firstPageFirstRowData = [
            'PRJEB4693',
            'ERP004004',
            'Host-associated',
            '',
            '',
            '',
            '',
            'UWEST'];
        studyTable.waitForTableLoad(25);
        studyTable.checkRowData(0,
            firstPageFirstRowData);

        cy.get('#projects-pagination > ul > li.page-item.next a').click({force: true});
        cy.wait('@fetchPage2');
        studyTable.checkRowData(0,
            ['PRJNA396275', 'SRP115612', 'Fecal', '', '', '', '', 'BioProject']);

        cy.get('#projects-pagination > ul > li.page-item.first a').click({force: true});
        cy.wait('@fetchPage1');
        studyTable.checkRowData(0,
            firstPageFirstRowData);
    });
});

describe('Search page - Display additional columns', function() {
    const projectsModal = 'projectsModal';
    const column = 'project-name';

    beforeEach(function() {
        setupDefaultRouting();
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
    beforeEach(function() {
        setupDefaultRouting();
    });
    it('Changing tabs should update result view', function() {
        loadPage(origPage + '#projects');
        cy.get('#projectsResults > div > div > h5').should('contain', 'projects');
        loadPage(origPage + '#samples');
        cy.get('#samplesResults > div > div > h5').should('contain', 'samples');
        loadPage(origPage + '#runs');
        cy.get('#runsResults > div > div > h5').should('contain', 'runs');
    });
});

function setupDefaultSliderRouting() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**-20**to**110**]**',
        'fixture:samplesTempSliderDefaultQuery').as('tempSliderSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_runs?**query=temperature:**[**-20**to**110**]**',
        'fixture:runsTempSliderDefaultQuery').as('tempSliderRuns');
}

function setupFilteredSliderRouting() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**-16**to**88**]**',
        'fixture:samplesTempSliderFilteredQuery').as('tempSliderFilteredSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_runs?**query=temperature:**[**-16**to**88**]**',
        'fixture:runsTempSliderFilteredQuery').as('tempSliderFilteredRuns');
}

function setupFilteredSliderRoutingTyped() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**40**to**88**]**',
        'fixture:samplesTempSliderTypedQuery').as('tempSliderFilteredSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_runs?**query=temperature:**[**40**to**88**]**',
        'fixture:runsTempSliderTypedQuery').as('tempSliderFilteredRuns');
}

function setupFilteredDepthSliderRouting() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=depth:*[*',
        'fixture:samplesDepthSliderQuery').as('tempSliderFilteredSamples');
}

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
        setupDefaultRouting();
        setupDefaultSliderRouting();
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
        setupFilteredSliderRouting();
        cy.get(samplesTempSlider).click(50, 5).click(100, 5);

        validateQueryFromInputs(samplesTempSliderContainer,
            'You searched for samples with temperature:[');
        changeTab('runs');
        validateQueryFromInputs(runsTempSliderContainer,
            'You searched for runs with temperature:[');
    });

    it('Depth slider should not affect temp slider', function() {
        setupFilteredDepthSliderRouting();
        const samplesDepthSwitchToggle = '[for=\'samplesDepthSwitch\']';
        const samplesDepthSliderContainer = '#samplesFiltersDepth';
        const samplesDepthCheckbox = '#samplesDepthSwitch';
        const samplesDepthSlider = samplesDepthSliderContainer + ' > .ui-slider-range';
        const runsDepthSliderContainer = '#runsFiltersDepth';

        checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox,
            'You searched for samples with no parameters.');
        sampleTable.checkRowData(1, [
            'SRS878823',
            'SRP056169',
            'S364.1.2',
            'Metagenome or environmental sample from unclassified sequences metagenome']);
        enableSlider(samplesDepthSwitchToggle, samplesDepthCheckbox, samplesDepthSliderContainer);
        const queryText = 'You searched for samples with depth:[0 TO 2000].';
        cy.contains(queryText).should('be.visible');
        cy.wait('@tempSliderFilteredSamples');
        sampleTable.checkRowData(1, [
            'ERS478766',
            'ERP006059',
            'Saliva98',
            'DonorA Saliva']);

        checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox, queryText);

        cy.get(samplesDepthSlider, {timeout: 40000}).click(50, 5).click(100, 5);
        validateQueryFromInputs(samplesDepthSliderContainer,
            'You searched for samples with depth:[');
        changeTab('runs');
        validateQueryFromInputs(runsDepthSliderContainer, 'You searched for runs with depth:[');
    });

    it('Changing textbox value should change slider value', function() {
        const min = '40';
        const max = '88';
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        setupFilteredSliderRoutingTyped();
        getInputText(samplesTempSliderContainer, 'min').clear().type(min).trigger('change');
        getInputText(samplesTempSliderContainer, 'max').clear().type(max).trigger('change');
        cy.contains('You searched for samples with temperature:[' + min + ' TO ' + max + '].');

        changeTab('runs');
        cy.contains('You searched for runs with temperature:[' + min + ' TO ' + max + '].');
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
