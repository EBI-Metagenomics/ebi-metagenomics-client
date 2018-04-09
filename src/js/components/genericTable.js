const tableTmpl = require('../commons').genericTable;
const _ = require('underscore');
const formatDownloadURL = require('../util').formatDownloadURL;
const Commons = require('../commons');
const Pagination = require('../components/pagination').Pagination;

module.exports = class GenericTable {
    /**
     * Instantiate pagination display and event handlers for table which requires page-by-page loading
     * @param $container jQuery container of table
     * @param title string title of table
     * @param headers string list of table header names
     * @param initPageSize initial page size
     * @param isPageHeader boolean true if table should have a larger header
     * @param callback function on event callback to load data
     */
    constructor($container, title, headers, initPageSize, isPageHeader, callback) {
        this.headers = headers;
        let params = {
            section_title: title,
            headers: headers,
            pagination: true,
            filter: true,
            header_class: isPageHeader ? 'h2' : 'h3'
        };
        const $sectionContent = $(tableTmpl(params));
        this.$table = $sectionContent.find('table');
        this.$loadingGif = $sectionContent.find('.loading-gif-medium');
        this.$tbody = $sectionContent.find('tbody');
        this.$filterInput = $sectionContent.find('#tableFilter');

        this.storeElemRefs($sectionContent);
        this.$pageSizeSelect.val(initPageSize);

        if (callback) {
            this.callback = callback;
            this.initHeaders(this.$table, null, callback);

            this.attachFilterCallback(this.$filterInput, callback);

            this.attachPageSizeCallback(this.$pageSizeSelect, callback);
        }
        this.order = null;
        $container.append($sectionContent);
    }

    /**
     * Store jQuery references to elements in table
     * @param $sectionContent {jQuery.HTMLElement} elem containing table
     */
    storeElemRefs($sectionContent) {
        this.$pagination = $sectionContent.find('ul.pagination');
        this.$pagesizeContainer = $sectionContent.find('div.pagesize');
        this.$currentPageDisp = this.$pagesizeContainer.find('#currentPage');
        this.$maxPageDisp = this.$pagesizeContainer.find('#maxPage');
        this.$totalResultsDisp = this.$pagesizeContainer.find('#totalResults');
        this.$pageSizeSelect = this.$pagesizeContainer.find('#pagesize');
        this.$downloadLink = $sectionContent.find('a.download-link');
    }

    /**
     * Instantiate page size callback handler
     * @param $elem {jQuery.HTMLElement} elem for PageSize select
     * @param callback on change callback to load data
     */
    attachPageSizeCallback($elem, callback) {
        const that = this;
        $elem.change(function() {
            callback(1, $elem.val(), that.getCurrentOrder(), that.getFilterText());
        });
    }

    /**
     * Instantiate table filtering handler (debounce used to avoid pre-emptively
     * filtering on partial query strings
     * @param {jQuery.HTMLElement} text input elem
     * @param {function} callback
     */
    attachFilterCallback($elem, callback) {
        const that = this;
        $elem.keyup(_.debounce(function() {
            callback(1, that.getPageSize(), that.getCurrentOrder(), that.getFilterText());
        }, 300));
    }

    /**
     * Clear table, update pagination and download link following a data update
     * @param dataset new data to display
     * @param clear {boolean} clear table
     * @param page {number} 1-indexed page
     * @param pageSize {number} number of results per page
     * @param resultCount  {number} total results
     * @param requestURL  {string} URL used to request data
     */
    update(dataset, clear, page, pageSize, resultCount, requestURL) {
        const that = this;
        if (clear) {
            this.$tbody.empty();
        }

        _.each(dataset, function(row) {
            that.addRow(row);
        });

        if (this.$pagination.data('twbs-pagination')) {
            this.$pagination.twbsPagination('destroy');
        }
        this.$pageSizeSelect.val(pageSize);

        let totalPages = Math.max(Math.ceil(resultCount / pageSize));
        if (isNaN(totalPages)) {
            totalPages = 1;
        }
        if (totalPages > 0) {
            this.$pagination.twbsPagination({
                startPage: page,
                totalPages: totalPages
            }).on('page', function(evt, page) {
                that.callback(page, that.getPageSize(), that.getCurrentOrder(),
                    that.getFilterText());
            });
        }
        this.setPageDisplay(page, resultCount, totalPages);
        this.hideLoadingGif();
        const downloadURL = formatDownloadURL(requestURL);
        this.setDownloadURL(downloadURL);
    }

    /**
     * Append a row of data to the table
     * @param data row data
     */
    addRow(data) {
        const that = this;
        if (this.headers.length !== data.length) {
            console.error('Insufficient data inserted');
            console.error(this.headers);
            console.error(data);
            return;
        }

        let i = 0;
        const tds = _.map(data, function(d) {
            if (d === null) {
                d = '';
            }
            const $td = $('<td>' + d + '</td>');
            const sortByClass = that.headers[i]['sortBy'];
            if (sortByClass !== null && sortByClass.length > 0) {
                $td.addClass(sortByClass);
            }
            i += 1;
            return $td;
        });
        const row = $('<tr></tr>').append(tds);
        this.$tbody.append(row);
    }

    /**
     * Instantiate table headers with sorting callback
     * @param {jQuery.HTMLElement} $table  elem for table header
     * @param {string} initialSort  initial sort type
     * @param {callback} onOrderCallback  callback for ordering change
     */
    initHeaders($table, initialSort, onOrderCallback) {
        const that = this;
        that.order = initialSort;
        $table.find('th.sort-both').on('click', function() {
            const siblings = $(this).siblings('[data-sortby]');
            _.each(siblings, function(s) {
                const sibling = $(s);
                if (sibling.hasClass('sort-desc') || sibling.hasClass('sort-asc')) {
                    siblings.removeClass('sort-desc');
                    siblings.removeClass('sort-asc');
                    siblings.addClass('sort-both');
                }
            });

            const elem = $(this);
            let sort = null;
            if (elem.hasClass('sort-both') || elem.hasClass('sort-desc')) {
                elem.removeClass('sort-both');
                elem.removeClass('sort-desc');
                elem.addClass('sort-asc');
                sort = elem.attr('data-sortby');
            } else {
                elem.removeClass('sort-asc');
                elem.addClass('sort-desc');
                sort = '-' + elem.attr('data-sortby');
            }
            that.order = sort;
            onOrderCallback(1, that.getPageSize(), sort, that.getFilterText());
        });
        if (initialSort) {
            $table.find('[data-sortby=\'' + initialSort + '\']').
                removeClass('sort-both').
                addClass(initialSort.charAt(0) === '-' ? 'sort-desc' : 'sort-asc');
        }
    }

    /**
     * Display loading gif
     */
    showLoadingGif() {
        this.$loadingGif.fadeIn();
    }

    /**
     * Hide loading gif
     */
    hideLoadingGif() {
        this.$loadingGif.fadeOut();
    }

    /**
     * Get
     * @returns {Number}
     */
    getPageSize() {
        return parseInt(this.$pageSizeSelect.val());
    }

    getFilterText() {
        return this.$filterInput.val();
    }

    getCurrentOrder() {
        return this.order;
    }

    setPageDisplay(currentPage, totalResults, totalPages) {
        this.$currentPageDisp.text(currentPage);
        this.$totalResultsDisp.text(totalResults);
        this.$maxPageDisp.text(totalPages);
    }

    setDownloadURL(url) {
        this.$downloadLink.attr('href', url);
    }
};

