/**
 * BIGSI genome search
 */
require('../commons');
const util = require('../util');
const Backbone = require('backbone');
const ClientSideTable = require('./clientSideTable');

const DEFAULT_PAGE_SIZE = 25;

/**
 * Genome Search View.
 * This view contains the Form and the Results table.
 */
module.exports = Backbone.View.extend({

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

        this.$form = this.$('#search-form');
        this.$fastaFile = this.$('#fasta-file');
        this.$sequence = this.$('#sequence');
        this.$threshold = this.$('#threshold');

        this.$searchButton = this.$('#search-button');
        this.$messageContainter = this.$('#message-containter');

        this.$resultsSection = this.$('#results-section');
        this.$loading = this.$('.genome-search-loading');

        if (!window.FileReader) {
            this.$('#fasta-file').hide();
        }

        const options = {
            title: '',
            headers: [
                {sortBy: 'a', name: 'Genome Accession', class: 'nowrap'},
                {sortBy: 'a', name: 'Taxonomic assignment', class: 'nowrap'},
                {sortBy: 'a', name: 'Genome length'},
                {sortBy: 'a', name: 'Num. contigs'},
                {sortBy: 'a', name: 'Genome completeness'},
                {sortBy: 'a', name: 'Genome contamination'},
                {sortBy: 'a', name: 'Geographic origin'},
                {sortBy: 'a', name: 'Num. K-mers in query'},
                {sortBy: 'a', name: 'Num. K-mers found in genome'},
                {sortBy: 'a', name: '% K-mers found'},
                {sortBy: 'a', name: 'BLAST score (log p)'}
            ],
            initPageSize: DEFAULT_PAGE_SIZE,
            textFilter: false
        };

        this.tableView = new ClientSideTable(this.$('#results-table'), options);
        this.$tableEl = this.tableView.$table;
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

        const rawSequence = this.$sequence.val();
        const sequence = this.cleanSequence(rawSequence);
        const threshold = parseFloat(this.$threshold.val());

        if (this.countSequences(rawSequence) > 1) {
            this.showMessage('Invalid sequence. Please submit only one fasta sequence.',
                             this.MSG_TYPE.ERROR);
            this.$searchButton.prop('disabled', false);
            this.$loading.hide();
            return;
        }

        if (!this.validateSequence(sequence)) {
            this.showMessage('Invalid sequence. It has to be a valid DNA sequence longer than ' +
                this.MIN_LEN + ' bp and shorter than ' +
                this.MAX_LEN + ' bp', this.MSG_TYPE.ERROR);
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

        // clean the table
        that.tableView.update([], true, 1);

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
                    '<a href="/metagenomics/genomes/' + accession + '">' + accession + '</a>',
                    util.getSimpleTaxLineage(d.mgnify.attributes['taxon-lineage'], true),
                    d.mgnify.attributes['length'],
                    d.mgnify.attributes['num-contigs'],
                    d.mgnify.attributes['completeness'],
                    d.mgnify.attributes['contamination'],
                    d.mgnify.attributes['geographic-origin'],
                    d.bigsi['num_kmers'],
                    d.bigsi['num_kmers_found'],
                    d.bigsi['percent_kmers_found'],
                    `${d.bigsi['score']} (${d.bigsi['log_pvalue']})`
                ];
            });

            that.tableView.update(data, true, 1);
            // Trigger tablesorter cache rebuild.
            // TODO: build a new Client Side table widget.
            that.$tableEl.trigger('update');

            if (data.length === 0) {
                this.$resultsSection.addClass('hidden');
                that.showMessage('No matches found.', that.MSG_TYPE.WARNING);
            } else {
                that.$messageContainter.html('');
                that.$resultsSection.removeClass('hidden');
                $([document.documentElement, document.body]).animate({
                    scrollTop: that.$resultsSection.offset().top - 120 // header and table header
                }, 1000);
            }
        }).fail((error) => {
            that.$messageContainter.html('');
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
        this.tableView.update([], true, 1);
        this.$resultsSection.addClass('hidden');
        this.$form.trigger('reset');
        this.$searchButton.prop('disabled', false);
        this.$loading.hide();
    },

    /**
     * Count the number of > characters, if more than one
     * then the user submited multiples sequences.
     * @param {string} sequence fasta submited
     * @return {int} number of > chars found
     */
    countSequences(sequence) {
        return sequence && (sequence.match(/>/g) || []).length;
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
    }
});
