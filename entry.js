***REMOVED***
import _ from 'underscore';

const BASE_URL = "https://wwwdev.ebi.ac.uk/metagenomics/api/v0.2/";
***REMOVED***

const STUDIES_PER_PAGE = 10;
var currentPage = 1;
var totalPages = -1;

$(".pagination-next").on('click', function(){
    console.log(currentPage, totalPages);
    if (currentPage<totalPages) {
        currentPage += 1;
        changePage();
    ***REMOVED***
***REMOVED***);

$(".pagination-previous").on('click', function(){
    if (currentPage>1) {
        currentPage -= 1;
        changePage();
    ***REMOVED***
***REMOVED***);

function changePage(){
    var formData = getFormData();
    studiesView.update(currentPage, STUDIES_PER_PAGE, formData[0], formData[1]);
***REMOVED***

function updatePaginationButtons(){
    $(".pagination-next").prop('disabled', currentPage<totalPages);
    $(".pagination-previous").prop('disabled', currentPage>1);
***REMOVED***

function stripLineage(lineage){
***REMOVED***
***REMOVED***
***REMOVED***
    ***REMOVED*** else {
***REMOVED***
    ***REMOVED***

***REMOVED***
***REMOVED***
// Allow function to be called from inside underscore template
***REMOVED***

function getFormData(){
    var formData = $("#studyFilter").serializeArray();
    //Returns [stringQuery, biomeSelectorValue]
    return formData.map(function(elem){return elem.value***REMOVED***);
***REMOVED***

$("#studyFilter").on('submit', function(e){
    e.preventDefault();
    var formData = getFormData();
    currentPage = 1;
    studiesView.update(currentPage, STUDIES_PER_PAGE, formData[0], formData[1]);
***REMOVED***);

var Biome = Backbone.Model.extend({
    parse: function(data){
        var lineage = data.attributes.lineage.match(/[\w|\s]*(root.*)/g)[0].trim();
        return {name: lineage***REMOVED***;
    ***REMOVED***
***REMOVED***);

var BiomeCollection = Backbone.Collection.extend({
    model: Biome,
    url: BASE_URL+"biomes/root",
    parse: function(response){
        return response.data
    ***REMOVED***
***REMOVED***);


var BiomeCollectionView = Backbone.View.extend({
    el: "#biomeSelect",
    template: _.template($("#biomeSelectorTmpl").html()),
    initialize: function(){
        var that = this;
        this.collection.fetch({success: function(){
            that.render();
        ***REMOVED******REMOVED***);

    ***REMOVED***,
    render: function(){
        var biomes = this.collection.models.map(function(model){return model.attributes.name***REMOVED***);
        window.temp = biomes;
        biomes.sort()
        var selectData = {biomes: biomes.sort()***REMOVED***;
        this.$el.html(this.template(selectData));
        return this
    ***REMOVED***

***REMOVED***);




// Model for an individual study
var Study = Backbone.Model.extend({
    parse: function(data){
        var d = new Date(data.attributes["last-update"]);
        return {
            study_link: BASE_URL+"projects/"+data.id,
            biome: data.relationships.biomes.data[0].id,
            study_name: data.attributes['study-name'],
            samples_count: data.attributes['samples-count'],
            last_update: d.getDate()+"-"+MONTHS[d.getMonth()]+"-"+d.getFullYear()
        ***REMOVED***;
    ***REMOVED***
***REMOVED***);


var StudyView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#projectRow").html()),
    attributes: {
        class: 'study',
    ***REMOVED***,
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    ***REMOVED***
***REMOVED***);

// Model for a collection of studies,
var StudiesCollection = Backbone.Collection.extend({
    url: BASE_URL+"studies",
    model: Study,
    parse: function(response){
        updatePaginationText(response.meta.pagination);
        return response.data;
    ***REMOVED***
***REMOVED***);

function updatePaginationText(p){
    console.log(p);
    var curPage = p.page;
    var totPages = p.pages;
    var countStudies = p.count;
    $("#currentPage").text(curPage);
    $("#totalPages").text(totPages);
    totalPages = totPages;
    $("#totalStudies").text(countStudies);
    if (countStudies<STUDIES_PER_PAGE){
        $("#visibleStudies").text(countStudies);
    ***REMOVED*** else {
        $("#visibleStudies").text(STUDIES_PER_PAGE);
    ***REMOVED***
***REMOVED***


var StudiesView = Backbone.View.extend({
    el: '#projectsTable',
    initialize: function(){
        var that = this;
        this.collection.fetch({data: $.param({page: currentPage, page_size: STUDIES_PER_PAGE***REMOVED***), success: function(response){
            that.render();
        ***REMOVED******REMOVED***);
        return this;
    ***REMOVED***,
    update: function(page, page_size, searchQuery, biome){
        var that = this;
        $(".study").remove();
        var params = {***REMOVED***;
        if (page!==undefined){
            params.page=page
        ***REMOVED***
        if (page_size!==undefined){
            params.page_size=page_size
        ***REMOVED***
        if (biome!==undefined){
            params.biome=biome
        ***REMOVED***
        if (searchQuery!==undefined && searchQuery.length > 0){
            params.search = searchQuery
        ***REMOVED***

        this.collection.fetch({data: $.param(params), remove:true, success: function(){
            that.render();
            updatePaginationButtons();
        ***REMOVED******REMOVED***);
        return this;
    ***REMOVED***,
    render: function(){
        this.collection.each(function(study){
            var studyView = new StudyView({model: study***REMOVED***);
            $(this.$el).append(studyView.render());
        ***REMOVED***, this);
        return this;
    ***REMOVED***
***REMOVED***);


StudyView.bind("remove", function(){
   this.$el.fadeOut();
***REMOVED***);

var biomes = new BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes***REMOVED***);

var studies = new StudiesCollection();
var studiesView = new StudiesView({collection: studies***REMOVED***);

// studiesView.update(1,10);
window.biomes = biomes;
window.studiesView = studiesView;

// $("#projectsTable tbody").append(studiesView.render().el);
// studiesView.render();

// studies.fetch({
// 	success: function(collection, response, options){
// 		$('#tmp').text(JSON.stringify(response.data));
// 	***REMOVED***,
// 	error: function(collection, response, options){
// 		console.log(e);
// 	***REMOVED***
// ***REMOVED***);