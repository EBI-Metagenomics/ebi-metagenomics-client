import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import UserContext from 'pages/Login/UserContext';
import InfoBanner from 'components/UI/InfoBanner';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { getBiomeIcon } from 'utils/biomes';

const MyData: React.FC = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      page_size: 25,
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const { data, loading, isStale, error, downloadURL } = useMGnifyData(
    isAuthenticated ? 'mydata' : null,
    {
      page: queryParameters.page as number,
      ordering: queryParameters.order as string,
      page_size: queryParameters.page_size as number,
    }
  );
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
  if (!isAuthenticated) {
    return (
      <InfoBanner title="Error" type="error">
        <div>
          <b>You are not logged in.</b>
          <p>
            Click <Link to="/login">here to login</Link> and view your data.
          </p>
        </div>
      </InfoBanner>
    );
  }
  if (loading && (!isStale || !data)) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  return (
    <section>
      <h4>My Studies</h4>
      <EMGTable
        cols={columns}
        data={data as MGnifyResponseList}
        initialPage={(queryParameters.page as number) - 1}
        sortable
        loading={loading}
        isStale={isStale}
        downloadURL={downloadURL}
      />
    </section>
  );
};

export default MyData;
