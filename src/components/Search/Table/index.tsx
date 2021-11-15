import React, { useMemo, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';

// import './style.css';

const dataFor = {
  '/search/studies': {
    label: 'Studies',
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
    label: 'Samples',
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
    label: 'Analyses',
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
const PAGE_SIZE = 25; // TODO: move to table

const SearchTable: React.FC = () => {
  const { pathname } = useLocation();
  const { searchData } = useContext(SearchQueryContext);
  const { data, loading, error, isStale } = searchData?.[pathname] || {};
  // console.log({loading});

  const columns = useMemo(() => dataFor?.[pathname]?.columns, [pathname]);
  if (loading && (!isStale || !data)) return <Loading size="large" />;
  if (error || !data) return <FetchError error={error} />;
  const fomattedData = {
    data: data.entries as Record<string, unknown>[],
    links: {},
    meta: {
      pagination: {
        pages: Math.ceil((data.hitCount as number) / PAGE_SIZE),
        count: 25,
        page: 1,
      },
    },
  };

  return (
    <EMGTable
      cols={columns}
      data={fomattedData}
      title={() => (
        <>
          {dataFor?.[pathname]?.label || ''}{' '}
          <span className="mg-number">{data.hitCount}</span>
        </>
      )}
      initialPage={0}
      className="mg-search-result"
      loading={loading}
      isStale={isStale}
    />
  );
};

export default SearchTable;
