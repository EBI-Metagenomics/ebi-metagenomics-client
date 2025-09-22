import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';

import useProtectedApiCall from 'hooks/useProtectedApiCall';
import { StudyList } from 'interfaces';

const {usePage, withQueryParamProvider} = createSharedQueryParamContextForTable()

const MyDataStudies: React.FC = () => {
  const [page] = usePage();

  const protectedAxios = useProtectedApiCall();
  const [myData, setMyData] = useState<StudyList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStale] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [downloadURL] = useState<string | null>(null);

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
          setError(apiError);
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
        Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
      },
    ],
    []
  );
  if (loading && (!isStale || !myData)) return <Loading size="large" />;
  if (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <FetchError error={error} />;
  }

  return (
    <section>
      <h4>My Studies</h4>
      <EMGTable
        cols={columns}
        data={myData}
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
