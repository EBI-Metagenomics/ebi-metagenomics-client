const _ = require('underscore');
const GenericTable = require('./genericTable');
require('../../../static/js/jquery.TableCSVExport');

module.exports = class ClientSideTable extends GenericTable {
    /**
     * Initialize handles, pagination and callback for table
     * @param {jQuery.HTMLElement} $container  jQuery container elem
     * @param {objects} options
     */
    constructor($container, options) {
        super($container, options);
        const that = this;
        this.$filterInput.on('keyup', function() {
            const str = $(this).val();
            that.filterTable(str);
        });
        this.initHeaders();
        this.attachDownloadHandler();
    }

    /**
     * Clear and update table with new data
     * @param {[*]} dataset new data
     * @param {number} clear boolean remove existing data
     * @param {number} page set pagination page
     */
    update(dataset, clear, page) {
        let resultCount = dataset.length;
        const that = this;
        if (clear) {
            this.$tbody.empty();
        }

        _.each(dataset, function(row) {
            that.addRow(row);
        });

        this.setPagination(page, resultCount, this.getPageSize());

        this.$tbody.children('tr').slice(this.getPageSize()).hide();
        this.setPageDisplay(1, resultCount);
        this.hideLoadingGif();
        this.$table.tablesorter({
            theme: 'dropbox',
            cssIcon: 'tablesorter-icon'
        });
        this.$table.bind('sortStart', function() {
            that.$tbody.children('tr').show();
        }).bind('sortEnd', function() {
            that.setVisibleRows(0, that.getPageSize());
        });
    }

    /**
     * Filter table results by string
     * @param {string} searchString filter parameter
     */
    filterTable(searchString) {
        this.searchString = searchString;
        this.$tbody.children('tr').filter(':contains(\'' + searchString + '\')').addClass('match');
        this.$tbody.children('tr')
            .filter(':not(:contains(\'' + searchString + '\'))')
            .removeClass('match');

        const pageSize = this.getPageSize();
        this.$tbody.children('tr').hide();
        const matchedRows = this.$tbody.children('tr.match');
        matchedRows.slice(0, pageSize).show();
        this.setPagination(1, matchedRows.length, pageSize);
    }

    /**
     * Update pagination display
     * @param {number} page int current page
     * @param {number} resultCount int total number of results
     * @param {number} pagesize int
     */
    setPagination(page, resultCount, pagesize) {
        const that = this;
        if (this.$pagination.data('twbs-pagination')) {
            this.$pagination.twbsPagination('destroy');
        }
        let totalPages = Math.max(Math.ceil(resultCount / pagesize));
        if (isNaN(totalPages)) {
            totalPages = 1;
        }
        if (totalPages > 0) {
            this.$pagination.twbsPagination({
                startPage: page,
                totalPages: totalPages
            }).on('page', function(evt, page) {
                that.changePage(page);
            });
        }
        this.$currentPageDisp.text(page);
        this.$maxPageDisp.text(totalPages);
    }

    /**
     * Change page that is currently displayed
     * @param {number} page from-1 page index
     */
    changePage(page) {
        const pageSize = this.getPageSize();
        const initIndex = (page - 1) * pageSize;
        const finalIndex = page * pageSize;
        this.setVisibleRows(initIndex, finalIndex);
        this.$currentPageDisp.text(page);
    }

    /**
     * Hide or display rows by index in dataset
     * @param {number} min starting index
     * @param {number} finalIndex end index
     */
    setVisibleRows(min, finalIndex) {
        if (this.searchString) {
            this.filterTable(this.searchString);
        }

        this.$tbody.children('tr').hide();
        const remainingRows = this.$tbody.children(this.searchString ? 'tr.match' : 'tr');
        // FIXME: For medium/large tables this is slow.
        remainingRows.slice(min, finalIndex).show();
    }

    /**
     * Create headers with sorting icons
     * @param {string} initialSort initialSort parameter
     */
    initHeaders(initialSort) {
        const that = this;
        that.order = initialSort;
        this.$table.find('th.sort-both').on('click', function() {
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
        });
        if (initialSort) {
            this.$table.find('[data-sortby=\'' + initialSort + '\']')
                .removeClass('sort-both')
                .addClass(initialSort.charAt(0) === '-' ? 'sort-desc' : 'sort-asc');
        }
    }

    /**
     * Add click handler to download link in table template
     */
    attachDownloadHandler() {
        const that = this;
        this.$downloadLink.click(() => {
            $(that.$table).TableCSVExport({
                showHiddenRows: true,
                delivery: 'download'
            });
        });
    }
};

