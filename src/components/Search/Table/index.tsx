import React, { useMemo, useContext, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import ExtLink from 'components/UI/ExtLink';
import Tooltip from 'components/UI/Tooltip';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import { ENA_VIEW_URL } from 'utils/urls';
import { uniq } from 'lodash-es';
import ColumnSelector from './ColumnSelector';

const initialColumnsState = {
  '/search/studies': {
    study_id: true,
    ena_id: true,
    biome: true,
    name: true,
    description: false,
    analyses: true,
    centre: false,
  },
  '/search/analyses': {
    analyses_id: true,
    pipeline: true,
    sample_id: true,
    mgnify_id: true,
    experiment: true,
    sample_name: true,
    project_name: false,
    assembly: false,
    ena_run: false,
  },
};
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
        Cell: ({ cell }) => {
          return cell.value === 'None' ? null : (
            <span>
              <ExtLink href={ENA_VIEW_URL + cell.value}>{cell.value}</ExtLink>
            </span>
          );
        },
      },
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (study) => study?.fields?.biome_name?.join(':'),
      },
      {
        id: 'name',
        Header: 'Name',
        accessor: (study) => study?.fields?.name?.join(', '),
        className: 'break-anywhere',
      },
      {
        id: 'description',
        Header: 'Description',
        accessor: (study) => study?.fields?.description?.join('. '),
        className: 'break-anywhere',
        isFullWidth: true,
      },
      {
        id: 'analyses',
        Header: 'Analyses',
        accessor: (study) => study?.fields?.METAGENOMICS_ANALYSES?.length,
        Cell: ({ cell, row }) => (
          <Link to={`/search/analyses?query=${row.original.id}`}>
            {cell.value}
          </Link>
        ),
      },
      {
        id: 'centre',
        Header: 'Centre name',
        accessor: (study) => study?.fields?.centre_name?.[0],
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
        accessor: (analysis) => analysis?.fields?.['SRA-SAMPLE']?.[0],
        Cell: ({ cell }) => (
          <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'sample_name',
        Header: 'Name',
        accessor: (study) => study?.fields?.sample_name?.[0],
        Cell: ({ cell }) => <span>{cell.value}</span>,
        className: 'break-anywhere',
      },
      {
        id: 'mgnify_id',
        Header: 'Study ID',
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
      },
      {
        id: 'assembly',
        Header: 'Assembly',
        accessor: (analysis) => analysis?.fields?.ANALYSIS?.[0],
        Cell: ({ cell }) => (
          <Link to={`/assemblies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'ena_run',
        Header: 'ENA run',
        accessor: (analysis) => analysis?.fields?.ENA_RUN?.[0],
        Cell: ({ cell }) => (
          <Link to={`/runs/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        id: 'project_name',
        Header: 'Study name',
        accessor: (analysis) => analysis?.fields?.project_name,
        Cell: ({ cell }) => (cell.value ? uniq(cell.value).join(', ') : null),
        className: 'break-anywhere',
        isFullWidth: true,
      },
    ],
  },
};
const PAGE_SIZE = 25; // TODO: move to table
const DOWNLOAD_LIMIT = 100;

const SearchTable: React.FC = () => {
  const { pathname } = useLocation();
  const { searchData } = useContext(SearchQueryContext);
  const { data, loading, error, isStale, getDownloadURL } =
    searchData?.[pathname] || {};
  const [selectedColumns, setSelectedColumns] = useState(initialColumnsState);

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
      cols={columns.filter(({ id }) => selectedColumns?.[pathname]?.[id])}
      data={fomattedData}
      Title={
        <div>
          {dataFor?.[pathname]?.label || ''}{' '}
          <span className="mg-number">{data.hitCount}</span>
        </div>
      }
      ExtraBarComponent={
        <>
          <Tooltip content="Show/Hide Columns">
            <section>
              <ColumnSelector
                pathname={pathname}
                columns={dataFor}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
              />
            </section>
          </Tooltip>
          {data.hitCount > DOWNLOAD_LIMIT && (
            <Tooltip content="CSV download limited to 100 results.">
              <div
                className="vf-button vf-button--sm mg-button-disabled"
                style={{ whiteSpace: 'nowrap', marginBottom: '8px' }}
              >
                <span className="icon icon-common icon-download" /> Download
              </div>
            </Tooltip>
          )}
        </>
      }
      initialPage={0}
      className="mg-search-result"
      loading={loading}
      isStale={isStale}
      downloadURL={
        data.hitCount > DOWNLOAD_LIMIT ? null : getDownloadURL(data.hitCount)
      }
    />
  );
};

export default SearchTable;
