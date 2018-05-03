const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const api = require('./components/api');
const Commons = require('./commons');
const GenericTable = require('./components/genericTable');
import 'process';

require('babel-polyfill');

export const subfolder = process.env.DEPLOYMENT_SUBFOLDER;
$.typeWatch = require('jquery.typewatch');

const biomeFilter = require('./commons').biomeFilter;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;

/**
 * Format lineage by removing root and replacing ':' with '>'
 * @param {string} lineage
 * @param {boolean} removeRoot
 * @return {string}
 */
export function formatLineage(lineage, removeRoot) {
    let splitLineage = lineage.split(':');
    if (removeRoot) {
        splitLineage.shift();
    }
    return splitLineage.join(' > ');
}

/**
 * Retrieve biome from lineage
 * @param {string} lineage
 * @return {string}
 */
export function lineageToBiome(lineage) {
    return lineage.split(':').splice(-1);
}

/**
 * Format datestr for readability
 * @param {string} dateStr
 * @return {string}
 */
export function formatDate(dateStr) {
    let d = new Date(dateStr);
    return d.getDate() + '-' + MONTHS[d.getMonth()] + '-' + d.getFullYear();
}

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
 * Retrieve icon and name from biome object
 * @param {object} biomeData
 * @return {{name: string, icon}}
 */
export function getBiomeIconData(biomeData) {
    const name = biomeData.id;
    return {name: formatLineage(name, true), icon: getBiomeIcon(name)};
}

/**
 * Create biome select filter
 * @param {jQuery.HTMLElement} $div
 * @param {callback} callback
 */
export function initBiomeFilter($div, callback) {
    $div.before(biomeFilter);
    const $biomeSelect = $('.biome-select');
    $biomeSelect.on('change', callback);

    const $clearBtn = $('.clear-filter');
    $clearBtn.click(function() {
        $('.table-filter').val('');
        $biomeSelect.val($biomeSelect.find('option:first').val());
        $biomeSelect.trigger('change');
    });
}

/**
 * Retrieve URL parameter after last /
 * @return {string}
 */
export function getURLParameter() {
    let regex = /\/([A-z0-9|.]+)(?:$|[?])/g;
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
    let i;
    let params = {};

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        params[sParameterName[0]] = decodeURIComponent(sParameterName[1]);
    }
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

const biomeIconMapD2 = {
    'root:engineered': 'engineered_b'
    // 'root:host-associated': 'non_human_host_b'
};
const biomeIconMapD3 = {
    'root:engineered:wastewater': 'wastewater_b',
    'root:environmental:air': 'air_b',
    'root:host-associated:amphibia': 'amphibian_b',
    'root:host-associated:arthropoda': 'arthropoda_b',
    'root:host-associated:fish': 'fish_b',
    'root:host-associated:human': 'human_host_b',
    'root:host-associated:insecta': 'insect_b',
    'root:host-associated:mammals': 'mammals_b',
    'root:host-associated:mollusca': 'mollusca_b',
    'root:host-associated:plants': 'plant_host_b',
    'root:host-associated:porifera': 'porifera_b'
    // 'root:environmental:air': 'air_b',
    // 'root:environmental:aquatic': 'freshwater_b',
    // 'root:engineered:wastewater': 'wastewater_b',
    // 'root:host-associated:human': 'human_host_b',
    // 'root:host-associated:plants': 'plant_host_b',

};
const biomeIconMapD4 = {
    'root:environmental:aquatic:freshwater': 'freshwater_b',
    'root:environmental:aquatic:marine': 'marine_b',
    'root:environmental:aquatic:thermal springs': 'hotspring_b',
    'root:environmental:terrestrial:soil': 'soil_b',
    'root:environmental:terrestrial:volcanic': 'vulcano_b',
    'root:host-associated:human:digestive system': 'human_gut_b',
    'root:host-associated:human:skin': 'skin_b'
    // 'root:environmental:aquatic:marine': 'marine_b',
    // 'root:environmental:terrestrial:volcanic': 'vulcano_b',
    // 'root:environmental:aquatic:marine:volcanic': 'vulcano_b',
    // 'root:environmental:aquatic:thermal springs': 'hotspring_b',
    // 'root:environmental:aquatic:freshwater': 'freshwater_b',
    // 'root:environmental:terrestrial:soil': 'soil_b',
    // 'root:host-associated:human:digestive system': 'human_gut_b',
};

const biomeIconMapD5 = {
    'root:environmental:aquatic:freshwater:drinking water': 'drinking_water_b',
    'root:environmental:aquatic:freshwater:groundwater': 'groundwater_b',
    'root:environmental:aquatic:freshwater:ice': 'ice_b',
    'root:environmental:aquatic:freshwater:lake': 'lake_b',
    'root:environmental:aquatic:freshwater:lotic': 'river_b',
    'root:environmental:aquatic:marine:hydrothermal vents': 'hydrothermal_vents_b',
    'root:environmental:terrestrial:soil:wetlands': 'wetlands_b',
    'root:host-associated:human:digestive system:oral': 'mouth_b',
    'root:host-associated:human:respiratory system:pulmonary system': 'lung_b',
    'root:host-associated:mammals:nervous system:brain': 'brain_b'
};

const biomeIconMapD6 = {
    'root:environmental:aquatic:freshwater:groundwater:cave water': 'cave_b',
    'root:environmental:aquatic:freshwater:ice:glacier': 'glacier_b',
    'root:environmental:terrestrial:soil:grasslands': 'grassland_b',
    'root:environmental:terrestrial:soil:loam:forest soil': 'forest_b',
    'root:environmental:terrestrial:soil:sand:desert': 'desert_b'
};

// .biome_icon.default_b {  background-image: url(../images/biome_icons/biome_default.svg);  }

/**
 * Retrieve biome icon for a lineage
 * @param {string} lineage
 * @return {string} css class for biome
 */
export function getBiomeIcon(lineage) {
    const lineageList = lineage.split(':').map(function(x) {
        return x.toLowerCase();
    });

    const lineageD2 = lineageList.slice(0, 2).join(':');
    const lineageD3 = lineageList.slice(0, 3).join(':');
    const lineageD4 = lineageList.slice(0, 4).join(':');
    const lineageD5 = lineageList.slice(0, 5).join(':');
    const lineageD6 = lineageList.slice(0, 6).join(':');
    // if (lineageD4 === 'root:environmental:terrestrial:soil' && lineageD5.includes('forest')) {
    //     return 'forest_b';
    // } else if (lineageD4 === 'root:
    // environmental:terrestrial:soil' && lineageD5.includes('grassland')) {
    //     return 'grassland_b';
    // }

    return biomeIconMapD6[lineageD6] || biomeIconMapD5[lineageD5] || biomeIconMapD4[lineageD4] ||
        biomeIconMapD3[lineageD3] || biomeIconMapD2[lineageD2] || (function() {
            console.warn('Could not match lineage "' + lineage + '" with any biome icons');
            return 'default_b';
        }());
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
 * Attach tab handler callback to switch tabs
 */
export function attachTabHandlers() {
    // Deep linking
    const $dataTabs = $('[data-tabs]');
    new window.Foundation.Tabs($dataTabs);
    const linkTab = window.location.hash.substr(1);
    if (linkTab) {
        const tabExists = $('a[href=\'#' + linkTab + '\']').length > 0;
        if (tabExists) {
            $($dataTabs).foundation('selectTab', linkTab);
            $('div.tabs-panel:not(\'' + linkTab + '\')').removeClass('active');
            $('#' + linkTab).addClass('active');
        }
    }

    // Linking click actions
    $('li.tabs-title > a').on('click', function() {
        let tabButtonContainer = $(this).closest('ul');
        $(tabButtonContainer).children().children('a').attr('aria-selected', 'false');
        $(this).attr('aria-selected', 'true');

        // Hide all other tabs
        let tabId = $(this).attr('href');
        let tabGroup = tabButtonContainer.attr('id');
        $('[data-tab-content=' + tabGroup + '] > .tabs-panel').removeClass('active');
        $(tabId).addClass('active');
    });
}

/**
 * Change tab visibility such that all tabs are hidden except specified tab
 * @param {string} tabId (without leading hash) to display
 */
export function changeTab(tabId) {
    // Tab header
    $('ul.tabs > li > a').each((i, el) => {
        const $el = $(el);
        if ($($el).attr('href') === ('#' + tabId)) {
            $($el).parent().addClass('is-active');
            $el.attr('aria-selected', 'true');
        } else {
            $($el).parent().removeClass('is-active');
            $el.attr('aria-selected', 'false');
        }
    });
    $('div.tabs-panel').each((i, el) => {
        const $el = $(el);
        if ($($el).attr('id') === tabId) {
            $($el).addClass('active');
        } else {
            $($el).removeClass('active');
        }
    });
    // Tab content
    // $("div.tabs-panel:not('" + tabId + "')").removeClass('active');
    // $("div.tabs-panel"+tabId).addClass('active');
}

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
    initialize(options, biome) {
        for (let arg in options) {
            if (options.hasOwnProperty(arg)) {
                this[arg] = options[arg];
            }
        }
        let that = this;
        this.collection.fetch({
            data: $.param({depth_lte: this.maxDepth, page_size: 100}), success() {
                // Fetch and pre-pend root node to list
                let root = new api.BiomeCollection();
                root.fetch({
                    success() {
                        that.render();
                        const $biomeSelect = $(that.selector);
                        if (!biome) {
                            biome = 'root';
                        } else {
                            let splitBiome = biome.split(':');
                            if (splitBiome.length > that.maxDepth) {
                                const existingParentBiome = splitBiome.slice(0, that.maxDepth)
                                    .join(':');
                                const $previousBiome = $biomeSelect.children('option[value=\'' +
                                    existingParentBiome + '\']');
                                const newOptions = [];
                                for (let i = that.maxDepth + 1; i < splitBiome.length + 1; i++) {
                                    const newLineage = splitBiome.slice(0, i).join(':');
                                    const newOption = createBiomeOption(newLineage);
                                    newOptions.push(newOption);
                                }
                                $previousBiome.after(newOptions);
                            }
                        }
                        $biomeSelect.val(biome);
                    }
                });
            }
        });
    },
    render() {
        const that = this;
        let biomes = this.collection.models.map(function(model) {
            return model.attributes.lineage;
        });
        _.each(biomes.sort(), function(lineage) {
            const option = createBiomeOption(lineage);
            $(that.selector).append($(option));
        });
        return this;
    }
});

/**
 * Capitalize a word.
 * @param {string} string to capitalize
 * @return {string}
 */
export const capitalizeWord = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Add additional URL parameters to convert a URL into a downloadable URL
 * @param {object} params
 * @return {object} params for download
 */
export const getDownloadParams = function(params) {
    const downloadParams = $.extend(true, {}, params);
    delete downloadParams['page'];
    delete downloadParams['page_size'];
    downloadParams['format'] = 'csv';
    return downloadParams;
};

/**
 * Set download tag url
 * @param {string} url
 */
export const setDownloadResultURL = function(url) {
    $('#download-results').attr('href', url);
};

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
 * @return {jQuery.promise}
 */
export function checkURLExists(url) {
    return $.ajax({
        type: 'HEAD',
        url: url
    });
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
 * @param {number} page current page number
 * @param {number} pageSize size of current page
 * @param {string} order ordering string
 * @param {string} query filtering string
 */
export function updateTableFromPagination(view, page, pageSize, order, query) {
    view.tableObj.showLoadingGif();
    let params = {
        page: page,
        page_size: pageSize
    };

    let collectionParams = view.collection.params || {};
    if (Object.prototype.hasOwnProperty.call(collectionParams, 'study_accession')) {
        params['study_accession'] = collectionParams.study_accession;
    } else if (Object.prototype.hasOwnProperty.call(collectionParams, 'sample_accession')) {
        params['sample_accession'] = collectionParams.sample_accession;
    } else if (Object.prototype.hasOwnProperty.call(collectionParams, 'run_accession')) {
        params['run_accession'] = collectionParams.run_accession;
    }

    if (order) {
        params['ordering'] = order;
    }
    if (query) {
        params['search'] = query;
    }
    const that = view;
    view.fetchXhr = view.collection.fetch({
        data: $.param(params),
        success(ignored, response) {
            that.renderData(page, pageSize, response.meta.pagination.count,
                response.links.first);
            that.tableObj.hideLoadingGif();
        }
    });
}

export let GenericTableView = Backbone.View.extend({
    update(page, pageSize, order, query) {
        updateTableFromPagination(this, page, pageSize, order, query);
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
    fetch() {
        return this.collection.fetch();
    },

    initialize(options) {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: null, name: 'Study ID'},
            {sortBy: null, name: 'Name'},
            {sortBy: null, name: 'Abstract'},
            {sortBy: null, name: 'Samples count'},
            {sortBy: null, name: 'Last update'}
        ];
        this.tableObj = new GenericTable($('#studies-section'), options.sectionTitle, columns,
            DEFAULT_PAGE_SIZE, options.isPageHeader, options.filter, options.tableClass,
            function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, DEFAULT_PAGE_SIZE, null, null);
    },

    getRowData(attr) {
        const studyLink = '<a href=\'' + attr.study_link + '\'>' + attr.study_id + '</a>';
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

export let SamplesView = GenericTableView.extend({
    tableObj: null,
    pagination: null,

    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'accession', name: 'Sample ID'},
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last update'}
        ];
        this.tableObj = new GenericTable($('#samples-section'), 'Associated samples', columns,
            Commons.DEFAULT_PAGE_SIZE_SAMPLES, false, true, 'samples-table',
            function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, Commons.DEFAULT_PAGE_SIZE_SAMPLES, null, null);
    },

    getRowData(attr) {
        const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
            '</a>';
        const biomes = '<span class="biome_icon icon_xs ' + attr.biome_icon + '" title="' +
            attr.biome_name + '"></span>';
        return [biomes, sampleLink, attr.sample_name, attr.sample_desc, attr.last_update];
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
        this.tableObj = new GenericTable($('#runs-section'), 'Associated runs', columns,
            Commons.DEFAULT_PAGE_SIZE, false, true, 'runs-table',
            function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, Commons.DEFAULT_PAGE_SIZE, null, null);
    },

    getRowData(attr) {
        const runLink = '<a href=\'' + attr.analysis_url + '\'>' + attr.run_id + '</a>';
        return [
            runLink,
            attr['experiment_type'],
            attr['instrument_model'],
            attr['instrument_platform'],
            attr['pipeline_versions'].join(', ')];
    }
});

/**
 * Check is user is logged in
 * @return {jQuery.jqXHR} true if user is logged in
 */
export function getLoginStatus() {
    const deferred = new $.Deferred();

    $.get(api.API_URL + 'utils/myaccounts').always(function(xhr) {
        deferred.resolve(String(xhr.status)[0] !== '4');
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
    api.getLoginForm().then(function(data) {
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
 */
export function setNavLoginButton(isLoggedIn) {
    if (isLoggedIn) {
        const $a = $('<a></a>');
        $a.text('Welcome, ' + getUsername() + ' ');
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
            logout().done(function(a, b, c) {
                console.log(a, b, c);
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
    return $.get(api.API_LOGIN_ROOT + 'http-auth/logout/?next=' + subfolder);
}

/**
 * Basic setup for any page on site
 * @param {string} tab tabID
 * @param {string} loginRedirect url to redirect on succesful login
 * @return {jQuery.promise} of login status
 */
export function setupPage(tab, loginRedirect) {
    const loginStatus = getLoginStatus();
    loginStatus.done(function(isLoggedIn) {
        setNavLoginButton(isLoggedIn);
        if (!isLoggedIn) {
            loadLoginForm(loginRedirect);
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
    });
}

