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
        header: 'Biome',
        accessorFn: (catalogue) => catalogue.biome.lineage,
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
        id: 'catalogue_id',
        header: () => <span className="nowrap">Catalogue ID</span>,
        accessorKey: 'catalogue_id',
        cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.getValue()}`}>
            {cell.getValue()}
          </Link>
        ),
        meta: { className: 'nowrap' },
      },
      {
        header: 'Catalogue name',
        accessorKey: 'name',
      },
      {
        header: 'Catalogue version',
        accessorKey: 'version',
        enableSorting: false,
      },
      {
        header: 'Species count',
        accessorKey: 'genome_count',
      },
      {
        header: 'Total genomes count',
        accessorKey: 'unclustered_genome_count',
      },
      {
        id: 'last_update',
        header: 'Last Updated',
        accessorKey: 'updated_at',
        cell: ({ cell }) => (
          <>{new Date(cell.getValue()).toLocaleDateString()}</>
        ),
      },
    ],
    []
  );

  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

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
