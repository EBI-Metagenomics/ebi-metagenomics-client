import React, { useEffect, useState } from 'react';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { getBiomeIcon } from 'utils/biomes';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { MGnifyResponseList } from 'hooks/data/useData';

const BrowseGenomesByCatalogue: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [hasData, setHasData] = useState(false);
  const {
    data: genomesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('genome-catalogues', {
    page,
    ordering: order,
    page_size: pageSize,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (catalogue) => catalogue.relationships.biome.data?.id,
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
        Header: 'Catalogue ID',
        accessor: 'id',
        Cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        Header: 'Catalogue name',
        accessor: 'attributes.name',
      },
      {
        Header: 'Catalogue version',
        accessor: 'attributes.version',
      },
      {
        Header: 'Species count',
        accessor: 'attributes.genome-count',
      },
      {
        Header: 'Total genomes count',
        accessor: 'attributes.unclustered-genome-count',
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

  useEffect(() => {
    setHasData(!!genomesList);
  }, [genomesList]);

  if (!genomesList && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <p className="vf-text-body vf-text-body--3">
        Select a catalogue in the table to browse or search its genomes.
      </p>
      {hasData && (
        <EMGTable
          cols={columns}
          data={genomesList as MGnifyResponseList}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseGenomesByCatalogue;
