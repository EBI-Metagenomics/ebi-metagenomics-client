const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const api = require('mgnify').api(process.env.API_URL);
const authApi = require('./components/authApi');
const Commons = require('./commons');
const GenericTable = require('./components/genericTable');
const Cookies = require('js-cookie');
import 'process';

require('babel-polyfill');

export const subfolder = process.env.DEPLOYMENT_SUBFOLDER;
$.typeWatch = require('jquery.typewatch');

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;

/**
 * Set visible tab by id
 * @param {string} id
 */
export function setCurrentTab(id) {
    document.addEventListener('DOMContentLoaded', function() {
        $(id).addClass('active');
    });
}

/**
 * Retrieve URL parameter after last /
 * @return {string}
 */
export function getURLParameter() {
    let regex = /([A-z0-9,%+.]+)(?:$|[?])/g;
    return regex.exec(window.location.pathname)[1];
}

/**
 * Get filter parameters from page URL
 * @return {*}
 */
export function getURLFilterParams() {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let sURLVariables = sPageURL.split('&');
    let sParameterName;
    let params = {};
    sURLVariables.forEach(function(e) {
        sParameterName = e.split('=');
        params[sParameterName[0]] = decodeURIComponent(sParameterName[1]);
    });
    return params;
}

/**
 * Format lineage text for biome selector
 * @param {string} lineage
 * @return {string}
 */
export function stripLineage(lineage) {
    let depth;
    if (lineage.includes(':')) {
        depth = lineage.match(/:/g).length;
    } else {
        depth = 0;
    }

    return '&nbsp;'.repeat(depth * 4) + lineage.split(':').pop();
}

/**
 * Set URL GET parameters from object
 * @param {object} params
 * @param {boolean} refresh page
 */
export function setURLParams(params, refresh) {
    if (refresh) {
        window.location.search = $.param(params);
    } else {
        history.pushState(null, '', window.location.pathname + '?' + $.param(params));
        //    Set URL without refreshing
    }
}

/**
 * Display loading gif
 */
export function showTableLoadingGif() {
    $('.loading-gif-row').show();
}

/**
 * Hide loading gif
 */
export function hideTableLoadingGif() {
    $('.loading-gif-row').hide();
}

/**
 * Retrieve parent tab of elem
 * @param {jQuery.Element} $elem
 * @return {jQuery.Element} parent tab elem
 */
function getParentTab($elem) {
    return $elem.parents('.tabs-panel');
}

/**
 * Attach tab handler callback to switch tabs
 */
export function attachTabHandlers() {
    // Deep linking
    const $dataTabs = $('[data-tabs]');
    $dataTabs.each(function() {
        new window.Foundation.Tabs($(this));
    });
    const linkTab = window.location.hash.substr(1);
    if (linkTab) {
        changeTab($('#' + linkTab));
    }

    // Linking click actions
    $('li.tabs-title > a').on('click', function() {
        changeTab($($(this).attr('href')));
        window.location.hash = $(this).attr('href');
    });
}

/**
 * Change tab visibility such that all tabs are hidden except specified tab
 * @param {jQuery.Element} $tab (without leading hash) to display
 */
export function changeTab($tab) {
    const $siblings = $tab.parent().children('.tabs-panel:not(\'#' + $tab.attr('id') + '\')');
    $siblings.each((i, elem) => {
        const $elem = $(elem);
        $elem.removeClass('active');
        const id = $elem.attr('id');
        const $btn = $('a[href=\'#' + id + '\']');
        $btn.attr('aria-selected', 'false');
    });
    $tab.addClass('active');
    const id = $tab.attr('id');
    const $btn = $('a[href=\'#' + id + '\']');
    $btn.attr('aria-selected', 'true').addClass('is-active');
    $btn.parent().addClass('is-active');
    let $parentTab = getParentTab($tab);
    if ($parentTab.length > 0) {
        changeTab($parentTab);
    }
    //
    // // Tab header
    // $('ul.tabs > li > a').each((i, el) => {
    //     const $el = $(el);
    //     if ($($el).attr('href') === ('#' + tabId)) {
    //         $($el).parent().addClass('is-active');
    //         $el.attr('aria-selected', 'true');
    //     } else {
    //         $($el).parent().removeClass('is-active');
    //         $el.attr('aria-selected', 'false');
    //     }
    // });
    // $('div.tabs-panel').each((i, el) => {
    //     const $el = $(el);
    //     if ($($el).attr('id') === tabId) {
    //         $($el).addClass('active');
    //     } else {
    //         $($el).removeClass('active');
    //     }
    // });
    // Tab content
    // $("div.tabs-panel:not('" + tabId + "')").removeClass('active');
    // $("div.tabs-panel"+tabId).addClass('active');
}

window.changeTab = changeTab;

/**
 * Create biome select option from lineage
 * @param {string} lineage
 * @return {string} <option>
 */
function createBiomeOption(lineage) {
    return '<option value="' + lineage + '">' + stripLineage(lineage) + '</option> ';
}

export const BiomeCollectionView = Backbone.View.extend({
    selector: '.biome-select',
    initialize() {
        let that = this;
        this.fetchOp = this.collection.fetchWithParams().done(() => {
            that.clearSelectOptions();
            that.addOptionsToSelect(that.collection.models, that.collection.rootLineage);
        });
    },
    clearSelectOptions() {
        const $biomeSelect = $(this.selector);
        $biomeSelect.empty();
    },
    addOptionsToSelect(data, biome) {
        const $biomeSelect = $(this.selector);
        _.each(data, function(d) {
            const newOption = createBiomeOption(d.attributes.lineage);
            $biomeSelect.append(newOption);
        });
        $biomeSelect.val(biome);
    }
});

/**
 * Truncates the given string to the given maximum length.
 *
 * @param {string} str to truncate.
 * @param {maxLength} maxLength .
 * @return {string} truncated input with ellipsis
 */
export function truncateString(str, maxLength = 190) {
    return (str.length > maxLength) ? str.substr(0, maxLength - 1) + '&hellip;' : str;
}

/**
 * Format request for URL (remove result size limit, add csv format
 * @param {string} requestURL api url to format for download
 * @return {string} formatted url for download
 */
export function formatDownloadURL(requestURL) {
    const splitURL = requestURL.split('?');
    let params = _.filter(splitURL[1].split('&'), function(e) {
        const paramName = e.split('=')[0];
        return !_.contains(['page', 'page_size', 'format'], paramName);
    });
    params.push('format=csv');
    return splitURL[0] + '?' + params.join('&');
}

/**
 * Create a string representation of a hyperlink tag
 * @param {string} url to follow on click
 * @param {string} text to display
 * @return {string}
 */
export function createLinkTag(url, text) {
    return '<a href=\'' + url + '\'>' + text + '</a>';
}

/**
 * Create a list item
 * @param {string} html content of tag
 * @return {string}
 */
export function createListItem(html) {
    return '<li>' + html + '</li>';
}

/**
 * Return promise of request of URL, used to validate if URL is valid
 * @param {string} url
 * @return {jQuery.Promise}
 */
export function checkURLExists(url) {
    const deferred = $.Deferred();
    $.ajax({
        type: 'HEAD',
        url: url,
        tryCount: 0,
        retryLimit: 5,
        success: function() {
            deferred.resolve();
        },
        error: function() {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                $.ajax(this);
            } else {
                deferred.reject();
            }
        }
    });
    return deferred.promise();
}

/**
 * Check API is online, replace body with error message if not.
 */
export function checkAPIonline() {
    checkURLExists(process.env.API_URL).fail(() => {
        $('body').html('Error: API Offline');
    }).done(() => {
        console.log('API is online.');
    });
}

/**
 * Method to update Samples or Runs view from pagination event
 * @param {Backbone.View} view Backbone view for sample or studies
 * @param {object} params dict of API query parameters
 * @return {jQuery.Promise} wrapping AJAX query to API
 */
export function updateTable(view, params) {
    view.tableObj.showLoadingGif();
    if (!params) {
        params = {};
    }
    if (!params['page']) {
        params['page'] = 1;
    }
    if (!params['page_size']) {
        params['page_size'] = view.tableObj.getPageSize();
    }
    if (!params['ordering']) {
        params['ordering'] = view.tableObj.getCurrentOrder();
    }
    if (!params['search']) {
        delete params['search'];
    }

    let collectionParams = view.collection.params || {};
    if (Object.prototype.hasOwnProperty.call(collectionParams, 'study_accession')) {
        params['study_accession'] = collectionParams.study_accession;
    } else if (Object.prototype.hasOwnProperty.call(collectionParams, 'sample_accession')) {
        params['sample_accession'] = collectionParams.sample_accession;
    } else if (Object.prototype.hasOwnProperty.call(collectionParams, 'run_accession')) {
        params['run_accession'] = collectionParams.run_accession;
    }

    const that = view;
    const deferred = $.Deferred();
    view.fetchXhr = view.collection.fetch({
        data: $.param(params),
        success(ignored, response) {
            that.renderData(response.meta.pagination.page, params['page_size'],
                response.meta.pagination.count,
                response.links.first);
            that.tableObj.hideLoadingGif();
            deferred.resolve(that.collection);
        },
        fail() {
            deferred.fail();
        }
    });
    return deferred.promise();
}

export let GenericTableView = Backbone.View.extend({
    update(params) {
        return updateTable(this, params);
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const that = this;
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            return that.getRowData(attr);
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

export let StudiesView = GenericTableView.extend({
    tableObj: null,
    pagination: null,
    columns: [
        {sortBy: null, name: 'Biome'},
        {sortBy: null, name: 'Study Accession'},
        {sortBy: null, name: 'Name'},
        {sortBy: null, name: 'Abstract'},
        {sortBy: null, name: 'Samples count'},
        {sortBy: null, name: 'Last update'}
    ],
    fetch() {
        return this.collection.fetch();
    },

    initialize(options) {
        const that = this;
        let tableOptions = {
            title: options.sectionTitle,
            headers: this.columns,
            initialOrdering: null,
            initPageSize: DEFAULT_PAGE_SIZE,
            isHeader: options.isPageHeader,
            textFilter: options.filter,
            tableClass: options.tableClass,
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($('#studies-section'), tableOptions);
        this.update({page: 1, page_size: DEFAULT_PAGE_SIZE, ordering: null, search: null});
    },

    getRowData(attr) {
        const studyLink = '<a href=\'' + attr.study_url + '\'>' + attr.study_accession + '</a>';
        const biomes = _.map(attr.biomes, function(b) {
            return '<span class=\'biome_icon icon_xs ' + b.icon + '\' title=\'' + b.name +
                '\'></span>';
        });
        return [
            biomes.join(' '),
            studyLink,
            attr['study_name'],
            attr['abstract'],
            attr['samples_count'],
            attr['last_update']];
    }
});

export let RunsView = GenericTableView.extend({
    tableObj: null,
    pagination: null,

    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'accession', name: 'Run ID'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'Instrument model'},
            {sortBy: null, name: 'Instrument platform'},
            {sortBy: null, name: 'Pipeline versions'}
        ];
        let tableOptions = {
            title: 'Associated runs',
            headers: columns,
            initialOrdering: 'accession',
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: false,
            textFilter: true,
            tableClass: 'runs-table',
            callback: function(page, pageSize, order, search) {
                that.update({page: page, page_size: pageSize, ordering: order, search: search});
            }
        };
        this.tableObj = new GenericTable($('#runs-section'), tableOptions);
        this.update(
            {page: 1, page_size: Commons.DEFAULT_PAGE_SIZE, ordering: 'accession', search: null});
    },

    getRowData(attr) {
        const runLink = '<a href=\'' + attr.analysis_url + '\'>' + attr.run_accession + '</a>';
        return [
            runLink,
            attr['experiment_type'],
            attr['instrument_model'],
            attr['instrument_platform'],
            attr['pipeline_versions'].join(', ')];
    }
});

export let AssembliesView = GenericTableView.extend({
    tableObj: null,
    pagination: null,

    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'accession', name: 'Assembly ID'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'WGS ID'},
            {sortBy: null, name: 'Legacy ID'},
            {sortBy: null, name: 'Pipeline versions'}
        ];
        let tableOptions = {
            title: 'Associated assemblies',
            headers: columns,
            initialOrdering: 'accession',
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: false,
            textFilter: true,
            tableClass: 'assemblies-table',
            callback: function(page, pageSize, order, search) {
                that.update({page: page, page_size: pageSize, ordering: order, search: search});
            }
        };
        this.tableObj = new GenericTable($('#assemblies-section'), tableOptions);
        this.update(
            {page: 1, page_size: Commons.DEFAULT_PAGE_SIZE, ordering: 'accession', search: null});
    },

    getRowData(attr) {
        const assemblyLink = '<a href=\'' + attr.analysis_url + '\'>' + attr.assembly_id + '</a>';
        return [
            assemblyLink,
            attr['experiment_type'],
            attr['wgs_id'],
            attr['legacy_id'],
            attr['pipeline_versions'].join(', ')
        ];
    }
});

export const AnalysesView = GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: null, name: 'Sample accession'},
            {sortBy: null, name: 'Sample description'},
            {sortBy: null, name: 'Run / Assembly accession'},
            {sortBy: null, name: 'Pipeline version'},
            {sortBy: null, name: 'Analysis accession'}
        ];
        let tableOptions = {
            title: 'Analyses',
            headers: columns,
            initialOrdering: null,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: false,
            textFilter: false,
            tableClass: 'analyses-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($('#analysis-section'), tableOptions);
        let params = {};

        // if (search) {
        //     params.search = search;
        //     $('#search').val(search);
        // }
        params.page_size = Commons.DEFAULT_PAGE_SIZE;
        params.page = 1;

        this.update(params);
    },

    update(params) {
        this.params = $.extend({'include': 'sample'}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(ignored, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count,
                    response.links.first);
                that.tableObj.hideLoadingGif();
            },
            error() {
                console.log('error');
            }
        });
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const biome = '<span class="biome_icon icon_xs ' + m.attributes.biome.icon + '" title="'
                + m.attributes.biome.name + '"></span>';
            const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
                '</a>';
            let runAssemblyLink;
            if (typeof attr.run_accession === 'undefined') {
                runAssemblyLink = '<a href=\'' + attr.assembly_url + '\'>' +
                    attr.assembly_accession +
                    '</a>';
            } else {
                runAssemblyLink = '<a href=\'' + attr.run_url + '\'>' + attr.run_accession +
                    '</a>';
            }
            const analysisLink = '<a href=\'' + attr.analysis_url + '\'>' +
                attr.analysis_accession +
                '</a>';
            const pipelineLink = '<a href=\'' + attr.pipeline_url + '\'>' +
                attr.pipeline_version +
                '</a>';
            return [
                biome, sampleLink, attr['sample_desc'],
                runAssemblyLink, pipelineLink, analysisLink];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

/**
 * Check is user is logged in
 * @return {jQuery.jqXHR} true if user is logged in
 */
export function getLoginStatus() {
    const deferred = new $.Deferred();

    $.get(api.API_URL + 'utils/myaccounts').done((data, state, xhr) => {
        try {
            deferred.resolve(String(xhr.status)[0] === '2', data['data'][0]);
        } catch (e) {
            console.error(e);
            deferred.resolve(false);
        }
    }).fail(() => {
        deferred.resolve(false);
    });
    return deferred.promise();
}

/**
 * Replace page with error message
 * @param {string} errorcode HTTP error code
 * @param {string} errormsg
 */
export function displayError(errorcode, errormsg) {
    const tmpl = Commons.errorTmpl({errorcode, errormsg});
    $('#main-content-area').html(tmpl);
}

/**
 * Set a redirection for the login's response
 * @param {string} url to redirect to on succesful login
 */
export function setLoginRedirect(url) {
    $('#loginModal').find('input[name=\'next\']').val(url);
}

/**
 * Returns string for a modal-opening link
 * @param {string} text to display in link
 * @return {string} HTML <a>
 */
export function getLoginLink(text) {
    return '<a data-open=\'loginModal\'>' + text + '</a>';
}

/**
 * Fetches loading form via API and appends to div in modal
 * @param {string} next location to redirect to.
 */
export function loadLoginForm(next) {
    if (!next) {
        next = subfolder + '/mydata';
    }
    authApi.getLoginForm().then(function(data) {
        const $div = $(data);
        const $form = $div.find('form');
        $form.submit(function(e) {
            e.preventDefault();
            $.ajax({
                type: 'post',
                url: $form.attr('action'),
                data: $form.serialize(),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-CSRFToken',
                        jQuery('[name=csrfmiddlewaretoken]').val());
                },
                success: function() {
                    sessionStorage.setItem('username',
                        $form.find('[name=\'username\']').val());
                    window.location = $form.find('[name=\'next\']').val();
                },
                error: function(a, b, c) {
                    console.error(a, b, c);
                }
            });
        });
        $div.find('input[type=\'hidden\'][name=\'next\']').val(next);
        $div.appendTo('#login-form');
    });
}

/**
 * Set navbar to reflect user login status
 * @param {boolean} isLoggedIn true if user is authenticated
 * @param {string} username of logged in user
 */
export function setNavLoginButton(isLoggedIn, username) {
    if (isLoggedIn && username !== null) {
        const $a = $('<a></a>');
        $a.text('Welcome, ' + username + ' ');
        $a.attr({
            'class': 'button',
            'href': subfolder + '/mydata',
            'data-cy': 'mydata'
        });
        $a.append('<span class=\'icon icon-generic\' data-icon=\'H\'></span>');
        const $ul = $('#mgnify').find('ul');
        $ul.find('li.functional').html($a);
        const $logout = $('<li><a data-cy=\'logout\' class=\'button\'>Logout</a></li>');
        $logout.click(function() {
            logout().done(function() {
                window.location = subfolder;
            });
        });
        $ul.append($logout);
    }
}

/**
 * Returns username from session storage if possible
 * @return {string} username
 */
export function getUsername() {
    return sessionStorage.getItem('username');
}

/**
 * Log user out using API endpoint
 * @return {JQuery.jqXHR}
 */
export function logout() {
    return $.get(authApi.API_LOGIN_ROOT + 'http-auth/logout/?next=' + subfolder);
}

/**
 * Basic setup for any page on site
 * @param {string} tab tabID
 * @param {string} loginRedirect url to redirect on succesful login
 * @return {jQuery.promise} of login status
 */
export function setupPage(tab, loginRedirect) {
    const loginStatus = getLoginStatus();
    loginStatus.done((isLoggedIn, userData) => {
        if (!isLoggedIn) {
            loadLoginForm(loginRedirect);
        } else {
            setNavLoginButton(isLoggedIn, typeof userData !== 'undefined' ? userData['id'] : '');
        }
    });
    checkAPIonline();
    setCurrentTab(tab);
    return loginStatus;
}

/**
 * Attach click handler for expandable div button
 */
export function attachExpandButtonCallback() {
    $('.expand-button').on('click', function() {
        if ($(this).hasClass('min')) {
            $(this).removeClass('min');
            $($(this).attr('for')).slideUp();
        } else {
            $(this).addClass('min');
            $($(this).attr('for')).slideDown();
        }
        $($(this).attr('for'));
    });
}

/**
 * Add an id to the start of the page title
 * @param {string} objectType Study | Sample | Run | Analysis
 * @param {string} id to add to page title
 */
export function specifyPageTitle(objectType, id) {
    document.title = `${objectType}: ${id} < ${document.title}`;
}

/**
 * Send mail via API
 * @param {string} fromEmail email address of sender
 * @param {string} subject of email
 * @param {string} body of email
 * @return {JQuery.Promise} of ajax request
 */
export function sendMail(fromEmail, subject, body) {
    const deferred = $.Deferred();
    console.log('Sending mail');
    $.ajax({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', Cookies.get('csrftoken'));
        },
        type: 'post',
        url: process.env.API_URL + 'utils/notify',
        contentType: 'application/vnd.api+json',
        data: JSON.stringify({
            data: {
                'type': 'notifies',
                'attributes': {
                    'from_email': fromEmail,
                    'subject': subject,
                    'message': body
                }
            }
        }),
        success() {
            console.log('Sent email successfully.');
            deferred.resolve(true);
        },
        error() {
            console.error('Failed to send email.');
            deferred.resolve(false);
        }
    });
    return deferred.promise();
}
