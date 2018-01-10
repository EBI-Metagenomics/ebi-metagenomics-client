const Backbone = require('backbone');
const _ = require('underscore');
const $ = require('jquery');
const api = require('../components/api');
const apiUrl = process.env.API_URL;
const commons = require('../commons');
const blogUrl = commons.BLOG_URL;

import {initHeadTag, setCurrentTab} from "../util";

setCurrentTab('#overview-nav');
initHeadTag('EBI metagenomics: archiving, analysis and integration of metagenomics data');

$('#this_close').on('click', function () {
    $('.jumbo-header').slideUp();
});

// Shorthand for $( document ).ready()
$(function () {
    // Sets the blog url for 'See all articles' link
    $('#blog-url').attr('href', blogUrl);
});

//  re-style the twitter component
$("iframe").ready(function () {
    var timer = setInterval(function () {
        if ($($("iframe").contents()).find(".avatar").length > 0) {
            $($("iframe").contents()).find(".avatar, .timeline-Tweet-author, .timeline-Tweet-media").css({display: "none"});
            $($("iframe").contents()).find(".timeline-Tweet-retweetCredit").css({'text-align': "center"});
            /*style retweet info text*/
            $($("iframe").contents()).find(".timeline-Tweet-text").css({
                'text-align': "center",
                'font-size': '157%',
                'line-height': '1.4'
            });
            /*style tweet main text*/
            $($("iframe").contents()).find("img.autosized-media").css({'max-height': '175px'});
            /*don't know if this is relevant anymore*/
            clearInterval(timer);
        }
    }, 100);
});

var BiomeView = Backbone.View.extend({
    tagName: 'div',
    first: false,
    template: _.template($("#biomeTmpl").html()),
    attributes: {
        class: 'small-6 medium-6 large-2 columns biome-disp'
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el;
    }
});

var Biomes = Backbone.Collection.extend({
    url: apiUrl + 'biomes/top10?ordering=-samples_count',
    model: api.Biome,
    parse: function (response) {
        return response.data;
    }
});

var BiomesView = Backbone.View.extend({
    el: '#top10biomes',
    initialize: function () {
        var that = this;
        this.collection.fetch({
            success: function () {
                that.collection.models.sort(function (a, b) {
                    return b.attributes.studies_count - a.attributes.studies_count
                });
                that.render();
            }
        });
        return this;
    },
    render: function () {
        let x = 0;
        this.collection.each(function (biome) {
            var biomeView = new BiomeView({model: biome});
            let newElem = biomeView.render();
            if (x % 5 === 0) {
                newElem.addClass('medium-offset-1')
            }
            if ((x + 1) % 5 === 0) {
                newElem.addClass('end')
            }
            $(this.$el).append(newElem);
            x += 1
        }, this);
        return this;
    }
});

var biomes = new Biomes();
var biomesView = new BiomesView({collection: biomes});


var StudyView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($("#studyTmpl").html()),
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
    url: apiUrl + "studies/recent",
    model: api.Study,
    parse: function (response) {
        return response.data;
    }
});

var StudiesView = Backbone.View.extend({
    el: '#studies',
    initialize: function () {
        var that = this;
        this.collection.fetch({
            success: function (response) {
                that.render();
            }
        });
        return this;
    },
    update: function (page, page_size, searchQuery, biome) {
        var that = this;
        $(".study").remove();
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        if (biome !== undefined) {
            params.biome = biome
        }
        if (searchQuery !== undefined && searchQuery.length > 0) {
            params.search = searchQuery
        }

        this.collection.fetch({
            data: $.param(params), remove: true, success: function () {
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

var studies = new StudiesCollection();
var studiesView = new StudiesView({collection: studies});