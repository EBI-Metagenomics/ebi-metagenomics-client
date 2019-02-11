const Backbone = require('backbone');
const _ = require('underscore');
const $ = require('jquery');
const api = require('mgnify').api(process.env.API_URL);
const ebisearch = require('../components/ebisearch');
const apiUrl = process.env.API_URL;
const commons = require('../commons');
const blogUrl = commons.BLOG_URL;
const cookieName = commons.COOKIE_NAME;
const Cookies = require('js-cookie');
const util = require('../util');
const subfolder = require('../util').subfolder;
const authApi = require('../components/authApi');

window.Foundation.Abide.defaults.patterns['study_accession']
    = /((?:PRJEB|PRJNA|PRJDB|PRJDA|MGYS|ERP|SRP|DRP)\d{5,})/;

window.Foundation.addToJquery($);

require('static/js/blog');
util.setupPage('#overview-nav');
util.attachExpandButtonCallback();


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
        $(e.currentTarget).prop('disabled', true);
        this.sendMail(false).always(() => {
            $(e.currentTarget).prop('disabled', false);
        });
    },
    sendMail(priv) {
        const deferred = $.Deferred();
        const blankStudyAcc = this.$el.find('input[name=study-accession]').val().length === 0;
        if (this.$el.find('[data-invalid]:visible').length !== 0 || blankStudyAcc) {
            if (blankStudyAcc) {
                this.$el.find('input[name=study-accession]')
                    .attr('data-invalid', '')
                    .addClass('is-invalid-input');
            }
            console.error('Did not submit, errors in form.');
            deferred.reject();
        } else {
            const that = this;
            const userData = new authApi.UserDetails();
            userData.fetch().done(() => {
                const attr = userData['attributes'];
                const email = attr['email'];
                const studyAcc = this.$el.find('input[name=study-accession]').val();
                const comments = this.$el.find('input[name=reason]').val();
                const subject = (priv ? 'Private' : 'Public') + ' analysis request: ' + studyAcc;
                let body = 'Study accession: ' + studyAcc + ';' +
                    (priv ? 'Private' : 'Public') + ' analysis.;' +
                    'Requester name: ' + attr['firstName'] + ' ' + attr['surname'] + '.;' +
                    'Email: ' + email + '.;' +
                    'Additional notes: ' + comments + '.;';
                const request = util.sendMail(email, subject, body);

                request.then((success) => {
                    const txt = '<p>' + (success
                        ? 'Analysis request was succesfully submitted.'
                        : 'Failed to send analysis request, please try ' +
                        'again or contact our helpdesk.')
                        + '</p>';
                    $(that.$el).find('.confirmation-text').html(txt);
                    if (success) {
                        $(that.$el).find('input[type=text], input[type=email], textarea').val('');
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                });
            }).fail(() => {
                deferred.reject();
            });
        }
        return deferred.promise();
    }
});

let RequestPrivateFormView = RequestPublicFormView.extend({
    el: '#analysisPrivateRequestForm',
    submitHandler(e) {
        e.preventDefault();
        const dataToSubmit = $('#dataNotSubmitted').is(':checked');
        const mailReq = this.sendMail(true);
        if (dataToSubmit) {
            mailReq.done(() => {
                window.location.href = subfolder + '/submit';
            });
        }
    }
});

/**
 * Force check that users are logged in before allowing the analysis request form to be displayed.
 */
function setAnalysisRequestLoginCheck() {
    $('button.requestAnalysis').click(function(e) {
        const that = this;
        e.preventDefault();
        util.getLoginStatus().then((loginStatus) => {
            let modalId;
            if (loginStatus) {
                modalId = $(that).attr('data-target-modal');
                $(modalId).find('.confirmation-text').empty();
            } else {
                modalId = '#loginModal';
                $('#loginModal').find('input[name=next]').attr('value', util.subfolder);
            }
            $(modalId).foundation('open');
        });
    });
}

let studies = new StudiesCollection();
new StudiesView({collection: studies});

new RequestPublicFormView();
new RequestPrivateFormView();

let biomes = new Biomes();
new BiomesView({collection: biomes});

setAnalysisRequestLoginCheck();

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

// Needed for hideable form elements
$(document).ready(function() {
    function conditionalElementsEBI(watchedParentClass) {
        watchedParentClass = watchedParentClass || '.conditional-form';
        $(watchedParentClass).on('change', function() {
            let activeSet = this;
            $(activeSet).children().each(function() {
                if ($(this).data('condition')) {
                    let conditionTarget = 'input[name=\'' + $(this).data('condition') + '\']';
                    if ($(conditionTarget).attr('type') === 'radio') {
                        conditionTarget += ':checked';
                    }
                    let conditionRequirement = $(this).data('condition-val') || 1;

                    let show;
                    if (conditionRequirement.indexOf(',') > -1) {
                        conditionRequirement = conditionRequirement.split(',');
                        show = conditionRequirement.indexOf($(conditionTarget).val()) > -1;
                    } else {
                        show = $(conditionTarget).val() === conditionRequirement;
                    }

                    if (show) {
                        $(this).removeClass('hidden');
                    } else {
                        $(this).addClass('hidden');
                    }
                }
            });
        });
    }

    // bootstrap it
    conditionalElementsEBI();
});


