import Backbone from 'backbone';

export const API_URL = "https://wwwdev.ebi.ac.uk/metagenomics/api/v0.2/";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const NO_DATA_MSG = "not available";

var header = require("./partials/header.handlebars");
var footer = require("./partials/footer.handlebars");
var tableTools = require("./partials/table_tools.handlebars");


export function formatDate(date_str){
    var d = new Date(date_str);
    return d.getDate()+"-"+MONTHS[d.getMonth()]+"-"+d.getFullYear()
}

document.addEventListener("DOMContentLoaded", function(){
   $("#header").append(header);
   $("#footer").append(footer);
});

export function initTableTools(){
    $("#tableTools").append(tableTools);
}

// Handlebars.registerPartial('header', 'partials/header.handlebars');

export function getURLParameter() {
    console.log(window.location);
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
window.stripLineage = stripLineage;
