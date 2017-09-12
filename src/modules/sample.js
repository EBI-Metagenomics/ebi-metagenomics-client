import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';
util.setCurrentTab('#samples-nav');


var sample_id = util.getURLParameter();

var SampleView = Backbone.View.extend({
    model: api.Sample,
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


var RunsView = Backbone.View.extend({
    el: '#runsTableBody',
    initialize: function (data) {
        var that = this;
        this.render();
    },
    render: function () {
        this.collection.forEach(function (run) {
            if (run.type==='runs') {
                var run2 = new api.Run().parse(run);
                var runView = new RunView({model: run2});
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


var sample = new api.Sample({id: sample_id});
var sampleView = new SampleView({model: sample});
