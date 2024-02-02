import React, { useContext, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { some } from 'lodash-es';

import MultipleOptionFilter from 'components/Search/Filter/MultipleOption';
import HierarchyMultipleOptionFilter from 'components/Search/Filter/HierarchyMultipleOption';
import TemperatureFilter from 'components/Search/Filter/Temperature';
import DepthFilter from 'components/Search/Filter/Depth';
import Tabs from 'components/UI/Tabs';
import TextSearch from 'components/Search/Filter/Text';
import SearchTable from 'components/Search/Table';
import useEBISearchData from 'hooks/data/useEBISearchData';

import { Param } from 'hooks/queryParamState/QueryParamStore/queryParamReducer';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import FieldMultipleTextQuery from 'components/Search/Filter/FieldMultipleTextQuery';
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

const getFacets = (facetQueryParams: Param[]): string => {
  return facetQueryParams
    .map((queryParam) =>
      queryParam === undefined
        ? ''
        : formatToFacet(queryParam.name, queryParam.value as string)
    )
    .filter(Boolean)
    .join(',');
};

const getRangeStringFromQueryParam = (queryParam: Param) => {
  const newRange = (queryParam.value as string)
    .split(',')
    .filter(Boolean)
    .map(Number);
  return newRange.length === 2
    ? `${queryParam.name}:[${Math.min(...newRange)} TO ${Math.max(
        ...newRange
      )}]`
    : '';
};

const joinQueries = (queryParams: Param[], defaultValue: string) => {
  if (!queryParams.length || some(queryParams, (q) => q === undefined))
    return defaultValue;
  const query = queryParams
    .map((param) => {
      switch (param.name) {
        case 'query':
          return param.value;
        case 'temperature':
        case 'depth': {
          return getRangeStringFromQueryParam(param);
        }
        case 'INTERPRO':
          if (!param.value) return '';
          return `(${param.value.replaceAll('IPR', 'INTERPRO:IPR')})`;
        case 'GO': {
          if (!param.value) return '';
          return `(${param.value})`;
        }
        default:
          return '';
      }
    })
    .filter(Boolean);
  if (query.length) return query.join(' AND ');
  return defaultValue;
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

const TextSearchPage: React.FC = () => {
  const [, , { param: queryParam }] = useQueryParamState('query', '');
  const [pageParam] = useQueryParamState('page', 1, Number);
  const [pageSizeParam] = useQueryParamState('page_size', PAGE_SIZE, Number);
  const [, , { param: centreNameParam }] = useQueryParamState(
    'centre_name',
    ''
  );
  const [, , { param: biomeParam }] = useQueryParamState('biome', '');
  const [, , { param: temperatureParam }] = useQueryParamState(
    'temperature',
    ''
  );
  const [, , { param: depthParam }] = useQueryParamState('depth', '');
  const [, , { param: experimentTypeParam }] = useQueryParamState(
    'experiment_type',
    ''
  );
  const [, , { param: sequencingMethodParam }] = useQueryParamState(
    'sequencing_method',
    ''
  );
  const [, , { param: locationNameParam }] = useQueryParamState(
    'location_name',
    ''
  );
  const [, , { param: organismParam }] = useQueryParamState('organism', '');
  const [, , { param: pipelineVersionParam }] = useQueryParamState(
    'pipeline_version',
    ''
  );
  const [, , { param: goParam }] = useQueryParamState('GO', '');
  const [, , { param: interproParam }] = useQueryParamState('INTERPRO', '');

  const start = useMemo(() => {
    return ((pageParam as number) - 1) * (pageSizeParam as number);
  }, [pageParam, pageSizeParam]);

  const searchDataStudies = useEBISearchData('metagenomics_projects', {
    query: joinQueries([queryParam], 'domain_source:metagenomics_projects'),
    size: pageSizeParam,
    start,
    fields:
      'ENA_PROJECT,METAGENOMICS_ANALYSES,biome_name,centre_name,description,name',
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: getFacets([centreNameParam, biomeParam]),
  });
  const searchDataAnalyses = useEBISearchData('metagenomics_analyses', {
    query: joinQueries(
      [queryParam, temperatureParam, depthParam, goParam, interproParam],
      'domain_source:metagenomics_analyses'
    ),
    size: pageSizeParam,
    start,
    /* eslint-disable max-len */
    fields:
      'METAGENOMICS_PROJECTS,pipeline_version,experiment_type,sample_name,project_name,ENA_RUN,ANALYSIS,SRA-SAMPLE',
    /* eslint-enable max-len */
    facetcount: 10,
    facetsdepth: FACET_DEPTH,
    facets: getFacets([
      biomeParam,
      organismParam,
      pipelineVersionParam,
      experimentTypeParam,
      locationNameParam,
      sequencingMethodParam,
    ]),
  });
  const context = useMemo(
    () => ({
      searchData: {
        '/search/studies': searchDataStudies,
        '/search/analyses': searchDataAnalyses,
      },
    }),
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
                      sortFn={({ value: a }, { value: b }) =>
                        Number(b) - Number(a)
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

export default TextSearchPage;
