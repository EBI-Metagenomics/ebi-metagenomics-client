import {openPage, waitForSamplesLoad, datatype, waitForPageLoad} from './util';
import GenericTableHandler from './genericTable';
import Config from './config';

const origPage = 'samples';


const samplesTableDefaultSize = 25;


const initialResultSize = 25;

function assertTableIsCleared() {
    cy.get("table tr").should('not.exist');
}

function setSelectOption(selector, option, num_results) {
    cy.get(selector).select(option);
    waitForSamplesLoad(num_results);
}

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
        data: ['Control patient 9 right foot time 1', 'Patient 8 skin contralateral foot to wound time 5'],
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

let table;
describe('Samples page - table', function () {
    beforeEach(function () {
        openPage(origPage);
        waitForPageLoad('Samples list');
        table = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
    });

    it('Samples table should contain correct number of samples', function () {
        table.checkLoadedCorrectly(1, samplesTableDefaultSize, 9157, samplesTableColumns);
    });

    it('Samples table should respond to ordering', function () {
        table.testSorting(samplesTableDefaultSize, samplesTableColumns);
    });

    it('Samples table should respond to filtering', function () {
        table.testFiltering('ERS1474797', [['', 'ERS1474797','Control patient 9 right foot time 1','control_skin_right','27-Nov-2017']])
    });

    it('Samples table should respond to pagination', function () {
        table.testPagination(samplesTableDefaultSize, [{
            index: 1,
            data: ['', 'ERS1474797','Control patient 9 right foot time 1','control_skin_right','27-Nov-2017'],
        }, {
            index: 3,
            data: ['', 'ERS1474798','Control patient 9 left foot time 2','control_skin_left','27-Nov-2017']
        }, {
            index: 'next',
            data: ['', 'ERS1474557','Control patient 6 right foot time 1','control_skin_right','27-Nov-2017'], // 4th row
            pageNum: 4
        }, {
            index: 'prev',
            data: ['', 'ERS1474798','Control patient 9 left foot time 2','control_skin_left','27-Nov-2017'],
            pageNum: 3
        }, {
            index: 'last',
            data: ['', 'SRS211742','J21, fermented Kimchi day 21','(CLOB) Community DNA obtained by 454 GS FLX titanium sequencing from sample at 21days of kimchi fermentation','13-Aug-2015'],
            pageNum: 367,
            pageSize: 7
        }, {
            index: 'first',
            data: ['', 'ERS1474797','Control patient 9 right foot time 1','control_skin_right','27-Nov-2017'],
            pageNum: 1
        }]);
    });

    it('Samples table should respond to page size change', function () {
        table.testPageSizeChange(samplesTableDefaultSize, 50)
    });

    it('Study table download link should be valid', function () {
        table.testDownloadLink(Config.API_URL + "samples?lineage=root&ordering=-last_update&format=csv")
    });

    it('Clicking clear button should remove filters', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 4);
        cy.get('span.biome_icon').should('have.class', 'air_b');

        const clearButtonSelector = '#clear-filter';
        cy.get(clearButtonSelector).click();
        waitForSamplesLoad(initialResultSize);
        cy.get('span.biome_icon').should('have.class', 'human_host_b');
    });

    it('Download link should change with changes in filtering or ordering', function () {
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 4);
        cy.get('span.biome_icon').should('have.class', 'air_b');

        table.getDownloadLink().then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
        });

        const searchQuery = 'windshield';
        table.getFilterInput().type(searchQuery);
        waitForSamplesLoad(2);

        table.getDownloadLink().then(function ($el) {
            expect($el[0].href).to.include(encodeURIComponent(biome));
            expect($el[0].href).to.include(encodeURIComponent(searchQuery));
        });

        table.getHeader(2).click();
        waitForSamplesLoad(2);
        const params = samplesTableColumns.sample_name;
        table.checkOrdering(2, params.type, true);
        table.testDownloadLink(Config.API_URL+"samples?lineage="+encodeURIComponent(biome)+"&ordering=sample_name&search="+searchQuery+"&format=csv");
    });

    it('Typing larger search query should cancel previous request.', function () {
        const searchQuery = ['Control patient 9', ' foot time', ' 44'];

        waitForSamplesLoad(initialResultSize);
        cy.server();
        // Typing text incrementally causes multiple requests to be made, resulting in a results table concatenating the response of all requests
        cy.route('**/samples?**').as('apiQuery');
        for (var i in searchQuery) {
            table.getFilterInput().type(searchQuery[i]);
            cy.wait('@apiQuery');
        }

        // Actual result set for query 'abc' should have size 1
        waitForSamplesLoad(1);
    });
    it('Should respond to biome selector', function () {
        table = new GenericTableHandler('#samples-section', initialResultSize);
        const selector = "#biome-select";
        let biome = "root:Environmental:Air";
        setSelectOption(selector, biome, 4);
        cy.get('span.biome_icon').should('have.class', 'air_b');

        biome = "root:Engineered:Biotransformation";
        setSelectOption(selector, biome, 25);
        cy.get('span.biome_icon').should('have.class', 'engineered_b');
    });
});


const longBiome = "root:Host-associated:Mammals:Digestive system:Fecal";
describe('Samples page - URL arguments', function () {
    beforeEach(function () {
        openPage('samples?lineage=' + longBiome);
        waitForPageLoad('Samples list');
    });
    it('Providing a biome with depth>3 should cause page to insert select options', function () {
        table = new GenericTableHandler('#samples-section', 1);
        // Check all options exist
        const splitBiome = longBiome.split(':');
        for (let i = 1; i < splitBiome.length; i++) {
            let parentLineage = splitBiome.slice(0, i).join(':');
            expect(cy.get("#biome-select > option[value='" + parentLineage + "']")).to.exist;
        }
        cy.get('#biome-select').should('have.value', longBiome)
    });
});

