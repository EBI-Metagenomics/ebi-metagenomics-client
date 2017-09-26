const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination');
const Order = require('../components/order');


import {DEFAULT_PAGE_SIZE} from "../config";
import {
    getFormData,
    getURLFilterParams,
    hideTableLoadingGif,
    initResultsFilter,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif,
    stripLineage
} from "../util";

setCurrentTab('#studies-nav');
$("#pagination").append(commons.pagination);
$("#pageSize").append(commons.pagesize);

const pageFilters = getURLFilterParams();

const orderOptions = [
    // {name: 'Study accession', value: 'accession'},
    {name: 'Study name', value: 'study_name'},
    // {name: 'Number of runs', value: 'runs-count'}, // NOT DISPLAYED IN TABLE
    {name: 'Number of samples', value: 'samples_count'},
    {name: 'Last updated', value: 'last_update'},
];


initResultsFilter(function (e) {
    e.preventDefault();
    var formData = getFormData("#filter");
    var params = {
        page_size: Pagination.getPageSize(),
        page: Pagination.currentPage,
        search: formData.search,
        lineage: formData.biome,
        ordering: Order.getValue(),
    };
    setURLParams(params, true);
});




var BiomeCollectionView = Backbone.View.extend({
    el: "#biomeSelect",
    template: _.template($("#biomeSelectorTmpl").html()),
    initialize: function () {
        var that = this;
        this.collection.fetch({
            data: $.param({depth_lte: 3}), success: function () {
                // Fetch and pre-pend root node to list
                var root = new api.Biome({id: 'root'});
                root.fetch({
                    success: function () {
                        that.collection.unshift(root);
                        that.render();
                        let biome = pageFilters.get('lineage');
                        if (!biome) {
                            biome = 'root';
                        }
                        $("#biomeSelect > select").val(biome);
                    }
                });
            }
        });
    },
    render: function () {
        var biomes = this.collection.models.map(function (model) {
            return model.attributes.lineage
        });
        var selectData = {
            biomes: biomes.sort().map(function (x) {
                return {
                    lineage: x,
                    biome: stripLineage(x)};
            })
        };
        this.$el.html(this.template(selectData));
        return this
    }
});

var StudyView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#study-row").html()),
    attributes: {
        class: 'study',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});


var StudiesView = Backbone.View.extend({
    el: '#studies-table-body',
    params: {},

    initialize: function () {
        var that = this;

        let params = {};
        params.page = Pagination.currentPage;
        params.page_size = Pagination.getPageSize();

        const biome = pageFilters.get('lineage');
        if (biome) {
            params.lineage = biome;
        } else {
            params.lineage = 'root';
        }

        const ordering = pageFilters.get('ordering');
        if (ordering){
            params.ordering = ordering;
        }  else {
            params.ordering = '-last_update';
        }

        const search = pageFilters.get('search');
        if (search) {
            params.search = search;
            $("#search").val(search);
        }

        const pagesize = pageFilters.get('pagesize') || DEFAULT_PAGE_SIZE;
        if (pagesize) {
            params.page_size = pagesize;
        }
        params.page = parseInt(pageFilters.get('page')) || 1;
        this.params = params;

        this.collection.fetch({
            data: $.param(params),
            remove: true,
            success: function (collection, response, options) {
                that.render();
                const pag = response.meta.pagination;
                Pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
                Order.initSelector(orderOptions, params.ordering, function (val) {
                    var formData = getFormData("#filter");
                    that.update(1, Pagination.getPageSize(), null, null, val);
                });
            }
        });
        return this;
    },

    update: function (page, page_size, searchQuery, biome, ordering) {
        $(".study").remove();

        showTableLoadingGif();
        var that = this;
        var params = {};

        if (page !== null) {
            params.page = page
        }

        if (page_size !== null) {
            params.page_size = page_size
        }

        if (searchQuery !== null) {
            params.search = searchQuery
        } else {
            if (this.params.search) {
                params.search = this.params.search;
            }
        }

        if (biome !== null) {
            params.lineage = biome
        } else {
            if (this.params.lineage) {
                params.lineage = this.params.lineage;
            }
        }

        if (ordering !== undefined) {
            params.ordering = ordering
        }
        // util.setURLParams(params.search, params.lineage, params.page_size, params.page, false);
        setURLParams(params, false);

        this.collection.fetch({
            data: $.param(params), remove: true, success: function (collection, response, options) {
                hideTableLoadingGif();
                Pagination.updatePagination(response.meta.pagination);
                that.render();
            }
        });
        return this;
    },
    render: function () {
        this.collection.each(function (study) {
            var studyView = new StudyView({model: study});
            $(this.$el).append(studyView.render());
        }, this);
        return this;
    }
});



function updatePageSize(pageSize) {
    var formData = getFormData("#filter");
    studiesView.update(Pagination.currentPage, pageSize, null, null);
}

function changePage(page) {
    var formData = getFormData("#filter");
    studiesView.update(page, Pagination.getPageSize(), null, null);
}

Pagination.setPageSizeChangeCallback(updatePageSize);


var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});
var studies = new api.StudiesCollection();
var studiesView = new StudiesView({collection: studies});

// PAGINATION






// function orderResultsTable(event) {
//     event.preventDefault();
//     const th = $(event.currentTarget);
//     let ordering;
//
//     if (th.hasClass('biome')) {
//         ordering = 'biome'
//     } else if (th.hasClass('name')) {
//         ordering = 'study-name'
//     } else if (th.hasClass('samples')) {
//         ordering = 'samples-count'
//     } else if (th.hasClass('updated')) {
//         ordering = 'last-update'
//     }
//
//     if (th.hasClass('tablesorter-headerAsc')) {
//         ordering = '-'.concat(ordering);
//     }
//
//     studiesView.update(1, Pagination.getPageSize(), undefined, undefined, ordering);
// }


//TODO remove this
// studiesView.update(1,10);
window.biomes = biomes;
window.studiesView = studiesView;

// $("#projectsTable tbody").append(studiesView.render().el);
// studiesView.render();

// studies.fetch({
// 	success: function(collection, response, options){
// 		$('#tmp').text(JSON.stringify(response.data));
// 	},
// 	error: function(collection, response, options){
// 	}
// });

