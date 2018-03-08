import {datatype} from './util';


class GenericTableHandler {
    constructor(parentId, defaultPageSize) {
        this.parentId = parentId;
        this.defaultPageSize = defaultPageSize;
        this.waitForLoadingIcon();
        this.waitForTableLoad(defaultPageSize);
    }

    setPageSize(pageSize) {
        this.defaultPageSize = pageSize;
        this.getPageSizeSelector().select(pageSize.toString());
        this.getPageSizeSelector().should('have.value', pageSize.toString());
    }

    checkLoadedCorrectly(currentPage, pageSize, expectedResults, columnOrdering) {
        this.waitForTableLoad(pageSize);
        this.getPageInfoSpan('#totalResults').should('contain', expectedResults);
        this.getPageInfoSpan('#maxPage').should('contain', Math.ceil(expectedResults / pageSize));
        this.getPageInfoSpan('#currentPage').should('contain', currentPage);
        let firstRowData = [];
        let lastRowData = [];
        for (const column in columnOrdering) {
            firstRowData.push(columnOrdering[column].data[0]);
            lastRowData.push(columnOrdering[column].data[1]);
        }
        this.checkRowData(0, firstRowData);
        this.checkRowData(pageSize - 1, lastRowData);
    }

    testSorting(pageSize, tests) {
        let i = 0;
        for (const header in tests) {
            const type = tests[header].type;
            if (tests[header].sortable) {
                this.getHeader(i).click();
                this.waitForTableLoad(pageSize);
                this.checkOrdering(i, type, true);
                this.getHeader(i).click();
                this.waitForTableLoad(pageSize);
                this.checkOrdering(i, type, false);
            }
            i += 1;
        }
    }

    waitForTableLoad(pageSize) {
        cy.get(this.getTableSelector() + "> tbody > tr", {timeout: 20000}).should('have.length', pageSize);
        this.waitForLoadingIcon();
    }

    waitForLoadingIcon() {
        this.getLoadingIcon().should(($el) => {
            expect($el).to.be.hidden;
        });
    }

    checkOrdering(index, type, gte) {
        const selector = this.getColumnSelector(index);
        cy.get(selector).first().should(function ($el) {
            let txt = $el.text();
            let txt2 = Cypress.$(selector).last().text();
            if (!gte) {
                txt = [txt2, txt2 = txt][0]; // Swap variables
            }
            if (type === datatype.DATE) {
                txt = new Date(txt);
                txt2 = new Date(txt2);
            } else if (type === datatype.NUM) {
                txt = parseFloat(txt);
                txt2 = parseFloat(txt2);
            } else if (type === datatype.STR) {
                txt = txt.toLowerCase();
                txt2 = txt2.toLowerCase();
            }
            expect(txt).to.be.lte(txt2);
        });
    }

    testFiltering(query, expectedData) {
        // Apply filter and check result
        this.getFilterInput().type(query);
        this.waitForTableLoad(expectedData.length);
        for (let row in expectedData) {
            const rowData = expectedData[row];
            this.checkRowData(row, rowData);
        }
        // Clear filter and check table is reset
        this.getFilterInput().clear();
        this.waitForTableLoad(this.defaultPageSize);
    }

    testPagination(pageSize, testData) {
        for (let i in testData) {
            const pageNum = testData[i].index;
            const pageData = testData[i].data;
            this.getPaginationButton(pageNum).click({force: true});

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
            if (isNaN(pageNum)) {
                pageNumber = testData[i].pageNum;
            } else {
                pageNumber = pageNum;
            }
            this.getPageInfoSpan('#currentPage').should('contain', pageNumber.toString());
            this.checkRowData(0, pageData);

        }
    }

    testPageSizeChange(defaultPageSize, newPageSize) {
        this.waitForTableLoad(defaultPageSize);
        this.setPageSize(newPageSize);
        this.waitForTableLoad(newPageSize)
    }

    testDownloadLink(expectedURL) {
        this.getDownloadLink().should(($el) => {
            expect($el.attr('href').replace('localhost', '127.0.0.1')).to.eq(expectedURL)
        });
    }

    testPageRowData(page, numVisibleResults, rowIndex, data){
        this.getPaginationButton(page).click();
        this.waitForTableLoad(numVisibleResults);
        this.checkRowData(rowIndex, data);
    }

    checkRowData(rowIndex, data) {
        for (let column in data) {
            const txt = data[column];
            const selector = this.getRowColumnSelector(rowIndex, column);
            cy.get(selector).first().should(($el) => {
                expect($el.text()).to.include(txt);
            });
        }
    }

    getHeader(columnIndex) {
        return cy.get(this.getTableSelector() + "> thead > tr th:nth-child(" + (columnIndex + 1) + ")")
    }

    getPageInfoSpan(spanId) {
        return cy.get(this.parentId + " > div.row > div.pagesize > label > span > span" + spanId)
    }

    getLoadingIcon() {
        return cy.get(this.parentId + "> * > img.loading-gif-medium")
    }

    getFilterInput() {
        return cy.get(this.parentId + "> div.row > div.columns > label > input#tableFilter")
    }

    getColumnSelector(columnIndex) {
        return this.getTableSelector() + "> tbody > tr td:nth-child(" + (columnIndex + 1) + ")"
    }

    /**
     * Returns jQuery selector string for a cell in the table's current page
     * @param rowIndex
     * @param columnIndex
     * @returns {string}
     */
    getRowColumnSelector(rowIndex, columnIndex) {
        rowIndex = parseInt(rowIndex);
        columnIndex = parseInt(columnIndex);
        return this.getTableSelector() + "> tbody > tr:nth-child(" + (rowIndex + 1) + ") td:nth-child(" + (columnIndex + 1) + ")"
    }

    getPageSizeSelector() {
        return cy.get(this.parentId + "> div.row div.columns > label > select#pagesize")
    }

    getPaginationButton(buttonIndex) {
        if (buttonIndex === 0 || buttonIndex === 'first') {
            return cy.get(this.parentId + "> div.pagination > ul.pagination > li:nth-child(1)") // First
        } else if (buttonIndex === 'prev') {
            return cy.get(this.parentId + "> div.pagination > ul.pagination > li:nth-child(2)")
        } else if (buttonIndex === 'next') {
            return cy.get(this.parentId + "> div.pagination > ul.pagination > li:nth-child(8)")
        } else if (buttonIndex === 'last') {
            return cy.get(this.parentId + "> div.pagination > ul.pagination > li:nth-child(9)")
        } else {
            return cy.get(this.parentId + "> div.pagination > ul.pagination > li:nth-child(" + (buttonIndex + 2) + ")")
        }
    }

    getDownloadLink() {
        return cy.get(this.parentId + "> div.row.columns > a.download-link")
    }
    getTableSelector() {
        return this.parentId + "> div.row.columns > table "
    }

    getClearButton(){
        return cy.get(this.parentId + " .clear-filter")
    }
}


module.exports = GenericTableHandler;