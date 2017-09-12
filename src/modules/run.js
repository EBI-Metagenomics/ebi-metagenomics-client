import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';

util.setCurrentTab('#samples-nav');

var run_id = util.getURLParameter();



var RunView = Backbone.View.extend({
    model: api.Run,
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



var run = new api.Run({id: run_id});
var runView = new RunView({model: run});
