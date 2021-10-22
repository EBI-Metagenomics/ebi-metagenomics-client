const Backbone = require('backbone');
const api = require('mgnify').api(process.env.API_URL);

const publicationAnnotationTmpl = require('../../partials/europePMCAnnotations.handlebars');
const sampleAnnotationsTmpl = require(
    '../../partials/sampleAnnotationsFromStudiesPublications.handlebars');

export const PublicationEuropePMCAnnotationsView = Backbone.View.extend({
    model: api.PublicationEuropePMCAnnotations,
    template: publicationAnnotationTmpl,
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

export const SampleAdditionalMetadataFromStudiesPublicationsView = Backbone.View.extend({
    model: api.SampleStudiesPublicationsAnnotationsExistence,
    template: sampleAnnotationsTmpl,
    initialize({sampleId}) {
        // eslint-disable-next-line new-cap
        this.model = new this.model({id: sampleId});
        this.model.fetch();
        this.model.on('sync', this.render, this);
    },
    render() {
        const that = this;
        if (this.model.attributes.query_possible &&
            !this.model.attributes.studies_with_annotations.length) {
            // no studies
            that.$el.empty();
            return;
        }
        that.$el.html(that.template(that.model.toJSON()));
    }
});
