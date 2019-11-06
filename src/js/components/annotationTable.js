const Backbone = require('backbone');
const Commons = require('../commons');
const GenericTable = require('../components/genericTable');

/**
 * Annotation table.
 * This table is meant to be used for annotation results, such as KEGG, Pfam.
 * FIXME: add docs!.
 */
module.exports = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},
    initialize(options) {
        this.analysisID = options.analysisID;
        // eslint-disable-next-line new-cap
        this.model = new options.model({
            id: this.analysisID
        });
        this.options = options;
    },
    render() {
        const that = this;
        let tableOptions = {
            title: this.options.title,
            headers: this.options.headers || [
                {name: 'Class ID'},
                {name: 'Description'},
                {name: 'Count'}
            ],
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: false,
            textFilter: false, // => Not supported by API (yet)
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable(this.$el, tableOptions);

        let params = {
            page: 1,
            page_size: Commons.DEFAULT_PAGE_SIZE
        };

        return this.update(params);
    },
    update(params) {
        const that = this;
        const defer = $.Deferred();
        that.tableObj.showLoadingGif();
        this.params = $.extend({}, this.params, params);
        this.fetchXhr = this.model.fetch({
            data: $.param(this.params),
            success(ignored, response) {
                const pagination = response.meta.pagination;
                that.renderData(
                    pagination.page,
                    that.params.page_size,
                    pagination.count,
                    response.links.first);
                that.tableObj.hideLoadingGif();
                defer.resolve();
            }, error(ignored, response) {
                defer.reject(response);
            }
        });
        return defer.promise();
    },
    buildRow(data) {
        return [
            data.accession,
            data.description,
            data.count
        ];
    },
    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = this.model.attributes.data.map((d) => {
            return this.buildRow(d.attributes);
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});
