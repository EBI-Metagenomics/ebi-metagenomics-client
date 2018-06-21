import {openPage, changeTab, waitForSearchResults, setupDefaultSearchPageRouting} from './util';
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

function routeWithTextQuery() {
    // cy.route('GET',
    //     '**/ebisearch/ws/rest/metagenomics_projects?**query=Test**',
    //     'fixture:projectsTextQuery').as('textQueryProjects');
    //
    // cy.route('GET',
    //     '**/ebisearch/ws/rest/metagenomics_samples?**query=Test**',
    //     'fixture:samplesTextQuery').as('textQuerySamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**query=Test**',
        'fixture:analysesTextQuery').as('textQueryAnalyses');
}

function routeWithBiomeFilter(biome) {
    let biomeParam = 'biome:' + biome;
    // cy.route('GET',
    //     '**/ebisearch/ws/rest/metagenomics_projects?**' + biomeParam + '**',
    //     'fixture:projectsBiomeFilter').as('biomeQueryProjects');
    //
    // cy.route('GET',
    //     '**/ebisearch/ws/rest/metagenomics_samples?**' + biomeParam + '**',
    //     'fixture:samplesBiomeFilter').as('biomeQuerySamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**' + biomeParam + '**',
        'fixture:analysesBiomeFilter').as('biomeQueryAnalyses');
}

function routeWithCenterName(center) {
    let centerParam = 'centre_name:' + center;
    // cy.route('GET',
    //     '**/ebisearch/ws/rest/metagenomics_projects?**' + centerParam + '**',
    //     'fixture:projectsCenterFilter').as('centerQueryProjects');
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
    studyTable = new GenericTableHandler('#projectsResults', 25, false);
    sampleTable = new GenericTableHandler('#samplesResults', 25, false);
    analysisTable = new GenericTableHandler('#analysesResults', 25, false);
}

function testResultsAreFilteredByString() {
    // routeWithTextQuery();
    //TODO reimplement routing with updated EBI SEARCH responses
    const testString = 'Test';
    filterByText(testString);
    // Tables have hidden columns
    studyTable.checkRowData(0,
        ['MGYS00001105', 'PRJEB14421', 'Sediment', '', '', '', '', 'UNIVERSITY OF CAMBRIDGE']);
    changeTab('samples');
    sampleTable.checkRowData(0, ['ERS782465', 'MGYS00001332', 'Test Brassicae', 'Test Brassicae']);
    changeTab('analyses');
    analysisTable.checkRowData(0, ['MGYA00087095', '3.0', 'ERS782465', 'MGYS00001332', 'amplicon', '', '', '']);
}

describe('Search page - general Functionality', function() {
    beforeEach(function() {
        // setupDefaultSearchPageRouting();
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
        // routeWithBiomeFilter(biome);
        cy.get('button.disp-children').first().click();
        cy.get('input[value=\'' + biome + '\']').check({force: true});
        waitForSearchResults(rowSelector, 2);
        cy.get(studyTable.getColumnSelector(2)).contains('Air');
    });

    it('Centre name filters should restrict results', function() {
        const centerName = 'BioProject';
        // routeWithCenterName(centerName);
        cy.get('input[value=\'' + centerName + '\']').check({force: true});
        waitForSearchResults(rowSelector, 25);
        cy.get(studyTable.getColumnSelector(7)).contains(centerName);
        cy.get('tbody > tr > td[data-column=\'project-centre-name\']').contains(centerName);
    });

    it('Clear button should reset search', function() {
        const biome = 'Environmental/Air';
        // routeWithBiomeFilter(biome);
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
        analysisTable.waitForTableLoad(25);
        studyTable.checkRowData(0,
            ['MGYS00001105', 'PRJEB14421', 'Sediment', '', '', '', '', 'UNIVERSITY OF CAMBRIDGE']);
        changeTab('samples');
        sampleTable.checkRowData(0, ['ERS782465', 'MGYS00001332', 'Test Brassicae', 'Test Brassicae']);
        changeTab('analyses');
        analysisTable.checkRowData(0, ['MGYA00087095', '3.0', 'ERS782465', 'MGYS00001332', 'amplicon', '', '', '']);
    });

    // it('Pagination - double page change', function() {
    //     // cy.route('**metagenomics_projects?**start=0**', 'fixture:projectsInitQuery')
    //     //     .as('fetchPage1');
    //     // cy.route('**metagenomics_projects?**start=25**', 'fixture:projectsInitQueryPage2')
    //     //     .as('fetchPage2');
    //     loadPage(origPage + '#projects');
    //     const firstPageFirstRowData = [
    //         'PRJNA46321','MGYS00000277','Fecal',
    //         '',
    //         '',
    //         '',
    //         '',
    //         'NIDDK'];
    //     studyTable.waitForTableLoad(25);
    //     studyTable.checkRowData(0,
    //         firstPageFirstRowData);
    //
    //     cy.get('#projects-pagination > ul > li.page-item.next a').click({force: true});
    //     cy.wait('@fetchPage2');
    //     studyTable.checkRowData(0,
    //         ['PRJEB9856','MGYS00001760','Cecum','','','','COPENHAGEN UNIVERSITY']);
    //
    //     cy.get('#projects-pagination > ul > li.page-item.first a').click({force: true});
    //     cy.wait('@fetchPage1');
    //     studyTable.checkRowData(0,
    //         firstPageFirstRowData);
    // });
});

describe('Search page - Display additional columns', function() {
    const projectsModal = 'projectsModal';
    const column = 'project-name';

    beforeEach(function() {
        // setupDefaultSearchPageRouting();
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
    // setupDefaultSearchPageRouting();
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

function setupFilteredSliderRouting() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**-16**to**88**]**',
        'fixture:samplesTempSliderFilteredQuery').as('tempSliderFilteredSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**query=temperature:**[**-16**to**88**]**',
        'fixture:analysesTempSliderFilteredQuery').as('tempSliderFilteredAnalyses');
}

function setupFilteredSliderRoutingTyped() {
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?**query=temperature:**[**40**to**88**]**',
        'fixture:samplesTempSliderTypedQuery').as('tempSliderFilteredSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?**query=temperature:**[**40**to**88**]**',
        'fixture:analysesTempSliderTypedQuery').as('tempSliderFilteredAnalyses');
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

    const analysesTempSwitchToggle = '[for=\'analysesTemperatureSwitch\']';
    const analysesTempSliderContainer = '#analysesFiltersTemperature';
    const analysesTempCheckbox = '#analysesTemperatureSwitch';
    const analysesDisabledQueryText = 'You searched for analyses with no parameters.';

    beforeEach(function() {
        // setupDefaultSearchPageRouting();
        // setupDefaultSliderRouting();
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

    // it('Depth slider should not affect temp slider', function() {
    //     // setupFilteredDepthSliderRouting();
    //     const samplesDepthSwitchToggle = '[for=\'samplesDepthSwitch\']';
    //     const samplesDepthSliderContainer = '#samplesFiltersDepth';
    //     const samplesDepthCheckbox = '#samplesDepthSwitch';
    //     const samplesDepthSlider = samplesDepthSliderContainer + ' > .ui-slider-range';
    //     const analysesDepthSliderContainer = '#analysesFiltersDepth';
    //
    //     checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox,
    //         'You searched for samples with no parameters.');
    //     sampleTable.checkRowData(1, [
    //         'SRS878823',
    //         'MGYS00000936',
    //         'S364.1.2',
    //         'Metagenome or environmental sample from unclassified sequences metagenome']);
    //     enableSlider(samplesDepthSwitchToggle, samplesDepthCheckbox, samplesDepthSliderContainer);
    //     const queryText = 'You searched for samples with depth:[0 TO 2000].';
    //     cy.contains(queryText).should('be.visible');
    //     // cy.wait('@tempSliderFilteredSamples');
    //     sampleTable.checkRowData(1, [
    //         'ERS549102',
    //         'MGYS00001357',
    //         'Lu-1_2_fun',
    //         'Lu-1_2']);
    //
    //     checkSliderDisabled(samplesTempSliderContainer, samplesTempCheckbox, queryText);
    //
    //     cy.get(samplesDepthSlider, {timeout: 40000}).click(50, 5).click(100, 5);
    //     validateQueryFromInputs(samplesDepthSliderContainer,
    //         'You searched for samples with depth:[');
    //     changeTab('analyses');
    //     validateQueryFromInputs(analysesDepthSliderContainer,
    //         'You searched for analyses with depth:[');
    // });

    it('Changing textbox value should change slider value', function() {
        const min = '40';
        const max = '88';
        enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
        // setupFilteredSliderRoutingTyped();
        getInputText(samplesTempSliderContainer, 'min').clear().type(min).trigger('change');
        getInputText(samplesTempSliderContainer, 'max').clear().type(max).trigger('change');
        cy.contains('You searched for samples with temperature:[' + min + ' TO ' + max + '].');

        changeTab('analyses');
        cy.contains('You searched for analyses with temperature:[' + min + ' TO ' + max + '].');
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
