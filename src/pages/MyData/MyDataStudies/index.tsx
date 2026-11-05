import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';

import useProtectedApiCall from 'hooks/useProtectedApiCall';
import { Study, StudyList } from 'interfaces/index';

const { usePage, withQueryParamProvider } =
  createSharedQueryParamContextForTable();

const MyDataStudies: React.FC = () => {
  const [page] = usePage();

  const protectedAxios = useProtectedApiCall();
  const [myData, setMyData] = useState<StudyList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStale] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [downloadURL] = useState<string>();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getMyData = async () => {
      try {
        const response = await protectedAxios.get<StudyList>(
          '/my-data/studies',
          {
            signal: controller.signal,
          }
        );
        if (isMounted) {
          setMyData(response.data);
          setLoading(false);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError as Error);
          setLoading(false);
        }
      }
    };

    getMyData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [protectedAxios]);

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        header: 'Biome',
        accessorFn: (study) => study.biome?.lineage,
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
          <Link to={`/studies/${cell.getValue()}`}>{cell.getValue()}</Link>
        ),
      },
      {
        header: 'Study name',
        accessorKey: 'title',
        enableSorting: false,
      },
      {
        header: 'Last updated',
        accessorKey: 'updated_at',
        cell: ({ cell }) => (
          <>{new Date(cell.getValue()).toLocaleDateString()}</>
        ),
      },
    ],
    []
  );
  if (loading && (!isStale || !myData)) return <Loading size="large" />;
  if (error) {
    // @ts-ignore
    return <FetchError error={error} />;
  }

  return (
    <section>
      <h4>My Studies</h4>
      <EMGTable<Study>
        cols={columns}
        data={myData ?? []}
        initialPage={(page as number) - 1}
        sortable
        loading={loading}
        isStale={isStale}
        downloadURL={downloadURL}
      />
    </section>
  );
};

export default withQueryParamProvider(MyDataStudies);
