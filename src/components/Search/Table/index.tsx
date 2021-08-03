import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useEBISearchData } from 'hooks/useMGnifyData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';

const PAGE_SIZE = 25;

const dataFor = {
  '/search/studies': {
    endpoint: 'metagenomics_projects',
    query: 'domain_source:metagenomics_projects',
    fields: 'ENA_PROJECT,biome_name,centre_name',
    columns: [
      {
        id: 'study_id',
        Header: 'MGnify ID',
        accessor: (study) => study.id,
        Cell: ({ cell }) => (
          <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'ena_id',
        Header: 'ENA accession',
        accessor: (study) => study?.fields?.ENA_PROJECT?.[0] || '',
        Cell: ({ cell }) => (
          <span>
            <a
              href={`https://www.ebi.ac.uk/ena/browser/view/${cell.value}`}
              className="ext"
            >
              {cell.value}
            </a>
          </span>
        ),
      },
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (study) => study?.fields?.biome_name?.join(':'),
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'centre',
        Header: 'Centre name',
        accessor: (study) => study?.fields?.centre_name?.[0],
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
    ],
  },
  '/search/samples': {
    endpoint: 'metagenomics_samples',
    query: 'domain_source:metagenomics_samples',
    fields: 'METAGENOMICS_PROJECTS,name,description',
    columns: [
      {
        id: 'sample_id',
        Header: 'Sample',
        accessor: (sample) => sample.id,
        Cell: ({ cell }) => (
          <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'mgnify_id',
        Header: 'MGnify ID',
        accessor: (sample) => sample?.fields?.METAGENOMICS_PROJECTS?.[0] || '',
        Cell: ({ cell }) => (
          <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'sample_name',
        Header: 'Name',
        pathnames: ['/search/studies'],
        accessor: (study) => study?.fields?.name?.[0],
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'sample_description',
        Header: 'Description',
        pathnames: ['/search/studies'],
        accessor: (study) => study?.fields?.description?.[0],
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
    ],
  },
  '/search/analyses': {
    endpoint: 'metagenomics_analyses',
    query: 'domain_source:metagenomics_analyses',
    fields:
      'METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,pipeline_version,experiment_type',
    columns: [
      {
        id: 'analyses_id',
        Header: 'Analysis',
        accessor: (analysis) => (analysis.id || '').split('_'),
        Cell: ({ cell }) => (
          <Link to={`/analyses/${cell.value[0]}?version=${cell.value[1]}`}>
            {cell.value[0]}
          </Link>
        ),
      },
      {
        id: 'pipeline',
        Header: 'Pipeline version',
        accessor: (analysis) => analysis?.fields?.pipeline_version?.[0] || '',
        Cell: ({ cell }) => (
          <span>
            <Link to={`/pipelines/${cell.value}`}>{cell.value}</Link>
          </span>
        ),
      },
      {
        id: 'sample_id',
        Header: 'Sample',
        accessor: (analysis) => analysis?.fields?.METAGENOMICS_SAMPLES?.[0],
        Cell: ({ cell }) => (
          <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'mgnify_id',
        Header: 'MGnify ID',
        accessor: (analysis) =>
          analysis?.fields?.METAGENOMICS_PROJECTS?.[0] || '',
        Cell: ({ cell }) => (
          <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'experiment',
        Header: 'Experiment type',
        accessor: (analysis) => analysis?.fields?.experiment_type?.[0],
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
    ],
  },
};
const SearchTable: React.FC = () => {
  const [queryParameters] = useQueryParametersState({
    query: '',
  });

  const { pathname } = useLocation();
  const { data, loading, error } = useEBISearchData(
    dataFor[pathname].endpoint,
    {
      query: queryParameters?.query || dataFor[pathname].query,
      size: PAGE_SIZE,
      fields: dataFor[pathname].fields,
      facetcount: 10,
      facetsdepth: 2,
      facets: '',
    }
  );

  const columns = useMemo(() => dataFor[pathname].columns, [pathname]);
  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  const fomattedData = {
    data: data.entries as Record<string, unknown>[],
    meta: {
      pagination: {
        pages: Math.ceil((data.hitCount as number) / PAGE_SIZE),
      },
    },
  };

  return (
    <EMGTable
      cols={columns}
      data={fomattedData}
      title={`Studies (${data.hitCount})`}
      initialPage={1}
    />
  );
};

export default SearchTable;
