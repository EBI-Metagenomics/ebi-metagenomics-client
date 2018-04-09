const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const api = require('./components/api');
const Commons = require('./commons');
const GenericTable = require('./components/genericTable');
import 'process';

export const subfolder = process.env.DEPLOYMENT_SUBFOLDER;
$.typeWatch = require('jquery.typewatch');

const biomeFilter = require('./commons').biomeFilter;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;

export function formatLineage(lineage, removeRoot) {
    let splitLineage = lineage.split(':');
    if (removeRoot) {
        splitLineage.shift();
    }
    return splitLineage.join(' > ');

}

export function lineageToBiome(lineage) {
    return lineage.split(':').splice(-1);
}

export function formatDate(dateStr) {
    let d = new Date(dateStr);
    return d.getDate() + '-' + MONTHS[d.getMonth()] + '-' + d.getFullYear();
}

export function setCurrentTab(id) {
    document.addEventListener('DOMContentLoaded', function() {
        $(id).addClass('active');
    });
}

export function getBiomeIconData(biomeData) {
    const name = biomeData.id;
    return {name: formatLineage(name, true), icon: getBiomeIcon(name)};
}

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

export function getURLParameter() {
    let regex = /\/([A-z0-9|\.]+)(?:$|[?])/g;
    return regex.exec(window.location.pathname)[1];
}

export function getURLFilterParams() {
    return new URL(window.location).searchParams;
}

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
    // } else if (lineageD4 === 'root:environmental:terrestrial:soil' && lineageD5.includes('grassland')) {
    //     return 'grassland_b';
    // }

    return biomeIconMapD6[lineageD6] || biomeIconMapD5[lineageD5] || biomeIconMapD4[lineageD4] ||
        biomeIconMapD3[lineageD3] || biomeIconMapD2[lineageD2] || (function() {
            console.warn('Could not match lineage "' + lineage + '" with any biome icons');
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
    $('.loading-gif-row').show();
}

export function hideTableLoadingGif() {
    $('.loading-gif-row').hide();
}

export function attachTabHandlers() {
    // Deep linking
    const $dataTabs = $('[data-tabs]');
    new window.Foundation.Tabs($dataTabs);
    const linkTab = window.location.hash.substr(1);
    if (linkTab) {
        $($dataTabs).foundation('selectTab', linkTab);
        $('div.tabs-panel:not(\'' + linkTab + '\')').removeClass('active');
        $('#' + linkTab).addClass('active');
    }

    // Linking click actions
    $('li.tabs-title > a').on('click', function() {
        let tabButtonContainer = $(this).closest('ul');
        $(tabButtonContainer).children().children('a').attr('aria-selected', 'false');
        $(this).attr('aria-selected', 'true');

        // Remove active class from all sibling buttons
        let tabId = $(this).attr('href');
        let tabGroup = tabButtonContainer.attr('id');
        $('[data-tab-content=' + tabGroup + '] > .tabs-panel').removeClass('active');
        $(tabId).addClass('active');
    });
}

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
                let root = new api.Biome({id: 'root'});
                root.fetch({
                    success() {
                        that.render();
                        const $biomeSelect = $(that.selector);
                        if (!biome) {
                            biome = 'root';
                        } else {
                            let splitBiome = biome.split(':');
                            if (splitBiome.length > that.maxDepth) {
                                const existingParentBiome = splitBiome.slice(0, that.maxDepth).
                                    join(':');
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

export const capitalizeWord = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getDownloadParams = function(params) {
    const downloadParams = $.extend(true, {}, params);
    delete downloadParams['page'];
    delete downloadParams['page_size'];
    downloadParams['format'] = 'csv';
    return downloadParams;
};

export const setDownloadResultURL = function(url) {
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
    let params = _.filter(splitURL[1].split('&'), function(e) {
        const paramName = e.split('=')[0];
        return !_.contains(['page', 'page_size', 'format'], paramName);
    });
    params.push('format=csv');
    return splitURL[0] + '?' + params.join('&');
}

export function createLinkTag(url, text) {
    return '<a href=\'' + url + '\'>' + text + '</a>';
}

export function createListItem(html) {
    return '<li>' + html + '</li>';
}

export function checkURLExists(url) {
    return $.ajax({
        type: 'HEAD',
        url: url
    });
}

export function checkAPIonline() {
    $.ajax({
        url: process.env.API_URL,
        success() {
            console.log('API is online.');
        },
        error() {
            $('body').html('Error: API Offline');
            // throw new Error("API is offline.");
        }
    });
}

/**
 * Method to update Samples or Runs view from pagination event
 * @param view Backbone view for sample or studies
 * @param page current page number
 * @param pageSize size of current page
 * @param order ordering string
 * @param query filtering string
 */
export function updateTableFromPagination(view, page, pageSize, order, query) {
    view.tableObj.showLoadingGif();
    let params = {
        page: page,
        page_size: pageSize
    };

    let collectionParams = view.collection.params;
    if (collectionParams.hasOwnProperty('study_accession')) {
        params['study_accession'] = collectionParams.study_accession;
    } else if (collectionParams.hasOwnProperty('sample_accession')) {
        params['sample_accession'] = collectionParams.sample_accession;
    } else if (collectionParams.hasOwnProperty('run_accession')) {
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

    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: null, name: 'Study ID'},
            {sortBy: null, name: 'Name'},
            {sortBy: null, name: 'Abstract'},
            {sortBy: null, name: 'Samples count'},
            {sortBy: null, name: 'Last update'}
        ];
        this.tableObj = new GenericTable($('#studies-section'), 'Associated studies', columns,
            DEFAULT_PAGE_SIZE, false, function(page, pageSize, order, query) {
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
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: 'accession', name: 'Sample ID'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last update'}
        ];
        this.tableObj = new GenericTable($('#samples-section'), 'Associated samples', columns,
            Commons.DEFAULT_PAGE_SIZE_SAMPLES, false, function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, Commons.DEFAULT_PAGE_SIZE_SAMPLES, null, null);
    },

    getRowData(attr) {
        const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
            '</a>';
        return [attr.sample_name, sampleLink, attr.sample_desc, attr.last_update];
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
            Commons.DEFAULT_PAGE_SIZE, false, function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, Commons.DEFAULT_PAGE_SIZE, null, null);
    },

    getRowData(attr) {
        const runLink = '<a href=\'' + attr.run_url + '\'>' + attr.run_id + '</a>';
        return [
            runLink,
            attr['experiment_type'],
            attr['instrument_model'],
            attr['instrument_platform'],
            attr['pipeline_versions'].join(', ')];
    }
});