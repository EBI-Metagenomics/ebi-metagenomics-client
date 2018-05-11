const Backbone = require('backbone');
require('../commons');
const api = require('mgnify').api;
const util = require('../util');

util.setupPage('#compare-nav');

// let StudyView = Backbone.View.extend({
//     tagName: 'option',
//     template: _.template($('#compare-option').html()),
//     attributes: {
//         value: '',
//         class: 'compare-option'
//     },
//     render() {
//         const d = this.model.toJSON();
//         this.attributes.value = d.study_accession;
//         this.$el.html(this.template({name: d.study_name}));
//         return this.$el;
//     }
// });

let StudiesView = Backbone.View.extend({
    el: '#studies',
    initialize() {
        let that = this;
        this.collection.fetch({
            success() {
                that.render();
            }
        });
        return this;
    },

    render() {
        let that = this;
        this.collection.each(function(study) {
            const model = study.toJSON();
            const tmpl = '<option class=\'compare-option\' value=\'' + model.study_accession +
                '\'>' + model.study_name + '</option>';
            $(that.el).append($(tmpl));
        }, this);
        return this;
    }
});

let RunsView = Backbone.View.extend({
    el: '#runs',
    initialize() {
        let that = this;
        $('.run-option').remove();
        this.collection.fetch({
            data: $.param({study_accession: this.collection.study_id}),
            success(collection) {
                updateRunSelectionTxt(0, collection.length);
                that.render();
            }
        });
        return this;
    },

    render() {
        let that = this;
        this.collection.each(function(run) {
            const model = run.toJSON();
            const tmpl = '<option class=\'compare-option run-option\' value=\'' + model.sample_id +
                '\'>' + model.run_id + '</option>';
            $(that.el).append($(tmpl));
        });
        return this;
    }
});

/**
 * Update displayed text for each run
 * @param {string} selected
 * @param {string} total
 */
function updateRunSelectionTxt(selected, total) {
    $('#selected').text(selected);
    $('#total').text(total);
}

let studies = new api.StudiesCollection(false);
new StudiesView({collection: studies});

const studiesSelect = '#studies';
$(studiesSelect).change(function() {
    const collection = new api.RunsCollection({study_id: $(this).val()});
    new RunsView({collection: collection});
});

const runsSelect = '#runs';
$(runsSelect).on('change', function() {
    const selectedRunIds = $(this).val();
    const totalRunIds = $(this).children().length;
    updateRunSelectionTxt(selectedRunIds.length, totalRunIds);
});

$('#selectAll').on('click', function() {
    $(runsSelect).children().prop('selected', true);
});
$('#unselectAll').on('click', function() {
    $(runsSelect).children().prop('selected', false);
});

$('#displayAdvSettings').on('click', function() {
    $('.advanced-settings-wrapper').slideToggle();
});

const advSettingsForm = '#advancedSettings';

$('#clearAll').on('click', function() {
    $(studiesSelect).children().prop('selected', false);
    $(runsSelect).children().prop('selected', false);
    $(advSettingsForm)[0].reset();
});

$('#compare').on('click', function() {
    const studyId = $(studiesSelect).val();
    const runIds = $(runsSelect).val();
    const advSettings = $(advSettingsForm).serializeArray();
    console.log(studyId);
    console.log(runIds);
    console.log(advSettings);
});
