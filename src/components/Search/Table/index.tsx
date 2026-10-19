import React, { useMemo, useContext, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import ExtLink from 'components/UI/ExtLink';
import Tooltip from 'components/UI/Tooltip';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import { ENA_VIEW_URL } from '@/utils/urls';
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
        header: 'MGnify ID',
        accessorFn: (study) => study.id,
        cell: ({ cell }) => (
          <Link to={`/studies/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        id: 'ena_id',
        header: 'ENA accession',
        accessorFn: (study) => study?.fields?.ENA_PROJECT?.[0] || '',
        cell: ({ cell }) => {
          return cell.getValue() === 'None' ? null : (
            <span>
              <ExtLink href={ENA_VIEW_URL + cell.getValue()}>
                {cell.getValue()}
              </ExtLink>
            </span>
          );
        },
      },
      {
        id: 'biome',
        header: 'Biome',
        accessorFn: (study) => study?.fields?.biome_name?.join(':'),
      },
      {
        id: 'name',
        header: 'Name',
        accessorFn: (study) => study?.fields?.name?.join(', '),
        meta: { className: 'break-anywhere' },
      },
      {
        id: 'description',
        header: 'Description',
        accessorFn: (study) => study?.fields?.description?.join('. '),
        meta: { className: 'break-anywhere', isFullWidth: true },
      },
      {
        id: 'analyses',
        header: 'Analyses',
        accessorFn: (study) => study?.fields?.METAGENOMICS_ANALYSES?.length,
        cell: ({ cell, row }) => (
          <Link to={`/search/analyses?query=${row.original.id}`}>
            {cell.getValue()}
          </Link>
        ),
      },
      {
        id: 'centre',
        header: 'Centre name',
        accessorFn: (study) => study?.fields?.centre_name?.[0],
      },
    ],
  },
  '/search/analyses': {
    label: 'Analyses',
    columns: [
      {
        id: 'analyses_id',
        header: 'Analysis',
        accessorFn: (analysis) => (analysis.id || '').split('_'),
        cell: ({ cell }) => (
          <Link
            to={`/analyses/${cell.getValue()[0]}?version=${cell.getValue()[1]}`}
          >
            {cell.getValue()[0]}
          </Link>
        ),
      },
      {
        id: 'pipeline',
        header: 'Pipeline version',
        accessorFn: (analysis) => analysis?.fields?.pipeline_version?.[0] || '',
        cell: ({ cell }) => (
          <span>
            <Link to={`/pipelines/${cell.getValue()}`}>{cell.getValue()}</Link>
          </span>
        ),
      },
      {
        id: 'sample_id',
        header: 'Sample',
        accessorFn: (analysis) => analysis?.fields?.['SRA-SAMPLE']?.[0],
        cell: ({ cell }) => (
          <Link to={`/samples/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        id: 'sample_name',
        header: 'Name',
        accessorFn: (study) => study?.fields?.sample_name?.[0],
        cell: ({ cell }) => <span>{cell.getValue()}</span>,
        meta: { className: 'break-anywhere' },
      },
      {
        id: 'mgnify_id',
        header: 'Study ID',
        accessorFn: (analysis) =>
          analysis?.fields?.METAGENOMICS_PROJECTS?.[0] || '',
        cell: ({ cell }) => (
          <Link to={`/studies/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        id: 'experiment',
        header: 'Experiment type',
        accessorFn: (analysis) => analysis?.fields?.experiment_type?.[0],
      },
      {
        id: 'assembly',
        header: 'Assembly',
        accessorFn: (analysis) => analysis?.fields?.ANALYSIS?.[0],
        cell: ({ cell }) => (
          <Link to={`/assemblies/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        id: 'ena_run',
        header: 'ENA run',
        accessorFn: (analysis) => analysis?.fields?.ENA_RUN?.[0],
        cell: ({ cell }) => (
          <Link to={`/runs/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        id: 'project_name',
        header: 'Study name',
        accessorFn: (analysis) => analysis?.fields?.project_name,
        cell: ({ cell }) =>
          cell.getValue() ? uniq(cell.getValue()).join(', ') : null,
        meta: { className: 'break-anywhere', isFullWidth: true },
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
  const [selectedColumns, setSelectedColumns] =
    useState<Record<string, any>>(initialColumnsState);

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
