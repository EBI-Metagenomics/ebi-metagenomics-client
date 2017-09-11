import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as pagi from '../components/pagination';

window.pag = pagi.$pagination;
util.setCurrentTab('#studies-nav');

// Allow function to be called from inside underscore template
function getFormData() {
    var formData = $("#studyFilter").serializeArray();
    //Returns [stringQuery, biomeSelectorValue]
    return formData.map(function (elem) {
        return elem.value
    });
}

$("#studyFilter").on('submit', function (e) {
    e.preventDefault();
    var formData = getFormData();
    pagi.currentPage = 1;
    studiesView.update(pagi.currentPage, pagi.getPageSize(), formData[0], formData[1]);
});

var Biome = Backbone.Model.extend({
    url: function () {
        var base = util.API_URL + 'biomes';
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },
    parse: function (data) {
        // Work-around when requesting root biome
        if (data.data) {
            data = data.data;
        }
        var lineage = data.attributes.lineage.match(/[\w|\s]*(root.*)/g)[0].trim();
        return {name: lineage};
    }
});

var BiomeCollection = Backbone.Collection.extend({
    model: Biome,
    url: util.API_URL + "biomes/root/children",
    parse: function (response) {
        return response.data
    }
});


var BiomeCollectionView = Backbone.View.extend({
    el: "#biomeSelect",
    template: _.template($("#biomeSelectorTmpl").html()),
    initialize: function () {
        var that = this;
        this.collection.fetch({
            data: $.param({depth_lte: 3}), success: function () {
                // Fetch and pre-pend root node to list
                var root = new Biome({id: 'root'});
                root.fetch({
                    success: function () {
                        that.collection.unshift(root);
                        that.render();
                    }
                });
            }
        });
    },
    render: function () {
        var biomes = this.collection.models.map(function (model) {
            return model.attributes.name
        });
        biomes.sort();
        var selectData = {biomes: biomes.sort()};
        this.$el.html(this.template(selectData));
        return this
    }
});

// Model for an individual study
var Study = Backbone.Model.extend({
    parse: function (data) {
        const attr = data.attributes;
        const biomes = data.relationships.biomes.data.map(function (x) {
            return x.id;
        });
        return {
            biome_icon: biomes.map(util.getBiomeIcon),
            study_link: "/study/" + data.id,
            study_name: attr['study-name'],
            samples_count: attr['samples-count'],
            last_update: util.formatDate(attr['last-update'])
        };
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

// Model for a collection of studies,
var StudiesCollection = Backbone.Collection.extend({
    url: util.API_URL + "studies",
    model: Study,
    parse: function (response) {
        updatePagination(response.meta.pagination);
        return response.data;
    }
});


var StudiesView = Backbone.View.extend({
    el: '#studies-table-body',
    initialize: function () {
        var that = this;
        this.collection.fetch({
            data: $.param({page: pagi.currentPage, page_size: pagi.getPageSize()}), success: function (response) {
                that.render();
                pagi.initPagination(changePage);
            }
        });
        return this;
    },

    update: function (page, page_size, searchQuery, biome, ordering) {
        var that = this;
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        if (searchQuery !== undefined && searchQuery.length > 0) {
            params.search = searchQuery
        }
        if (biome !== undefined) {
            params.biome = biome
        }
        if (ordering !== undefined) {
            params.ordering = ordering
        }
        this.collection.fetch({
            data: $.param(params), remove: true, success: function () {
                $(".study").remove();
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
StudyView.bind("remove", function () {
    this.$el.fadeOut();
});

// PAGINATION



$("#pagination").append(util.pagination);
$("#pageSize").append(util.pagesize);

pagi.attachCallBack(changePageSize);


function changePageSize(pageSize) {
    var formData = getFormData();
    studiesView.update(pagi.currentPage, pageSize, formData[0], formData[1]);
}

function changePage(page) {
    var formData = getFormData();
    studiesView.update(page, pagi.getPageSize(), formData[0], formData[1]);
}

function updatePagination(p) {
    var curPage = p.page;
    var totPages = p.pages;
    var countStudies = p.count;
    $("#currentPage").text(curPage);
    $("#maxPage").text(totPages);
    pagi.maxPage = totPages;
    $("#totalStudies").text(countStudies);
    if (countStudies < pagi.getPageSize()) {
        $("#visibleStudies").text(countStudies);
    } else {
        $("#visibleStudies").text(pagi.getPageSize());
    }
    $(pagi.pagination).twbsPagination($.extend({}, pagi.opts, {
        startPage: 1,
        totalPages: totPages
    }));
}



var biomes = new BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});

var studies = new StudiesCollection();
var studiesView = new StudiesView({collection: studies});




function orderResultsTable(event) {
    event.preventDefault();
    const th = $(event.currentTarget);
    let ordering;

    if (th.hasClass('biome')) {
        ordering = 'biome'
    } else if (th.hasClass('name')) {
        ordering = 'study-name'
    } else if (th.hasClass('samples')) {
        ordering = 'samples-count'
    } else if (th.hasClass('updated')) {
        ordering = 'last-update'
    }

    if (th.hasClass('tablesorter-headerAsc')) {
        ordering = '-'.concat(ordering);
    }

    studiesView.update(1, pagi.getPageSize(), undefined, undefined, ordering);
}


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
// 		console.log(e);
// 	}
// });

