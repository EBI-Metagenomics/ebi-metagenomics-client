const Backbone = require('backbone');
const api = require('mgnify').api(process.env.API_URL);

const tmpl = require('../../partials/europePMCAnnotations.handlebars');

export const PublicationEuropePMCAnnotationsView = Backbone.View.extend({
    model: api.PublicationEuropePMCAnnotations,
    template: tmpl,
    initialize({publicationId}) {
        this.$loadingSpinner = this.$('.loading-spinner');
        // eslint-disable-next-line new-cap
        this.model = new this.model({id: publicationId});
        this.model.fetch();
        this.model.on('sync', this.render, this);
    },
    render() {
        const that = this;
        // this.model.set('pubmedID', this.model.id);
        that.$el.html(that.template(that.model.toJSON()));
        that.$loadingSpinner.hide();
    }
});
