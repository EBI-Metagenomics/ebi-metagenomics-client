const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const api = require('./components/api');
export const subfolder = process.env.DEPLOYMENT_SUBFOLDER;
$.typeWatch = require('jquery.typewatch');

const biomeFilter = require('./commons').biomeFilter;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatLineage(lineage) {
    return lineage.split(":").join(" > ");
}

export function lineage2Biome(lineage) {
    return lineage.split(":").splice(-1);
}

export function formatDate(date_str) {
    var d = new Date(date_str);
    return d.getDate() + "-" + MONTHS[d.getMonth()] + "-" + d.getFullYear()
}

export function setCurrentTab(id) {
    document.addEventListener("DOMContentLoaded", function () {
        $(id).addClass('active');
    });
}


export function getBiomeIconData(biome_data) {
    const name = biome_data.id;
    return {name: formatLineage(name), icon: getBiomeIcon(name)};
}

export function initBiomeFilter($div, callback) {
    $div.before(biomeFilter);
    const $biomeSelect = $('.biome-select');
    $biomeSelect.on('change', callback);

    const $clearBtn = $('.clear-filter');
    $clearBtn.click(function () {
        $('.table-filter').val('');
        $biomeSelect.val($biomeSelect.find('option:first').val());
        $biomeSelect.trigger('change');
    })
}

export function getURLParameter() {
    var regex = /\/([A-z0-9|\.]+)(?:$|[?])/g;
    return regex.exec(window.location.pathname)[1];
}

export function getURLFilterParams() {
    return new URL(window.location).searchParams;
}

export function stripLineage(lineage) {
    var depth;
    if (lineage.includes(":")) {
        depth = lineage.match(/:/g).length;
    } else {
        depth = 0;
    }

    return "&nbsp;".repeat(depth * 4) + lineage.split(":").pop();
}

const biomeIconMapD2 = {
    'root:engineered': 'engineered_b',
    'root:host-associated': 'non_human_host_b'
};
const biomeIconMapD3 = {
    'root:environmental:air': 'air_b',
    'root:environmental:aquatic': 'freshwater_b',
    'root:engineered:wastewater': 'wastewater_b',
    'root:host-associated:human': 'human_host_b',
    'root:host-associated:plants': 'plant_host_b',

};
const biomeIconMapD4 = {
    'root:environmental:aquatic:marine': 'marine_b',
    'root:environmental:terrestrial:volcanic': 'vulcano_b',
    'root:environmental:aquatic:marine:volcanic': 'vulcano_b',
    'root:environmental:aquatic:thermal springs': 'hotspring_b',
    'root:environmental:aquatic:freshwater': 'freshwater_b',
    'root:environmental:terrestrial:soil': 'soil_b',
    'root:host-associated:human:digestive system': 'human_gut_b',

};

export function getBiomeIcon(lineage) {
    const lineageList = lineage.split(':').map(function (x) {
        return x.toLowerCase()
    });
    const lineageD2 = lineageList.slice(0, 2).join(':');
    const lineageD3 = lineageList.slice(0, 3).join(':');
    const lineageD4 = lineageList.slice(0, 4).join(':');
    const lineageD5 = lineageList.slice(0, 5).join(':');
    if (lineageD4 === 'root:environmental:terrestrial:soil' && lineageD5.includes('forest')) {
        return 'forest_b';
    } else if (lineageD4 === 'root:environmental:terrestrial:soil' && lineageD5.includes('grassland')) {
        return 'grassland_b';
    }

    return biomeIconMapD4[lineageD4] || biomeIconMapD3[lineageD3] || biomeIconMapD2[lineageD2] || (function (lineage) {
        console.warn('Could not match lineage "' + lineageD5 + '" with any biome icons');
        return 'default_b';
    }());
}

export function setURLParams(params, refresh) {
    if (refresh) {
        window.location.search = $.param(params);
    } else {
        history.pushState(null, '', window.location.pathname + '?' + $.param(params));
        //    Set URL without refreshing
    }
}

export function showTableLoadingGif() {
    $(".loading-gif-row").show();
}

export function hideTableLoadingGif() {
    $(".loading-gif-row").hide();
}

export function attachTabHandlers() {
    // Deep linking
    const $dataTabs = $('[data-tabs]');
    new window.Foundation.Tabs($dataTabs);
    const linkTab = window.location.hash.substr(1);
    if (linkTab) {
        $($dataTabs).foundation('selectTab', linkTab);
        $("div.tabs-panel:not('" + linkTab + "')").removeClass('active');
        $('#' + linkTab).addClass('active');
    }

    // Linking click actions
    $("li.tabs-title > a").on('click', function () {
        var tabButtonContainer = $(this).closest('ul');
        $(tabButtonContainer).children().children('a').attr('aria-selected', 'false');
        $(this).attr('aria-selected', 'true');

        // Remove active class from all sibling buttons
        var tabId = $(this).attr('href');
        var tabGroup = tabButtonContainer.attr('id');
        $("[data-tab-content=" + tabGroup + "] > .tabs-panel").removeClass('active');
        $(tabId).addClass('active');
    });
}

export function changeTab(tabId){
    // Tab header
    $("ul.tabs > li > a").each((i, el) => {
        const $el = $(el);
        if ($($el).attr('href')===('#'+tabId)){
            $($el).parent().addClass('is-active');
            $el.attr('aria-selected', 'true');
        } else {
            $($el).parent().removeClass('is-active');
            $el.attr('aria-selected', 'false');
        }
    });
    $("div.tabs-panel").each((i, el) => {
        const $el = $(el);
        if ($($el).attr('id')===tabId){
            $($el).addClass('active');
        } else {
            $($el).removeClass('active');
        }
    });
    // Tab content
    // $("div.tabs-panel:not('" + tabId + "')").removeClass('active');
    // $("div.tabs-panel"+tabId).addClass('active');
}

export const BiomeCollectionView = Backbone.View.extend({
    selector: ".biome-select",
    initialize: function (options, biome) {
        for (let arg in options) {
            this[arg] = options[arg];
        }
        var that = this;
        this.collection.fetch({
            data: $.param({depth_lte: this.maxDepth, page_size: 100}), success: function () {
                // Fetch and pre-pend root node to list
                var root = new api.Biome({id: 'root'});
                root.fetch({
                    success: function () {
                        that.render();
                        const $biomeSelect = $(that.selector);
                        if (!biome) {
                            biome = 'root';
                        } else {
                            let splitBiome = biome.split(':');
                            if (splitBiome.length > that.maxDepth) {
                                const existingParentBiome = splitBiome.slice(0, that.maxDepth).join(':');
                                const $previousBiome = $biomeSelect.children("option[value='" + existingParentBiome + "']");
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
    render: function () {
        const that = this;
        var biomes = this.collection.models.map(function (model) {
            return model.attributes.lineage
        });
        _.each(biomes.sort(), function (lineage) {
            const option = createBiomeOption(lineage);
            $(that.selector).append($(option));
        });
        return this
    }
});

function createBiomeOption(lineage) {
    return "<option value=\"" + lineage + "\">" + stripLineage(lineage) + "</option> ";
}

export const capitalizeWord = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getDownloadParams = function (params) {
    const downloadParams = $.extend(true, {}, params);
    delete downloadParams['page'];
    delete downloadParams['page_size'];
    downloadParams['format'] = 'csv';
    return downloadParams;
};

export const setDownloadResultURL = function (url) {
    $('#download-results').attr('href', url);
};

/**
 * Truncates the given string to the given maximum length.
 *
 * @param str String to truncate.
 * @param maxLength Maximum length.
 */
export function truncateString(str, maxLength = 190) {
    return (str.length > maxLength) ? str.substr(0, maxLength - 1) + '&hellip;' : str;
}

/**
 * Format request for URL (remove result size limit, add csv format
 * @param requestURL: api url to format for download
 */
export function formatDownloadURL(requestURL) {
    const splitURL = requestURL.split('?');
    let params = _.filter(splitURL[1].split('&'), function (e) {
        const paramName = e.split('=')[0];
        return !_.contains(['page', 'page_size', 'format'], paramName);
    });
    params.push('format=csv');
    return splitURL[0] + '?' + params.join('&');
}


export function createLinkTag(url, text) {
    return "<a href='" + url + "'>" + text + "</a>";
}

export function createListItem(html) {
    return "<li>" + html + "</li>";
}

export function checkURLExists(url) {
    return $.ajax({
        type: 'HEAD',
        url: url,
    });
}

export function checkAPIonline() {
    $.ajax({
        url: process.env.API_URL,
        success: function () {
            console.log('API is online.');
        },
        error: function () {
            $('body').html('Error: API Offline');
            // throw new Error("API is offline.");
        }
    });
}
