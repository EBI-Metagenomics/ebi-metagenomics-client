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
        var that = this;
        this.collection.each(function (study) {
            const model = study.toJSON();
            const tmpl = "<option class='compare-option' value='" + model.study_accession + "'>" + model.study_name + "</option>";
            $(that.el).append($(tmpl));
        }, this);
        return this;
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
                updateRunSelectionTxt(0, collection.length);
                that.render();
            }
        });
        return this;
    },

    render: function () {
        var that = this;
        this.collection.each(function (run) {
            const model = run.toJSON();
            const tmpl = "<option class='compare-option run-option' value='" + model.sample_id + "'>" + model.run_id + "</option>";
            $(that.el).append($(tmpl));
        });
        return this;
    }
});

function updateRunSelectionTxt(selected, total){
    $("#selected").text(selected);
    $("#total").text(total);
}

var studies = new api.StudiesCollection(false);
var studiesView = new StudiesView({collection: studies});

const studiesSelect = '#studies';
$(studiesSelect).change(function (e) {
    const study_id = $(this).val();
    const collection = new api.RunCollection({study_id: study_id});
    const runsView = new RunsView({collection: collection});
});


const runsSelect = '#runs';
$(runsSelect).on('change', function (e) {
    const selected_runids = $(this).val();
    const total_runids = $(this).children().length;
    updateRunSelectionTxt(selected_runids.length, total_runids);
});

$("#selectAll").on('click', function(){
    $(runsSelect).children().prop('selected', true);
});
$("#unselectAll").on('click', function(){
    $(runsSelect).children().prop('selected', false);
});

$("#displayAdvSettings").on('click', function(){
    $('.advanced-settings-wrapper').slideToggle();
});

const advSettingsForm = "#advancedSettings";

$("#clearAll").on('click', function(){
    $(studiesSelect).children().prop('selected', false);
    $(runsSelect).children().prop('selected', false);
    $(advSettingsForm)[0].reset();
});

$("#compare").on('click', function(){
   const studyId = $(studiesSelect).val();
   const runIds = $(runsSelect).val();
   const advSettings = $(advSettingsForm).serializeArray();
   console.log(studyId);
   console.log(runIds);
   console.log(advSettings);
});