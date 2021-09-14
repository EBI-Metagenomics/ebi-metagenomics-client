import React from 'react';
import { Switch, Route } from 'react-router-dom';

import MultipleOptionFilter from 'components/Search/Filter/MultipleOption';
import HierarchyMultipleOptionFilter from 'src/components/Search/Filter/HierarchyMultipleOption';
import TemperatureFilter from 'components/Search/Filter/Temperature';
import DepthFilter from 'components/Search/Filter/Depth';
import SearchTabs from 'src/components/Search/Tabs';
import TextSearch from 'src/components/Search/Filter/Text';
import SearchTable from 'src/components/Search/Table';
import useEBISearchData from 'hooks/data/useEBISearchData';
import { QueryState, useQueryParametersState } from 'hooks/useQueryParamState';
import SearchQueryContext from './SearchQueryContext';

import './style.css';

const PAGE_SIZE = 25;
const FACET_DEPTH = 4;

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

const getSamplesQuery = (
  names: string[],
  queryParameters: QueryState,
  defaultValue: string
): string => {
  const query = names
    .map((name) => {
      switch (name) {
        case 'query':
          return queryParameters[name];
        case 'temperature':
        case 'depth': {
          const newRange = (queryParameters[name] as string)
            .split(',')
            .filter(Boolean)
            .map(Number);

          return newRange.length === 2
            ? `${name}:[${Math.min(...newRange)} TO ${Math.max(...newRange)}]`
            : '';
        }
        default:
          return '';
      }
    })
    .filter(Boolean);
  if (query.length) return query.join(' AND ');
  return defaultValue;
};
const TextSearchPage: React.FC = () => {
  const [queryParameters, setQueryParameters] = useQueryParametersState({
    query: '',
    centre_name: '',
    biome: '',
    temperature: '',
    depth: '',
    experiment_type: '',
    sequencing_method: '',
    location_name: '',
    disease_status: '',
    phenotype: '',
    organism: '',
    pipeline_version: '',
    GO: '',
    INTERPRO: '',
  });

  const searchDataStudies = useEBISearchData('metagenomics_projects', {
    query: getSamplesQuery(
      ['query'],
      queryParameters,
      'domain_source:metagenomics_projects'
    ),
    size: PAGE_SIZE,
    fields: 'ENA_PROJECT,biome_name,centre_name',
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: getFacets(['centre_name', 'biome'], queryParameters),
  });
  const searchDataSamples = useEBISearchData('metagenomics_samples', {
    query: getSamplesQuery(
      ['query', 'temperature', 'depth'],
      queryParameters,
      'domain_source:metagenomics_samples'
    ),
    size: PAGE_SIZE,
    fields: 'METAGENOMICS_PROJECTS,name,description',
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: getFacets(
      [
        'biome',
        'experiment_type',
        'location_name',
        'disease_status',
        'sequencing_method',
        'phenotype',
      ],
      queryParameters
    ),
  });
  const searchDataAnalyses = useEBISearchData('metagenomics_analyses', {
    query: getSamplesQuery(
      ['query', 'temperature', 'depth'],
      queryParameters,
      'domain_source:metagenomics_analyses'
    ),
    size: PAGE_SIZE,
    fields:
      'METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,pipeline_version,experiment_type',
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: getFacets(
      [
        'biome',
        'organism',
        'pipeline_version',
        'experiment_type',
        'GO',
        'INTERPRO',
      ],
      queryParameters
    ),
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
    <section className="vf-content mg-page-search">
      <h2>Text Search.</h2>
      <SearchQueryContext.Provider value={context}>
        <TextSearch />
        <SearchTabs />
        <section className="vf-grid">
          <div className="vf-stack vf-stack--200">
            <Switch>
              <Route path="/search/studies">
                <HierarchyMultipleOptionFilter
                  facetName="biome"
                  header="Biome"
                />
                <MultipleOptionFilter
                  facetName="centre_name"
                  header="Centre Name"
                  includeTextFilter
                />
              </Route>
              <Route path="/search/samples">
                <TemperatureFilter />
                <DepthFilter />
                <HierarchyMultipleOptionFilter
                  facetName="biome"
                  header="Biome"
                />
                <MultipleOptionFilter
                  facetName="experiment_type"
                  header="Experiment type"
                />
                <MultipleOptionFilter
                  facetName="sequencing_method"
                  header="Sequencing method"
                />
                <MultipleOptionFilter
                  facetName="location_name"
                  header="Location name"
                  includeTextFilter
                />
                <MultipleOptionFilter
                  facetName="disease_status"
                  header="Disease status"
                />
                <MultipleOptionFilter
                  facetName="phenotype"
                  header="Phenotype"
                />
              </Route>
              <Route path="/search/analyses">
                <TemperatureFilter />
                <DepthFilter />
                <HierarchyMultipleOptionFilter
                  facetName="organism"
                  header="Organism"
                />
                <HierarchyMultipleOptionFilter
                  facetName="biome"
                  header="Biome"
                />
                <MultipleOptionFilter
                  facetName="pipeline_version"
                  header="Pipeline version"
                />
                <MultipleOptionFilter
                  facetName="experiment_type"
                  header="Experiment type"
                />
                <MultipleOptionFilter
                  facetName="GO"
                  header="GO"
                  includeTextFilter
                />
                <MultipleOptionFilter
                  facetName="INTERPRO"
                  header="InterPro"
                  includeTextFilter
                />
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
