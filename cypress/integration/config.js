var Config = module.exports = {
    BASE_URL: Cypress.env('CLIENT_URL'),
    // BASE_URL: 'http://localhost:8000/metagenomics/',
    API_URL: "http://localhost:8000/v1/",
    SEARCH_URL: "https://www.ebi.ac.uk/ebisearch/ws/rest/metagenomics_",
    INTERPRO_URL: "http://www.ebi.ac.uk/interpro/",
    SEQUENCE_SEARCH_URL: "https://www.ebi.ac.uk/metagenomics/sequence-search/search/phmmer",
    ENA_URL: "https://www.ebi.ac.uk/ena/data/view/"
};
