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
    if (order) params.set('ordering', String(order));
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
      Header: 'Biome',
      accessor: (genome) => genome?.biome?.lineage,
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
      id: 'accession',
      Header: 'Accession',
      accessor: 'accession',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: 'catalogue_id',
      Cell: ({ cell }) => (
        <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
      ),
      disableSortBy: true,
    },
    {
      Header: 'Type',
      accessor: 'type',
      disableSortBy: true,
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
