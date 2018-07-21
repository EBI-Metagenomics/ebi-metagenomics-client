import {openPage, datatype, waitForPageLoad, changeTab} from '../util/util';
import GenericTableHandler from '../util/genericTable';
import Config from '../util/config';

const origPage = 'browse';

const studiesTableDefaultSize = 25;
const samplesTableDefaultSize = 25;

function setSelectOption(table, selector, option, numResults) {
    cy.get(selector).select(option);
    table.waitForTableLoad(numResults);
}

const studiesTableColumns = {
    biome_icon: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    accession: {
        data: ['MGYS00002072', 'MGYS00001587'],
        type: datatype.STR,
        sortable: false // TODO fix test
    },
    study_name: {
        data: [
            'Longitudinal study of the diabetic skin and wound microbiome',
            'Changeability of bacterial community composition caused by seawater exposure' +
            ' to crude oil at low temperature'],
        type: datatype.STR,
        sortable: false
    },
    samples_count: {
        data: ['258', '8'],
        type: datatype.NUM,
        sortable: false
    },
    last_update: {
        data: ['27-Nov-2017', '16-Mar-2017'],
        type: datatype.DATE,
        sortable: false
    }
};

const samplesTableColumns = {
    biome_icon: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    sample_id: {
        data: ['ERS1474797', 'ERS1474735'],
        type: datatype.STR,
        sortable: false
    },
    sample_name: {
        data: [
            'Control patient 9 right foot time 1',
            'Patient 8 skin contralateral foot to wound time 5'],
        type: datatype.STR,
        sortable: false
    },
    sample_desc: {
        data: ['control_skin_right', 'diabetic_skin_contra'],
        type: datatype.STR,
        sortable: false
    },
    last_update: {
        data: ['27-Nov-2017', '27-Nov-2017'],
        type: datatype.DATE,
        sortable: false
    }
};

let studiesTable;
let samplesTable;
describe('Browse page', function() {
    context('Studies table', function() {
        beforeEach(function() {
            openPage(origPage + '#studies');
            waitForPageLoad('Studies list');
            studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
        });

        it('Should contain correct number of studies', function() {
            studiesTable.checkLoadedCorrectly(1, studiesTableDefaultSize, 122, studiesTableColumns);
        });

        it('Should respond to ordering', function() {
            studiesTable.testSorting(studiesTableDefaultSize, studiesTableColumns);
        });

        it('Should respond to filtering', function() {
            studiesTable.testFiltering('Longitudinal', [
                [
                    '',
                    'MGYS00002072',
                    'Longitudinal study of the diabetic skin and wound microbiome',
                    '258',
                    '27-Nov-2017']]);
        });

        it('Should respond to pagination', function() {
            studiesTable.testPagination(studiesTableDefaultSize, [
                {
                    index: 1,
                    data: [
                        '',
                        'MGYS00002072',
                        'Longitudinal study of the diabetic skin and wound microbiome',
                        '258',
                        '27-Nov-2017']
                }, {
                    index: 3,
                    data: [
                        '',
                        'MGYS00001019',
                        'Metacommunity analysis of two protozoan taxa (Amoebozoa) in grassland soils',
                        '1',
                        '6-Jun-2016']
                }, {
                    index: 'next',
                    data: [
                        '',
                        'MGYS00000604',
                        'Gene-Environment Interactions at the Skin Surface',
                        '2560',
                        '3-Feb-2016'], // 4th page
                    pageNum: 4
                }, {
                    index: 'prev',
                    data: [
                        '',
                        'MGYS00001019',
                        'Metacommunity analysis of two protozoan taxa (Amoebozoa) in grassland soils',
                        '1',
                        '6-Jun-2016'],
                    pageNum: 3
                }, {
                    index: 'last',
                    data: ['', 'MGYS00000283', 'MetaSoil', '13', '20-Jan-2016'],
                    pageNum: 5,
                    pageSize: 22
                }, {
                    index: 'first',
                    data: [
                        '',
                        'MGYS00002072',
                        'Longitudinal study of the diabetic skin and wound microbiome',
                        '258',
                        '27-Nov-2017'],
                    pageNum: 1
                }]);
        });

        it('Should respond to page size change', function() {
            studiesTable.testPageSizeChange(studiesTableDefaultSize, 50);
        });

        it('Download link should be valid', function() {
            studiesTable.testDownloadLink(Config.API_URL +
                'studies?lineage=root&ordering=-last_update&format=csv');
        });

        it('Clicking clear button should remove filters', function() {
            const selector = '#studies-section .biome-select';
            let biome = 'root:Environmental:Air';
            setSelectOption(studiesTable, selector, biome, 2);
            cy.get('span.biome_icon.air_b').should('exist');
            cy.get('span.biome_icon').should('have.class', 'air_b');
            studiesTable.getClearButton().click();
            cy.get('span.biome_icon.air_b').should('not.exist');
            studiesTable.waitForTableLoad(studiesTableDefaultSize);
            cy.get('span.biome_icon').first().should('have.class', 'skin_b');
        });

        it('Download link should change with changes in filtering or ordering', function() {
            const selector = '#studies-section .biome-select';
            let biome = 'root:Environmental:Air';
            setSelectOption(studiesTable, selector, biome, 2);
            cy.get('span.biome_icon').should('have.class', 'air_b');

            studiesTable.getDownloadLink().then(function($el) {
                expect($el[0].href).to.include(encodeURIComponent(biome));
            });

            const searchQuery = 'windshield';
            studiesTable.getFilterInput().type(searchQuery);
            studiesTable.waitForTableLoad(1);

            studiesTable.getDownloadLink().then(function($el) {
                expect($el[0].href).to.include(encodeURIComponent(biome));
                expect($el[0].href).to.include(encodeURIComponent(searchQuery));
            });

            studiesTable.getHeader(3).click();
            const params = studiesTableColumns.samples_count;
            studiesTable.checkOrdering(3, params.type, true);

            const expectedLink = Config.API_URL +
                'studies?lineage=root%3AEnvironmental%3AAir&ordering=' +
                'samples_count&search=windshield&format=csv';
            cy.get('a[href=\'' + expectedLink + '\'], a[href=\'' +
                expectedLink.replace('127.0.0.1', 'localhost') + '\']', {timeout: 10000});
        });

        it('Typing larger search query should cancel previous request.', function() {
            const searchQuery = 'abc';

            studiesTable.waitForTableLoad(studiesTableDefaultSize);
            cy.server();

            // Typing text incrementally causes multiple requests to be made,
            // resulting in a results table concatenating the response of all requests

            cy.route('**/studies?**').as('apiQuery');
            for (let i in searchQuery) {
                if (Object.prototype.hasOwnProperty.call(searchQuery, i)) {
                    studiesTable.getFilterInput().type(searchQuery[i]);
                    cy.wait('@apiQuery');
                }
            }

            // Actual result set for query 'abc' should have size 1
            studiesTable.waitForTableLoad(1);
        });

        it('Should respond to biome selector', function() {
            studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
            const selector = '#studies-section .biome-select';

            let biome = 'root:Environmental:Air';
            setSelectOption(studiesTable, selector, biome, 2);
            cy.get('span.biome_icon.air_b').should('exist');
            cy.get('span.biome_icon').should('have.class', 'air_b');

            let biome2 = 'root:Engineered:Biotransformation';
            setSelectOption(studiesTable, selector, biome2, 7);
            cy.get('span.biome_icon').should('have.class', 'engineered_b');
        });
    });

    context('Samples table', function() {
        beforeEach(function() {
            openPage(origPage + '#samples');
            waitForPageLoad('Samples list');
            samplesTable = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
        });

        it('Samples table should contain correct number of samples', function() {
            samplesTable.checkLoadedCorrectly(1, samplesTableDefaultSize, 9158,
                samplesTableColumns);
        });

        it('should respond to ordering', function() {
            samplesTable.testSorting(samplesTableDefaultSize, samplesTableColumns);
        });

        it('Should respond to filtering', function() {
            samplesTable.testFiltering('ERS1474797', [
                [
                    '',
                    'ERS1474797',
                    'Control patient 9 right foot time 1',
                    'control_skin_right',
                    '27-Nov-2017']]);
        });

        it('Should respond to pagination', function() {
            samplesTable.testPagination(samplesTableDefaultSize, [
                {
                    index: 1,
                    data: [
                        '',
                        'ERS1474797',
                        'Control patient 9 right foot time 1',
                        'control_skin_right',
                        '27-Nov-2017']
                }, {
                    index: 3,
                    data: [
                        '',
                        'ERS1474798',
                        'Control patient 9 left foot time 2',
                        'control_skin_left',
                        '27-Nov-2017']
                }, {
                    index: 'next',
                    data: [
                        '',
                        'ERS1474557',
                        'Control patient 6 right foot time 1',
                        'control_skin_right',
                        '27-Nov-2017'], // 4th row
                    pageNum: 4
                }, {
                    index: 'prev',
                    data: [
                        '',
                        'ERS1474798',
                        'Control patient 9 left foot time 2',
                        'control_skin_left',
                        '27-Nov-2017'],
                    pageNum: 3
                }, {
                    index: 'last',
                    data: [
                        '',
                        'SRS211741',
                        'J18, fermented Kimchi day 18',

                        '(CLOB) Community DNA obtained by 454 GS FLX titanium ' +
                        'sequencing from sample at 18days of kimchi fermentation',

                        '13-Aug-2015'],
                    pageNum: 367,
                    pageSize: 8
                }, {
                    index: 'first',
                    data: [
                        '',
                        'ERS1474797',
                        'Control patient 9 right foot time 1',
                        'control_skin_right',
                        '27-Nov-2017'],
                    pageNum: 1
                }]);
        });

        it('Samples table should respond to page size change', function() {
            samplesTable.testPageSizeChange(samplesTableDefaultSize, 50);
        });

        it('Samples table download link should be valid', function() {
            samplesTable.testDownloadLink(Config.API_URL +
                'samples?lineage=root&ordering=-last_update&format=csv');
        });

        it('Clicking clear button should remove filters', function() {
            const selector = '#samples-section .biome-select';
            let biome = 'root:Environmental:Air';
            setSelectOption(samplesTable, selector, biome, 4);
            cy.get('span.biome_icon.air_b').should('exist');
            cy.get('span.biome_icon').should('have.class', 'air_b');
            samplesTable.getClearButton().click();
            cy.get('span.biome_icon.air_b').should('not.exist');
            samplesTable.waitForTableLoad(samplesTableDefaultSize);
            cy.get('span.biome_icon').first().should('have.class', 'skin_b');
        });

        it('Download link should change with changes in filtering or ordering', function() {
            const selector = '#samples-section .biome-select';
            let biome = 'root:Environmental:Air';
            setSelectOption(samplesTable, selector, biome, 4);
            cy.get('span.biome_icon').should('have.class', 'air_b');

            samplesTable.getDownloadLink().then(function($el) {
                expect($el[0].href).to.include(encodeURIComponent(biome));
            });

            const searchQuery = 'windshield';
            samplesTable.getFilterInput().type(searchQuery);
            samplesTable.waitForTableLoad(2);

            samplesTable.getDownloadLink().then(function($el) {
                expect($el[0].href).to.include(encodeURIComponent(biome));
                expect($el[0].href).to.include(encodeURIComponent(searchQuery));
            });

            samplesTable.getHeader(2).click();
            samplesTable.waitForTableLoad(2);
            const params = samplesTableColumns.sample_name;
            samplesTable.checkOrdering(3, params.type, true);
            samplesTable.testDownloadLink(Config.API_URL + 'samples?lineage=' +
                encodeURIComponent(biome) + '&ordering=sample_name&search=' + searchQuery +
                '&format=csv');
        });

        it('Typing larger search query should cancel previous request.', function() {
            const searchQuery = ['Control patient 9', ' foot time', ' 44'];

            samplesTable.waitForTableLoad(studiesTableDefaultSize);
            cy.server();

            // Typing text incrementally causes multiple requests to be made, resulting in
            // a results table concatenating the response of all requests

            cy.route('**/samples?**').as('apiQuery');
            for (let i in searchQuery) {
                if (Object.prototype.hasOwnProperty.call(searchQuery, i)) {
                    samplesTable.getFilterInput().type(searchQuery[i]);
                    cy.wait('@apiQuery');
                }
            }

            // Actual result set for query 'abc' should have size 1
            samplesTable.waitForTableLoad(1);
        });
        it('Should respond to biome selector', function() {
            studiesTable = new GenericTableHandler('#samples-section', studiesTableDefaultSize);
            const selector = '#samples-section .biome-select';
            let biome = 'root:Environmental:Air';
            setSelectOption(studiesTable, selector, biome, 4);
            cy.get('span.biome_icon.air_b').should('exist');
            cy.get('span.biome_icon').should('have.class', 'air_b');

            let biome2 = 'root:Engineered:Biotransformation';
            setSelectOption(studiesTable, selector, biome2, 25);
            cy.get('span.biome_icon').should('have.class', 'engineered_b');
        });
    });
    context('Filter propagation', function() {
        beforeEach(function() {
            openPage('browse#studies');
            waitForPageLoad('Studies list');
            studiesTable = new GenericTableHandler('#studies-section', 25);
            samplesTable = new GenericTableHandler('#samples-section', 25);
        });

        it('Changes in biome select should propagate to other facets', function() {
            const studiesSelector = '#studies-section .biome-select';
            const samplesSelector = '#samples-section .biome-select';
            let biome = 'root:Environmental:Air';
            setSelectOption(studiesTable, studiesSelector, biome, 2);
            changeTab('samples');
            samplesTable.waitForTableLoad(4);
            cy.get('#samples-section .biome-select').should('have.value', biome);

            biome = 'root:Environmental:Aquatic';
            setSelectOption(samplesTable, samplesSelector, biome, 25);
            changeTab('studies');
            studiesTable.waitForTableLoad(11);
            cy.get('#studies-section .biome-select').should('have.value', biome);
        });

        it('Changes in filter text should propagate to other facets', function() {
            let filterText = 'Glacier Metagenome';
            studiesTable.getFilterInput().type(filterText);
            studiesTable.waitForTableLoad(1);
            studiesTable.checkRowData(0,
                ['', 'MGYS00000259', 'Glacier Metagenome', '1', '20-Jan-2016']);

            changeTab('samples');
            samplesTable.waitForTableLoad(1);
            samplesTable.getFilterInput().should('have.value', filterText);

            samplesTable.checkRowData(0, [
                '',
                'SRS000608',
                'Glacier Metagenome',
                '454 Sequencing of The Glacier Ice Metagenome Of The Northern Schneeferner',
                '13-Aug-2015']);

            samplesTable.getClearButton().click();
            samplesTable.getFilterInput().should('have.value', '');

            filterText = 'OSD';
            samplesTable.getFilterInput().type(filterText);
            samplesTable.waitForTableLoad(25);
            changeTab('studies');
            studiesTable.waitForTableLoad(1);
            studiesTable.getFilterInput().should('have.value', filterText);
        });
    });

    context('URL parameters', function() {
        it('Providing a biome with depth>3 should cause page to insert select options', function() {
            let lineage = 'root:Host-associated:Mammals:Digestive system:Fecal';
            openPage('browse?lineage=' + lineage + '#samples');
            waitForPageLoad('Samples list');
            studiesTable = new GenericTableHandler('#studies-section', 1);
            samplesTable = new GenericTableHandler('#samples-section', 1);
            // Check all options exist
            cy.get('#studies-section .biome-select > option[value=\'' + lineage + '\']')
                .should('exist');
            cy.get('#samples-section .biome-select > option[value=\'' + lineage + '\']')
                .should('exist');
            cy.get('#studies-section .biome-select').should('have.value', lineage);
            cy.get('#samples-section .biome-select').should('have.value', lineage);
        });
        it('Should order results according to URL parameters (studies tab)', function() {
            openPage('browse?ordering=samples_count#studies');
            waitForPageLoad('Studies list');
            studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
            studiesTable.checkOrdering(4, datatype.NUM, false);
        });
        it('Should order results according to URL parameters (samples tab)', function() {
            openPage('browse?ordering=accession#samples');
            waitForPageLoad('Samples list');
            samplesTable = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
            samplesTable.checkOrdering(1, datatype.STR, true);
        });
        it('Should order results according to URL parameters (both tabs)', function() {
            openPage('browse?ordering=last_updated#studies');
            waitForPageLoad('Studies list');
            studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
            studiesTable.checkOrdering(4, datatype.DATE, false);
            changeTab('samples');
            samplesTable = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
            samplesTable.checkOrdering(4, datatype.DATE, false);
        });

        it('Should filter results by search query', function() {
            const searchQuery = 'OSD';
            openPage('browse?search=' + searchQuery + '#studies');
            waitForPageLoad('Studies list');
            cy.get('input.table-filter').then(($els) => {
                expect(Cypress.$($els).val()).to.eq(searchQuery);
            });
            studiesTable = new GenericTableHandler('#studies-section', 1);
            samplesTable = new GenericTableHandler('#samples-section', 25);
        });

        it('Should filter results by biome', function() {
            const biome = 'root:Environmental:Air';
            openPage('browse?lineage=' + biome + '#studies');
            waitForPageLoad('Studies list');
            cy.get('.biome-select option:selected').then(($els) => {
                expect(Cypress.$($els).attr('value')).to.eq(biome);
            });
            studiesTable = new GenericTableHandler('#studies-section', 2);
            samplesTable = new GenericTableHandler('#samples-section', 4);
        });
    });
});