import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

import useProtectedApiCall from 'hooks/useProtectedApiCall';
import { MGnifyResponseList } from 'hooks/data/useData';

const MyData: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);

  const protectedAxios = useProtectedApiCall();
  const [myData, setMyData] = useState<MGnifyResponseList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStale] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [downloadURL] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getMyData = async () => {
      try {
        const response = await protectedAxios.get('/mydata', {
          signal: controller.signal,
        });
        if (isMounted) {
          setMyData(response.data.data);
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
        accessor: (study) => study.relationships.biomes.data?.[0]?.id,
        Cell: ({ cell }) => (
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
            style={{ float: 'initial' }}
          />
        ),
        className: 'mg-biome',
        disableSortBy: true,
      },
      {
        id: 'study_id',
        Header: 'Accession',
        accessor: 'attributes.accession',
        Cell: ({ cell }) => (
          <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        Header: 'Study name',
        accessor: 'attributes.study-name',
      },
      {
        Header: 'Abstract',
        accessor: 'attributes.study-abstract',
      },
      {
        Header: 'Samples',
        accessor: 'attributes.samples-count',
      },
      {
        id: 'last_update',
        Header: 'Last Updated',
        accessor: 'attributes.last-update',
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
        data={myData as MGnifyResponseList}
        initialPage={(page as number) - 1}
        sortable
        loading={loading}
        isStale={isStale}
        downloadURL={downloadURL}
      />
    </section>
  );
};

export default MyData;
