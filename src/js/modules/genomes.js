const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const Pagination = require('../components/pagination').Pagination;
const GenericTable = require('../components/genericTable');
const Commons = require('../commons');
const pagination = new Pagination();
const PhyloTree = require('../components/phyloTree');
const GenomesSearchView = require('../components/genomeSearch');

util.attachTabHandlers();

util.setupPage('#genome-nav');

$('#pagination').append(commons.pagination);
$('#pageSize').append(commons.pagesize);

const pageFilters = util.getURLFilterParams();

let GenomesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},
    version: null,
    genome_set: null,
    getRowData(attr) {
        const biome = attr.biome;
        const biomeIcon = '<span class="biome_icon icon_xs ' + biome.icon + '" title="' +
            biome.name +
            '"></span>';
        const genomeUrl = '<a href=\'' + attr.genome_url + '\'>' + attr.accession +
            '</a>';
        return [
            biomeIcon,
            genomeUrl, attr.length,
            attr.num_contigs, attr.completeness,
            attr.contamination, attr.type,
            util.getSimpleTaxLineage(attr.taxon_lineage, true), attr.last_updated
        ];
    },
    /**
     * Create basic request parameters for calls to studies / samples on EMG API
     * @return {object}
     */
    createInitParams() {
        let params = {};
        params.page = pagination.currentPage;

        if (this.version && this.version !== 'all') {
            params.release__version = this.version;
        }
        if (this.genome_set && this.genome_set !== 'all') {
            params.genome_set__name = this.genome_set;
        }
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
            params.ordering = '-last_update';
        }

        const search = pageFilters['search'];
        if (search) {
            params.search = search;
            $('#search').val(search);
        }
        params.page_size = pageFilters['pagesize'] || Commons.DEFAULT_PAGE_SIZE;
        params.page = parseInt(pageFilters['page']) || 1;
        return params;
    },
    init() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'accession', name: 'Accession'},
            {sortBy: 'length', name: 'Length'},
            {sortBy: 'num_contigs', name: 'Num. of contigs'},
            {sortBy: 'completeness', name: 'Completeness'},
            {sortBy: 'contamination', name: 'Contamination'},
            {sortBy: null, name: 'Type'},
            {sortBy: null, name: 'Taxonomy'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];
        let params = this.createInitParams();

        const $studiesSection = $('#genomes-section');
        let tableOptions = {
            title: 'Browse genomes',
            headers: columns,
            initialOrdering: params.ordering,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: false,
            tableClass: 'browse-genomes-table',
            hideIfEmpty: false,
            callback: function(page, pageSize, order, search) {
                const params = that.createInitParams();
                params['page'] = page;
                params['page_size'] = pageSize;
                params['ordering'] = order || that.tableObj.getCurrentOrder();
                params['search'] = search;
                that.update(params);
            }
        };
        this.tableObj = new GenericTable($studiesSection, tableOptions);
        this.tableObj.order = params.ordering;
        this.update(params);
    }
});

/**
 * Filter genomes cb
 * @param {Event} e the event
 */
function filterGenomesCallback(e) {
    const releaseVersion = $('#select-release').val();
    const set = $('#select-genomeset').val();

    const params = genomesView.createInitParams();
    genomesView.version = releaseVersion;
    if (releaseVersion !== 'all') {
        genPhyloTree(releaseVersion);
        params['release__version'] = releaseVersion;
    } else {
        delete params['release__version'];
    }

    genomesView.genome_set = set;
    if (set !== 'all') {
        params['genome_set__name'] = set;
    } else {
        delete params['genome_set__name'];
    }
    const filterSearch = genomesView.tableObj.$filterInput.val();
    if (filterSearch) {
        params['search'] = filterSearch;
    }
    genomesView.update(params);
}

let ReleasesView = Backbone.View.extend({
    template: _.template($('#releasesTmpl').html()),
    el: '#releases',
    init() {
        const that = this;
        return this.collection.fetch().done(() => {
            const options = this.collection.toJSON();
            that.release_version = options[0]['version'];
            options.push({'version': 'all'});
            this.$el.html(this.template({'data': options}));
            this.$el.find('#select-release').change(filterGenomesCallback);
        });
    }
});

/**
 * Generate the phylogenetic tree
 * @param {string} releaseVersion Release version
 */
function genPhyloTree(releaseVersion) {
    new api.ReleaseDownloads({id: releaseVersion}).fetch().done((data) => {
        const url = util.findFileUrl(data.data, 'phylo_tree.json');
        new PhyloTree('phylo-tree', url);
    });
}

let releases = new api.Releases();
let releasesView = new ReleasesView({collection: releases});

let genomes = new api.GenomesCollection();

let genomesView = null;
releasesView.init().done(() => {
    genomesView = new GenomesView({collection: genomes});
    const releaseVersion = $('#select-release').val();
    genomesView.version = releaseVersion;
    genPhyloTree(releaseVersion);
    $.when(genomesView.init()).done(() => {
        util.attachExpandButtonCallback();
    });
});

new GenomesSearchView({
    api_url: api.API_URL + 'genome-search'
});
