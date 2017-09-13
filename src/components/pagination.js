var Pagination = module.exports = {
    pageSize: '#pagesize',
    pagination: '#pagination',
    currentPage: 1,

    opts: {
        startPage: null,
        totalPages: null,
        activeClass: 'current',
        disabledClass: 'disabled',
        hideOnlyOnePage: true,
        visiblePages: 5,
    },

    initPagination: function(initPage, initPageSize, totalPages, totalResults, callback) {
        this.opts.startPage = initPage;
        this.opts.totalPages = parseInt(totalPages);
        this.callback = callback;
        this.setPageDisplay(initPage, totalPages, totalResults);
        $("#pagesize").val(initPageSize);

        $(pagination).twbsPagination(this.opts).on('page', function(evt, page){
            console.log('callback');
            callback(page);
        });
    },

    setPageSizeChangeCallback(callback) {
        let that = this;
        $(document).ready(function () {
            $(that.pageSize).change(function (e) {
                callback(that.getPageSize());
            });
        });
    },

    getPageSize: function(){
        return parseInt($(this.pageSize)[0].value);
    },

    updatePagination: function(p) {
        let that = this;
        var totPages = p.pages;

        this.setPageDisplay(p.page, p.pages, p.count);
        this.opts.startPage = p.page;
        this.opts.totalPages = p.pages;
        $(this.pagination).twbsPagination('destroy');
        $(this.pagination).twbsPagination($.extend({}, this.opts, {
            startPage: p.PAGE,
            totalPages: p.pages,
        })).on('page', function(evt, page){
            that.callback(page);
        });
    },

    setPageDisplay: function(currentPage, maxPage, totalResults){
        $("#currentPage").text(currentPage);
        $("#maxPage").text(maxPage);
        $("#totalResults").text(totalResults);
    }
};

window.Pagination = Pagination;