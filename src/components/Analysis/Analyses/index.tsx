import React from 'react';
import { Link } from 'react-router-dom';
import { unescape } from 'lodash-es';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList, MGnifyDatum } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { getBiomeIcon } from 'utils/biomes';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const initialPageSize = 10;
type AssociatedAnaysesProps = {
  rootEndpoint: string;
};

const AnalysesTable: React.FC<AssociatedAnaysesProps> = ({ rootEndpoint }) => {
  const accession = useURLAccession();
  const [analysesPage] = useQueryParamState('analyses-page', 1, Number);
  const [analysesPageSize] = useQueryParamState(
    'analyses-page_size',
    initialPageSize,
    Number
  );
  const [analysesOrder] = useQueryParamState('analyses-order', '');

  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `${rootEndpoint}/${accession}/analyses`,
    {
      include: 'sample',
      page: analysesPage,
      ordering: analysesOrder,
      page_size: analysesPageSize,
    }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  if (!(data.data as MGnifyDatum[]).length) return null;

  const samples = {};
  (data.included || [])
    ?.filter(({ type }) => type === 'samples')
    .forEach((sample) => {
      samples[sample.id as string] = {
        description: sample.attributes['sample-desc'],
        biome: (
          sample.relationships as Record<string, { data: { id: string } }>
        ).biome.data.id,
      };
    });
  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (analysis) =>
        samples?.[analysis?.relationships?.sample?.data?.id]?.biome || '',
      Cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
          style={{ float: 'initial' }}
        />
      ),
      className: 'mg-biome',
    },
    {
      id: 'sample',
      Header: 'Sample accession',
      accessor: (analysis) => analysis?.relationships?.sample?.data?.id,
      Cell: ({ cell }) => (
        <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'description_id',
      Header: 'Sample description',
      accessor: (analysis) =>
        samples?.[analysis?.relationships?.sample?.data?.id]?.description || '',
      Cell: ({ cell }) => unescape(cell.value),
    },
    {
      id: 'assembly_run_id',
      Header: ' Run / Assembly accession',
      accessor: (analysis) => ({
        assembly: analysis?.relationships?.assembly?.data?.id || '',
        run: analysis?.relationships?.run?.data?.id || '',
      }),
      Cell: ({ cell }) => (
        <>
          {cell.value.assembly && (
            <Link to={`/assemblies/${cell.value.assembly}`}>
              {cell.value.assembly}
            </Link>
          )}
          {cell.value.run && (
            <Link to={`/runs/${cell.value.run}`}>{cell.value.run}</Link>
          )}
        </>
      ),
    },
    {
      id: 'pipeline_id',
      Header: 'Pipeline version',
      accessor: (analysis) => analysis.attributes['pipeline-version'],
      Cell: ({ cell }) => (
        <Link to={`/pipelines/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'analysis_id',
      Header: 'Analysis accession',
      accessor: (analysis) => analysis.id,
      Cell: ({ cell }) => (
        <Link to={`/analyses/${cell.value}`}>{cell.value}</Link>
      ),
    },
  ];
  const showPagination = (data.meta?.pagination?.count || 1) > initialPageSize;
  return (
    <EMGTable
      cols={columns}
      data={data as MGnifyResponseList}
      Title="Analyses"
      initialPage={(analysesPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      namespace="analyses-"
      showPagination={showPagination}
      downloadURL={downloadURL}
    />
  );
};

export default AnalysesTable;
