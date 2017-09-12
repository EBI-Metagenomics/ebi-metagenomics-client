var Pagination = module.exports = {
    pageSize: '#pagesize',
    pagination: '#pagination',
    currentPage: 1,
    opts: {
        startPage: 1,
        totalPages: 2,
        activeClass: 'current',
        disabledClass: 'disabled',
        hideOnlyOnePage: true,
        visiblePages: 5,
    },

    initPagination: function(callback) {
        $(pagination).twbsPagination(this.opts).on('page', function(evt, page){
            callback(page);
        });
    },

    updatePageSize(callback) {
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
        var totPages = p.pages;

        this.currentPage = p.page;
        this.maxPage = totPages;
        this.totalResults = p.count;
        $("#currentPage").text(this.currentPage);
        $("#maxPage").text(this.maxPage);
        $("#totalResults").text(this.totalResults);

        $(this.pagination).twbsPagination($.extend({}, this.opts, {
            startPage: 1,
            totalPages: totPages
        }));
    }
};
