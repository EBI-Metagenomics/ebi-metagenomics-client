import * as util from '../main';
import {SEARCH_URL} from '../config';
const _ = require('underscore');
const Backbone = require('backbone');

util.setCurrentTab('#search-nav');
util.attachTabHandlers();


/*
* FOLLOWING CODE IS SPECIFIC TO EBI-SEARCH API
* */
let Search = Backbone.Collection.extend({
    tab: null,
    params: {
        query: 'A',
        format: 'json',
        size: 10,
        start: 0,
        fields: 'id,name,biome,description',
        facetcount: 10,
        facetsdepth: 5,
    },
    url: function () {
        return SEARCH_URL + this.tab;
    },
    parse: function (response) {
        if (this.pagination) {
            // TODO pagination
            // Pagination.updatePagination(response.meta.pagination);
        }
        console.log(response);
        return response.data;
    }
});

let Project = Backbone.Model.extend({
    parse: function (d) {
        console.log(d);
        return d;
    }
});

let Projects = Search.extend({
    tab: 'projects',
    model: Project,
    parse: function (response) {
        let data = Search.prototype.parse(response);
        console.log(data);
    }
});

let ResultsView = Backbone.View.extend({
    render: function (response) {
        this.$el.html(this.template(response));
        return this.$el
    }
});

let ProjectsView = ResultsView.extend({
    el: '#projects',
    params: {},
    template: _.template($("#projectsTmpl").html()),
    initialize: function () {
        //TODO fetch params from session storage
        this.params = Search.prototype.params;
        const that = this;
        this.collection.fetch({
            data: $.param(this.params),
            success: function (collection, response) {
                console.log(1,collection);
                console.log(2,response);
                that.render(response);
                $('.disp-children').click(function(){
                    const group = $(this).siblings('.facet-child-group');
                    group.hasClass('show') ? group.removeClass('show') : group.addClass('show');
                })
            }
        });
    }
});
let search = new Search();
console.log(search.tab);

let projects = new Projects();
let projectsView = new ProjectsView({collection: projects});