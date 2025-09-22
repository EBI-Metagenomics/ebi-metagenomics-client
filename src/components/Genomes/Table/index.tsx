import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseList } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import { getBiomeIcon } from '@/utils/biomes';
import { cleanTaxLineage, getSimpleTaxLineage } from '@/utils/taxon';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import Tooltip from 'components/UI/Tooltip';

const initialPageSize = 10;
const {
  useGenomesPage,
  useGenomesPageSize,
  useGenomesOrder,
  useGenomesSearch,
  withQueryParamProvider
} = createSharedQueryParamContextForTable("genomes")

const GenomesTable: React.FC = () => {
  const accession = useURLAccession();
  const [genomesPage] = useGenomesPage();
  const [genomesPageSize] = useGenomesPageSize();
  const [genomesOrder] = useGenomesOrder();
  const [genomeSearch] = useGenomesSearch();
  const { data, loading, error, isStale } = useMGnifyData(
    `genome-catalogues/${accession}/genomes`,
    {
      page: genomesPage as number,
      ordering: genomesOrder as string,
      page_size: genomesPageSize as number,
      search: genomeSearch as string,
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
      Cell: ({ cell }) => (
        <>
          {getSimpleTaxLineage(cell.value, true)}{' '}
          <Tooltip content={cleanTaxLineage(cell.value, ' > ')}>
            <sup>
              <span className="icon icon-common icon-info" />
            </sup>
          </Tooltip>
        </>
      ),
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
      Title="Species-level cluster representatives"
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(genomesPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-anlyses-table"
      loading={loading}
      isStale={isStale}
      namespace="genomes-"
      showTextFilter
      sortable
    />
  );
};

export default withQueryParamProvider(GenomesTable);
