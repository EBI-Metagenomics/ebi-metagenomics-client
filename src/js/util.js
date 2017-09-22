let $ = require('jquery');
// import '../../static/js/foundation';
//
// console.log(Foundation);
// $ = (function() {
//     // TODO: consider not making this a jQuery function
//     // TODO: need way to reflow vs. re-initialize
//     /**
//      * The Foundation jQuery method.
//      * @param {String|Array} method - An action to perform on the current jQuery object.
//      */
//     var foundation = function(method) {
//         var type = typeof method,
//             $noJS = $('.no-js');
//         if($noJS.length){
//             $noJS.removeClass('no-js');
//         }
//
//         if(type === 'undefined'){//needs to initialize the Foundation object, or an individual plugin.
//             Foundation.MediaQuery._init();
//             Foundation.reflow(this);
//         }else if(type === 'string'){//an individual method to invoke on a plugin or group of plugins
//             var args = Array.prototype.slice.call(arguments, 1);//collect all the arguments, if necessary
//             var plugClass = this.data('zfPlugin');//determine the class of plugin
//
//             if(plugClass !== undefined && plugClass[method] !== undefined){//make sure both the class and method exist
//                 if(this.length === 1){//if there's only one, call it directly.
//                     plugClass[method].apply(plugClass, args);
//                 }else{
//                     this.each(function(i, el){//otherwise loop through the jQuery collection and invoke the method on each
//                         plugClass[method].apply($(el).data('zfPlugin'), args);
//                     });
//                 }
//             }else{//error for no class or no method
//                 throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
//             }
//         }else{//error for invalid argument type
//             throw new TypeError(`We're sorry, ${type} is not a valid parameter. You must use a string representing the method you wish to invoke.`);
//         }
//         return this;
//     };
//     $.fn.foundation = foundation;
//     return $;
// }());
//
// // Foundation.addToJquery($);
//
// import '../../static/js/foundationExtendEBI';
//
// $(document).ready(function() {
//     $(document).foundation();
//     $(document).foundationExtendEBI();
//     console.log('done');
// });


import {footer, header, resultsFilter, tableTools} from "./commons";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatLineage(lineage) {
    return lineage.split(":").slice(1).join(" > ");
}

export function lineage2Biome(lineage) {
    return lineage.split(":").slice(-1)[0];
}

export function formatDate(date_str) {
    var d = new Date(date_str);
    return d.getDate() + "-" + MONTHS[d.getMonth()] + "-" + d.getFullYear()
}

export function setCurrentTab(id) {
    document.addEventListener("DOMContentLoaded", function () {
        $("#header").append(header);
        $("#footer").append(footer);
        $(id).addClass('active');
    });
}

export function initTableTools() {
    $("#tableTools").append(tableTools);
}

export function initResultsFilter(callback) {
    const formId = "#filter";
    $("#filterForm").append(resultsFilter);
    $(formId).on('submit', callback);
    $(".clearFilter").on('click', function (e) {
        $(formId)[0].reset();
        callback(e);
    });

}

export function getURLParameter() {
    var regex = /\/([A-z0-9]+)(?:$|[?])/g;
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
    'root:environmental:aquatic': 'marine_b',
    'root:engineered:wastewater': 'wastewater_b',
    'root:host-associated:human': 'human_host_b',
    'root:host-associated:plants': 'plant_host_b',

};
const biomeIconMapD4 = {
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

export function getFilterFormData() {
    var formData = $("#filter").serializeArray();
    var data = {};
    $.map(formData, function (n, i) {
        data[n['name']] = n['value'];
    });
    return data;
}

export function setURLParams(params, refresh) {
// export function setURLParams(search, lineage, pageSize, currentPage, refresh){
//     let params = {};
//     if (search!==null)  params.search = search;
//     if (lineage!==null) params.lineage = lineage;
//     params.pagesize = pageSize;
//     params.page = currentPage;
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
