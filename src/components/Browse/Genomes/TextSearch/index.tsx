import React from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useApiData from 'hooks/data/useApiData';
import { GenomeList, PaginatedList } from '@/interfaces';
import Loading from 'components/UI/Loading';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';
import FetchError from 'components/UI/FetchError';
import config from 'utils/config';

const { usePage, usePageSize, useOrder, useSearch, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {}, 25);

const GenomesTextSearch: React.FC = () => {
  const [page] = usePage<number>();
  const [order] = useOrder<string>();
  const [pageSize] = usePageSize<number>();
  const [search] = useSearch<string>();
  const buildURL = () => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('page_size', String(pageSize));
    if (order) params.set('order', String(order));
    if (search) params.set('search', String(search));
    const qs = params.toString();
    return `${config.api_v2}genomes/${qs ? `?${qs}` : ''}`;
  };
  const {
    data: genomesList,
    loading,
    stale: isStale,
    error,
    download,
  } = useApiData<GenomeList>({
    url: buildURL(),
  });

  const columns = [
    {
      id: 'biome_id',
      header: 'Biome',
      accessorFn: (genome) => genome?.biome?.lineage,
      cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.getValue())}`}
          style={{ float: 'initial' }}
        />
      ),
      enableSorting: false,
      meta: { className: 'mg-biome' },
    },
    {
      id: 'accession',
      header: 'Accession',
      accessorKey: 'accession',
      cell: ({ cell }) => (
        <Link to={`/genomes/${cell.getValue()}`}>{cell.getValue()}</Link>
      ),
    },
    {
      id: 'catalogue',
      header: 'Catalogue',
      accessorKey: 'catalogue_id',
      cell: ({ cell }) => (
        <Link to={`/genome-catalogues/${cell.getValue()}`}>
          {cell.getValue()}
        </Link>
      ),
      enableSorting: false,
    },
    {
      header: 'Type',
      accessorKey: 'type',
      enableSorting: false,
    },
  ];

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !genomesList) return <FetchError error={error} />;

  return (
    <div>
      <p className="vf-text-body vf-text-body--3">
        Search for genomes across all catalogues.
      </p>
      <EMGTable
        cols={columns}
        data={genomesList as PaginatedList}
        Title={`Genomes (${genomesList.count})`}
        initialPage={(page as number) - 1}
        expectedPageSize={pageSize as number}
        sortable
        loading={loading}
        isStale={isStale}
        showTextFilter
        onDownloadRequested={download}
      />
    </div>
  );
};

export default withQueryParamProvider(GenomesTextSearch);
