import {openPage, waitForPageLoad, datatype} from '../util/util';
import GenericTableHandler from '../util/genericTable';
import Config from '../util/config';

const origPage = 'biomes';

const biomesTableDefaultSize = 25;

const biomesTableColumns = {
    biome_icon: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    biome_name: {
        data: [
            'Plants',
            'Agricultural'],
        type: datatype.STR,
        sortable: false // TODO fix test to account for text in column
    },
    samples_count: {
        data: [
            '3921', '2'],
        type: datatype.NUM,
        sortable: true
    }
};

let biomesTable;

describe('Biomes page', function() {
    context('General', function() {
        beforeEach(function() {
            openPage(origPage);
            waitForPageLoad('Biomes list');
            biomesTable = new GenericTableHandler('#biomes-section', biomesTableDefaultSize);
        });

        // // // TODO fix test, values do not correspond to API in travis
        // it('Should contain correct number of studies', function() {
        //     biomesTable.checkLoadedCorrectly(1, biomesTableDefaultSize, 490, biomesTableColumns);
        // });

        it('Should respond to ordering', function() {
            biomesTable.testSorting(biomesTableDefaultSize, biomesTableColumns);
        });

        it('Should respond to filtering', function() {
            biomesTable.testFiltering('beach', [
                ['', 'Beach', '0']]);
        });

        it('Should respond to pagination', function() {
            biomesTable.testPagination(biomesTableDefaultSize, [
                {
                    index: 1,
                    data: [
                        '',
                        'Plants',
                        '3921']
                }, {
                    index: 3,
                    data: [
                        '',
                        'Simulated communities (sequence read mixture)',
                        '0']
                }, {
                    index: 'next',
                    data: [
                        '',
                        'Dissolved organics (anaerobic)', '0'], // 4th page
                    pageNum: 4
                }, {
                    index: 'prev',
                    data: [
                        '',
                        'Simulated communities (sequence read mixture)',
                        '0'],
                    pageNum: 3
                }, {
                    index: 'last',
                    data: [
                        '', 'Epiphytes',
                        '0'],
                    pageNum: 20,
                    pageSize: 15
                }, {
                    index: 'first',
                    data: [
                        '',
                        'Engineered',
                        '0'],
                    pageNum: 1
                }]);
        });
        it('Should respond to page size change', function() {
            biomesTable.testPageSizeChange(biomesTableDefaultSize, 50);
        });
        it('Download link should be valid', function() {
            biomesTable.testDownloadLink(Config.API_URL +
                'biomes?ordering=-samples_count&format=csv');
        });

        it('Download link should change with changes in filtering or ordering', function() {
            const searchQuery = 'Beach';
            biomesTable.getFilterInput().type(searchQuery);
            biomesTable.waitForTableLoad(1);

            biomesTable.getDownloadLink().then(function($el) {
                expect($el[0].href).to.include(encodeURIComponent(searchQuery));
            });

            biomesTable.getHeader(2).click();
            const params = biomesTableColumns.samples_count;
            biomesTable.checkOrdering(2, params.type, true);

            const expectedLink = Config.API_URL +
                'biomes?ordering=samples_count&search=' + searchQuery + '&format=csv';
            cy.get('a[href=\'' +
                expectedLink.replace('127.0.0.1', 'localhost') + '\']', {timeout: 10000});
        });

        it('Typing larger search query should cancel previous request.', function() {
            const searchQuery = 'soil';

            biomesTable.waitForTableLoad(biomesTableDefaultSize);
            cy.server();

            // Typing text incrementally causes multiple requests to be made,
            // resulting in a results table concatenating the response of all requests

            cy.route('**/biomes?**').as('apiQuery');
            for (let i in searchQuery) {
                if (Object.prototype.hasOwnProperty.call(searchQuery, i)) {
                    biomesTable.getFilterInput().type(searchQuery[i]);
                    cy.wait('@apiQuery');
                }
            }

            biomesTable.waitForTableLoad(25);
        });
    });
    context('Click actions', function() {
        beforeEach(function() {
            openPage(origPage);
            biomesTable = new GenericTableHandler('#biomes-section', biomesTableDefaultSize);
        });
        it('Clicking on biome link should show only studies of that biome.', function() {
            openPage(origPage);
            cy.get('td.biome_name').first().then(($el) => {
                expect($el.text()).to.contain('root > Host-associated > Plants');
                cy.get('td.biome_name').first().find('a').click();
                new GenericTableHandler('#studies-section', 25);
                cy.get('span.biome_icon').should('have.class', 'plant_host_b');
            });
        });
    });
    context('URL Parameters', function() {
        it('Should order results according to URL parameters', function() {
            openPage('biomes?ordering=-samples_count');
            biomesTable = new GenericTableHandler('#biomes-section', biomesTableDefaultSize);
            biomesTable.checkOrdering(2, datatype.NUM, false);
        });
        it('Should filter results according to URL parameters', function() {
            const searchQuery = 'root';
            openPage('biomes?search=' + searchQuery);
            biomesTable = new GenericTableHandler('#biomes-section', biomesTableDefaultSize);
            biomesTable.checkOrdering(2, datatype.NUM, false);
            biomesTable.getFilterInput().then(($el) => {
                expect(Cypress.$($el).val()).to.eq(searchQuery);
            });
        });
    });
});

