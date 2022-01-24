import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';
import { getSimpleTaxLineage } from 'utils/taxon';

const initialPageSize = 10;
const GenomesTable: React.FC = () => {
  const accession = useURLAccession();
  const [queryParameters] = useQueryParametersState(
    {
      'genomes-page': 1,
      'genomes-page_size': initialPageSize,
      'genomes-order': '',
    },
    {
      'genomes-page': Number,
      'genomes-page_size': Number,
    }
  );
  const { data, loading, error, isStale } = useMGnifyData(
    `genome-catalogues/${accession}/genomes`,
    {
      page: queryParameters['genomes-page'] as number,
      ordering: queryParameters['genomes-order'] as string,
      page_size: queryParameters['genomes-page_size'] as number,
    }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (genome) => genome.relationships.biome.data?.id,
      Cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
          style={{ float: 'initial' }}
        />
      ),
      disableSortBy: true,
      className: 'mg-biome',
    },
    {
      id: 'genome',
      Header: 'Accession',
      accessor: 'id',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Length',
      accessor: 'attributes.length',
    },
    {
      Header: 'Num. of genomes',
      accessor: 'attributes.num-genomes-total',
    },
    {
      Header: 'Completeness',
      accessor: 'attributes.completeness',
    },
    {
      Header: 'Contamination',
      accessor: 'attributes.contamination',
    },
    {
      Header: 'Type',
      accessor: 'attributes.type',
      disableSortBy: true,
    },
    {
      Header: 'Taxonomy',
      accessor: 'attributes.taxon-lineage',
      Cell: ({ cell }) => getSimpleTaxLineage(cell.value, true),
      disableSortBy: true,
    },
    {
      id: 'last_update',
      Header: 'Last Updated',
      accessor: 'attributes.last-update',
      Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
    },
  ];

  return (
    <EMGTable
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(queryParameters['genomes-page'] as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      namespace="genomes-"
      sortable
    />
  );
};

export default GenomesTable;
