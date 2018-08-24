import {
    openPage,
    getBaseURL,
    waitForBiomesLoad,
    waitForSearchResults,
    setupDefaultSearchPageRouting,
    login,
    urlExists
} from '../util/util';
import GenericTableHandler from '../util/genericTable';

const origPage = '';
const options = {timeout: 40000};

function waitForStatsLoadingGif() {
    cy.get('.loading-gif-large').should('be.hidden', {timeout: 20000});
}

function defaultLoginFieldsAreVisible(confidentialityText) {
    cy.get('input[name=\'analysis-type\']').should('be.visible');
    cy.get('input[name=\'reason\']').should('be.visible');
    cy.contains(confidentialityText).should('be.visible');
    cy.get('button.mailtobtn').should('be.visible');
}

describe('Home page', function() {
    context('Check for elements', function() {
        before(function() {
            openPage(origPage);
        });

        it('Browse by selected biomes"', function() {
            cy.contains('Or by selected biomes');
            // Check biome icons are loaded
            cy.get('#top10biomes span.biome_icon').then(($els) => {
                expect($els).to.have.length(10);
            });
        });

        it('Select specific biomes', function() {
            cy.get('#top10biomes').contains('Plants');
            cy.get('#top10biomes').contains('Human');
            cy.get('#top10biomes').contains('Skin');
            cy.get('#top10biomes').contains('Soil');
            cy.get('#top10biomes').contains('Food production');
            cy.get('#top10biomes').contains('Digestive system');
            cy.get('#top10biomes').contains('Digestive system');
            cy.get('#top10biomes').contains('Aquatic');
            cy.get('#top10biomes').contains('Marine');
            cy.get('#top10biomes').contains('Wastewater');
        });
    });

    context('Perform click events', function() {
        before(function() {
            openPage(origPage);
            cy.server();
        });
        beforeEach(function() {
            cy.server();
        });
        afterEach(function() {
            cy.go('back');
        });

        it('Browse all biomes', function() {
            cy.contains('Browse all biomes').click();
            waitForBiomesLoad(25);
            cy.url().should('eq', getBaseURL() + 'biomes');
        });

        it('Browse human skin biomes', function() {
            cy.get('#top10biomes').get('.skin_b.Skin').click();
            new GenericTableHandler('#studies-section', 9);
            cy.url().should('include',
                getBaseURL() + 'browse?lineage=root:Host-associated:Human:Skin#studies');
        });

        it('Browse amplicon assemblies', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_analyses?**experiment_type:amplicon**',
                'fixture:ampliconAnalysesQuery.json');
            waitForStatsLoadingGif();
            cy.get('#amplicon-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#analyses');
            waitForSearchResults('table tr.search-row:visible', 2);
            cy.get('#analysesResults h5', {timeout: 20000})
                .contains('You searched for analyses with filters: experiment_type:amplicon.');
        });
        it('Browse assemblies', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_analyses?**experiment_type:assembly**',
                'fixture:assemblyAnalysesQuery.json');
            waitForStatsLoadingGif();
            cy.get('#assembly-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#analyses');
            waitForSearchResults('table tr.search-row:visible', 2);
            cy.get('#analysesResults h5', {timeout: 20000})
                .contains('You searched for analyses with filters: experiment_type:assembly.');
        });
        it('Browse metabarcoding analyses', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_analyses?**experiment_type:metabarcoding**',
                'fixture:metabarcodingAnalysesQuery.json');
            waitForStatsLoadingGif();
            cy.get('#metaB-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#analyses');
            waitForSearchResults('table tr.search-row:visible', 2);
            cy.get('#analysesResults h5', {timeout: 20000})
                .contains('You searched for analyses with filters: experiment_type:metabarcoding.');
        });
        it('Browse metagenome analyses', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_analyses?**experiment_type:metagenomic**',
                'fixture:metagenomeAnalysesQuery.json');
            waitForStatsLoadingGif();
            cy.get('#metaG-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#analyses');
            waitForSearchResults('table tr.search-row:visible', 2);
            cy.get('#analysesResults h5', {timeout: 20000})
                .contains('You searched for analyses with filters: experiment_type:metagenomic.');
        });
        it('Browse metatranscriptomes analyses', function() {
            cy.route(
                '**/ebisearch/ws/rest/metagenomics_analyses?**experiment_type:metatranscriptomic**',
                'fixture:metatranscriptomesAnalysesQuery.json');
            waitForStatsLoadingGif();
            cy.get('#metaT-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#analyses');
            waitForSearchResults('table tr.search-row:visible', 2);
            cy.get('#analysesResults h5', {timeout: 20000})
                .contains(
                    'You searched for analyses with filters: experiment_type:metatranscriptomic.');
        });
        it('Browse studies', function() {
            setupDefaultSearchPageRouting();
            waitForStatsLoadingGif();
            cy.get('#project-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#projects');
            waitForSearchResults('table tr.search-row:visible', 3);
            cy.get('#projectsResults h5', {timeout: 20000})
                .contains('You searched for studies with no parameters.');
        });
        it('Browse samples', function() {
            setupDefaultSearchPageRouting();
            waitForStatsLoadingGif();
            cy.get('#sample-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#samples');
            waitForSearchResults('table tr.search-row:visible', 3);
            cy.get('#samplesResults h5', {timeout: 20000})
                .contains('You searched for samples with no parameters.');
        });
        it('Browse analyses', function() {
            setupDefaultSearchPageRouting();
            waitForStatsLoadingGif();
            cy.get('#run-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#analyses');
            waitForSearchResults('table tr.search-row:visible', 3);
            cy.get('#analysesResults h5', {timeout: 20000})
                .contains('You searched for analyses with no parameters.');
        });
    });
    context('Latest studies', function() {
        beforeEach(function() {
            openPage(origPage);
        });

        it('Check for elements"', function() {
            cy.get('#latestStudies').contains('Latest studies');
        });

        it('Click to view all studies', function() {
            cy.contains('View all studies').click();
            cy.contains('Studies list');
            cy.title().should('include', 'Browse');
        });

        it('Click to view specific study', function() {
            cy.get('#studies > .study', {timeout: 5000}).should('have.length', parseInt(25));
            cy.get('#latestStudies').contains('View more').first().click();
            cy.contains('Study');
            cy.title().should('include', 'Study');
        });
    });
    context('Getting started section', function() {
        beforeEach(function() {
            openPage(origPage);
        });
        it('Text search btn should link to text search page', function() {
            cy.contains('Text search').click();
            cy.get('h2').should('contain', 'Search');
        });
        it('Sequence search btn should link to seq search page', function() {
            cy.get('[data-cy=\'seq-search-getting-started-btn\']').then(($el) => {
                expect(Cypress.$($el).attr('href')).to.contain('sequence-search');
            });
        });
    });

    function testAnalysisTypeTooltip(tooltipDataAttr) {
        cy.get('[data-cy=\'' + tooltipDataAttr + '\']:visible')
            .invoke('hover').invoke('mouseover').trigger('mouseover').trigger('hover')
            .then(($el) => {
                const tooltipId = Cypress.$($el).parent().attr('data-toggle');
                cy.get('#' + tooltipId).should('be.visible');
            });
    }

    context('Request analysis section - Private data', function() {
        const confidentialityText = 'The analysis of your data will be held confidentially ' +
            'on our site until the hold date expires.';

        before(function() {
            openPage(origPage);
            login();
            openPage(origPage);
            cy.contains('Submit and/or Request').click();
        });
        it('Form elements should be hidden until a radio button is checked', function() {
            cy.get('input[name=\'study-accession\']').should('be.hidden');
            cy.get('input[name=\'analysis-type\']').should('be.hidden');
            cy.get('input[name=\'reason\']').should('be.hidden');
            cy.contains(confidentialityText).should('be.hidden');
            cy.get('button.mailtobtn').should('be.hidden');
        });

        it('Checking yes radio box should display elements', function() {
            cy.get('input[value=\'yes\']').click();
            cy.get('input[name=\'study-accession\']').should('be.visible');
            defaultLoginFieldsAreVisible(confidentialityText);
        });
        it('Checking no radio button should display elements', function() {
            cy.get('input[value=\'no\']').click();
            cy.get('input[name=\'study-accession\']').should('be.hidden');
            cy.contains('Please submit your data before requesting analysis as it must be archived in the ENA for us to process it.').should('be.visible');
            cy.contains('Go to ENA submission page').then(($el) => {
                urlExists($el.attr('href'));
            });
        });
        it('Analysis type tooltip hover should display tooltip', function() {
            cy.get('input[value=\'yes\']').click();
            testAnalysisTypeTooltip('private-help-tooltip');
        });
    });
    context('Request analysis - public data', function() {
        before(function() {
            openPage(origPage);
            login();
            openPage(origPage);
            cy.get('button[data-target-modal=\'#requestPublicAnalysisModal\']').click();
        });
        it('Analysis type tooltip hover should display tooltip', function() {
            testAnalysisTypeTooltip('public-help-tooltip');
        });
        it('Form elements should be visible', function() {
            cy.get('input[name=\'study-accession\']').should('be.visible');
            cy.get('input[name=\'analysis-type\']').should('be.visible');
            cy.get('input[name=\'reason\']').should('be.visible');
            cy.get('button.mailtobtn').should('be.visible');
        });
    });
    context('Analyses request - Should force login prior to displaying forms', function() {
        beforeEach(function() {
            openPage(origPage);
        });
        it('Should display login form on public request btn click', function() {
            cy.get('button[data-target-modal=\'#requestPublicAnalysisModal\']').click();
            cy.get('#requestPublicAnalysisModal').should('be.hidden');
            cy.get('#loginModal').should('be.visible');
        });
        it('Should display login form on private request btn click', function() {
            cy.get('button[data-target-modal=\'#requestPrivateAnalysisModal\']').click();
            cy.get('#requestPrivateAnalysisModal').should('be.hidden');
            cy.get('#loginModal').should('be.visible');
        });
    });
});
