import React from 'react';
import { Switch, Route } from 'react-router-dom';

import CentreNameFilter from 'components/Search/Filter/CentreName';
import BiomeFilter from 'components/Search/Filter/Biome';
import SearchTabs from 'src/components/Search/Tabs';
import TextSearch from 'src/components/Search/Filter/Text';
import SearchTable from 'src/components/Search/Table';
import { useEBISearchData } from 'hooks/useMGnifyData';
import { QueryState, useQueryParametersState } from 'hooks/useQueryParamState';
import SearchQueryContext from './SearchQueryContext';

const PAGE_SIZE = 25;

const formatToFacet = (facetName: string, strValue: string): string =>
  strValue
    .split(',')
    .filter(Boolean)
    .map((v) => `${facetName}:${v}`)
    .join(',');

const getFacets = (facetNames: string[], queryParameters: QueryState): string =>
  facetNames
    .map((name) => formatToFacet(name, queryParameters[name] as string))
    .filter(Boolean)
    .join(',');

const TextSearchPage: React.FC = () => {
  const [queryParameters, setQueryParameters] = useQueryParametersState({
    query: '',
    centre_name: '',
    biome: '',
  });

  const searchDataStudies = useEBISearchData('metagenomics_projects', {
    query:
      (queryParameters?.query as string) ||
      'domain_source:metagenomics_projects',
    size: PAGE_SIZE,
    fields: 'ENA_PROJECT,biome_name,centre_name',
    facetcount: 10,
    facetsdepth: 3,
    facets: getFacets(['centre_name', 'biome'], queryParameters),
  });
  const searchDataSamples = useEBISearchData('metagenomics_samples', {
    query:
      (queryParameters?.query as string) ||
      'domain_source:metagenomics_samples',
    size: PAGE_SIZE,
    fields: 'METAGENOMICS_PROJECTS,name,description',
    facetcount: 10,
    facetsdepth: 3,
    facets: getFacets(['biome'], queryParameters),
  });
  const searchDataAnalyses = useEBISearchData('metagenomics_analyses', {
    query:
      (queryParameters?.query as string) ||
      'domain_source:metagenomics_analyses',
    size: PAGE_SIZE,
    fields:
      'METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,pipeline_version,experiment_type',
    facetcount: 10,
    facetsdepth: 3,
    facets: getFacets(['biome'], queryParameters),
  });
  const context = {
    searchData: {
      '/search/studies': searchDataStudies,
      '/search/samples': searchDataSamples,
      '/search/analyses': searchDataAnalyses,
    },
    queryParameters,
    setQueryParameters,
  };

  return (
    <section className="vf-content">
      <h2>Text Search.</h2>
      <SearchQueryContext.Provider value={context}>
        <TextSearch />
        <SearchTabs />
        <section className="embl-grid">
          <div className="vf-stack vf-stack--400">
            <Switch>
              <Route path="/search/studies">
                <BiomeFilter />
                <CentreNameFilter />
              </Route>
              <Route path="/search/samples">
                <BiomeFilter />
              </Route>
              <Route path="/search/analyses">
                <BiomeFilter />
              </Route>
            </Switch>
          </div>
          <SearchTable />
        </section>
      </SearchQueryContext.Provider>
    </section>
  );
};

export default TextSearchPage;
