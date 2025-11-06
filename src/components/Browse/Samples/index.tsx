import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from '@/utils/biomes';
import Loading from 'components/UI/Loading';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useSamplesList from 'hooks/data/useSamples';
import FetchError from 'components/UI/FetchError';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import BiomeSelector from 'components/UI/BiomeSelector';

const { usePage, useSearch, useOrder, useBiome, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseSamples: React.FC = () => {
  const [page, setPage] = usePage<number>();
  const [order] = useOrder<string>();
  const [biome] = useBiome<string>();
  const [search] = useSearch<string>();

  const [hasData, setHasData] = useState(false);
  const {
    data: samplesList,
    loading,
    download,
    error,
  } = useSamplesList({
    page,
    search,
    biome_lineage: biome,
    order,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (sample) => sample.biome?.lineage,
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
        Header: 'Accession',
        accessor: 'accession',
        Cell: ({ cell }) => (
          <Link to={`/samples/${cell.value}`}>{cell.value}</Link>
        ),
        disableSortBy: true,
      },
      {
        Header: 'Sample name',
        accessor: 'sample_title',
      },
      // {
      //   Header: 'Description',
      //   accessor: 'metadata?.description',
      //   disableSortBy: true,
      // },
      // TODO: consider enabling description again on API list
      {
        id: 'updated_at',
        Header: 'Last Updated',
        accessor: 'updated_at',
        Cell: ({ cell }) => <>{new Date(cell.value).toLocaleDateString()}</>,
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!samplesList);
  }, [samplesList]);
  if (!samplesList && loading) return <Loading />;

  if (!samplesList && loading) return <Loading />;
  if (error) return <FetchError error={error} />;

  return (
    <section className="mg-browse-section">
      <div>
        <BiomeSelector
          onSelect={async () => {
            await setHasData(false);
            setPage(1);
            await samplesList;
            setHasData(true);
          }}
        />
      </div>
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={samplesList ?? []}
          Title={`Samples (${samplesList?.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          showTextFilter
          onDownloadRequested={download}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseSamples);
