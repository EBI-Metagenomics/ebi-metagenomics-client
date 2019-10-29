const tableTmpl = require('../../partials/genericTable.handlebars');
const BaseTable = require('./baseTable.js');

module.exports = class ContigsTable extends BaseTable {
    /**
     * Render the handlebars template
     * @param {Object} params Table initialization options
     * @return {String} the rendered HTML
     */
    renderTemplate(params) {
        // FIXME: use handlebars partials
        const headerPreContent = '<div class="row columns">' +
                '<div class="columns">' +

                    '<span class="contigs-legend">' +
                    '<span class="mgnify-icon has_cog"></span>' +
                    '<span>COG</span>' +
                    '</span>' +

                    '<span class="contigs-legend">' +
                    '<span class="mgnify-icon has_kegg"></span>' +
                    '<span>KEGG ortholog</span>' +
                    '</span>' +

                    '<span class="contigs-legend">' +
                    '<span class="mgnify-icon has_go"></span>' +
                    '<span>GO</span>' +
                    '</span>' +

                    '<span class="contigs-legend">' +
                    '<span class="mgnify-icon has_pfam"></span>' +
                    '<span>Pfam</span>' +
                    '</span>' +

                    '<span class="contigs-legend">' +
                    '<span class="mgnify-icon has_interpro"></span>' +
                    '<span>InterPro</span>' +
                    '</span>' +

                    '<span class="contigs-legend">' +
                    '<span class="mgnify-icon has_antismash"></span>' +
                    '<span>antiSMASH</span>' +
                    '</span>' +
                '</div>' +
            '</div>';
        params.headerPreContent = headerPreContent;
        return $(tableTmpl(params));
    }
};
