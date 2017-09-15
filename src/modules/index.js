import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';
import {API_URL} from "../config";

util.setCurrentTab('#overview-nav');

$('#this_close').on('click', function () {
    $('.jumbo-header').slideUp();
});


var BiomeView = Backbone.View.extend({
    tagName: 'div',
    first: false,
    template: _.template($("#biomeTmpl").html()),
    attributes: {
        class: 'small-6 medium-6 large-2 columns biome-disp'
    },
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el;
    }
});

var Biomes = Backbone.Collection.extend({
    url: API_URL + 'biomes/top10',
    model: api.Biome,
    parse: function(response){
        return response.data;
    }
});

var BiomesView = Backbone.View.extend({
    el: '#top10biomes',
    initialize: function(){
        var that = this;
        this.collection.fetch({success: function(){
            that.collection.models.sort(function(a,b){
                return b.attributes.num_biome_projects - a.attributes.num_biome_projects
            });
            that.render();
        }});
        return this;
    },
    render: function(){
        let x = 0;
        this.collection.each(function(biome){
            var biomeView = new BiomeView({model: biome});
            let newElem = biomeView.render();
            if (x%5===0) {newElem.addClass('medium-offset-1')}
            if ((x+1)%5===0) {newElem.addClass('end')}
            $(this.$el).append(newElem);
            x+=1
        }, this);
        return this;
    }
});

var StudyView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($("#studyTmpl").html()),
    attributes: {
        class: 'study',
    },
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

// Model for a collection of studies,
var StudiesCollection = Backbone.Collection.extend({
    url: API_URL+"studies/recent",
    model: api.Study,
    parse: function(response){
        return response.data;
    }
});

var StudiesView = Backbone.View.extend({
    el: '#studies',
    initialize: function(){
        var that = this;
        this.collection.fetch({success: function(response){
            that.render();
        }});
        return this;
    },
    update: function(page, page_size, searchQuery, biome){
        var that = this;
        $(".study").remove();
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
        }});
        return this;
    },
    render: function(){
        this.collection.each(function(study){
            var studyView = new StudyView({model: study});
            $(this.$el).append(studyView.render());
        }, this);
        return this;
    }
});


var biomes = new Biomes();
var biomesView = new BiomesView({collection: biomes});

var studies = new StudiesCollection();
var studiesView = new StudiesView({collection: studies});
