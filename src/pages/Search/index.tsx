import React, { useContext, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MultipleOptionFilter from 'components/Search/Filter/MultipleOption';
import HierarchyMultipleOptionFilter from 'components/Search/Filter/HierarchyMultipleOption';
import TemperatureFilter from 'components/Search/Filter/Temperature';
import DepthFilter from 'components/Search/Filter/Depth';
import Tabs from 'components/UI/Tabs';
import TextSearch from 'components/Search/Filter/Text';
import SearchTable from 'components/Search/Table';
import useEBISearchData from 'hooks/data/useEBISearchData';
import useSharedQueryParamState from 'hooks/queryParamState/useQueryParamState';
import FieldMultipleTextQuery from 'components/Search/Filter/FieldMultipleTextQuery';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import SharedQueryParamsProvider, {
  SharedMultipleValueQueryParam,
  SharedNumberQueryParam,
  SharedTextQueryParam,
} from 'hooks/queryParamState/QueryParamStore/QueryParamContext';

import './style.css';

const PAGE_SIZE = 25;
const FACET_DEPTH = 4;

const buildFacetString = (facetName: string, values: string[]): string =>
  (values || [])
    .filter(Boolean)
    .map((v) => `${facetName}:${v}`)
    .join(',');

const buildRangeString = (fieldName: string, rangeStr: string): string => {
  const parts = String(rangeStr || '')
    .split(',')
    .filter(Boolean)
    .map(Number);
  if (parts.length !== 2) return '';
  return `${fieldName}:[${Math.min(...parts)} TO ${Math.max(...parts)}]`;
};

const joinQueryParts = (parts: string[], defaultValue: string): string => {
  const filtered = parts.filter(Boolean);
  return filtered.length ? filtered.join(' AND ') : defaultValue;
};

const TextSearchCount: React.FC<{ to: string; label: string }> = ({
  to,
  label,
}) => {
  const { searchData } = useContext(SearchQueryContext);
  return (
    <>
      {label}
      <span className="mg-number">
        {searchData?.[to]?.data?.hitCount || '0'}
      </span>
    </>
  );
};

const tabs = [
  {
    to: '/search/studies',
    label: () => <TextSearchCount to="/search/studies" label="Studies" />,
  },
  {
    to: '/search/analyses',
    label: () => (
      <TextSearchCount to="/search/analyses" label="Sample analyses" />
    ),
  },
];

const SearchPageInner: React.FC = () => {
  const [query] = useSharedQueryParamState<string>('query');
  const [page] = useSharedQueryParamState<number>('page');
  const [pageSize] = useSharedQueryParamState<number>('page_size');
  const [centreName] = useSharedQueryParamState<string[]>('centre_name');
  const [biome] = useSharedQueryParamState<string[]>('biome');
  const [temperature] = useSharedQueryParamState<string>('temperature');
  const [depth] = useSharedQueryParamState<string>('depth');
  const [experimentType] =
    useSharedQueryParamState<string[]>('experiment_type');
  const [sequencingMethod] =
    useSharedQueryParamState<string[]>('sequencing_method');
  const [locationName] = useSharedQueryParamState<string[]>('location_name');
  const [organism] = useSharedQueryParamState<string[]>('organism');
  const [pipelineVersion] =
    useSharedQueryParamState<string[]>('pipeline_version');
  const [go] = useSharedQueryParamState<string>('GO');
  const [interpro] = useSharedQueryParamState<string>('INTERPRO');

  const start = useMemo(
    () => ((page || 1) - 1) * (pageSize || PAGE_SIZE),
    [page, pageSize]
  );

  const studiesQuery = useMemo(
    () =>
      joinQueryParts([query as string], 'domain_source:metagenomics_projects'),
    [query]
  );

  const studiesFacets = useMemo(
    () =>
      [
        buildFacetString('centre_name', centreName as string[]),
        buildFacetString('biome', biome as string[]),
      ]
        .filter(Boolean)
        .join(','),
    [centreName, biome]
  );

  const analysesQuery = useMemo(() => {
    const interproFormatted =
      interpro && String(interpro)
        ? `(${String(interpro).replaceAll('IPR', 'INTERPRO:IPR')})`
        : '';
    const goFormatted = go && String(go) ? `(${String(go)})` : '';
    return joinQueryParts(
      [
        query as string,
        buildRangeString('temperature', temperature as string),
        buildRangeString('depth', depth as string),
        goFormatted,
        interproFormatted,
      ],
      'domain_source:metagenomics_analyses'
    );
  }, [query, temperature, depth, go, interpro]);

  const analysesFacets = useMemo(
    () =>
      [
        buildFacetString('biome', biome as string[]),
        buildFacetString('organism', organism as string[]),
        buildFacetString('pipeline_version', pipelineVersion as string[]),
        buildFacetString('experiment_type', experimentType as string[]),
        buildFacetString('location_name', locationName as string[]),
        buildFacetString('sequencing_method', sequencingMethod as string[]),
      ]
        .filter(Boolean)
        .join(','),
    [
      biome,
      organism,
      pipelineVersion,
      experimentType,
      locationName,
      sequencingMethod,
    ]
  );

  const searchDataStudies = useEBISearchData('metagenomics_projects', {
    query: studiesQuery,
    size: pageSize || PAGE_SIZE,
    start,
    fields:
      'ENA_PROJECT,METAGENOMICS_ANALYSES,biome_name,centre_name,description,name',
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: studiesFacets,
  });

  const searchDataAnalyses = useEBISearchData('metagenomics_analyses', {
    query: analysesQuery,
    size: pageSize || PAGE_SIZE,
    start,
    /* eslint-disable max-len */
    fields:
      'METAGENOMICS_PROJECTS,pipeline_version,experiment_type,sample_name,project_name,ENA_RUN,ANALYSIS,SRA-SAMPLE',
    /* eslint-enable max-len */
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: analysesFacets,
  });

  const context = useMemo(
    () =>
      ({
        searchData: {
          '/search/studies': searchDataStudies,
          '/search/analyses': searchDataAnalyses,
        },
      } as any),
    [searchDataStudies, searchDataAnalyses]
  );

  return (
    <section className="vf-content mg-page-search">
      <h2>Text Search</h2>
      <SearchQueryContext.Provider value={context}>
        <TextSearch />
        <Tabs tabs={tabs} preservedQueryParameters={['query']} />
        <section className="vf-grid mg-grid-search vf-u-padding__top--400">
          <div className="vf-stack vf-stack--800">
            <Routes>
              <Route
                path="studies"
                element={
                  <>
                    <HierarchyMultipleOptionFilter
                      facetName="biome"
                      header="Biome"
                    />
                    <MultipleOptionFilter
                      facetName="centre_name"
                      header="Centre Name"
                      includeTextFilter
                    />
                  </>
                }
              />
              <Route
                path="analyses"
                element={
                  <>
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
                      sortFn={(a: unknown, b: unknown) =>
                        Number((b as { value: unknown }).value) -
                        Number((a as { value: unknown }).value)
                      }
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
                    <FieldMultipleTextQuery
                      fieldName="GO"
                      header="GO"
                      example="E.g. GO:0003677"
                      queryMatcher={/GO:\d+/g}
                      queryMustInclude="GO:"
                      explainer={
                        <span>
                          Annotations from the{' '}
                          <a href="https://www.ebi.ac.uk/QuickGO/">
                            Gene Ontology
                          </a>
                        </span>
                      }
                    />
                    <FieldMultipleTextQuery
                      fieldName="INTERPRO"
                      header="InterPro"
                      example="E.g. IPR013785"
                      queryMatcher={/IPR\d+/g}
                      queryMustInclude="IPR"
                      explainer={
                        <span>
                          Annotations from{' '}
                          <a href="https://www.ebi.ac.uk/interpro/entry/InterPro/">
                            InterPro
                          </a>
                        </span>
                      }
                    />
                  </>
                }
              />
              <Route index element={<Navigate to="studies" replace />} />
            </Routes>
          </div>
          <SearchTable />
        </section>
      </SearchQueryContext.Provider>
    </section>
  );
};

const SearchPage: React.FC = () => (
  <SharedQueryParamsProvider
    params={{
      query: SharedTextQueryParam(''),
      page: SharedNumberQueryParam(1),
      page_size: SharedNumberQueryParam(PAGE_SIZE),
      centre_name: SharedMultipleValueQueryParam([]),
      biome: SharedMultipleValueQueryParam([]),
      temperature: SharedTextQueryParam(''),
      depth: SharedTextQueryParam(''),
      experiment_type: SharedMultipleValueQueryParam([]),
      sequencing_method: SharedMultipleValueQueryParam([]),
      location_name: SharedMultipleValueQueryParam([]),
      organism: SharedMultipleValueQueryParam([]),
      pipeline_version: SharedMultipleValueQueryParam([]),
      GO: SharedTextQueryParam(''),
      INTERPRO: SharedTextQueryParam(''),
    }}
  >
    <SearchPageInner />
  </SharedQueryParamsProvider>
);

export default SearchPage;
