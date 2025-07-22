import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useURLAccession from 'hooks/useURLAccession';
import { getBiomeIcon } from 'utils/biomes';
import useSuperStudyDetail from 'hooks/data/useSuperStudyDetail';

const SuperStudyGenomeCataloguesTable: React.FC = () => {
  const slug = useURLAccession();
  const { data, loading, error } = useSuperStudyDetail(slug);

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (catalogue) => catalogue.biome.lineage,
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
        id: 'catalogue_id',
        Header: () => <span className="nowrap">Catalogue ID</span>,
        accessor: 'catalogue_id',
        Cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
        ),
        className: 'nowrap',
      },
      {
        Header: 'Catalogue name',
        accessor: 'name',
      },
      {
        Header: 'Catalogue version',
        accessor: 'version',
        disableSortBy: true,
      },
      {
        Header: 'Species count',
        accessor: 'genome_count',
      },
      {
        Header: 'Total genomes count',
        accessor: 'unclustered_genome_count',
      },
      {
        id: 'last_update',
        Header: 'Last Updated',
        accessor: 'updated_at',
        Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
      },
    ],
    []
  );

  if (loading) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  return (
    <details>
      <summary>
        <b>Related Genome Catalogues</b>
      </summary>
      <EMGTable
        cols={columns}
        data={data.genome_catalogues}
        showPagination={false}
        loading={loading}
        namespace="catalogues-"
        dataCy="superStudyCataloguesTable"
      />
    </details>
  );
};

export default SuperStudyGenomeCataloguesTable;
