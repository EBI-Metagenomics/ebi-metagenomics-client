import {
    openPage,
    getBaseURL,
    waitForBiomesLoad,
    waitForSearchResults,
    setupDefaultSearchPageRouting
} from './util';
import GenericTableHandler from './genericTable';

const origPage = '';
const options = {timeout: 40000};

function waitForStatsLoadingGif() {
    cy.get('.loading-gif-large').should('be.hidden');
}

describe('Home page: Test Browse by selected biomes component', function() {
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
        beforeEach(function() {
            openPage(origPage);
            cy.server();
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
});

describe('Home page: Test Browse latest studies component', function() {
    context('Check for elements', function() {
        before(function() {
            openPage(origPage);
        });

        it('Browse by latest studies"', function() {
            cy.get('#latestStudies').contains('Latest studies');
        });
    });

    context('Perform click events', function() {
        beforeEach(function() {
            openPage(origPage);
        });

        it('View all studies', function() {
            cy.contains('View all studies').click();
            cy.contains('Studies list');
            cy.title().should('include', 'Browse');
        });

        it('View specific study', function() {
            cy.get('#studies > .study', {timeout: 5000}).should('have.length', parseInt(25));
            cy.get('#latestStudies').contains('View more').first().click();
            cy.contains('Study');
            cy.title().should('include', 'Study');
        });
    });
});
