import React from 'react';
import { Link } from 'react-router-dom';
import { unescape } from 'lodash';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { getBiomeIcon } from 'utils/biomes';

const AnalysesTable: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error, isStale } = useMGnifyData(
    `studies/${accession}/analyses`,
    { include: 'sample' }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  const samples = {};
  data.included
    .filter(({ type }) => type === 'samples')
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
      id: 'assembly_id',
      Header: ' Run / Assembly accession',
      accessor: (analysis) => analysis?.relationships?.sample?.data?.id || '',
      Cell: ({ cell }) => (
        <Link to={`/assemblies/${cell.value}`}>{cell.value}</Link>
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

  return (
    <div className="mg-table-overlay-container">
      <div className={loading && isStale ? 'mg-table-overlay' : undefined} />
      <EMGTable
        cols={columns}
        data={data as MGnifyResponseList}
        title="Analyses"
        initialPage={1}
        className="mg-anlyses-table"
      />
    </div>
  );
};

export default AnalysesTable;
