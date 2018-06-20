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

        it('Browse amplicon runs', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_runs?**experiment_type:amplicon**',
                'fixture:ampliconRunsQuery.json');
            cy.get('#amplicon-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#runs');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#runsResults h5', {timeout: 20000})
                .contains('You searched for runs with filters: experiment_type:amplicon.');
        });
        it('Browse assemblies', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_runs?**experiment_type:assembly**',
                'fixture:assemblyRunsQuery.json');
            cy.get('#assembly-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#runs');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#runsResults h5', {timeout: 20000})
                .contains('You searched for runs with filters: experiment_type:assembly.');
        });
        it('Browse metabarcoding runs', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_runs?**experiment_type:metabarcoding**',
                'fixture:metabarcodingRunsQuery.json');
            cy.get('#metaB-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#runs');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#runsResults h5', {timeout: 20000})
                .contains('You searched for runs with filters: experiment_type:metabarcoding.');
        });
        it('Browse metagenome runs', function() {
            cy.route('**/ebisearch/ws/rest/metagenomics_runs?**experiment_type:metagenome**',
                'fixture:metagenomeRunsQuery.json');
            cy.get('#metaG-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#runs');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#runsResults h5', {timeout: 20000})
                .contains('You searched for runs with filters: experiment_type:metagenomic.');
        });
        it('Browse metatranscriptomes runs', function() {
            cy.route(
                '**/ebisearch/ws/rest/metagenomics_runs?**experiment_type:metatranscriptomes**',
                'fixture:metatranscriptomesRunsQuery.json');
            cy.get('#metaT-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#runs');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#runsResults h5', {timeout: 20000})
                .contains(
                    'You searched for runs with filters: experiment_type:metatranscriptomic.');
        });
        it('Browse studies', function() {
            setupDefaultSearchPageRouting();
            cy.get('#project-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#projects');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#projectsResults h5', {timeout: 20000})
                .contains('You searched for projects with no parameters.');
        });
        it('Browse samples', function() {
            setupDefaultSearchPageRouting();
            cy.get('#sample-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#samples');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#samplesResults h5', {timeout: 20000})
                .contains('You searched for samples with no parameters.');
        });
        it('Browse runs', function() {
            setupDefaultSearchPageRouting();
            cy.get('#run-stats a', options).click();
            cy.url().should('eq', getBaseURL() + 'search#runs');
            waitForSearchResults('table tr.search-row:visible', 25);
            cy.get('#runsResults h5', {timeout: 20000})
                .contains('You searched for runs with no parameters.');
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
