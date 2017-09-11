import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';

util.setCurrentTab('#samples-nav');


var sample_id = util.getURLParameter();

var Sample = Backbone.Model.extend({
    url: function () {
        return util.API_URL + 'samples/' + this.id;
    },
    parse: function (d) {
        const data = d.data;
        const attr = data.attributes;
        return {
            study_accession: attr['study-accession'] || util.NO_DATA_MSG,
            study_link: '/study/' + attr['study-accession'],
            sample_accession: attr.accession || util.NO_DATA_MSG,
            sample_name: attr['sample-name'] || util.NO_DATA_MSG,
            investigation_type: 'N/A' || util.NO_DATA_MSG,
            geo_location: attr['geo-loc-name'] || util.NO_DATA_MSG,
            collection_date: attr['collection-date]'] || util.NO_DATA_MSG,
            env_biome: attr['environment-biome'] || util.NO_DATA_MSG,
            env_feature: attr['environment-feature'] || util.NO_DATA_MSG,
            env_material: attr['environment-material'] || util.NO_DATA_MSG,
            env_package: util.NO_DATA_MSG,
            elevation: util.NO_DATA_MSG,
            ncbi_class: util.NO_DATA_MSG,
            depth: util.NO_DATA_MSG,
            inst_model: util.NO_DATA_MSG,
            lineage: util.formatLineage(data.relationships.biome.data.id || util.NO_DATA_MSG),
            runs: d.included,
        };
    }
});

var SampleView = Backbone.View.extend({
    model: Sample,
    template: _.template($("#sampleTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: $.param({include: 'runs,metadata'}), success: function (data) {
                that.render();
                util.initTableTools();
                var runsView = new RunsView({collection: data.attributes.runs});
            }
        });
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});
var Run = Backbone.Model.extend({
    initialize: function(data){
        this.attributes = this.parse(data);
    },
    parse: function (data) {
        var attr = data.attributes;
        var rel = data.relationships;
        var pipelines = rel.pipelines;
        var analysis = rel.analysis;
        //TODO add analysis date to table
        return {
            run_id: attr.accession,
            run_url: '/run/'+attr.accession,
            experiment_type: data.relationships['experiment-type'].data.id,
            instrument_model: attr.instrument_model || util.NO_DATA_MSG,
            pipeline_version: pipelines.data.map(function (x) {
                return x.id
            }).join(", "),
            analysis_results: 'TAXONOMIC / FUNCTION / DOWNLOAD'
        }
    }
});

var RunView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#runRow").html()),
    attributes: {
        class: 'run',
    },
    render: function () {
        this.$el.html(this.template(this.model));
        return this.$el
    }
});
// var RunCollection = Backbone.Collection.extend({
//     url: util.API_URL + 'runs',
//     model: Run,
//     initialize: function (data) {
//         this.pid = data.pid;
//     },
//     parse: function (response) {
//         return response.data
//     }
// });

var RunsView = Backbone.View.extend({
    el: '#runsTableBody',
    initialize: function () {
        var that = this;
        // this.collection.fetch({
        //     data: $.param({study_accession: this.collection.pid}), success: function () {
        this.render();
        //         createLiveFilter();
        //     }
        // });
        // return this;
    },
    render: function () {
        this.collection.forEach(function (run) {
            if (run.type==='runs') {
                var run = new Run(run);
                var runView = new RunView({model: run.attributes});
                $(this.$el).append(runView.render());
            }
        }, this);
        $(this.el).parent().tablesorter();
        return this;
    }
});

function createLiveFilter() {
    $('#runsTableBody').liveFilter(
        '#search-filter', 'tr'
    );
}


var sample = new Sample({id: sample_id});
var sampleView = new SampleView({model: sample});
