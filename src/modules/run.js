import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';

util.setCurrentTab('#samples-nav');

var run_id = util.getURLParameter();


console.log(run_id);


var Run = Backbone.Model.extend({
    url: function(){
        return util.API_URL + 'runs/' + this.id;
    },
    parse: function(d){
        console.log(d.data);
        const data = d.data;
        const attr = data.attributes;
        return {
            run_accession: attr['accession'],
            analyses: [{
                experiment_type: 'A',
                pipeline_version: 'x.x',
                date: 'xx/xx/xxxx'
            }]

        }
    }
});

var RunView = Backbone.View.extend({
    model: Run,
    template: _.template($("#runTmpl").html()),
    el: '#main-content-area',
    initialize: function() {
        const that = this;
        this.model.fetch({
            data: $.param({include: 'sample'}), success: function (data) {
                that.render();
            }
        })
    },
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el;
    }
});
//
var run = new Run({id: run_id});
var runView = new RunView({model: run});
