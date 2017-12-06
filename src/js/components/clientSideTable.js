const tableTmpl = require('../commons').genericTable;
const _ = require('underscore');
const GenericTable = require('./genericTable');

const INIT_PAGE_SIZE = 10;

module.exports = class ClientSideTable extends GenericTable {
    constructor($container, title, headers) {
        super($container, title, headers, null);
        const that = this;
        this.$filterInput.on('keyup', function () {
            const str = $(this).val();
            that.filterTable(str);
        });
        that.attachPageSizeCallback();
    }

    update(dataset, clear, page, resultCount) {
        const that = this;
        if (clear) {
            this.$tbody.empty();
        }

        _.each(dataset, function (row) {
            that.addRow(row);
        });

        this.setPagination(page, resultCount, this.getPageSize());

        this.$tbody.children('tr').slice(this.getPageSize()).hide();
        this.setPageDisplay(1, resultCount);
        this.hideLoadingGif();
    }

    filterTable(searchString) {
        this.searchString = searchString;
        this.$tbody.children('tr').filter(":contains('" + searchString + "')").show();
        this.$tbody.children('tr').filter(":not(:contains('" + searchString + "'))").hide();

        const pageSize = this.getPageSize();
        this.$tbody.children('tr').slice(pageSize).hide();
        const visibleRows = this.$tbody.children('tr:visible').length;
        this.setPagination(1, visibleRows, pageSize);
    }

    attachPageSizeCallback() {
        const that = this;
        this.$pageSizeSelect.change(function () {
            const resultCount = that.$tbody.children('tr').length;
            const pageSize = parseInt(that.$pageSizeSelect.val());
            that.setPagination(1, resultCount, pageSize);
            that.setVisibleRows(0, pageSize)
        })
    }

    setPagination(page, resultCount, pagesize) {
        const that = this;
        if (this.$pagination.data("twbs-pagination")) {
            this.$pagination.twbsPagination('destroy');
        }
        this.$pagination.twbsPagination({
            startPage: page,
            totalPages: Math.max(Math.ceil(resultCount / pagesize), 1),
        }).on('page', function (evt, page) {
            that.changePage(page)
            // that.callback(page, that.getPageSize(), that.getCurrentOrder(), that.getFilterText());
        });
    }

    changePage(page) {
        const pageSize = this.getPageSize();
        const initIndex = (page - 1) * pageSize;
        const finalIndex = page * pageSize;
        this.setVisibleRows(initIndex, finalIndex);
    }

    setVisibleRows(min, pageSize) {
        this.$tbody.children('tr').slice(min).show();

        if (this.searchString) {
            this.filterTable(this.searchString);
        }

        let count = 0;
        this.$tbody.children('tr:visible').each(function (i, e) {
            if (!(min <= i && i < pageSize)) {
                $(e).hide();
            } else {
                $(e).show();
                count++;
            }
        });
    }
};

