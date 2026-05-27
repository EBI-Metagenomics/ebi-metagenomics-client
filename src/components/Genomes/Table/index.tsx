import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { Column } from 'react-table';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import Tooltip from 'components/UI/Tooltip';
import useApiData from '@/hooks/data/useApiData';
import { Genome, PaginatedList } from '@/interfaces';
import useURLAccession from '@/hooks/useURLAccession';
import { getBiomeIcon } from '@/utils/biomes';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import UserContext from 'pages/Login/UserContext';
import { cleanTaxLineage, getSimpleTaxLineage } from 'utils/taxon';

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

  const columns: Column<Genome>[] = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (genome: Genome) => genome.biome?.lineage || '',
        Cell: ({ cell }: { cell: { value: string } }) => (
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
            style={{ float: 'initial' }}
          />
        ),
        disableSortBy: true,
        className: 'mg-biome',
      } as Column<Genome>,
      {
        id: 'accession',
        Header: 'Accession',
        accessor: 'accession' as const,
        Cell: ({ cell }: { cell: { value: string } }) => (
          <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
        ),
      } as Column<Genome>,
      {
        Header: 'Length',
        accessor: 'length' as const,
      } as Column<Genome>,
      {
        Header: 'Num. of genomes',
        accessor: 'num_genomes_total' as const,
      } as Column<Genome>,
      {
        Header: 'Completeness',
        accessor: 'completeness' as const,
      } as Column<Genome>,
      {
        Header: 'Contamination',
        accessor: 'contamination' as const,
      } as Column<Genome>,
      {
        Header: 'Type',
        accessor: 'type' as const,
        disableSortBy: true,
      } as Column<Genome>,

      {
        Header: 'Taxonomy',
        accessor: 'taxon_lineage' as const,
        Cell: ({ cell }: { cell: { value: string } }) => (
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
      } as Column<Genome>,

      {
        id: 'last_update',
        Header: 'Last Updated',
        accessor: 'updated_at' as const,
        Cell: ({ cell }: { cell: { value: string } }) => (
          <>{new Date(cell.value).toLocaleDateString()}</>
        ),
        disableSortBy: true,
      } as Column<Genome>,
    ],
    []
  );

  if (loading && !stale) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <EMGTable<Genome>
      Title="Species-level cluster representatives"
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
