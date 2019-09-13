import {openPage, datatype, waitForPageLoad} from '../util/util';
import GenericTableHandler from '../util/genericTable';

let table;

describe('Super Study page', function() {
    const superStudyId = '1';
    const origPage = 'super-studies/' + superStudyId;
    const pageTitle = 'Human microbiome';

    context('Landing', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            cy.contains('Human microbiome')
                .should('be.visible');
        });

        it('Verify elements are present', function() {
            cy.get('h3').should('contain', 'Super Study');
            cy.get('h2')
                .should('contain', 'Human microbiome');
            cy.get('[data-cy=\'superStudyDescription\']').should((el) => {
                expect(el.text().trim().length).to.equal(626);
            })
            .parent()
            .should('have.class', 'columns small-8 medium-10 large-10');
            cy.get('[data-cy=\'superStudyLogo\']').should('be.visible');
        });
    });

    context('Flagship Projects table', function() {
        // Default values
        const tableSize = 10; // there are 4 records on the fixtures
        const tableColumns = {
            biome: {
                data: ['', ''],
                type: datatype.STR,
                sortable: false
            },
            accession: {
                data: [
                    'MGYS00002072',
                    'MGYS00000256'
                    ],
                type: datatype.STR,
                sortable: false
            },
            name: {
                data: [
                    'Longitudinal study of the diabetic skin and wound microbiome',
                    'Rainforest Soil'
                ],
                type: datatype.STR,
                sortable: false
            },
            abstract: {
                data: ['', ''],
                type: datatype.STR,
                sortable: false
            },
            samples_count: {
                data: [259, 1],
                type: datatype.NUM,
                sortable: false
            },
            last_update: {
                data: [
                    '27-Nov-2017',
                    '20-Jan-2016'
                ],
                type: datatype.STR,
                sortable: false
            }
        };

        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            table = new GenericTableHandler(
                '#flagship-studies-section',
                tableSize,
                true,
                4 // expected elements
            );
        });

        it('Should be toggleable', function() {
            table.testTableHiding();
        });

        it('Should contain correct studies', function() {
            table.checkLoadedCorrectly(1, tableSize, 4, tableColumns, true);
        });

        it('Studies table links should be valid', function() {
            const selector = table.getRowColumnSelector(0, 1);
            cy.get(selector + ' > a')
                .first()
                .should('have.prop', 'href')
                .and('include', '/studies/MGYS00002072');
        });
    });

    context('Related Projects table', function() {
        // Default values
        const tableSize = 10;
        const tableColumns = {
            biome: {
                data: ['', ''],
                type: datatype.STR,
                sortable: false
            },
            accession: {
                data: [
                    'MGYS00001729',
                    'MGYS00001372'
                ],
                type: datatype.STR,
                sortable: false
            },
            name: {
                data: [
                    'Computational integration of genomic traits into 16S rDNA ' +
                    'microbiota sequencing studies',
                    'Plants Assemble Species Specific Bacterial Communities From ' +
                    'Common Core Taxa in Three Arcto-Alpine Climate Zones'
                ],
                type: datatype.STR,
                sortable: false
            },
            abstract: {
                data: ['', ''],
                type: datatype.STR,
                sortable: false
            },
            samples_count: {
                data: [2, 174],
                type: datatype.NUM,
                sortable: false
            },
            last_update: {
                data: [
                    '4-May-2017',
                    '5-Jan-2017'
                ],
                type: datatype.STR,
                sortable: false
            }
        };

        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad(pageTitle);
            table = new GenericTableHandler(
                '#related-studies-section',
                tableSize
            );
        });

        it('Should be toggleable', function() {
            table.testTableHiding();
        });

        it('Should contain correct studies', function() {
            table.checkLoadedCorrectly(1, tableSize, 27, tableColumns);
        });

        it('Studies table links should be valid', function() {
            const selector = table.getRowColumnSelector(0, 1);
            cy.get(selector + ' > a')
                .first()
                .should('have.prop', 'href')
                .and('include', '/studies/MGYS00001729');
        });
    });

    context('Landing no image', function() {
        beforeEach(function() {
            openPage('super-studies/2');
            waitForPageLoad('Cow gut microbime');
            cy.contains('Cow gut microbime')
                .should('be.visible');
        });

        it('Verify elements are present', function() {
            cy.get('h3').should('contain', 'Super Study');
            cy.get('h2')
                .should('contain', 'Cow gut microbime');
            cy.get('[data-cy=\'superStudyDescription\']')
              .should((el) => {
                expect(el.text().trim().length).to.equal(302);
             })
             .parent()
             .should('have.class', 'columns small-8 medium-12 large-12');
            cy.get('[data-cy=\'superStudyLogo\']').should('not.exist');
        });
    });

    context('Error handling', function() {
        it('Should display error message if invalid super study Id passed in URL', function() {
            const superStudyId = '99';
            const origPage = 'super-studies/' + superStudyId;
            openPage(origPage);
            waitForPageLoad('Oh no! An error has occured!');
            cy.contains('Error: 404');
            cy.contains('Could not retrieve Super Study: ' + superStudyId);
        });
    });
});
