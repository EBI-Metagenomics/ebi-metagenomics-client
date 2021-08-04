require('twbs-pagination');

export const Pagination = function() {
    let pageSize = '#pagesize';
    let pagination = '#pagination';

    let defaultOptions = {
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
        defaultOptions.startPage = Math.max(1, parseInt(initPage));
        defaultOptions.totalPages = Math.max(1, parseInt(totalPages));
        setPageDisplay(initPage, totalPages, totalResults);
        $(pageSize).val(initPageSize);
        $(this.pagination).twbsPagination(defaultOptions).on('page', function(evt, page) {
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
        setPageDisplay(p.page, p.pages, p.count);
        defaultOptions.startPage = p.page;

        const $pagination = $(this.pagination);
        $pagination.removeData('twbs-pagination');
        $pagination.off('page');
        $pagination.empty();

        $pagination.twbsPagination($.extend({}, defaultOptions, {
            startPage: p.PAGE,
            totalPages: p.pages
        })).on('page', function(_, page) {
            callback(page);
        });

        return $pagination;
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
