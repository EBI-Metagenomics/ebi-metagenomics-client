import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';
import Pagination from '../components/pagination';

const SAMPLES_PER_PAGE = 10;
var currentPage = 1;
var totalPages = -1;

util.setCurrentTab('#samples-nav');


util.initResultsFilter(function (e) {
    e.preventDefault();
    var formData = util.getFormData();
    console.log(formData);
    samplesView.update(1, Pagination.getPageSize(), formData[0], formData[1]);
});

// $("#filter").on('submit', );


var BiomeCollectionView = Backbone.View.extend({
    el: "#biomeSelect",
    template: _.template($("#biomeSelectorTmpl").html()),
    initialize: function(){
        var that = this;
        this.collection.fetch({data: $.param({depth_lte:3}), success: function(){
            // Fetch and pre-pend root node to list
            var root = new api.Biome({id:'root'});
            root.fetch({success: function(){
                that.collection.unshift(root);
                that.render();
            }});
        }});
    },
    render: function(){
        var biomes = this.collection.models.map(function(model){return model.attributes.name});
        window.temp = biomes;
        biomes.sort();
        var selectData = {biomes: biomes.sort()};
        this.$el.html(this.template(selectData));
        return this
    }
});



var SampleView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#sample-row").html()),
    attributes: {
        class: 'sample',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});


var SamplesView = Backbone.View.extend({
    el: "#samples-table-body",
    initialize: function(){
        var that = this;
        this.collection.fetch({data: $.param({page: Pagination.currentPage, page_size: Pagination.getPageSize()}), success: function(response){
            that.render();
            Pagination.initPagination(changePage);
        }});
        return this;
    },
    update: function(page, page_size, searchQuery, biome){
        var that = this;

        var params = {};
        if (page!==undefined){
            params.page=page
        }
        if (page_size!==undefined){
            params.page_size=page_size
        }
        if (biome!==undefined){
            params.biome=biome
        }
        if (searchQuery!==undefined && searchQuery.length > 0){
            params.search = searchQuery
        }

        this.collection.fetch({page: Pagination.currentPage, page_size: Pagination.getPageSize(), data: $.param(params), remove:true, success: function(){
            $(".sample").remove();
            that.render();
        }});
        return this;
    },
    render: function(){
        this.collection.each(function(sample){
            var sampleView = new SampleView({model: sample});
            $(this.$el).append(sampleView.render());
        }, this);
        return this;
    }
});

$("#pagination").append(util.pagination);
$("#pageSize").append(util.pagesize);

Pagination.updatePageSize(changePageSize);


function changePageSize(pageSize) {
    var formData = util.getFormData();
    samplesView.update(Pagination.currentPage, pageSize, formData[0], formData[1]);
}

function changePage(page) {
    var formData = util.getFormData();
    samplesView.update(page, Pagination.getPageSize(), formData[0], formData[1]);
}




var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});

var samples = new api.SamplesCollection();
var samplesView = new SamplesView({collection: samples});

// TODO remove this
window.samplesView = samplesView;