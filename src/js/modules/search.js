console.log(1);
import {SEARCH_URL} from '../config';
import {attachTabHandlers, setCurrentTab} from "../util";
console.log(2);
const _ = require('underscore');
const Backbone = require('backbone');

setCurrentTab('#search-nav');
attachTabHandlers();
console.log(3);

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
console.log(4);

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
console.log(5);
let ResultsView = Backbone.View.extend({
    render: function (response) {
        this.$el.html(this.template(response));
        return this.$el
    }
});

console.log(6);
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
console.log(1);
let search = new Search();

let projects = new Projects();
let projectsView = new ProjectsView({collection: projects});