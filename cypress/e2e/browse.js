import {openPage, waitForPageLoad} from '../util/util';

const origPage = 'browse';

describe('Browse page', function() {
    beforeEach(function() {
        cy.server();

        // cy.log('studies**');

        cy.intercept('**/v1/studies**search=**').as('studiesSearchCall');
        cy.intercept('**/v1/studies**').as('studiesCall');
        cy.intercept('**/v1/samples**').as('samplesCall');
    });

    context('Super studies table', function() {
        beforeEach(function() {
            openPage(origPage + '/super-studies');
            waitForPageLoad('Browse MGnify');
        });

        it('Should contain correct number of super studies', function() {
            cy.get('.mg-table-caption').should('contain.text', 1);
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
            cy.get('.vf-table__body > .vf-table__row > :nth-child(1)').should('contain.text', 'Excellent');
        });

        it('Should have markdown rendered description', function() {
            cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.html', '<strong>Excellent Adventure</strong>');
        });

        it('Should be sortable by title', function() {
            cy.contains('Title').click();
            cy.url().should('contain', 'order=title');
        });

        it('Should have download button', function() {
            cy.contains('Download')
              .should('have.attr', 'href')
              .and('include', 'super-studies')
              .and('include', 'format=csv');
        });

    });
    context('Studies table', function() {
        beforeEach(function() {
            openPage(origPage + '/studies');
            waitForPageLoad('Browse MGnify');
        });

        it('Should contain correct number of studies', function() {
            cy.get('.mg-table-caption').should('contain.text', 1);
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
            cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.text', 'MGYS00000001');
        });

        it('Should make new request when search box changes', function() {
            //TODO: testing actual search requires SQLite full text search turned on
            cy.get('#searchitem').type('wow');
            cy.wait('@studiesSearchCall').its('request.url').should('include', 'search=wow');
        });

        it('Should respond to biome filtering', function() {
            cy.get('#biome-select').click();
            cy.contains('All Engineered').click();
            cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
            cy.contains('No matching data');
        });

    });
        //TODO list genome catalogues

        //TODO list biomes

        //TODO list publications

        //TODO list samples

        // it('Should contain correct number of studies', function() {
        //     studiesTable.checkLoadedCorrectly(1, studiesTableDefaultSize, 124, studiesTableColumns);
        // });
    //
    //     it('Should respond to ordering', function() {
    //         studiesTable.testSorting(studiesTableDefaultSize, studiesTableColumns);
    //     });
    //
    //     it('Should respond to filtering', function() {
    //         studiesTable.testFiltering('Longitudinal', [
    //             [
    //                 '',
    //                 'MGYS00002072',
    //                 'Longitudinal study of the diabetic skin and wound microbiome',
    //                 '25',
    //                 '27-Nov-2017'
    //             ]
    //         ]);
    //     });
    //
    //     it('Should respond to pagination', function() {
    //         studiesTable.testPagination(studiesTableDefaultSize, [
    //             {
    //                 index: 1,
    //                 data: [
    //                     '',
    //                     'MGYS00002008',
    //                     'EMG produced TPA metagenomics assembly of the Shotgun ' +
    //                     'Sequencing of Tara Oceans DNA samples corresponding to ' +
    //                     'size fractions for prokaryotes. (APY) data set',
    //                     '1',
    //                     '3-Oct-2019'
    //                 ]
    //             }, {
    //                 index: 3,
    //                 data: [
    //                     '',
    //                     'MGYS00001079',
    //                     'Transient rapamycin treatment robustly increases lifespan' +
    //                     ' and healthspan in middle-aged mice',
    //                     '38',
    //                     '16-Jun-2016'
    //                 ]
    //             }, {
    //                 index: 'Next',
    //                 data: [
    //                     '',
    //                     'MGYS00000613',
    //                     'Analysis of metagenomes from oak wood taken from '+
    //                     'healthy and diseased trees.',
    //                     '9',
    //                     '22-Feb-2016'
    //                 ],
    //                 pageNum: 4
    //             }, {
    //                 index: 'Previous',
    //                 data: [
    //                     '',
    //                     'MGYS00001079',
    //                     'Transient rapamycin treatment robustly increases lifespan' +
    //                     ' and healthspan in middle-aged mice',
    //                     '38',
    //                     '16-Jun-2016'
    //                 ],
    //                 pageNum: 3
    //             }, {
    //                 index: 'Last',
    //                 data: [
    //                     '',
    //                     'MGYS00000278',
    //                     'Developing infant gut microbiome',
    //                     '17',
    //                     '20-Jan-2016'
    //                 ],
    //                 pageNum: 5,
    //                 pageSize: 24
    //             }, {
    //                 index: 'First',
    //                 data: [
    //                     '',
    //                     'MGYS00002008',
    //                     'EMG produced TPA metagenomics assembly of the Shotgun ' +
    //                     'Sequencing of Tara Oceans DNA samples corresponding to ' +
    //                     'size fractions for prokaryotes. (APY) data set',
    //                     '1',
    //                     '3-Oct-2019'
    //                 ],
    //                 pageNum: 1
    //             }], 5);
    //     });
    //
    //     it('Should respond to page size change', function() {
    //         studiesTable.testPageSizeChange(studiesTableDefaultSize, 50);
    //     });
    //
    //     it('Download link should be valid', function() {
    //         studiesTable.testDownloadLink(Config.API_URL +
    //             'studies?lineage=root&ordering=-last_update&format=csv');
    //     });
    //
    //     it('Clicking clear button should remove filters', function() {
    //         const selector = '#studies-section .biome-select';
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(studiesTable, selector, biome, 2);
    //         cy.get('span.biome_icon.air_b').should('exist');
    //         cy.get('span.biome_icon').should('have.class', 'air_b');
    //         studiesTable.getClearButton().click();
    //         cy.get('span.biome_icon.air_b').should('not.exist');
    //         studiesTable.waitForTableLoad(studiesTableDefaultSize);
    //         cy.get('span.biome_icon').first().should('have.class', 'marine_b');
    //     });
    //
    //     it('Download link should change with changes in filtering or ordering', function() {
    //         const selector = '#studies-section .biome-select';
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(studiesTable, selector, biome, 2);
    //         cy.wait('@studiesCall');
    //         cy.get('span.biome_icon').should('have.class', 'air_b');
    //
    //         studiesTable.getDownloadLink().then(function($el) {
    //             expect($el[0].href).to.include(encodeURIComponent(biome));
    //         });
    //
    //         const searchQuery = 'windshield';
    //         studiesTable.getFilterInput().type(searchQuery);
    //         studiesTable.waitForTableLoad(1);
    //         cy.wait('@studiesCall');
    //
    //         studiesTable.getDownloadLink().then(function($el) {
    //             expect($el[0].href).to.include(encodeURIComponent(biome));
    //             expect($el[0].href).to.include(encodeURIComponent(searchQuery));
    //         });
    //
    //         studiesTable.getHeader(3).click();
    //         cy.wait('@studiesCall');
    //         const params = studiesTableColumns.samples_count;
    //         studiesTable.checkOrdering(3, params.type, true);
    //
    //         const expectedLink = Config.API_URL +
    //             'studies?lineage=root%3AEnvironmental%3AAir&ordering=' +
    //             'samples_count&search=windshield&format=csv';
    //         cy.get('a[href=\'' + expectedLink + '\'], a[href=\'' +
    //             expectedLink.replace('127.0.0.1', 'localhost') + '\']', {timeout: 10000});
    //     });
    //
    //     it('Typing larger search query should cancel previous request.', function() {
    //         const searchQuery = 'abc';
    //
    //         studiesTable.waitForTableLoad(studiesTableDefaultSize);
    //
    //         // Typing text incrementally causes multiple requests to be made,
    //         // resulting in a results table concatenating the response of all requests
    //
    //         for (let i in searchQuery) {
    //             if (Object.prototype.hasOwnProperty.call(searchQuery, i)) {
    //                 studiesTable.getFilterInput().type(searchQuery[i]);
    //                 cy.wait('@studiesCall');
    //             }
    //         }
    //
    //         // Actual result set for query 'abc' should have size 1
    //         studiesTable.waitForTableLoad(1);
    //     });
    //
    //     it('Should respond to biome selector', function() {
    //         studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
    //         const selector = '#studies-section .biome-select';
    //
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(studiesTable, selector, biome, 2);
    //         cy.get('span.biome_icon.air_b').should('exist');
    //         cy.get('span.biome_icon').should('have.class', 'air_b');
    //
    //         let biome2 = 'root:Engineered:Biotransformation';
    //         setSelectOption(studiesTable, selector, biome2, 7);
    //         cy.get('span.biome_icon').should('have.class', 'engineered_b');
    //     });
    // });
    //
    // context('Samples table', function() {
    //     const tableFirstRecord = [
    //         '',
    //         'ERS487899',
    //         'TARA_X000000263',
    //         // eslint-disable-next-line max-len
    //         '"This sample (TARA_X000000263) was collected during the Tara Oceans expedition (2009-2013) at station TARA_004 (latitudeN=36.5533, longitudeE=-6.5669) on date/time=2009-09-15T11:30, using a PUMP (High Volume Peristaltic Pump). The sample material (saline water (ENVO:00002010), including plankton (ENVO:xxxxxxxx)) was collected at a depth of 3-7 m, targeting a surface water layer (ENVO:00002042) in the marine biome (ENVO:00000447). The sample was size-fractionated (0.22-1.6 micrometres), and stored in liquid nitrogen for later detection of prokaryote nucleic acid sequences by pyrosequencing methods, and for later metagenomics analysis. This sample has replicate sample(s): TARA_X000000264."',
    //         '25-Sep-2019'
    //     ];
    //
    //     beforeEach(function() {
    //         openPage(origPage + '#samples');
    //         waitForPageLoad('Samples list');
    //         samplesTable = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
    //     });
    //
    //     it('Samples table should contain correct number of samples', function() {
    //         samplesTable.checkLoadedCorrectly(1, samplesTableDefaultSize, 9159,
    //             samplesTableColumns);
    //     });
    //
    //     it('should respond to ordering', function() {
    //         samplesTable.testSorting(samplesTableDefaultSize, samplesTableColumns);
    //     });
    //
    //     it('Should respond to filtering', function() {
    //         samplesTable.testFiltering('ERS1474797', [
    //             [
    //                 '',
    //                 'ERS1474797',
    //                 'Control patient 9 right foot time 1',
    //                 'control_skin_right',
    //                 '27-Nov-2017'
    //             ]
    //         ]);
    //     });
    //
    //     it('Should respond to pagination', function() {
    //         samplesTable.testPagination(samplesTableDefaultSize, [
    //             {
    //                 index: 1,
    //                 data: tableFirstRecord
    //             }, {
    //                 index: 3,
    //                 data: [
    //                     '',
    //                     'ERS1474616',
    //                     'Patient 10 skin adjacent to wound time 1',
    //                     'diabetic_skin_adj',
    //                     '27-Nov-2017'
    //                 ]
    //             }, {
    //                 index: 'Next',
    //                 data: [
    //                     '',
    //                     'ERS1474707',
    //                     'Patient 7 wound debridement time 1',
    //                     'wound_deb',
    //                     '27-Nov-2017'
    //                 ], // 4th row
    //                 pageNum: 4
    //             }, {
    //                 index: 'Previous',
    //                 data: [
    //                     '',
    //                     'ERS1474616',
    //                     'Patient 10 skin adjacent to wound time 1',
    //                     'diabetic_skin_adj',
    //                     '27-Nov-2017'
    //                 ],
    //                 pageNum: 3
    //             }, {
    //                 index: 'Last',
    //                 data: [
    //                     '',
    //                     'SRS211740',
    //                     'J16, fermented Kimchi day 16',
    //                     '(CLOB) Community DNA obtained by 454 GS FLX titanium ' +
    //                     'sequencing from sample at 16days of kimchi fermentation',
    //                     '13-Aug-2015'
    //                 ],
    //                 pageNum: 367,
    //                 pageSize: 9
    //             }, {
    //                 index: 'First',
    //                 data: tableFirstRecord,
    //                 pageNum: 1
    //             }]);
    //     });
    //
    //     it('Samples table should respond to page size change', function() {
    //         samplesTable.testPageSizeChange(samplesTableDefaultSize, 50);
    //     });
    //
    //     it('Samples table download link should be valid', function() {
    //         samplesTable.testDownloadLink(Config.API_URL +
    //             'samples?lineage=root&ordering=-last_update&format=csv');
    //     });
    //
    //     it('Clicking clear button should remove filters', function() {
    //         const selector = '#samples-section .biome-select';
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(samplesTable, selector, biome, 4);
    //         cy.get('span.biome_icon.air_b').should('exist');
    //         cy.get('span.biome_icon').should('have.class', 'air_b');
    //         samplesTable.getClearButton().click();
    //         cy.get('span.biome_icon.air_b').should('not.exist');
    //         samplesTable.waitForTableLoad(samplesTableDefaultSize);
    //         cy.get('span.biome_icon').first().should('have.class', 'marine_b');
    //     });
    //
    //     it('Download link should change with changes in filtering or ordering', function() {
    //         const selector = '#samples-section .biome-select';
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(samplesTable, selector, biome, 4);
    //         cy.wait('@samplesCall');
    //         cy.get('span.biome_icon').should('have.class', 'air_b');
    //
    //         samplesTable.getDownloadLink().then(function($el) {
    //             expect($el[0].href).to.include(encodeURIComponent(biome));
    //         });
    //
    //         const searchQuery = 'windshield';
    //         samplesTable.getFilterInput().type(searchQuery);
    //         samplesTable.waitForTableLoad(2);
    //         cy.wait('@samplesCall');
    //
    //         samplesTable.getDownloadLink().then(function($el) {
    //             expect($el[0].href).to.include(encodeURIComponent(biome));
    //             expect($el[0].href).to.include(encodeURIComponent(searchQuery));
    //         });
    //
    //         samplesTable.getHeader(2).click();
    //         cy.wait('@samplesCall');
    //         const params = samplesTableColumns.sample_name;
    //         samplesTable.checkOrdering(3, params.type, true);
    //         samplesTable.testDownloadLink(Config.API_URL + 'samples?lineage=' +
    //             encodeURIComponent(biome) + '&ordering=sample_name&search=' + searchQuery +
    //             '&format=csv');
    //     });
    //
    //     it('Typing larger search query should cancel previous request.', function() {
    //         const searchQuery = ['Control patient 9', ' foot time', ' 44'];
    //
    //         samplesTable.waitForTableLoad(studiesTableDefaultSize);
    //
    //         // Typing text incrementally causes multiple requests to be made, resulting in
    //         // a results table concatenating the response of all requests
    //
    //         for (let i in searchQuery) {
    //             if (Object.prototype.hasOwnProperty.call(searchQuery, i)) {
    //                 samplesTable.getFilterInput().type(searchQuery[i]);
    //                 cy.wait('@samplesCall');
    //             }
    //         }
    //
    //         // Actual result set for query 'abc' should have size 1
    //         samplesTable.waitForTableLoad(1);
    //     });
    //     it('Should respond to biome selector', function() {
    //         studiesTable = new GenericTableHandler('#samples-section', studiesTableDefaultSize);
    //         const selector = '#samples-section .biome-select';
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(studiesTable, selector, biome, 4);
    //         cy.get('span.biome_icon.air_b').should('exist');
    //         cy.get('span.biome_icon').should('have.class', 'air_b');
    //
    //         let biome2 = 'root:Engineered:Biotransformation';
    //         setSelectOption(studiesTable, selector, biome2, 25);
    //         cy.get('span.biome_icon').should('have.class', 'engineered_b');
    //     });
    // });
    // context('Filter propagation', function() {
    //     beforeEach(function() {
    //         openPage('browse#studies');
    //         waitForPageLoad('Studies list');
    //         studiesTable = new GenericTableHandler('#studies-section', 25);
    //         samplesTable = new GenericTableHandler('#samples-section', 25);
    //     });
    //
    //     it('Changes in biome select should propagate to other facets', function() {
    //         const studiesSelector = '#studies-section .biome-select';
    //         const samplesSelector = '#samples-section .biome-select';
    //         let biome = 'root:Environmental:Air';
    //         setSelectOption(studiesTable, studiesSelector, biome, 2);
    //         cy.wait('@studiesCall');
    //         cy.wait('@samplesCall');
    //         changeTab('samples');
    //         samplesTable.waitForTableLoad(4);
    //         cy.get('#samples-section .biome-select').should('have.value', biome);
    //
    //         biome = 'root:Environmental:Aquatic';
    //         setSelectOption(samplesTable, samplesSelector, biome, 25);
    //         cy.wait('@studiesCall');
    //         cy.wait('@samplesCall');
    //         changeTab('studies');
    //         studiesTable.waitForTableLoad(12);
    //         cy.get('#studies-section .biome-select').should('have.value', biome);
    //     });
    //
    //     it('Changes in filter text should propagate to other facets (Studies -> Samples)',
    //         function() {
    //             let filterText = 'Glacier Metagenome';
    //             studiesTable.getFilterInput().type(filterText);
    //             cy.wait('@studiesCall');
    //             cy.wait('@samplesCall');
    //             studiesTable.waitForTableLoad(1);
    //             studiesTable.checkRowData(0,
    //                 ['', 'MGYS00000259', 'Glacier Metagenome', '1', '20-Jan-2016']);
    //
    //             changeTab('samples');
    //             samplesTable.waitForTableLoad(1);
    //             samplesTable.getFilterInput().should('have.value', filterText);
    //
    //             samplesTable.checkRowData(0, [
    //                 '',
    //                 'SRS000608',
    //                 'Glacier Metagenome',
    //                 '454 Sequencing of The Glacier Ice Metagenome Of The Northern Schneeferner',
    //                 '13-Aug-2015']);
    //         });
    //     it('Changes in filter text should propagate to other facets (Samples -> Studies)',
    //         function() {
    //             changeTab('samples');
    //             let filterText = 'Glacier Metagenome';
    //             samplesTable.getFilterInput().type(filterText);
    //             cy.wait('@studiesCall');
    //             cy.wait('@samplesCall');
    //             samplesTable.waitForTableLoad(1);
    //             samplesTable.getFilterInput().should('have.value', filterText);
    //
    //             samplesTable.checkRowData(0, [
    //                 '',
    //                 'SRS000608',
    //                 'Glacier Metagenome',
    //                 '454 Sequencing of The Glacier Ice Metagenome Of The Northern Schneeferner',
    //                 '13-Aug-2015']);
    //
    //             changeTab('studies');
    //             studiesTable.waitForTableLoad(1);
    //             studiesTable.checkRowData(0,
    //                 ['', 'MGYS00000259', 'Glacier Metagenome', '1', '20-Jan-2016']);
    //         });
    // });
    //
    // context('URL parameters', function() {
    //     it('Providing a biome with depth>3 should cause page to insert select options', function() {
    //         let lineage = 'root:Host-associated:Mammals:Digestive system:Fecal';
    //         openPage('browse?lineage=' + lineage + '#samples');
    //         waitForPageLoad('Samples list');
    //         cy.wait('@studiesCall');
    //         cy.wait('@samplesCall');
    //         changeTab('studies');
    //         studiesTable = new GenericTableHandler('#studies-section', 1);
    //         changeTab('samples');
    //         samplesTable = new GenericTableHandler('#samples-section', 1);
    //         // Check all options exist
    //         cy.get('#studies-section .biome-select > option[value=\'' + lineage + '\']')
    //             .should('exist');
    //         cy.get('#samples-section .biome-select > option[value=\'' + lineage + '\']')
    //             .should('exist');
    //         cy.get('#studies-section .biome-select').should('have.value', lineage);
    //         cy.get('#samples-section .biome-select').should('have.value', lineage);
    //     });
    //     it('Should order results according to URL parameters (studies tab)', function() {
    //         openPage('browse?ordering=-samples_count#studies');
    //         waitForPageLoad('Studies list');
    //         studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
    //         studiesTable.checkOrdering(3, datatype.NUM, false);
    //     });
    //     it('Should order results according to URL parameters (samples tab)', function() {
    //         openPage('browse?ordering=accession#samples');
    //         waitForPageLoad('Samples list');
    //         samplesTable = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
    //         samplesTable.checkOrdering(1, datatype.STR, true);
    //     });
    //     it('Should order results according to URL parameters (both tabs)', function() {
    //         openPage('browse?ordering=last_updated#studies');
    //         waitForPageLoad('Studies list');
    //         studiesTable = new GenericTableHandler('#studies-section', studiesTableDefaultSize);
    //         studiesTable.checkOrdering(4, datatype.DATE, false);
    //         changeTab('samples');
    //         samplesTable = new GenericTableHandler('#samples-section', samplesTableDefaultSize);
    //         samplesTable.checkOrdering(4, datatype.DATE, false);
    //     });
    //
    //     it('Should filter results by search query', function() {
    //         const searchQuery = 'OSD';
    //         openPage('browse?search=' + searchQuery + '#studies');
    //         waitForPageLoad('Studies list');
    //         cy.get('input.table-filter').then(($els) => {
    //             expect(Cypress.$($els).val()).to.eq(searchQuery);
    //         });
    //         studiesTable = new GenericTableHandler('#studies-section', 1);
    //         samplesTable = new GenericTableHandler('#samples-section', 25);
    //     });
    //
    //     it('Should filter results by biome', function() {
    //         const biome = 'root:Environmental:Air';
    //         openPage('browse?lineage=' + biome + '#studies');
    //         waitForPageLoad('Studies list');
    //         cy.wait('@studiesCall');
    //         cy.wait('@samplesCall');
    //         cy.get('.biome-select option:selected').then(($els) => {
    //             expect(Cypress.$($els).attr('value')).to.eq(biome);
    //         });
    //         studiesTable = new GenericTableHandler('#studies-section', 2);
    //         samplesTable = new GenericTableHandler('#samples-section', 4);
    //     });
    // });
});
