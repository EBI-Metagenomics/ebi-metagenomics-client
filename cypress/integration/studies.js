import {openPage, waitForStudiesLoad, datatype, waitForPageLoad} from './util';
import GenericTableHandler from './genericTable';
import Config from './config';

const origPage = 'studies';


const studiesTableDefaultSize = 25;


const initialResultSize = 25;

function assertTableIsCleared() {
    cy.get("table tr").should('not.exist');
}


function setSortBy(sortBySelector, numResults) {
    cy.get(sortBySelector).click();
    waitForStudiesLoad(numResults || initialResultSize);
}

function setSelectOption(selector, option, num_results) {
    cy.get(selector).select(option);
    waitForStudiesLoad(num_results);
}

const studiesTableColumns = {
    biome_icon: {
        data: ['', ''],
        type: datatype.STR,
        sortable: false
    },
    study_name: {
        data: ['Longitudinal study of the diabetic skin and wound microbiome', 'Fungi associated with Rhamnus cathartica in Southwestern Ontario'],
        type: datatype.STR,
        sortable: false
    },
    samples_count: {
        data: ['258', '10'],
        type: datatype.NUM,
        sortable: false
    },
    last_update: {
        data: ['27-Nov-2017', '22-Mar-2017'],
        type: datatype.DATE,
        sortable: false
    }
};

let table;
describe('Studies page - table', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad('Studies list');
        table = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
    });

    // it('Studies table should contain correct number of studies', function () {
    //     table.checkLoadedCorrectly(1, studiesTableDefaultSize, 122, studiesTableColumns);
    // });
    //
    // it('Studies table should respond to ordering', function () {
    //     table.testSorting(studiesTableDefaultSize, studiesTableColumns);
    // });
    //
    // it('Studies table should respond to filtering', function () {
    //     table.testFiltering('Longitudinal', [['', 'Longitudinal study of the diabetic skin and wound microbiome', '258', '27-Nov-2017']])
    // });
    //
    // it('Studies table should respond to pagination', function () {
    //     table.testPagination(studiesTableDefaultSize, [{
    //         index: 1,
    //         data: ['', 'Longitudinal study of the diabetic skin and wound microbiome', '258', '27-Nov-2017'],
    //     }, {
    //         index: 3,
    //         data: ['', 'Forest Soil Targeted Locus (Loci)', '23', '6-Jun-2016']
    //     }, {
    //         index: 'next',
    //         data: ['', 'Skin microbiome in human volunteers inoculated with H. ducreyi Raw sequence reads', '191', '4-Feb-2016'], // 4th row
    //         pageNum: 4
    //     }, {
    //         index: 'prev',
    //         data: ['', 'Forest Soil Targeted Locus (Loci)', '23', '6-Jun-2016'], // Back to 3rd row
    //         pageNum: 3
    //     }, {
    //         index: 'last',
    //         data: ['', 'MetaSoil', '13', '20-Jan-2016'],
    //         pageNum: 5,
    //         pageSize: 22
    //     }, {
    //         index: 'first',
    //         data: ['', 'Longitudinal study of the diabetic skin and wound microbiome', '258', '27-Nov-2017'],
    //         pageNum: 1
    //     }]);
    // });
    //
    // it('Studies table should respond to page size change', function () {
    //     table.testPageSizeChange(studiesTableDefaultSize, 50)
    // });
    //
    // it('Study table download link should be valid', function () {
    //     table.testDownloadLink(Config.API_URL + "studies?lineage=root&ordering=-last_update&format=csv")
    // });
    //
    // it('Clicking clear button should remove filters', function () {
    //     const selector = "#biome-select";
    //     let biome = "root:Environmental:Air";
    //     setSelectOption(selector, biome, 2);
    //     cy.get('span.biome_icon').should('have.class', 'air_b');
    //
    //     const clearButtonSelector = '#clear-filter';
    //     cy.get(clearButtonSelector).click();
    //     waitForStudiesLoad(initialResultSize);
    //     cy.get('span.biome_icon').should('have.class', 'non_human_host_b');
    // });

    it('Download link should change with changes in filtering or ordering', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 2);
        cy.get('span.biome_icon').should('have.class', 'air_b');

        table.getDownloadLink().then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
        });

        const searchQuery = 'windshield';
        table.getFilterInput().type(searchQuery);
        waitForStudiesLoad(1);

        table.getDownloadLink().then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
            expect($el[0].href).to.include(encodeURIComponent(searchQuery));
        });

        table.getHeader(2).click();
        const params = studiesTableColumns.samples_count;
        table.checkOrdering(2, params.type, true);

        const expectedLink = (Config.API_URL.replace('127.0.0.1','localhost'))+'studies?lineage=root%3AEnvironmental%3AAir&ordering=samples_count&search=windshield&format=csv'
        cy.get("a[href='"+expectedLink+"']", {timeout: 10000});
    });

    it('Typing larger search query should cancel previous request.', function () {
        const searchQuery = 'abc';

        waitForStudiesLoad(initialResultSize);
        cy.server();
        // Typing text incrementally causes multiple requests to be made, resulting in a results table concatenating the response of all requests
        cy.route('**/studies?**').as('apiQuery');
        for (var i in searchQuery) {
            table.getFilterInput().type(searchQuery[i]);
            cy.wait('@apiQuery');
        }

        // Actual result set for query 'abc' should have size 1
        waitForStudiesLoad(1);
    });
    it('Should respond to biome selector', function () {
        table = new GenericTableHandler('#studies-section', initialResultSize);
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 2);
        cy.get('span.biome_icon').should('have.class', 'air_b');

        biome = "root:Engineered:Biotransformation";
        setSelectOption(selector, biome, 7);
        cy.get('span.biome_icon').should('have.class', 'engineered_b');
    });
});


const longBiome = "root:Host-associated:Mammals:Digestive system:Fecal";
describe('Studies page - URL arguments', function () {
    beforeEach(function () {
        openPage('studies?lineage=' + longBiome);
        waitForPageLoad('Studies list');
    });
    it('Providing a biome with depth>3 should cause page to insert select options', function () {
        table = new GenericTableHandler('#studies-section', 1);
        // Check all options exist
        const splitBiome = longBiome.split(':');
        for (let i = 1; i < splitBiome.length; i++) {
            let parentLineage = splitBiome.slice(0, i).join(':');
            expect(cy.get("#biome-select > option[value='" + parentLineage + "']")).to.exist;
        }
        cy.get('#biome-select').should('have.value', longBiome)
    });
});
