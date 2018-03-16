require('static/libraries/jquery.twbsPagination.js');

export const Pagination = function () {
    let pageSize = '#pagesize';
    let pagination = '#pagination';

    let currentPage = 1;

    let opts = {
        startPage: null,
        totalPages: null,
        activeClass: 'current',
        disabledClass: 'disabled',
        hideOnlyOnePage: true,
        visiblePages: 5,
    };

    function setPaginationElem(selector) {
        pagination = selector;
    }

    function init(initPage, initPageSize, totalPages, totalResults, callback) {
        opts.startPage = Math.max(1, parseInt(initPage));
        opts.totalPages = Math.max(1, parseInt(totalPages));
        setPageDisplay(initPage, totalPages, totalResults);
        $(pageSize).val(initPageSize);
        $(pagination).twbsPagination(opts).on('page', function (evt, page) {
            callback(page);
        });
    }

    function setPageSizeChangeCallback(callback) {
        const that = this;
        $(document).on('change', that.pageSize, function (e) {
            callback(that.getPageSize());
        });
    }

    function getPageSize() {
        return parseInt($(pageSize)[0].value);
    }

    function update(p, callback) {
        let totPages = p.pages;
        setPageDisplay(p.page, totPages, p.count);
        opts.startPage = p.page;
        opts.totalPages = totPages;
        $(pagination).twbsPagination('destroy');
        $(pagination).twbsPagination($.extend({}, opts, {
            startPage: p.PAGE,
            totalPages: totPages,
        })).on('page', function (evt, page) {
            callback(page);
        });
    }

    function setPageDisplay(currentPage, maxPage, totalResults) {
        $("#currentPage").text(currentPage);
        $("#maxPage").text(maxPage);
        $("#totalResults").text(totalResults);
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
    }
};


// window.Pagination = Pagination;