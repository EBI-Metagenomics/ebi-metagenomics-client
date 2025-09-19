import { datatype } from './util';
import config from './config';

class GenericTableHandler {
  constructor(parentId, defaultPageSize, expectedElements) {
    this.parentId = parentId;
    this.defaultPageSize = defaultPageSize;
    if (expectedElements) {
      this.elementsInTable = (expectedElements > defaultPageSize) ?
                                   defaultPageSize : expectedElements;
    } else {
      this.elementsInTable = defaultPageSize;
    }
    this.waitForTableLoad(this.elementsInTable);
  }

  setPageSize(pageSize) {
    this.defaultPageSize = pageSize;
    this.getPageSizeSelector().select(pageSize.toString());
    this.getPageSizeSelector().should('have.value', pageSize.toString());
  }

  checkLoadedCorrectly(currentPage, pageSize, expectedResults, columnOrdering, expectPagination = true) {
    this.waitForTableLoad(this.elementsInTable);
    if (expectPagination) {
      cy.get(`${this.parentId } caption .mg-number`).should('contain', expectedResults);
      cy.get(`${this.parentId } .vf-pagination__item:not(.vf-pagination__item--next-page):last`).should('contain', Math.ceil(expectedResults / pageSize));
      cy.get(`${this.parentId } [data-cy="current-page"]`).should('contain', currentPage);
    }
    const firstRowData = [];
    const lastRowData = [];
    for (const column in columnOrdering) {
      if (columnOrdering.hasOwnProperty(column)) {
        firstRowData.push(columnOrdering[column].data[0]);
        lastRowData.push(columnOrdering[column].data[1]);
      }
    }
    this.checkRowData(0, firstRowData);
    if (this.elementsInTable > 1) {
      this.checkRowData(this.elementsInTable - 1, lastRowData);
    }
  }

  testSorting(pageSize, tests, clientSide) {
    const that = this;
    if (!clientSide) {
      cy.intercept(`${config.API_URL }**/*ordering=*`).as('apiCall');
    }
    let i = 0;
    for (const header in tests) {
      if (tests.hasOwnProperty(header)) {
        const { type } = tests[header];
        if (tests[header].sortable) {
          cy.log(`Testing sorting for ${ header }.`);

          const i2 = i;
          this.getHeader(i2).click();

          if (!clientSide) {
            cy.wait('@apiCall');
          }

          this.waitForTableLoad(pageSize);
          this.getHeader(i2).then(($el) => {
            const asc = Cypress.$($el.find('span i')).hasClass('icon-sort-up');
            cy.log(Cypress.$($el));
            cy.log(`Should be ${ asc ? 'ascending' : 'descending'}`);
            that.checkOrdering(i2, type, asc);
            that.getHeader(i2).click();

            if (!clientSide) {
              cy.wait('@apiCall');
            }

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
    cy.get(`${this.getTableSelector() } tbody > tr`, { timeout: 20000 })
        .should('have.length', pageSize);
  }

  checkOrdering(index, type, gte) {
    const selector = this.getColumnSelector(index);
    cy.get(selector).first().then(function($el) {
      let txt = $el.text();
      let txt2 = Cypress.$(selector).last().text();
      if (!gte) {
        [txt, txt2] = [txt2, txt]; // Swap variables
      }
      if (type === datatype.STR || !type) {
        txt = txt.toLowerCase();
        txt2 = txt2.toLowerCase();
        expect([txt, txt2]).to.have.ordered.members([txt, txt2].sort());
      } else {
        if (type === datatype.DATE) {
          txt = new Date(txt);
          txt2 = new Date(txt2);
        } else if (type === datatype.NUM) {
          txt = parseFloat(txt);
          txt2 = parseFloat(txt2);
        }
        expect(txt).to.be.lte(txt2);
      }
    });
  }

  testFiltering(query, expectedData) {
    // Apply filter and check result
    this.getFilterInput().type(query);
    this.waitForTableLoad(expectedData.length);
    for (const row in expectedData) {
      if (expectedData.hasOwnProperty(row)) {
        const rowData = expectedData[row];
        this.checkRowData(row, rowData);
      }
    }
    // Clear filter and check table is reset
    this.getFilterInput().clear();
    this.waitForTableLoad(this.elementsInTable);
  }

  testPagination(pageSize, testData) {
    for (const i in testData) {
      if (testData.hasOwnProperty(i)) {
        const pageNum = testData[i].index;
        const pageData = testData[i].data;
        this.getPaginationButton(pageNum).click({ force: true });
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
        cy.get(`${this.parentId } [data-cy="current-page"]`).should('contain', pageNumber.toString());
        this.checkRowData(0, pageData);
      }
    }
  }

  testPageSizeChange(defaultPageSize, newPageSize) {
    this.waitForTableLoad(defaultPageSize);
    this.setPageSize(newPageSize);
    this.waitForTableLoad(newPageSize);
  }

  testDownloadLink(expectedURL) {
    this.getDownloadLink().should(($el) => {
      expect(
          $el.attr('href')
              .replace('localhost', '127.0.0.1')
              .replace('ordering=&', '')
      ).to.eq(expectedURL
          .replace('localhost', '127.0.0.1')
          .replace('ordering=&', '')
      );
    });
  }

  checkRowData(rowIndex, data) {
    for (const column in data) {
      if (data.hasOwnProperty(column)) {
        const txt = data[column];
        const selector = this.getRowColumnSelector(rowIndex, column);
        if (txt.length > 0) {
          cy.get(selector, { timeout: 40000 })
              .first()
              .scrollIntoView()
              .contains(txt, { timeout: 20000 });
        }
      }
    }
  }

  getHeader(columnIndex) {
    return cy.get(`${this.getTableSelector() }> thead > tr th:nth-child(${ columnIndex + 1
    })`);
  }

  getPageInfoSpan(spanId) {
    return cy.get(`${this.parentId } div.row > div.pagesize > label > span > span${ spanId}`);
  }

  getFilterInput() {
    return cy.get(`${this.parentId } .mg-textsearch input[type=search]`);
  }

  getColumnSelector(columnIndex) {
    return `${this.getTableSelector() } tbody > tr td:nth-child(${ columnIndex + 1 })`;
  }

  /**
     * Returns jQuery selector string for a cell in the table's current page
     * @param {number} rowIndex
     * @param {number} columnIndex
     * @return {string}
     */
  getRowColumnSelector(rowIndex, columnIndex) {
    rowIndex = parseInt(rowIndex);
    columnIndex = parseInt(columnIndex);
    return `${this.getTableSelector() } tbody > tr:nth-child(${ rowIndex + 1
    }) td:nth-child(${ columnIndex + 1 })`;
  }

  getPageSizeSelector() {
    return cy.get(`${this.parentId } div.row div.columns > label > select#pagesize`);
  }

  getPaginationButton(buttonIndex) {
    // if (!numPages) {
    //     numPages = 5;
    // }
    // let str;
    // switch (buttonIndex) {
    //     case 0:
    //     case 'first':
    //         str = ' div.pagination > ul.pagination > li:nth-child(1)';
    //         break;
    //     case 'prev':
    //         str = ' div.pagination > ul.pagination > li:nth-child(2)';
    //         break;
    //     case 'next':
    //         str = ' div.pagination > ul.pagination > li:nth-child(' + (numPages + 2) + ')';
    //         break;
    //     case 'last':
    //         str = ' div.pagination > ul.pagination > li:nth-child(' + (numPages + 2) + ')';
    //         break;
    //     default:
    //         str = ' div.pagination > ul.pagination > li:nth-child(' +
    //             (buttonIndex + 2) + ')';
    // }
    return cy.get(`${this.parentId } nav.vf-pagination > ul.vf-pagination__list`).contains(buttonIndex);
  }

  getDownloadLink() {
    return cy.get(`${this.parentId } a[download]`);
  }

  getTableElem() {
    return cy.get(this.getTableSelector());
  }

  getTableSelector() {
    return this.parentId;
  }

  getClearButton() {
    return cy.get(`${this.parentId } .clear-filter`);
  }
}

module.exports = GenericTableHandler;
