import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';

util.setCurrentTab('#compare-nav');

var StudyView = Backbone.View.extend({
    tagName: 'option',
    template: _.template($('#compare-option').html()),
    attributes: {
        value: '',
        class: 'compare-option',
    },
    render: function () {
        const d = this.model.toJSON();
        this.attributes.value = d.study_accession;
        this.$el.html(this.template({name: d.study_name}));
        return this.$el
    }
});

var StudiesView = Backbone.View.extend({
    el: '#studies',
    initialize: function () {
        var that = this;
        this.collection.fetch({
            success: function (collection, response, options) {
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

var RunView = Backbone.View.extend({
    tagName: 'option',
    template: _.template($('#compare-option').html()),
    attributes: {
        value: '',
        class: 'compare-option run-option',
    },
    render: function () {
        const d = this.model.toJSON();
        this.attributes.value = d.study_accession;
        this.$el.html(this.template({name: d.run_id}));
        return this.$el
    }
});

var RunsView = Backbone.View.extend({
    el: '#runs',
    initialize: function () {
        var that = this;
        $(".run-option").remove();
        this.collection.fetch({
            data: $.param({study_accession: this.collection.study_id}),
            success: function (collection, response, options) {
                that.render();
            }
        });
        return this;
    },

    render: function () {
        this.collection.each(function (run) {
            var runView = new RunView({model: run});
            $(this.$el).append(runView.render());
        }, this);
        return this;
    }
});

var studies = new api.StudiesCollection(false);
var studiesView = new StudiesView({collection: studies});

$('#studies').change(function(e){
    const study_id = $(this).val();
    const collection = new api.RunCollection({study_id: study_id});
    const runsView = new RunsView({collection: collection});
});

