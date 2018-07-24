const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api;
const Pagination = require('../components/pagination').Pagination;
const Commons = require('../commons');
const util = require('../util');
const pagination = new Pagination();
const GenericTable = require('../components/genericTable');
const apiUtil = require('mgnify').util;

util.setupPage('#browse-nav');

$('#pagination').append(Commons.pagination);
$('#pageSize').append(Commons.pagesize);

const pageFilters = util.getURLFilterParams();

let BiomesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    init() {
        const that = this;
        const columns = [
            {sortBy: null, name: ''},
            {sortBy: 'biome_name', name: 'Biome name and lineage'},
            {sortBy: 'samples_count', name: 'Samples excluding sub-lineages'}
        ];
        const $samplesSection = $('#biomes-section');
        // ($container, title, headers, initialOrdering, initPageSize, isHeader,
        // filter, tableClass, callback)
        let tableOptions = {
            title: 'Biomes list',
            headers: columns,
            initialOrdering: '-samples_count',
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            filter: true,
            tableClass: 'biomes-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($samplesSection, tableOptions);

        let params = {};
        params.page = pagination.currentPage;

        const biome = pageFilters['lineage'];
        if (biome) {
            params.lineage = biome;
        } else {
            params.lineage = 'root';
        }

        const ordering = pageFilters['ordering'];
        if (ordering) {
            params.ordering = ordering;
        } else {
            params.ordering = '-samples_count';
        }

        const search = pageFilters['search'];
        if (search) {
            params.search = search;
            $('#search').val(search);
        }
        params.page_size = pageFilters['pagesize'] || Commons.DEFAULT_PAGE_SIZE;
        params.page = parseInt(pageFilters['page']) || 1;

        return this.update(params);
    },

    update(params) {
        this.params = $.extend({}, this.params, params);
        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(ignored, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count,
                    response.links.first);
                that.tableObj.hideLoadingGif();
            }
        });
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const biomeName = attr.name[0];
            const biomes = '<span class="biome_icon icon_xs ' + attr.icon + '" title="' +
                biomeName + '"></span>';
            const name = '<a href=\'' + attr.biome_studies_link + '\'>' + biomeName +
                '</a>';
            const lineage = apiUtil.formatLineage(attr.lineage);
            const studiesLink = '<a href=\'' + attr.biome_studies_link + '\'>' +
                attr.samples_count + '</a>';
            return [biomes, name + '<br>' + lineage, studiesLink];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let biomes = new api.BiomeCollection();
let biomesView = new BiomesView({collection: biomes});
biomesView.init();

/**
 * Update page size callback for pageSize select
 * @param {number} pageSize
 */
function updatePageSize(pageSize) {
    const params = {
        page_size: pageSize,
        page: 1
    };
    biomesView.update(params);
}

pagination.setPageSizeChangeCallback(updatePageSize);


