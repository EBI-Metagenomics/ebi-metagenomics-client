import 'static/libraries/jquery.twbsPagination.js'

export var Pagination = function(){
    let pageSize =  '#pagesize';
    let pagination =  '#pagination';

    let currentPage = 1;

    let opts =  {
        startPage: null,
        totalPages: null,
        activeClass: 'current',
        disabledClass: 'disabled',
        hideOnlyOnePage: true,
        visiblePages: 5,
    };

    function setPaginationElem(selector){
        pagination = selector;
    }

    function initPagination(initPage, initPageSize, totalPages, totalResults, callback) {
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
            $(that.pageSize).change(function (e) {
                callback(that.getPageSize());
        });
    }

    function getPageSize() {
        return parseInt($(pageSize)[0].value);
    }

    function updatePagination(p) {
        const that = this;
        var totPages = p.pages;
        setPageDisplay(p.page, p.pages, p.count);
        opts.startPage = p.page;
        opts.totalPages = p.pages;
        $(pagination).twbsPagination('destroy');
        $(pagination).twbsPagination($.extend({}, opts, {
            startPage: p.PAGE,
            totalPages: p.pages,
        })).on('page', function (evt, page) {
            that.callback(page);
        });
    }

    function setPageDisplay(currentPage, maxPage, totalResults) {
        $("#currentPage").text(currentPage);
        $("#maxPage").text(maxPage);
        if (totalResults){
            $("#totalResults").text(totalResults);
        }
    }
    return {
        setPaginationElem: setPaginationElem,
        initPagination: initPagination,
        setPageSizeChangeCallback: setPageSizeChangeCallback,
        getPageSize: getPageSize,
        updatePagination: updatePagination,
        setPageDisplay: setPageDisplay
    }
};


// window.Pagination = Pagination;