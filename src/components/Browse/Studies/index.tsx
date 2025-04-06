/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import useStudiesList from 'hooks/data/useStudies';
import BiomeSelector from 'components/UI/BiomeSelector';

const BrowseStudies: React.FC = () => {
  const [page, setPage] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [biome] = useQueryParamState('biome', '');

  const [hasData, setHasData] = useState(false);

  const {
    data: studiesList,
    loading,
    url: downloadURL,
  } = useStudiesList({
    page,
    order,
    biome_lineage: biome,
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
    ],
    []
  );

  useEffect(() => {
    setHasData(!!studiesList);
  }, [studiesList]);

  if (!studiesList && loading) return <Loading />;
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
        <EMGTable
          cols={columns}
          data={studiesList}
          Title={`Studies (${studiesList.count})`}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          // showTextFilter
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseStudies;
