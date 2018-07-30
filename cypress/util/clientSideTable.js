const GenericTableHandler = require('./genericTable');

/**
 * Adapted to handle hidden rows which are dynamically loaded to genericTableHandler,
 * but pre-loaded to client side tables
 */
class ClientSideTableHandler extends GenericTableHandler {
    checkLoadedCorrectly(currentPage, pageSize, expectedResults, columnOrdering) {
        this.waitForTableLoad(pageSize);
        this.getPageInfoSpan('#totalResults').should('contain', expectedResults);
        this.getPageInfoSpan('#maxPage').should('contain', Math.ceil(expectedResults / pageSize));
        this.getPageInfoSpan('#currentPage').should('contain', currentPage);
        let firstRowData = [];
        let lastRowData = [];
        for (let column in columnOrdering) {
            if (columnOrdering.hasOwnProperty(column)) {
                firstRowData.push(columnOrdering[column].data[0]);
                lastRowData.push(columnOrdering[column].data[1]);
            }
        }
        this.checkRowData(0, 0, pageSize, firstRowData);
        this.checkRowData(pageSize - 1, 0, pageSize, lastRowData);
    }

    testSorting(pageSize, tests) {
        const that = this;

        let i = 0;
        for (let header in tests) {
            if (tests.hasOwnProperty(header)) {
                const type = tests[header].type;
                if (tests[header].sortable) {
                    cy.log('Testing sorting for ' + header + '.');
                    const i2 = i;
                    this.getHeader(i2).click();
                    this.waitForTableLoad(pageSize);
                    this.getHeader(i2).then(($el) => {
                        const asc = Cypress.$($el).hasClass('tablesorter-headerAsc');
                        cy.log(Cypress.$($el));
                        cy.log('Should be ' + (asc ? 'ascending' : 'descending'));
                        that.checkOrdering(i2, type, asc);
                        that.getHeader(i2).click();
                        that.waitForTableLoad(pageSize);
                        cy.log('Should be ' + (!asc ? 'ascending' : 'descending'));
                        that.checkOrdering(i2, type, !asc);
                    });
                }
                i += 1;
            }
        }
    }

    waitForTableLoad(pageSize) {
        this.waitForLoadingIconHidden();
        cy.get(this.getTableSelector() + '> tbody > tr:visible', {timeout: 20000})
            .should('have.length', pageSize);
    }

    waitForLoadingIconHidden() {
        if (this.hasLoadingGif) {
            this.getLoadingIcon().should('be.hidden', {timeout: 40000});
        }
    }

    testFiltering(query, page, pageSize, expectedData) {
        // Apply filter and check result
        this.getFilterInput().type(query);
        this.waitForTableLoad(expectedData.length);
        for (let row in expectedData) {
            if (expectedData.hasOwnProperty(row)) {
                const rowData = expectedData[row];
                this.checkRowData(row, page, pageSize, rowData);
            }
        }
        // Clear filter and check table is reset
        this.getFilterInput().clear();
        this.waitForTableLoad(this.defaultPageSize);
    }

    testPagination(pageSize, testData) {
        for (let i in testData) {
            if (testData.hasOwnProperty(i)) {
                const index = testData[i].index;
                const pageData = testData[i].data;
                this.getPaginationButton(index).click({force: true});
                // Edge case for last page
                let size;
                if (testData[i].pageSize) {
                    size = testData[i].pageSize;
                } else {
                    size = pageSize;
                }
                this.waitForTableLoad(size);

                // To handle testing 'next', 'prev', 'first', and 'last'
                let pageNumber;
                if (isNaN(index)) {
                    pageNumber = testData[i].pageNum;
                } else {
                    pageNumber = index;
                }
                this.getPageInfoSpan('#currentPage').should('contain', pageNumber.toString());
                this.checkRowData(0, pageNumber, pageSize, pageData);
            }
        }
    }

    checkRowData(rowIndex, page, pageSize, data) {
        for (let column in data) {
            if (data.hasOwnProperty(column)) {
                const txt = data[column];
                cy.log(page, page - 1, rowIndex, pageSize);
                const selector = this.getRowColumnSelector(rowIndex + ((page - 1) * pageSize),
                    column);
                if (txt.length > 0) {
                    cy.get(selector, {timeout: 40000})
                        .first()
                        .contains(txt, {timeout: 20000});
                }
            }
        }
    }

    getHeader(columnIndex) {
        return cy.get(this.getTableSelector() + '> thead > tr:visible th:nth-child(' +
            (columnIndex + 1) + ')');
    }

    getColumnSelector(columnIndex) {
        return this.getTableSelector() + ' tbody > tr td:nth-child(' + (columnIndex + 1) + ')';
    }
}

module.exports = ClientSideTableHandler;
