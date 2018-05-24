const searchUrl = process.env.SEARCH_URL;

/**
 * Container for EBI search counts, used on index page
 */
class Count {
    /**
     * Initialise result count display
     * @param {string} domainIdShort
     * @param {string} domainId
     * @param {string} experimentType
     */
    constructor(domainIdShort, domainId, experimentType) {
        this.params = {
            fields: 'id,name',
            facet: {
                experimentType: experimentType
            }
        };
        this.domainIdShort = domainIdShort;
        this.domainId = domainId;
    }

    /**
     * Fetch EBI search url
     * @return {string}
     */
    get url() {
        let searchQuery = 'value1?query=domain_source:value2' +
            '&format=json' +
            '&size=0' +
            '&start=0' +
            '&fields=id,name,description,biome_name,metagenomics_samples' +
            '&facetcount=0' +
            '&facetsdepth=5';
        searchQuery = searchQuery.replace('value1', this.domainIdShort);
        searchQuery = searchQuery.replace('value2', this.domainId);
        if (this.params.facet.experimentType !== null) {
            searchQuery += '&facets=experiment_type:' + this.params.facet.experimentType;
        }
        return searchUrl + searchQuery;
    }
}

/**
 * Retrive project count
 */
export class ProjectCount extends Count {
    constructor() {
        super('projects', 'metagenomics_projects', null);
    }
}

/**
 * Retrive sample count
 */
export class SampleCount extends Count {
    constructor() {
        super('samples', 'metagenomics_samples', null);
    }
}

/**
 * Retrive run count
 */
export class RunCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', null);
    }
}

/**
 * Retrive amplicon count
 */
export class AmpliconCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'amplicon');
    }
}

/**
 * Retrive assembly count
 */
export class AssemblyCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'assembly');
    }
}

/**
 * Retrive metatranscriptomic count
 */
export class MetatranscriptomicCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'metatranscriptomic');
    }
}

/**
 * Retrive metabarcoding count
 */
export class MetabarcodingCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'metabarcoding');
    }
}

/**
 * Retrive metagenomic count
 */
export class MetagenomicCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'metagenomic');
    }
}
