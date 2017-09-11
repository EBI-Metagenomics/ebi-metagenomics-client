import Backbone from 'backbone';

export const API_URL = "https://wwwdev.ebi.ac.uk/metagenomics/api/v0.2/";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const NO_DATA_MSG = "N/A";

var header = require("./partials/header.handlebars");
var footer = require("./partials/footer.handlebars");
var tableTools = require("./partials/table_tools.handlebars");
export var pagination = require("./partials/pagination.handlebars");
export var pagesize = require("./partials/pagesize.handlebars");



export function formatLineage(lineage){
    return lineage.split(":").slice(1).join(" > ");
}

export function formatDate(date_str){
    var d = new Date(date_str);
    return d.getDate()+"-"+MONTHS[d.getMonth()]+"-"+d.getFullYear()
}


export function setCurrentTab(id){
    document.addEventListener("DOMContentLoaded", function(){
       $("#header").append(header);
       $("#footer").append(footer);
        $(id).addClass('active');
    });
}

export function initTableTools(){
    $("#tableTools").append(tableTools);
}

// Handlebars.registerPartial('header', 'partials/header.handlebars');

export function getURLParameter() {
    var regex = /\/([A-z0-9]+)$/g;
    return regex.exec(window.location)[1];
}

export function stripLineage(lineage){
    var depth;
    if (lineage.includes(":")){
        depth = lineage.match(/:/g).length;
    } else {
        depth = 0;
    }

    return "&nbsp;".repeat(depth*4)+lineage.split(":").pop();
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

export function getBiomeIcon(lineage){
    const lineageList = lineage.split(':').map(function(x){return x.toLowerCase()});
    const lineageD2 = lineageList.slice(0,2).join(':');
    const lineageD3 = lineageList.slice(0,3).join(':');
    const lineageD4 = lineageList.slice(0,4).join(':');
    const lineageD5 = lineageList.slice(0,5).join(':');
    if (lineageD4 === 'root:environmental:terrestrial:soil' && lineageD5.includes('forest')){
        return 'forest_b';
    } else if (lineageD4 === 'root:environmental:terrestrial:soil' && lineageD5.includes('grassland')) {
        return 'grassland_b';
    }

    return biomeIconMapD4[lineageD4] || biomeIconMapD3[lineageD3] || biomeIconMapD2[lineageD2] || (function(lineage){
        console.warn('Could not match lineage '+lineage+' with any biome icons');
        return 'default_b';
    }());
}


window.D2 = biomeIconMapD2;
window.D3 = biomeIconMapD3;
window.D4 = biomeIconMapD4;



window.stripLineage = stripLineage;

