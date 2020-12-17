const _ = require('underscore');
const Backbone = require('backbone');
const queryString = require('query-string');

const contigsTableTpl = require("../../templates/analysis/contigsTable/contigsViewerTable.html");
const contigsTableRowsTpl = require("../../templates/analysis/contigsTable/contigsTableRows.html");

require('style-loader!../../../static/css/modules/table.css');

export const ContigsTable = Backbone.View.extend({
    template: contigsTableTpl,
    rowsTemplate: contigsTableRowsTpl,

    events: {
        'click .cursor-next': 'next',
        'click .cursor-prev': 'previuos',
    },

    initialize(collection) {
        this.collection = collection;
    },

    /**
     * Render the handlebars template
     * @param {Object} params Table initialization options
     * @return {String} the rendered HTML
     */
    render(filters) {
        const that = this;
        const tableId = "contigs-table";
        this.$el.html(this.template({
            tableId: tableId,
            title: "Contigs",
            headers: [
                {name: "Name"},
                {name: "Length (bp)"},
                {name: "Coverage"},
                {name: "Features"}
            ],
        }));

        this.$tbody = $("#" + tableId + "-body");
        this.$totalSpan = $("#" + tableId + "-total-results");
        this.$tblLoading = this.$('#table-loading');

        this.refreshTable(filters).then(
            function() {
                that.trigger("contigs-table:render:done");
            }, function() {
                console.error("Contigs table. Error fetching the collection");
            }
        );

        this._filters = filters;

        return this;
    },

    /**
     * Refresh the table data.
     * @param {Object} options with { page, pageSize, ordering, search, viewFirst}
     */
    refreshTable(filters) {
        const that = this;
        this._filters = filters;

        this.$tblLoading.show();

        const deferred = $.Deferred();

        this.collection.fetch({
            data: filters,
            success(ignored, response) {
                that.setNext(response.links.next);
                that.setPrev(response.links.prev);

                that.$totalSpan.html(response.meta.pagination.count);
                
                that._rows = [];

                _.each(that.collection.models, (contigModel) => {
                    const features = [];
                    for (let field in contigModel.attributes) {
                        if (field.startsWith('has_')) {
                            const feature = {
                                field: field,
                                missing: !contigModel.get(field)
                            }
                            features.push(feature);
                        }
                    }
                    that._rows.push({
                        model: contigModel,
                        features: features
                    });   
                });

                that.$tbody.html(that.rowsTemplate({ rows: that._rows }));
                that.trigger("contigs-table:refresh:done", that._filters);
                deferred.resolve();
            },
            error(ignored, response) {
                util.displayError(
                    response.status,
                    'Error while retrieving contigs data for: ' + that.analysisID,
                    that.el);
                deferred.reject();
            },
            complete() {
                that.$tblLoading.hide();
            }
        });

        return deferred.promise();
    },

    /**
     * Get the table rows, provide the contig id for filtering purposes
     * @param {string} contigId filter the rows by id
     */
    getRows(contigId) {
        const that = this;
        if (_.isUndefined(contigId)) {
            return this._rows;
        } else {
            return _.filter(that._rows, function(row) {
                return row.model.get('contig_id') === contigId;
            })
        }
    },

    setNext(url) {
        const next = this.parseCursor(url);
        const hasNext = !_.isEmpty(next) && !_.isUndefined(next);
        this.$('.cursor-next').prop('disabled', !hasNext);
        this._next = next;
        return this;
    },

    setPrev(url) {
        const prev = this.parseCursor(url);
        const hasPrev = !_.isEmpty(prev) && !_.isUndefined(prev);
        this.$('.cursor-prev').prop('disabled', !hasPrev);
        this._previuos = prev;
        return this;
    },

    next() {
        this._filters.cursor = this._next;
        this.refreshTable(this._filters);
        return this;
    },

    previuos() {
        this._filters.cursor = this._previuos;
        this.refreshTable(this._filters);
        return this;
    },

    parseCursor(url) {
        if (_.isEmpty(url)) return;
        const qs = queryString.extract(url);
        if (_.isEmpty(qs)) return;
        const qsValues = queryString.parse(qs);
        return qsValues.cursor;
    }
});
