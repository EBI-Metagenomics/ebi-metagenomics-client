***REMOVED***
import _ from 'underscore';
import * as site from '../main';

var regex = /(?:id=)(.+)/g;
var project_id = regex.exec(window.location.search)[1];

var Study = Backbone.Model.extend({
    url : function() {
        var base = site.API_URL+'studies';
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    ***REMOVED***,
    parse: function(data){
        var attr = data.data.attributes;
        var biomes = data.data.relationships.biomes.data;
        var biome_list = biomes.map(function(x){return x.id.split(":").slice(1).join(" > ")***REMOVED***);
        return {
            project_id: attr['project-id'],
            project_accession: attr['accession'],
            last_updated: site.formatDate(attr['last-update']),
            contact_details: {
                institute: attr['centre-name'] || site.NO_DATA_MSG,
                name: attr['author-name'] || site.NO_DATA_MSG,
                email: attr['author-email'] || site.NO_DATA_MSG,
            ***REMOVED***,
            abstract: attr['study-abstract'],
            classifications: biome_list
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

var StudyView = Backbone.View.extend({
    model: Study,
    template: _.template($("#studyTmpl").html()),
    el: '#content',
    initialize: function(){
        var that = this;
        this.model.fetch({success: function(data){
            that.render();
            attachTabHandlers();
        ***REMOVED******REMOVED***);
    ***REMOVED***,
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    ***REMOVED***
***REMOVED***)
//
// var SampleView = Backbone.Model.extend({
//
// ***REMOVED***);




var test = new Study({id: project_id***REMOVED***);
var testView = new StudyView({model: test***REMOVED***);

window.testView = testView;

function attachTabHandlers(){
    $("li.tabs-title > a").on('click', function(){
        var tabButtonContainer = $(this).closest('ul');
        $(tabButtonContainer).children().children('a').attr('aria-selected', 'false');
        $(this).attr('aria-selected', 'true');

        // Remove active class from all sibling buttons
        var tabId = $(this).attr('href');
        var tabGroup = tabButtonContainer.attr('id');
        $("[data-tab-content="+tabGroup+"] > .tabs-panel").removeClass('active');
        $(tabId).addClass('active');
    ***REMOVED***);
***REMOVED***;
