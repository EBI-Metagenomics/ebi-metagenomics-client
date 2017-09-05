import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';

const SAMPLES_PER_PAGE = 10;
var currentPage = 1;
var totalPages = -1;

util.setCurrentTab('#samples-nav');


var Biome = Backbone.Model.extend({
    url : function() {
        var base = util.API_URL+'biomes';
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },
    parse: function(data){
        // Work-around when requesting root biome
        if (data.data){
            data = data.data;
        }
        var lineage = data.attributes.lineage.match(/[\w|\s]*(root.*)/g)[0].trim();
        return {name: lineage};
    }
});

var BiomeCollection = Backbone.Collection.extend({
    model: Biome,
    url: util.API_URL+"biomes/root/children",
    parse: function(response){
        return response.data
    }
});


var BiomeCollectionView = Backbone.View.extend({
    el: "#biomeSelect",
    template: _.template($("#biomeSelectorTmpl").html()),
    initialize: function(){
        var that = this;
        this.collection.fetch({data: $.param({depth_lte:3}), success: function(){
            // Fetch and pre-pend root node to list
            var root = new Biome({id:'root'});
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


var Sample = Backbone.Model.extend({
    parse: function (data) {
        const attr = data.attributes;
        return {
            biome: attr['environment-biome'],
            sample_id: attr['accession'],
            sample_name: attr['sample-name'],
            sample_desc: attr['sample-desc'],
            sample_link: "/sample/"+attr['accession']
        }
    }
});

var SampleView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#sampleRow").html()),
    attributes: {
        class: 'study',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

var SamplesCollection = Backbone.Collection.extend({
    url: util.API_URL + "samples",
    model: Sample,
    parse: function(response){
        return response.data;
    }
});

var SamplesView = Backbone.View.extend({
    el: "#samplesTable",
    initialize: function(){
        var that = this;
        this.collection.fetch({data: $.param({page: currentPage, page_size: SAMPLES_PER_PAGE}), success: function(response){
            that.render();
        }});
        return this;
    },
    update: function(page, page_size, searchQuery, biome){
        var that = this;
        $(".sample").remove();
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

        this.collection.fetch({data: $.param(params), remove:true, success: function(){
            that.render();
            // updatePaginationButtons();
            $(this.el).parent().tablesorter();
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

var biomes = new BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});

var samples = new SamplesCollection();
var samplesView = new SamplesView({collection: samples});

// TODO remove this
window.samplesView = samplesView;