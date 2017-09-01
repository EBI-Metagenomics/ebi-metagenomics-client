import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import tablesorter from 'tablesorter';

const STUDIES_PER_PAGE = 10;
var currentPage = 1;
var totalPages = -1;

$(".pagination-next").on('click', function(){
    if (currentPage<totalPages) {
        currentPage += 1;
        changePage();
    }
});

$(".pagination-previous").on('click', function(){
    if (currentPage>1) {
        currentPage -= 1;
        changePage();
    }
});

function changePage(){
    var formData = getFormData();
    studiesView.update(currentPage, STUDIES_PER_PAGE, formData[0], formData[1]);
}

function updatePaginationButtons(){
    $(".pagination-next").prop('disabled', currentPage<totalPages);
    $(".pagination-previous").prop('disabled', currentPage>1);
}


// Allow function to be called from inside underscore template

function getFormData(){
    var formData = $("#studyFilter").serializeArray();
    //Returns [stringQuery, biomeSelectorValue]
    return formData.map(function(elem){return elem.value});
}

$("#studyFilter").on('submit', function(e){
    e.preventDefault();
    var formData = getFormData();
    currentPage = 1;
    studiesView.update(currentPage, STUDIES_PER_PAGE, formData[0], formData[1]);
});

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

// Model for an individual study
var Study = Backbone.Model.extend({
    parse: function(data){
        const attr = data.attributes;
        return {
            study_link: "/study/"+data.id,
            biome: data.relationships.biomes.data[0].id,
            study_name: attr['study-name'],
            samples_count: attr['samples-count'],
            last_update: util.formatDate(attr['last-update'])
        };
    }
});

var StudyView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#studyRow").html()),
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
    url: util.API_URL+"studies",
    model: Study,
    parse: function(response){
        updatePaginationText(response.meta.pagination);
        return response.data;
    }
});

function updatePaginationText(p){
    var curPage = p.page;
    var totPages = p.pages;
    var countStudies = p.count;
    $("#currentPage").text(curPage);
    $("#totalPages").text(totPages);
    totalPages = totPages;
    $("#totalStudies").text(countStudies);
    if (countStudies<STUDIES_PER_PAGE){
        $("#visibleStudies").text(countStudies);
    } else {
        $("#visibleStudies").text(STUDIES_PER_PAGE);
    }
}


var StudiesView = Backbone.View.extend({
    el: '#studiesTable',
    initialize: function(){
        var that = this;
        this.collection.fetch({data: $.param({page: currentPage, page_size: STUDIES_PER_PAGE}), success: function(response){
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
            updatePaginationButtons();
            $(this.el).parent().tablesorter();
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


StudyView.bind("remove", function(){
    this.$el.fadeOut();
});

var biomes = new BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});

var studies = new StudiesCollection();
var studiesView = new StudiesView({collection: studies});


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

