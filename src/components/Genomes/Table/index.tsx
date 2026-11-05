import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ColumnDef as Column } from '@tanstack/react-table';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import Tooltip from 'components/UI/Tooltip';
import useApiData from '@/hooks/data/useApiData';
import { Genome, PaginatedList } from '@/interfaces';
import useURLAccession from '@/hooks/useURLAccession';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import UserContext from 'pages/Login/UserContext';
import { cleanTaxLineage, getSimpleTaxLineage } from 'utils/taxon';
import { getGenomeUrl } from '@/utils/genomes';

const {
  useGenomesPage,
  useGenomesPageSize,
  useGenomesOrder,
  useGenomesSearch,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable('genomes');

const GenomesTable: React.FC = () => {
  const { config } = useContext(UserContext);
  const accession = useURLAccession();
  const [genomesPage] = useGenomesPage();
  const [genomesPageSize] = useGenomesPageSize();
  const [genomesOrder] = useGenomesOrder();
  const [genomeSearch] = useGenomesSearch();
  const params = Object.fromEntries(
    Object.entries({
      page: genomesPage as number,
      order: genomesOrder as string,
      page_size: genomesPageSize as number,
      search: genomeSearch as string,
    }).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const query = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  const url = `${config.api_v2}genomes/catalogues/${accession}/genomes${
    query ? `?${query}` : ''
  }`;
  const { data, loading, error, stale } = useApiData<PaginatedList>({
    url,
  });

  const columns = React.useMemo<Column<Genome, any>[]>(
    () => [
      {
        id: 'accession',
        header: 'Accession',
        accessorKey: 'accession',
        cell: ({ cell }: { cell: { getValue: () => string } }) => (
          <Link to={getGenomeUrl(cell.getValue(), accession)}>
            {cell.getValue()}
          </Link>
        ),
      },
      {
        header: 'Taxonomy',
        accessorKey: 'taxon_lineage',
        cell: ({ cell }: { cell: { getValue: () => string } }) => (
          <>
            {getSimpleTaxLineage(cell.getValue(), true)}{' '}
            <Tooltip content={cleanTaxLineage(cell.getValue(), ' > ')}>
              <sup>
                <span className="icon icon-common icon-info" />
              </sup>
            </Tooltip>
          </>
        ),
        enableSorting: false,
      },
      {
        header: 'Cluster size',
        accessorKey: 'num_genomes_total',
      },
      {
        header: 'Type',
        accessorKey: 'type',
        enableSorting: false,
      },
      {
        header: 'Completeness',
        accessorKey: 'completeness',
        cell: ({ cell }: { cell: { getValue: () => number } }) => (
          <span>{cell.getValue().toFixed(2)}%</span>
        ),
      },
      {
        header: 'Contamination',
        accessorKey: 'contamination',
        cell: ({ cell }: { cell: { getValue: () => number } }) => (
          <span>{cell.getValue().toFixed(2)}%</span>
        ),
      },
      {
        header: 'Length (MB)',
        id: 'length',
        accessorFn: (genome) => (genome.length / 1000000).toFixed(2),
      },
      {
        header: 'N50',
        enableSorting: false,
        accessorKey: 'n_50',
        cell: ({ cell }: { cell: { getValue: () => number } }) => (
          <span>{cell.getValue().toLocaleString()}</span>
        ),
      },
      {
        header: 'GC%',
        accessorKey: 'gc_content',
        enableSorting: false,
        cell: ({ cell }: { cell: { getValue: () => number } }) => (
          <span>{cell.getValue().toFixed(2)}%</span>
        ),
      },
    ],
    [accession]
  );

  if (loading && !stale) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <EMGTable<Genome>
      Title="Species representatives"
      cols={columns}
      data={data as PaginatedList<Genome>}
      initialPage={(genomesPage as number) - 1}
      expectedPageSize={genomesPageSize as number}
      className="mg-anlyses-table"
      loading={loading}
      isStale={stale}
      namespace="genomes-"
      showTextFilter
      sortable
    />
  );
};

export default withQueryParamProvider(GenomesTable);
