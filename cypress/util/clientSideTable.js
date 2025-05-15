const GenericTableHandler = require('./genericTable');

/**
 * Adapted to handle hidden rows which are dynamically loaded to genericTableHandler,
 * but pre-loaded to client side tables
 */
class ClientSideTableHandler extends GenericTableHandler {
  checkLoadedCorrectly(currentPage, pageSize, expectedResults, columnOrdering, hasCaption=true) {
    this.waitForTableLoad(pageSize);
    if (hasCaption) {
      cy.get(`${this.parentId } caption .mg-number`).should('contain', expectedResults);
    }
    if (expectedResults > pageSize) {
      cy.get(`${this.parentId }.vf-pagination__item:not(.vf-pagination__item--next-page):last`).should('contain', Math.ceil(expectedResults / pageSize));
      cy.get(`${this.parentId }[data-cy="current-page"]`).should('contain', currentPage);
    }
    const firstRowData = [];
    const lastRowData = [];
    for (const column in columnOrdering) {
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
    for (const header in tests) {
      if (tests.hasOwnProperty(header)) {
        const { type } = tests[header];
        if (tests[header].sortable) {
          cy.log(`Testing sorting for ${ header }.`);
          const i2 = i;
          this.getHeader(i2).click();
          this.waitForTableLoad(pageSize);
          this.getHeader(i2).then(($el) => {
            const asc = Cypress.$($el.find('span i')).hasClass('icon-sort-up');

            cy.log(Cypress.$($el));
            cy.log(`Should be ${ asc ? 'ascending' : 'descending'}`);
            that.checkOrdering(i2, type, asc);
            that.getHeader(i2).click();
            that.waitForTableLoad(pageSize);
            cy.log(`Should be ${ !asc ? 'ascending' : 'descending'}`);
            that.checkOrdering(i2, type, !asc);
          });
        }
        i += 1;
      }
    }
  }

  waitForTableLoad(pageSize) {
    cy.get(`${this.getTableSelector() } tbody > tr:visible`, { timeout: 20000 })
        .should('have.length', pageSize);
  }

  testFiltering(query, page, pageSize, expectedData) {
    // Apply filter and check result
    this.getFilterInput().type(query);
    this.waitForTableLoad(expectedData.length);
    for (const row in expectedData) {
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
    for (const i in testData) {
      if (testData.hasOwnProperty(i)) {
        const { index } = testData[i];
        const pageData = testData[i].data;
        this.getPaginationButton(index).click({ force: true });
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
        cy.get(`${this.parentId } [data-cy="current-page"]`).should('contain', pageNumber);
        this.checkRowData(0, pageNumber, pageSize, pageData);
      }
    }
  }

  checkRowData(rowIndex, page, pageSize, data) {
    for (const column in data) {
      if (data.hasOwnProperty(column)) {
        const txt = data[column];
        const selector = this.getRowColumnSelector(
            // rowIndex + (Math.max(0, (page - 1)) * pageSize),
            rowIndex,
            column);
        if (txt.length > 0) {
          cy.get(selector, { timeout: 40000 })
              .first()
              .contains(txt, { timeout: 20000 });
        }
      }
    }
  }

  getHeader(columnIndex) {
    return cy.get(`${this.getTableSelector() }> thead > tr:visible th:nth-child(${
      columnIndex + 1 })`);
  }

  getColumnSelector(columnIndex) {
    return `${this.getTableSelector() } tbody > tr td:nth-child(${ columnIndex + 1 })`;
  }
}

module.exports = ClientSideTableHandler;
