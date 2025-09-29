import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import useStudiesList from 'hooks/data/useStudies';
import BiomeSelector from 'components/UI/BiomeSelector';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import FetchError from 'components/UI/FetchError';
import { Study } from '@/interfaces';

const { usePage, useOrder, useBiome, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseStudies: React.FC = () => {
  const [page, setPage] = usePage<number>();
  const [order] = useOrder<string>();
  const [biome] = useBiome<string>();

  const [hasData, setHasData] = useState(false);

  const {
    data: studiesList,
    loading,
    download,
    error,
  } = useStudiesList({
    page,
    order,
    biome_lineage: biome,
    has_analyses_from_pipeline: 'V6',
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (study) => study.biome?.lineage,
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
          <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        Header: 'Study name',
        accessor: 'title',
        disableSortBy: true,
      },
      {
        Header: 'Last updated',
        accessor: 'updated_at',
        Cell: ({ cell }) => <>{new Date(cell.value).toLocaleDateString()}</>,
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!studiesList);
  }, [studiesList]);

  if (!studiesList && loading) return <Loading />;
  if (error) return <FetchError error={error} />;
  return (
    <section className="mg-browse-section">
      <div>
        <BiomeSelector
          onSelect={async () => {
            await setHasData(false);
            setPage(1);
            await studiesList;
            setHasData(true);
          }}
        />
      </div>
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable<Study>
          cols={columns}
          data={studiesList ?? []}
          Title={`Studies (${studiesList?.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          onDownloadRequested={download}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseStudies);
