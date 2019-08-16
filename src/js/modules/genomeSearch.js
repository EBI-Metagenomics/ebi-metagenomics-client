/**
 * BIGSI genome search
 */
require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const util = require('../util');
const Backbone = require('backbone');
const ClientSideTable = require('../components/clientSideTable');

const DEFAULT_PAGE_SIZE = 25;

util.setupPage('#genome-search-nav');

/**
 * Genome Search View.
 * This view contains the Form and the Results table.
 */
const GenomeSearchView = Backbone.View.extend({

    el: '#genome-search',

    events: {
        'click #example-seq': 'loadExample',
        'submit #search-form': 'submitSearch',
        'change #fasta-file': 'loadFastaFile',
        'click #clear-button': 'reset'
    },

    MSG_TYPE: {
        ERROR: 'alert',
        SUCCESS: 'success',
        WARNING: 'warning'
    },

    initialize(settings) {
        this.MAX_LEN = settings.max_len || 5000;
        this.MIN_LEN = settings.min_len || 50;
        this.API_URL = settings.api_url;

        this.$form = $('#search-form', this.$el);
        this.$fastaFile = $('#fasta-file', this.$el);
        this.$sequence = $('#sequence', this.$el);
        this.$threshold = $('#threshold', this.$el);

        this.$searchButton = $('#search-button', this.$el);
        this.$messageContainter = $('#message-containter', this.$el);

        this.$resultsSection = $('#results-section', this.$el);
        this.$loading = $('.genome-search-loading', this.$el);

        if (!window.FileReader) {
            // FileReader API not available
            $('#fasta-file').hide();
        }

        const options = {
            title: '',
            headers: [
                // bigsi
                {sortBy: 'a', name: 'Accession', class: 'nowrap'},
                {sortBy: 'a', name: '% kmers found'},
                {sortBy: 'a', name: 'No kmers'},
                {sortBy: 'a', name: 'No kmers found'},
                // mgnify
                {sortBy: 'a', name: 'Completeness'},
                {sortBy: 'a', name: 'Contamination'},
                {sortBy: 'a', name: 'Taxon lineage', class: 'nowrap'},
                {sortBy: 'a', name: 'Geographic origin'},
                {sortBy: 'a', name: 'No contigs'},
                {sortBy: 'a', name: 'Length'}
            ],
            initPageSize: DEFAULT_PAGE_SIZE,
            textFilter: true
        };

        this.$table = new ClientSideTable($('#results-table'), options);
    },

    /**
     * Load an example sequence.
     * @param {Event} event The event.
     */
    loadExample(event) {
        event.preventDefault();
        this.$sequence.val(
            '>GUT_GENOME119949_7\n' +
            'GGAGTGCGGCGGAAAGTTAACCTATGCCGGACCCTGCGGGAATCCAGCTGCGTTCGAACA' +
            'AGCAACCAACATATATATCTGAATTTGGATGTGGTGGGCACTTTGTTGTTAGGCGCTTTG' +
            'AGGTGCGAGTGACACTTTGGGGTGCGCGGAGCCCTGGGTTGGGTCGATGATTTGGGATGA' +
            'GCTTCTTACTTAGGTGAAGAGGGGCTTTATGGCTGAGAGGTAGTCTTTGGCTACGTCGGC' +
            'TTTATCTGCTTGGAAATTGTGCCAGGCCCACCATTGGACCATTCCTACGAAGCTTGAGGC' +
            'TATGTGGTGTAGTAGGAAGCTTCGGTCCATGGTGGCGGCGGGGCCGTTTGGGTCGGTAGG' +
            'GACGGTTTCGGCTGCTCGGGCCATGATGGTCTTGCGGAGGCTGTCGGCGAAGACGCGTGA' +
            'ACCGGCGCCGGCTACCAGTGCCCGTACACCCTGACGGCGCTCCCAGAGGTTGTTGAGGAT' +
            'ATGCTCGACCTGTACGAGTGGGTCATCGAGGGGCGTACCGTCATCGTCGAGGGCATGGGT' +
            'GCAGATATCGCGCACGAGCTCAGCGAGCAGGTCATCTTTGCTTTTGAAGAGGCCGTAGAA' +
            'CGTGGCCCGACCCACATGGGCGCGAGCGATGATGTCGCCGACGGTGATCTTGCCGTAGTC' +
            'CTCTTCGCGCAGCAGCTCGGAGAACGCCGCGACGATCGCGGCGCGGCTTTTGGCCTTGCG' +
            'GGCATCCATGGCTATGCGTCCGCGTCAACGAGCAGACAGCGGAGCGTCCCGGAGCAGCCC' +
            'TCGTAGGGGCGCTTGCCGGCGCCGTAGCCGACGGCTTCGATGCGGTAGCGTGAGGGCAGT' +
            'TGGTCGGACGTGCGCAGAGCAGTGACGATGGCGGCGCCCGTGGGCGTCACGAGCTCGCCG' +
            'GCGACCGGTGCAGGCGTGAGGGCGATATTGCCCGCCTGGCACAGGTTGACGACAGCGGGG' +
            'ACGGGAATGGGCATGAGGCCGTGGGCGCAGCGAATGGCGCCGTGGCCCTCGAAAAGCGAC'
        );
    },

    /**
     * Submit the search to the API microservice.
     * The service expects a fasta or a DNA sequence shorter than MAX_SEQ
     * @param {Event} event The event.
     */
    submitSearch(event) {
        const that = this;
        event.preventDefault();
        this.$searchButton.prop('disabled', true);

        const sequence = this.cleanSequence(this.$sequence.val());
        const threshold = parseFloat(this.$threshold.val());

        if (!this.validateSequence(sequence)) {
            this.showMessage('Invalid sequence. It has to be a valid DNA sequence longer than ' +
                this.MIN_LEN + 'pb and shorter than ' +
                this.MAX_LEN + 'pb', this.MSG_TYPE.ERROR);
            this.$searchButton.prop('disabled', false);
            this.$loading.hide();
            return;
        }

        if (threshold < 0.1 || threshold > 1.0) {
            this.showMessage('Invalid threshold. The value has to be between 0.1 and ' +
                        ' 1.0 (recommended value 0.4)',
                        this.MSG_TYPE.ERROR);
            this.$searchButton.prop('disabled', false);
            this.$loading.hide();
            return;
        }

        that.$loading.show();

        $.ajax({
            method: 'POST',
            url: that.API_URL,
            data: {
                seq: sequence,
                threshold: threshold
            }
        }).done((response) => {
            const data = response.results.map((d) => {
                const accession = d.bigsi['sample_name'];
                return [
                    '<a href="/metagenomics/genome/' + accession + '">' + accession + '</a>',
                    // bigsi
                    d.bigsi['percent_kmers_found'],
                    d.bigsi['num_kmers'],
                    d.bigsi['num_kmers_found'],
                    // mgnify
                    d.mgnify.attributes['completeness'],
                    d.mgnify.attributes['contamination'],
                    that.processLineage(d.mgnify.attributes['taxon-lineage']),
                    d.mgnify.attributes['geographic-origin'],
                    d.mgnify.attributes['num-contigs'],
                    d.mgnify.attributes['length']
                ];
            });

            that.$table.update(data, true, 1);

            that.$loading.hide();
            that.$resultsSection.removeClass('hidden');

            $([document.documentElement, document.body]).animate({
                scrollTop: that.$resultsSection.offset().top - 120 // header and table header
            }, 1000);
        }).fail((error) => {
            that.showMessage('Unexpected error.' + error.response || '', that.MSG_TYPE.ERROR);
        }).always(() => {
            that.$searchButton.prop('disabled', false);
            that.$loading.hide();
        });
    },

    /**
     * Load the content of the file directly into the text area.
     */
    loadFastaFile() {
        const files = this.$fastaFile.prop('files');
        if (files.length !== 1) {
            this.showMessage('Please, select only one file.', this.MSG_TYPE.WARNING);
            return;
        }
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.$sequence.val(reader.result);
        };
        reader.onerror = (event) => {
            this.showMessage('File upload error. Error: ' + event.type, this.MSG_TYPE.ERROR);
        };
        reader.onabort = () => {
            this.showMessage('File upload abort.', this.MSG_TYPE.WARNING);
        };
        reader.readAsText(file);
    },

    /**
     * Clear the form and remove the resutls table.
     */
    reset() {
        this.$sequence.val('');
        this.$table.update([], true, 1);
        this.$resultsSection.addClass('hidden');
        this.$form.trigger('reset');
        this.$searchButton.prop('disabled', false);
        this.$loading.hide();
    },

    /**
     * Will clean the fasta sequence.
     * This will remove the fasta seq name and will remove new lines or empty spaces
     * @param {string} sequence fasta or DNA sequence
     * @return {string} the clean fasta
     */
    cleanSequence(sequence) {
        if (!sequence) {
            return sequence;
        }
        return sequence.replace(/^>.+\n/gm, '')
            .replace(/r\n|\n|\r|\s/gm, '');
    },

    /**
     * Will validate if the sequence is DNA only.
     * @param {string} sequence true if the sequence contains only IUPAC DNA valid characters
     *                          and if shorter that MAX_LEN
     *                          and if longer that MIN_LEN
     * @return {bool} True if valid
     */
    validateSequence(sequence) {
        return sequence.length < this.MAX_LEN &&
            sequence.length > this.MIN_LEN &&
            /^[ATGCRYMKSWHBVDN\s]+$/i.test(sequence);
    },

    /**
     * Show a meesage to the user.
     * @param {string} message the string message
     * @param {messageType} type the message type
     */
    showMessage(message, type) {
        this.$messageContainter.html(
            $('<div class="callout ' + type + '" data-closable>' + message +
                '<button class="close-button" aria-label="Dismiss message"' +
                    ' type="button" data-close>' +
                    '<span aria-hidden="true">&times;</span>' +
                '</button>' +
              '</div>')
        );
    },

    /**
     * Get the latest completed element of a lineage.
     * For example for:
     * 'd__Bacteria;p__Bacteroidota;c__Bacteroidia;
     *  o__Bacteroidales;f__Bacteroidaceae;g__Bacteroides;s__'
     * this method will return 'g__Bacteroides'
     * @param {string} lineage a genome lineage
     * @return {string} the last element of the lineage
     */
    processLineage(lineage) {
        let split = lineage.split(';');
        for (let i = split.length - 1; i > 0; i--) {
            // eslint-disable-next-line security/detect-object-injection
            if (split[i].length > 3) {
                // eslint-disable-next-line security/detect-object-injection
                return split[i];
            }
        }
        return '';
    }
});

new GenomeSearchView({
    api_url: api.API_URL + 'genome-search'
});
