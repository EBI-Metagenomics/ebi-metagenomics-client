import {openPage, waitForPageLoad, changeTab, datatype} from '../util/util';
import GenericTableHandler from '../util/genericTable';


describe('Genomes page', () => {
    context('Browse genomes', () => {

        beforeEach(() => {
            openPage('genomes');
            waitForPageLoad('MGnify Genomes');
        });

        const genomesTableData = {
            biome_icon: {
                data: ['', ''],
                type: datatype.STR,
                sortable: false
            },
            accession: {
                data: [
                    'MGYG-HGUT-00240',
                    'MGYG-HGUT-00279'
                ],
                type: datatype.STR,
                sortable: true
            },
            length: {
                data: [
                    '2627858',
                    '2007253'
                ],
                type: datatype.NUM,
                sortable: true
            },
            num_of_genomes: {
                data: [
                    '44',
                    '5'
                ],
                type: datatype.NUM,
                sortable: true
            },
            completeness: {
                data: [
                    '100',
                    '99.85'
                ],
                type: datatype.NUM,
                sortable: true
            },
            contamination: {
                data: [
                    '0',
                    '0'
                ],
                type: datatype.NUM,
                sortable: true
            },
            type: {
                data: [
                    'Isolate',
                    'Isolate'
                ],
                type: datatype.STR,
                sortable: false
            },
            taxonomy: {
                data: [
                    'Absiella',
                    'Veillonella'
                ],
                type: datatype.STR,
                sortable: false
            },
            last_updated: {
                data: [
                    '',
                    ''
                ],
                type: datatype.DATE,
                sortable: false
            }
        };
        it('Table load, sort and filter', () => {
            const genomesTable = new GenericTableHandler('#genomes-section', 2);
            genomesTable.checkLoadedCorrectly(1, 2, 2, genomesTableData);
            genomesTable.testSorting(2, genomesTableData);
            genomesTable.testFiltering('absi', [
                [
                    '',
                    'MGYG-HGUT-00240',
                    '2627858',
                    '44',
                    '100',
                    '0',
                    'Isolate',
                    'Absiella'
                ]
            ]);
        });
    });

    context('Taxonomy tree', () => {
        before(() => {
            openPage('genomes');
            waitForPageLoad('MGnify Genomes');
            changeTab('phylo-tab');
        });
        it('Load', () => {
            cy.get('#phylo-tree').get('svg');
            // base tree
            cy.get('.node').eq(0).contains('Domain (root)');
            cy.get('.node').eq(1).contains('Bacteria (4616)');
            cy.get('.node').eq(2).contains('Archaea (28)');
        });
        it('Tree is interactive', () => {
            // clicks
            cy.get('.node').eq(1).click();
            cy.get('.node').contains('Bdellovibrionota (1)');
            cy.get('.node:contains("Bdellovibrionota (1)")').click();
            cy.get('.node').contains('MGYG-HGUT-03389');
            cy.get('#reset-tree-btn').click();
            // reset
            cy.get('.node').should('have.length', 3);
            cy.get('.node').eq(0).contains('Domain (root)');
            cy.get('.node').eq(1).contains('Bacteria (4616)');
            cy.get('.node').eq(2).contains('Archaea (28)');
        });
    });

    context('Search', () => {
        let resultsTable = {};
        const resultsTableData = {
            genome_accession: {
                data: [
                    'MGYG-HGUT-01992',
                    'MGYG-HGUT-01092'
                ],
                type: datatype.STR,
                sortable: true
            },
            tax_assignment: {
                data: [
                    'Collinsella',
                    'Collinsella'
                ],
                type: datatype.STR,
                sortable: true
            },
            genome_length: {
                data: [
                    '2017875',
                    '2221580'
                ],
                type: datatype.NUM,
                sortable: true
            },
            num_of_contigs: {
                data: [
                    '229',
                    '70'
                ],
                type: datatype.NUM,
                sortable: true
            },
            genome_completeness: {
                data: [
                    '95.7',
                    '100'
                ],
                type: datatype.NUM,
                sortable: true
            },
            genome_contamination: {
                data: [
                    '2.02',
                    '0.81'
                ],
                type: datatype.NUM,
                sortable: true
            },
            geo_origin: {
                data: [
                    'Europe',
                    'Europe'
                ],
                type: datatype.STR,
                sortable: true
            },
            num_kmers_query: {
                data: [
                    '990',
                    '990'
                ],
                type: datatype.NUM,
                sortable: true
            },
            num_kmers_genome: {
                data: [
                    '990',
                    '399'
                ],
                type: datatype.NUM,
                sortable: true
            },
            kmers_found: {
                data: [
                    '100',
                    '40.3'
                ],
                type: datatype.NUM,
                sortable: true
            }
        };
        before(() => {
            cy.server();
            cy.route('POST', '**/genome-search', 'fixture:genomeSearch.json');
            openPage('genomes');
            waitForPageLoad('MGnify Genomes');
            changeTab('genome-search-tab');
        });
        it('Search, table and clear', () => {
            cy.get('#example-seq').click();
            cy.get('#search-button').click();

            resultsTable = new GenericTableHandler('#results-section', 12, false);
            resultsTable.checkLoadedCorrectly(1, 12, 12, resultsTableData);
            resultsTable.testSorting(12, resultsTableData, true);

            cy.get('#clear-button').click();
            cy.get('#sequence').should('have.value', '');
            cy.get('#results-section').should('be.hidden');
        });
    });
});
