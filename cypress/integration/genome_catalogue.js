import GenericTableHandler from '../util/genericTable';
import {openPage, waitForPageLoad, changeTab, datatype} from '../util/util';


describe('Genome catalogue page', () => {
    const catalogueId = 'human-gut-v2-0';
    context('Browse genomes', () => {
        beforeEach(() => {
            openPage('genome-catalogues/' + catalogueId);
            waitForPageLoad('Human Gut v2.0');
        });
        const genomesTableData = {
            biome_icon: {
                data: ['', ''],
                type: datatype.STR,
                sortable: false
            },
            accession: {
                data: [
                    'MGYG000000001',
                    'MGYG000000003'
                ],
                type: datatype.STR,
                sortable: true
            },
            length: {
                data: [
                    '3219617',
                    '3229518'
                ],
                type: datatype.NUM,
                sortable: true
            },
            num_of_genomes: {
                data: [
                    '4',
                    '1181'
                ],
                type: datatype.NUM,
                sortable: true
            },
            completeness: {
                data: [
                    '98.59',
                    '100'
                ],
                type: datatype.NUM,
                sortable: true
            },
            contamination: {
                data: [
                    '0.7',
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
                sortable: true
            },
            taxonomy: {
                data: [
                    'GCA-900066495 sp902362365',
                    'Alistipes shahii'
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
        it('Table load and sort', () => {
            const genomesTable = new GenericTableHandler('#genomes-section', 3);
            genomesTable.checkLoadedCorrectly(1, 3, 3, genomesTableData);
            genomesTable.testSorting(3, genomesTableData);
        });
    });

    context('Taxonomy tree', () => {
        before(() => {
            openPage('genome-catalogues/' + catalogueId);
            waitForPageLoad('Human Gut v2.0');
            changeTab('phylo-tab');
        });
        it('Load', () => {
            cy.get('#phylo-tree').get('svg');
            // base tree
            cy.get('.node').eq(0).contains('Domain (root)');
            cy.get('.node').eq(1).contains('Archaea (28)');
            cy.get('.node').eq(2).contains('Bacteria (4716)');
        });
        it('Tree is interactive', () => {
            // clicks
            cy.get('.node').eq(2).click();
            cy.get('.node').contains('Bdellovibrionota (1)');
            cy.get('.node:contains("Bdellovibrionota (1)")').click();
            cy.get('.node').contains('MGYG000003389');
            cy.get('#reset-tree-btn').click();
            // reset
            cy.get('.node').should('have.length', 3);
            cy.get('.node').eq(0).contains('Domain (root)');
            cy.get('.node').eq(1).contains('Archaea (28)');
            cy.get('.node').eq(2).contains('Bacteria (4716)');
        });
    });

    // TODO BIGSI and Sourmash searches
    // context('Search', () => {
    //     let resultsTable = {};
    //     const resultsTableData = {
    //         genome_accession: {
    //             data: [
    //                 'MGYG-HGUT-01992',
    //                 'MGYG-HGUT-01092'
    //             ],
    //             type: datatype.STR,
    //             sortable: true
    //         },
    //         tax_assignment: {
    //             data: [
    //                 'Collinsella',
    //                 'Collinsella'
    //             ],
    //             type: datatype.STR,
    //             sortable: true
    //         },
    //         genome_length: {
    //             data: [
    //                 '2017875',
    //                 '2221580'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         },
    //         num_of_contigs: {
    //             data: [
    //                 '229',
    //                 '70'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         },
    //         genome_completeness: {
    //             data: [
    //                 '95.7',
    //                 '100'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         },
    //         genome_contamination: {
    //             data: [
    //                 '2.02',
    //                 '0.81'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         },
    //         geo_origin: {
    //             data: [
    //                 'Europe',
    //                 'Europe'
    //             ],
    //             type: datatype.STR,
    //             sortable: true
    //         },
    //         num_kmers_query: {
    //             data: [
    //                 '990',
    //                 '990'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         },
    //         num_kmers_genome: {
    //             data: [
    //                 '990',
    //                 '399'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         },
    //         kmers_found: {
    //             data: [
    //                 '100',
    //                 '40.3'
    //             ],
    //             type: datatype.NUM,
    //             sortable: true
    //         }
    //     };
    //     before(() => {
    //         cy.server();
    //         cy.route('POST', '**/genome-search', 'fixture:genomeSearch.json');
    //         openPage('genomes');
    //         waitForPageLoad('MGnify Genomes');
    //         changeTab('genome-search-tab');
    //     });
    //     it('Search, table and clear', () => {
    //         cy.get('#example-seq').click();
    //         cy.get('#search-button').click();
    //
    //         resultsTable = new GenericTableHandler('#results-section', 12, false);
    //         resultsTable.checkLoadedCorrectly(1, 12, 12, resultsTableData);
    //         resultsTable.testSorting(12, resultsTableData, true);
    //
    //         cy.get('#clear-button').click();
    //         cy.get('#sequence').should('have.value', '');
    //         cy.get('#results-section').should('be.hidden');
    //     });
    // });
});
