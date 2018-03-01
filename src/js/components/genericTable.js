const tableTmpl = require('../commons').genericTable;
const _ = require('underscore');
const formatDownloadURL = require('../util').formatDownloadURL;
const Commons = require('../commons');


module.exports = class GenericTable {
    constructor($container, title, headers, initPageSize, callback) {
        this.headers = headers;
        let params = {
            section_title: title,
            headers: headers,
            pagination: true,
            filter: true
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

    storeElemRefs($sectionContent) {
        this.$pagination = $sectionContent.find('ul.pagination');
        this.$pagesizeContainer = $sectionContent.find('div.pagesize');
        this.$currentPageDisp = this.$pagesizeContainer.find("#currentPage");
        this.$maxPageDisp = this.$pagesizeContainer.find("#maxPage");
        this.$totalResultsDisp = this.$pagesizeContainer.find("#totalResults");
        this.$pageSizeSelect = this.$pagesizeContainer.find('#pagesize');
        this.$downloadLink = $sectionContent.find('a.download-link');
    }

    attachPageSizeCallback($elem, callback) {
        const that = this;
        $elem.change(function () {
            callback(1, $elem.val(), that.getCurrentOrder(), that.getFilterText())
        })
    }

    attachFilterCallback($elem, callback) {
        const that = this;
        $elem.keyup(_.debounce(function () {
            callback(1, that.getPageSize(), that.getCurrentOrder(), that.getFilterText())
        }, 300));
    }

    update(dataset, clear, page, pageSize, resultCount, requestURL) {
        const that = this;
        if (clear) {
            this.$tbody.empty();
        }

        _.each(dataset, function (row) {
            that.addRow(row);
        });

        if (this.$pagination.data("twbs-pagination")) {
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
            }).on('page', function (evt, page) {
                that.callback(page, that.getPageSize(), that.getCurrentOrder(), that.getFilterText());
            });
        }
        this.setPageDisplay(page, resultCount, totalPages);
        this.hideLoadingGif();
        const downloadURL = formatDownloadURL(requestURL);
        this.setDownloadURL(downloadURL);
    }

    addRow(data) {
        const that = this;
        if (this.headers.length !== data.length) {
            console.error('Insufficient data inserted');
            console.error(this.headers);
            console.error(data);
            return;
        }


        let i = 0;
        const tds = _.map(data, function (d) {
            if (d === null) {
                d = ''
            }
            const $td = $("<td>" + d + "</td>");
            const sortByClass = that.headers[i]['sortBy'];
            if (sortByClass !== null && sortByClass.length > 0) {
                $td.addClass(sortByClass);
            }
            i += 1;
            return $td;
        });
        const row = $("<tr></tr>").append(tds);
        this.$tbody.append(row);
    }


    initHeaders($table, initialSort, onChangeCallback) {
        const that = this;
        that.order = initialSort;
        $table.find("th.sort-both").on('click', function () {
            const siblings = $(this).siblings('[data-sortby]');
            _.each(siblings, function (s) {
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
            onChangeCallback(1, that.getPageSize(), sort, that.getFilterText());
        });
        if (initialSort) {
            $table.find("[data-sortby='" + initialSort + "']").removeClass('sort-both').addClass(initialSort.charAt(0) === '-' ? 'sort-desc' : 'sort-asc');
        }
    }

    showLoadingGif() {
        this.$loadingGif.fadeIn();
    }

    hideLoadingGif() {
        this.$loadingGif.fadeOut();
    }

    getPageSize() {
        return parseInt(this.$pageSizeSelect.val())
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

