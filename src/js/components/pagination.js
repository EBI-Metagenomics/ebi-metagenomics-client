require('twbs-pagination');

export const Pagination = function() {
    let pageSize = '#pagesize';
    let pagination = '#pagination';

    let opts = {
        startPage: null,
        totalPages: null,
        activeClass: 'current',
        disabledClass: 'disabled',
        hideOnlyOnePage: true,
        visiblePages: 5
    };

    /**
     * Overwrite default jQuery selector
     * @param {string} selector
     */
    function setPaginationElem(selector) {
        this.pagination = selector;
    }

    /**
     * Setup pagination display
     * @param {integer} initPage
     * @param {integer} initPageSize
     * @param {integer} totalPages
     * @param {integer} totalResults
     * @param {function} callback page change callback
     */
    function init(initPage, initPageSize, totalPages, totalResults, callback) {
        opts.startPage = Math.max(1, parseInt(initPage));
        opts.totalPages = Math.max(1, parseInt(totalPages));
        setPageDisplay(initPage, totalPages, totalResults);
        $(pageSize).val(initPageSize);
        $(this.pagination).twbsPagination(opts).on('page', function(evt, page) {
            callback(page);
        });
    }

    /**
     * Set callback for page size
     * @param {function} callback
     */
    function setPageSizeChangeCallback(callback) {
        const that = this;
        $(document).on('change', that.pageSize, function() {
            callback(that.getPageSize());
        });
    }

    /**
     * Return current page size
     * @return {Number}
     */
    function getPageSize() {
        return parseInt($(pageSize)[0].value);
    }

    /**
     * Update pagination elem
     * @param {object} p pagination object
     * @param {function} callback
     */
    function update(p, callback) {
        let totPages = p.pages;
        setPageDisplay(p.page, totPages, p.count);
        opts.startPage = p.page;
        opts.totalPages = totPages;
        $(this.pagination).twbsPagination('destroy');
        $(this.pagination).twbsPagination($.extend({}, opts, {
            startPage: p.PAGE,
            totalPages: totPages
        })).on('page', function(evt, page) {
            callback(page);
        });
    }

    /**
     * Update pagination display
     * @param {number} currentPage
     * @param {number} maxPage
     * @param {number} totalResults
     */
    function setPageDisplay(currentPage, maxPage, totalResults) {
        $('#currentPage').text(currentPage);
        $('#maxPage').text(maxPage);
        $('#totalResults').text(totalResults);
    }

    return {
        pageSize: pageSize,
        pagination: pagination,
        setPaginationElem: setPaginationElem,
        init: init,
        setPageSizeChangeCallback: setPageSizeChangeCallback,
        getPageSize: getPageSize,
        update: update,
        setPageDisplay: setPageDisplay
    };
};

// window.Pagination = Pagination;
