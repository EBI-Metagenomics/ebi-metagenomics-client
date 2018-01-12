const _ = require('underscore');
const GenericTable = require('./genericTable');


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

    update(dataset, clear, page) {
        let resultCount = dataset.length;
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
        this.$table.tablesorter({});
        this.$table.bind('sortStart', function () {
            that.$tbody.children('tr').show();
        }).bind('sortEnd', function () {
            that.setVisibleRows(0, that.getPageSize())
        })
    }

    filterTable(searchString) {
        this.searchString = searchString;
        this.$tbody.children('tr').filter(":contains('" + searchString + "')").addClass('match');
        this.$tbody.children('tr').filter(":not(:contains('" + searchString + "'))").removeClass('match');

        const pageSize = this.getPageSize();
        this.$tbody.children('tr').hide();
        const matchedRows = this.$tbody.children('tr.match');
        matchedRows.slice(0, pageSize).show();
        this.setPagination(1, matchedRows.length, pageSize);
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
        const totalPages = Math.max(Math.ceil(resultCount / pagesize), 1);
        this.$pagination.twbsPagination({
            startPage: page,
            totalPages: totalPages
        }).on('page', function (evt, page) {
            that.changePage(page)
            // that.callback(page, that.getPageSize(), that.getCurrentOrder(), that.getFilterText());
        });
        this.$currentPageDisp.text(page);
        this.$maxPageDisp.text(totalPages);
    }

    changePage(page) {
        const pageSize = this.getPageSize();
        const initIndex = (page - 1) * pageSize;
        const finalIndex = page * pageSize;
        this.setVisibleRows(initIndex, finalIndex);
        this.$currentPageDisp.text(page);
    }

    setVisibleRows(min, finalIndex) {
        // this.$tbody.children('tr').slice(min).show();

        if (this.searchString) {
            this.filterTable(this.searchString);
        }

        let count = 0;
        this.$tbody.children('tr').hide();
        const remainingRows = this.$tbody.children(this.searchString ? 'tr.match' : 'tr');
        remainingRows.slice(min, finalIndex).show();
        // remainingRows.each(function (i, e) {
        //     if (!(min <= i && i < pageSize)) {
        //         $(e).hide();
        //     } else {
        //         console.log('Index:', i);
        //         $(e).show();
        //         count++;
        //     }
        // });
    }
};

