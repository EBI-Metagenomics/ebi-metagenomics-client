const searchUrl = process.env.SEARCH_URL;

class Count {
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

    get url() {
        let searchQuery = 'value1?query=domain_source:value2&format=json&size=0&start=0&fields=id,name,description,biome_name,metagenomics_samples&facetcount=0&facetsdepth=5';
        searchQuery = searchQuery.replace('value1', this.domainIdShort);
        searchQuery = searchQuery.replace('value2', this.domainId);
        if (this.params.facet.experimentType !== null) {
            searchQuery += '&facets=experiment_type:' + this.params.facet.experimentType
        }
        return searchUrl + searchQuery;
    }
}

export class ProjectCount extends Count {
    constructor() {
        super('projects', 'metagenomics_projects', null);
    }
}

export class SampleCount extends Count {
    constructor() {
        super('samples', 'metagenomics_samples', null);
    }
}

export class RunCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', null);
    }
}

export class AmpliconCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'amplicon');
    }
}

export class AssemblyCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'assembly');
    }
}

export class MetatranscriptomicCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'metatranscriptomic');
    }
}

export class MetabarcodingCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'metabarcoding');
    }
}

export class MetagenomicCount extends Count {
    constructor() {
        super('runs', 'metagenomics_runs', 'metagenomic');
    }
}