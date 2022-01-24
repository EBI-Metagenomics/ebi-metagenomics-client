/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';

const BrowseBiomes: React.FC = () => {
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '-samples_count',
      page_size: 25,
      search: '',
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const {
    data: biomesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('biomes', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    page_size: queryParameters.page_size as number,
    search: (queryParameters.search as string) || undefined,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: '',
        accessor: 'id',
        Cell: ({ cell }) => (
          <span className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`} />
        ),
        disableSortBy: true,
        className: 'mg-biome',
      },
      {
        id: 'biome_name',
        Header: 'Biome name and lineage',
        accessor: (biome) => ({
          lineage: biome.attributes.lineage,
          name: biome.attributes['biome-name'],
        }),
        Cell: ({ cell }) => (
          <>
            <Link to={`/browse/studies?biome=${cell.value.lineage}`}>
              {cell.value.name}
            </Link>
            <br />
            {cell.value.lineage}
          </>
        ),
      },
      {
        Header: 'Samples excluding sub-lineages',
        id: 'samples_count',
        accessor: (biome) => ({
          lineage: biome.attributes.lineage,
          count: biome.attributes['samples-count'],
        }),
        Cell: ({ cell }) => (
          <Link to={`/browse/samples?biome=${cell.value.lineage}`}>
            {cell.value.count}
          </Link>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!biomesList);
  }, [biomesList]);
  if (!biomesList && loading) return <Loading />;

  return (
    <section className="mg-browse-section">
      {hasData && (
        <EMGTable
          cols={columns}
          data={biomesList as MGnifyResponseList}
          title={`Biomes (${biomesList.meta.pagination.count})`}
          initialPage={(queryParameters.page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          showTextFilter
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseBiomes;
