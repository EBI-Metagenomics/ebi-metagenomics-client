const Backbone = require('backbone');
const _ = require('underscore');
const $ = require('jquery');
const api = require('mgnify').api;
const ebisearch = require('../components/ebisearch');
const apiUrl = process.env.API_URL;
const commons = require('../commons');
const blogUrl = commons.BLOG_URL;
const cookieName = commons.COOKIE_NAME;
const Cookies = require('js-cookie');
const util = require('../util');
const subfolder = require('../util').subfolder;

window.Foundation.addToJquery($);

require('static/js/blog');
util.setupPage('#overview-nav');

// Shorthand for $( document ).ready()
$(function() {
    // Sets the blog url for 'See all articles' link
    $('#blog-url').attr('href', blogUrl);
});

let BiomeView = Backbone.View.extend({
    tagName: 'div',
    first: false,
    template: _.template($('#biomeTmpl').html()),
    attributes: {
        class: 'small-6 medium-2 large-2 columns biome-disp'
    },
    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el;
    }
});

let Biomes = Backbone.Collection.extend({
    url: apiUrl + 'biomes/top10?ordering=-samples_count',
    model: api.Biome,
    parse(response) {
        return response.data;
    }
});

let BiomesView = Backbone.View.extend({
    el: '#top10biomes',
    initialize() {
        let that = this;
        this.collection.fetch({
            success() {
                that.collection.models.sort(function(a, b) {
                    return b.attributes.studies_count - a.attributes.studies_count;
                });
                that.render();
            }
        });
        return this;
    },
    render() {
        let x = 0;
        this.collection.each(function(biome) {
            let biomeView = new BiomeView({model: biome});
            let newElem = biomeView.render();
            if (x % 5 === 0) {
                newElem.addClass('medium-offset-1');
            }
            if ((x + 1) % 5 === 0) {
                newElem.addClass('end');
            }
            $(this.$el).append(newElem);
            x += 1;
        }, this);
        return this;
    }
});

let biomes = new Biomes();
new BiomesView({collection: biomes});

let StudyView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#studyTmpl').html()),
    attributes: {
        class: 'study'
    },
    render() {
        let data = this.model.toJSON();
        data.abstract = util.truncateString(data.abstract, 250);
        this.$el.html(this.template(data));
        return this.$el;
    }
});

// Model for a collection of studies,
let StudiesCollection = Backbone.Collection.extend({
    url: apiUrl + 'studies/recent',
    model: api.Study,
    parse(response) {
        return response.data;
    }
});

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
        this.collection.each(function(study) {
            let studyView = new StudyView({model: study});
            $(this.$el).append(studyView.render());
        }, this);
        return this;
    }
});

Foundation.Abide.defaults.patterns['study_accession']
    // = ;
    = /^[EDS]RP\d{6,}$/;

let RequestPublicFormView = Backbone.View.extend({
    el: '#analysisPublicRequestForm',
    tagName: 'form',
    initialize() {
        new window.Foundation.Abide(this.$el, {
            'data-live-validate': true,
            'data-validate-on-blur': true
        });
        this.render();
        const that = this;
        this.$el.find('button.mailtobtn').click(that.submitHandler.bind(this));
    },
    submitHandler(e) {
        e.preventDefault();
        this.sendMail(false);
    },
    sendMail(priv) {
        this.$el.foundation('validateForm');
        // const hasEmptyField = this.$el.find('input:visible').filter(function(e) {
        //     return e.value.length === 0;
        // }).length > 0;
        if (this.$el.find('[data-invalid]:visible').length !== 0) {
            console.error('Did not submit, errors in form.');
            return false;
        } else {
            let body = this.$el.find('input:visible').serialize();
            body = body.replace(/=/g, ': ').replace(/&/g, '%0D%0A');
            body += '%0D%0A'; // Newline
            if (priv) {
                body += 'Private analysis';
            } else {
                body += 'Public analysis';
            }
            body += '%0D%0A'; // Newline
            body += 'Additional notes:';

            let win = window.open('mailto:metagenomics-help@ebi.ac.uk?subject=Analysis request&body=' +
                body, '_blank');
            setTimeout(function() {
                win.close();
            }, 1000);

            this.$el.parent().foundation('toggle');
            return true;
        }
    }
});

let RequestPrivateFormView = RequestPublicFormView.extend({
    el: '#analysisPrivateRequestForm',
    submitHandler(e) {
        e.preventDefault();
        const dataToSubmit = $('#dataNotSubmitted').is(':checked');
        if (this.sendMail(true) && dataToSubmit) {
            window.location.href = subfolder + '/submit';
        }
    }
});

let studies = new StudiesCollection();
new StudiesView({collection: studies});

new RequestPublicFormView();
new RequestPrivateFormView();

/**
 * Intialise stats section
 * @return {JQuery.Promise3<number, number, number, number, number, number, number, number>}
 */
function initObjectCounts() {
    // Perform Ajax request
    const projectCountReq = $.get({url: new ebisearch.ProjectCount().url, cache: false});
    const sampleCountReq = $.get({url: new ebisearch.SampleCount().url, cache: false});
    const runCountReq = $.get({url: new ebisearch.RunCount().url, cache: false});
    const ampliconCountReq = $.get({url: new ebisearch.AmpliconCount().url, cache: false});
    const assemblyCountReq = $.get({url: new ebisearch.AssemblyCount().url, cache: false});
    const metaGountReq = $.get({url: new ebisearch.MetagenomicCount().url, cache: false});
    const metaTCountReq = $.get({url: new ebisearch.MetatranscriptomicCount().url, cache: false});
    const metaBCountReq = $.get({url: new ebisearch.MetabarcodingCount().url, cache: false});

    /**
     * Set filter in site cookie
     * @param {string} experimentType
     */
    function setCookieFilter(experimentType) {
        Cookies.remove(cookieName);
        const defaultCookieParamsStr =
            '{"samples":{"query":""},"projects":{"query":""},"analyses":{"query":""}}';
        let cookieParams = JSON.parse(defaultCookieParamsStr);

        if (experimentType) {
            cookieParams['samples']['filters'] = 'experiment_type:' + experimentType;
            cookieParams['analyses']['filters'] = 'experiment_type:' + experimentType;
        }
        Cookies.set(cookieName, cookieParams);
    }

    /**
     * Create stats display tag
     * @param {number} count number of results
     * @param {string} experimentType
     * @param {string} hashAppend hash location to append to url for redirection
     * @return {jQuery.HTMLElement}
     */
    function createAnchorTag(count, experimentType, hashAppend) {
        const a = $('<a></a>');
        const linkText = document.createTextNode(count);
        a.append(linkText);
        a.attr('href', util.subfolder + '/search' + hashAppend);
        a.click(function() {
            setCookieFilter(experimentType);
            window.location = $(this).attr('href');
            return false;
        });
        return a;
    }

    /**
     * Append link tag to stats display
     * @param {string} elementId id of element to fill with stats
     * @param {number} count number of results for this type
     * @param {string} experimentType of the statistic
     * @param {string} hashAppend hash to append to url to filter results on redirect
     */
    function appendNewAnchorEl(elementId, count, experimentType, hashAppend) {
        let statsElement = $(elementId);
        statsElement.append(createAnchorTag(count, experimentType, hashAppend));
    }

    // Use Promise to get acknowledged when succeeded
    return $.when(
        projectCountReq,
        sampleCountReq,
        runCountReq,
        ampliconCountReq,
        assemblyCountReq,
        metaGountReq,
        metaBCountReq,
        metaTCountReq
    ).done(() => {
        const projectCount = projectCountReq.responseJSON.hitCount;
        const sampleCount = sampleCountReq.responseJSON.hitCount;
        const runCount = runCountReq.responseJSON.hitCount;
        const ampliconCount = ampliconCountReq.responseJSON.hitCount;
        const assemblyCount = assemblyCountReq.responseJSON.hitCount;
        const metaGCount = metaGountReq.responseJSON.hitCount;
        const metaTCount = metaTCountReq.responseJSON.hitCount;
        const metaBCount = metaBCountReq.responseJSON.hitCount;

        const data = [
            ['#amplicon-stats', ampliconCount, 'amplicon', '#analyses'],
            ['#assembly-stats', assemblyCount, 'assembly', '#analyses'],
            ['#metaB-stats', metaBCount, 'metabarcoding', '#analyses'],
            ['#metaG-stats', metaGCount, 'metagenomic', '#analyses'],
            ['#metaT-stats', metaTCount, 'metatranscriptomic', '#analyses'],
            ['#project-stats', projectCount, null, '#projects'],
            ['#sample-stats', sampleCount, null, '#samples'],
            ['#run-stats', runCount, null, '#analyses']
        ];
        _.each(data, function(d) {
            appendNewAnchorEl(...d);
        });
        $('#stats-loading').hide();
        $('#stats-disp').show();
    });
}

initObjectCounts();


