import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useApiData from '@/hooks/data/useApiData';
import { PaginatedList } from '@/interfaces';
import useURLAccession from '@/hooks/useURLAccession';
import { getBiomeIcon } from '@/utils/biomes';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import UserContext from 'pages/Login/UserContext';

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
      ordering: genomesOrder as string,
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
  if (loading && !stale) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const columns = [
    {
      id: 'biome',
      Header: 'Biome',
      accessor: (genome: any) => genome.biome?.lineage,
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
      accessor: 'accession',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Length',
      accessor: 'length',
    },
    {
      Header: 'Num. contigs',
      accessor: 'num_contigs',
    },
    {
      Header: 'Completeness',
      accessor: 'completeness',
    },
    {
      Header: 'Contamination',
      accessor: 'contamination',
    },
    {
      Header: 'Type',
      accessor: 'type',
      disableSortBy: true,
    },
  ];

  return (
    <EMGTable
      Title="Species-level cluster representatives"
      cols={columns}
      data={data as PaginatedList}
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
