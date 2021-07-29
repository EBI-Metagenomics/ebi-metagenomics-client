import {
    openPage,
    changeTab,
    waitForSearchResults,
    setupDefaultSearchPageRouting
} from '../util/util';
import GenericTableHandler from '../util/genericTable';
import faker from 'faker';

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

function mockHeadRequest() {
    cy.route({
        'method': 'HEAD',
        'url': 'http://localhost:8000/v1/',
        'status': 200,
        'response': {}
    });
}

/**
 * Force fixture responses for the facet load requests.
 * Facets loaded from fixtures files (cypress/fixture/{projects,analyses,samples}InitFacetFilter_<facet>.json)
 */
function mockEBISearchFacetLoadRequests() {

    ['biome', 'centre_name'].forEach((facet) => {
        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_projects?' +
            [
                'query=domain_source:metagenomics_projects',
                'size=1',
                'start=0',
                'facetcount=10',
                'facetsdepth=3',
                `facetfields=${facet}`,
            ].join('&'),
            `fixture:projectsInitFacetFilter_${facet}.json`).as(`projectFacet${facet}`);
    });

    ['biome', 'experiment_type', 'sequencing_method', 'location_name', 'disease_status', 'phenotype'].forEach((facet) => {
        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_samples?' +
            [
                'query=domain_source:metagenomics_samples',
                'size=1',
                'start=0',
                'facetcount=10',
                'facetsdepth=3',
                `facetfields=${facet}`,
            ].join('&'),
            `fixture:samplesInitFacetFilter_${facet}.json`).as(`sampleFacet${facet}`);
    });

    ['organism', 'biome', 'pipeline_version', 'experiment_type', 'GO', 'INTERPRO'].forEach((facet) => {
        cy.route('GET',
            '**/ebisearch/ws/rest/metagenomics_analyses?' +
            [
                'query=domain_source:metagenomics_analyses',
                'size=1',
                'start=0',
                'facetcount=10',
                'facetsdepth=3',
                `facetfields=${facet}`,
            ].join('&'),
            `fixture:analysesInitFacetFilter_${facet}.json`).as(`analysesFacet${facet}`);
    });
}

/**
 * Mock EBI Search responses for Projects (studies), Samples and Analyses
 */
function mockEBISearch() {

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?format=json&' +
        [
            'size=25',
            'start=0',
            '**',
            'facetcount=10',
            'facetsdepth=2',
            'facets=',
            'query=domain_source:metagenomics_projects'
        ].join('&'),
        'fixture:projectsInitQuery.json').as('basicProjects');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_samples?format=json&' +
        [
            'size=25',
            'start=0',
            '**',
            'facetcount=10',
            'facetsdepth=2',
            'facets=',
            'query=domain_source:metagenomics_samples',
        ].join('&'),
        'fixture:samplesInitQuery.json').as('basicSamples');

    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_analyses?format=json&' +
        [
            'size=25',
            'start=0',
            '**',
            'facetcount=10',
            'facetsdepth=2',
            'facets=',
            'query=domain_source:metagenomics_analyses',
        ].join('&'),
        'fixture:analysesInitQuery.json').as('basicAnalyses');
}

/**
 * Mock EBI Search responses when submitting a query=Test** request.
 */
function mockEBISearchTextFilterResponses() {
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

/**
 * Mock EBI Search responses when submitting with biome:<biome>.
 */
function mockEBISearchBiomeFilterResponses(biome) {
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

/**
 * Mock EBI Search responses when submitting to metagenomics_projects with centre_name:<biome>.
 * @param {string} center Center Name 
 */
function mockEBISearchCenterNameFilterResponses(center) {
    let centerParam = 'centre_name:' + center;
    cy.route('GET',
        '**/ebisearch/ws/rest/metagenomics_projects?**' + centerParam + '**',
        'fixture:projectsCenterFilter').as('centerQueryProjects');
}

/**
 * Trigger the text filter click event
 * @param {string} testString 
 */
function triggerTextFilterEvent(testString) {
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
    mockEBISearchTextFilterResponses();
    const testString = 'Test';
    triggerTextFilterEvent(testString);
    // Tables have hidden columns
    studyTable.checkRowData(0,
        ['MGYS00001105', 'PRJEB14421', 'Sediment', '', '', '', '', 'UNIVERSITY OF CAMBRIDGE']);
    changeTab('samples');
    sampleTable.checkRowData(0, ['ERS782465', 'MGYS00001332', 'Test Brassicae', 'Test Brassicae']);
    changeTab('analyses');
    analysisTable.checkRowData(0,
        ['MGYA00087095', '3.0', 'ERS782465', 'MGYS00001332', 'amplicon', '', '', '']);
}

describe('Search page', function () {
    context('General Functionality', function () {
        beforeEach(function () {
            // set up mocks for the routes to be used
            cy.server();
            mockHeadRequest();
            mockEBISearch();
            mockEBISearchFacetLoadRequests();

            loadPage(origPage);
            initTableHandlers();
        });

        it('Text query should apply to all facets', function () {
            testResultsAreFilteredByString();
        });

        it('Correct number of results.', function () {
            openPage(origPage);
            cy.wait(1000);
            cy.get(pageSizeSelect).select('50');
            waitForSearchResults(rowSelector, 50);
        });

        it('Biome filters should restrict results', function () {
            const biome = 'Environmental/Air';
            mockEBISearchBiomeFilterResponses(biome);
            cy.get('.toggle-tree-node').first().click();
            cy.get('input[value="biome/' + biome + '"]').check({ force: true });
            waitForSearchResults(rowSelector, 2);
            cy.get(studyTable.getColumnSelector(2)).contains('Air');
        });

        it('Centre name filters should restrict results', function () {
            const centerName = 'BioProject';
            mockEBISearchCenterNameFilterResponses(centerName);
            cy.get('input[value="centre_name/BioProject"]').check({ force: true });
            waitForSearchResults(rowSelector, 25);
            cy.get(studyTable.getColumnSelector(7)).contains(centerName);
            cy.get('tbody > tr > td[data-column=\'project-centre-name\']').contains(centerName);
        });

        it('Clear button should reset search', function () {
            const biome = 'Environmental/Air';
            mockEBISearchBiomeFilterResponses(biome);
            cy.get('.toggle-tree-node').first().click();
            cy.get('input[value="biome/' + biome + '"]').check({ force: true });
            studyTable.waitForTableLoad(2);
            cy.get(studyTable.getColumnSelector(2)).contains('Air');
            cy.get('#search-reset').click();
            studyTable.waitForTableLoad(3);
        });
    });

    context('Pagination', function () {

        const TOTAL_ELEMENTS = 43;
        let fakeFirstPage = {
            "hitCount": TOTAL_ELEMENTS,
            "entries": []
        };
        let fakeSecondPage = {
            "hitCount": TOTAL_ELEMENTS,
            "entries": []
        }

        beforeEach(function () {
            // Samples table columns
            // - Sample
            // - MGnify ID
            // - Name
            // - Description

            for (let i = 0; i < TOTAL_ELEMENTS; i++) {
                const _id = 'SRS' + faker.datatype.number().toString();
                let entry = {
                    "id": _id,
                    "source": "metagenomics_samples",
                    "fields": {
                        "id": [
                            _id
                        ],
                        "name": [
                            faker.random.words(5)
                        ],
                        "biome_name": [
                            faker.random.words(1)
                        ],
                        "description": [
                            faker.random.words()
                        ],
                        "METAGENOMICS_PROJECTS": [
                            'MGYS' + faker.datatype.number().toString()
                        ],
                        "project_name": [
                            faker.random.words()
                        ]
                    }
                };
                if (i < 25) {
                    fakeFirstPage.entries.push(entry);
                } else {
                    fakeSecondPage.entries.push(entry);
                }
            }
            // Mock responses
            cy.server();
            mockHeadRequest();
            mockEBISearch();
            mockEBISearchFacetLoadRequests();

            cy.route('GET', '**/ebisearch/ws/rest/metagenomics_samples?**start=0**query=domain_source:metagenomics_samples**', fakeFirstPage);
            cy.route('GET', '**/ebisearch/ws/rest/metagenomics_samples?**start=25**query=domain_source:metagenomics_samples**', fakeSecondPage);
        })

        it('Click on pagination links should paginate the table', function () {
            openPage(origPage + '#samples');

            cy.get('#samplesResults > div > div > h5').should('contain', 'samples');

            let table = new GenericTableHandler('#samplesResults', 25, false, 25);

            table.waitForTableLoad(25);
            cy.get('#samples-pagination .pagination .page-item a').eq(2).contains('1');
            cy.get('#samples-pagination .pagination li.page-item').eq(2).should('have.class', 'current');
            cy.get('#samples-pagination .pagination .page-item a').eq(3).contains('2');

            const firstColSelector = table.getRowColumnSelector(0, 0);
            const firstPageFirstEntry = fakeFirstPage.entries[0];
            cy.get(firstColSelector).first().contains(firstPageFirstEntry.id);

            // Second page
            cy.get('#samples-pagination .pagination .page-item .page-link').eq(3).click();
            table.waitForTableLoad(18);
            cy.get('#samples-pagination .pagination .page-item a').eq(2).contains('1');
            cy.get('#samples-pagination .pagination .page-item a').eq(3).contains('2');
            cy.get('#samples-pagination .pagination li.page-item').eq(3).should('have.class', 'current');

            const secondPageFirstEntry = fakeSecondPage.entries[0];
            cy.get(firstColSelector).first().contains(secondPageFirstEntry.id);
        });
    })

    context('Filter facet list', function () {
        beforeEach(function () {
            cy.server();
            mockHeadRequest();
            mockEBISearch();
            mockEBISearchFacetLoadRequests();
            openPage(origPage);
        });
        it('Typing "EMG" in the facet input box should limit facets for this field', function () {
            cy.get('#projectsFilters input.filter').type('EMG');
            cy.wait(3);
            cy.get('input[value^="centre_name"]:visible').should('have.length', 1);
        });

    });

    context('Deep linking', function () {
        beforeEach(function () {
            cy.server();
            mockHeadRequest();
            mockEBISearch();
            mockEBISearchFacetLoadRequests();
        });
        it('Changing tabs should update result view', function () {
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

    context('Sliders - ', function () {
        const samplesTempSwitchToggle = '[for=\'samplesTemperatureSwitch\']';
        const samplesTempSliderContainer = '#samplesFiltersTemperature';
        const samplesTempCheckbox = '#samplesTemperatureSwitch';
        const samplesTempSlider = samplesTempSliderContainer + ' > .ui-slider-range';
        const samplesDisabledQueryText = 'You searched for samples with no parameters.';

        const analysesTempSwitchToggle = '[for=\'analysesTemperatureSwitch\']';
        const analysesTempSliderContainer = '#analysesFiltersTemperature';
        const analysesTempCheckbox = '#analysesTemperatureSwitch';
        const analysesDisabledQueryText = 'You searched for analyses with no parameters.';

        beforeEach(function () {
            cy.server();
            mockHeadRequest();
            mockEBISearch();
            mockEBISearchFacetLoadRequests();

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

        it('Slider toggling should apply to other facets', function () {
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

        it('Slider value should propagate to other facets', function () {
            enableSlider(samplesTempSwitchToggle, samplesTempCheckbox, samplesTempSliderContainer);
            // setupFilteredSliderRouting();
            cy.get(samplesTempSlider).click(50, 5).click(100, 5);

            validateQueryFromInputs(samplesTempSliderContainer,
                'You searched for samples with temperature:[');
            changeTab('analyses');
            validateQueryFromInputs(analysesTempSliderContainer,
                'You searched for analyses with temperature:[');
        });

        it('Changing textbox value should change slider value', function () {
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
