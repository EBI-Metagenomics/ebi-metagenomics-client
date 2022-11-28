import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { getBiomeIcon } from 'utils/biomes';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const initialPageSize = 10;
const SuperStudyGenomeCataloguesTable: React.FC = () => {
  const accession = useURLAccession();
  const [cataloguesPage] = useQueryParamState('catalogues-page', 1, Number);
  const [cataloguesPageSize] = useQueryParamState(
    'catalogues-page_size',
    initialPageSize,
    Number
  );
  const [cataloguesOrder] = useQueryParamState('catalogues-order', '');
  const { data, loading, error, isStale } = useMGnifyData(
    `super-studies/${accession}/related-genome-catalogues`,
    {
      page: cataloguesPage as number,
      ordering: cataloguesOrder as string,
      page_size: cataloguesPageSize as number,
    }
  );

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
        id: 'catalogue_id',
        Header: () => <span className="nowrap">Catalogue ID</span>,
        accessor: 'id',
        Cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
        ),
        className: 'nowrap',
      },
      {
        Header: 'Catalogue name',
        accessor: 'attributes.name',
      },
      {
        Header: 'Catalogue version',
        accessor: 'attributes.version',
        disableSortBy: true,
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

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  return (
    <details>
      <summary>
        <b>Related Genome Catalogues</b>
      </summary>
      <EMGTable
        cols={columns}
        data={data as MGnifyResponseList}
        initialPage={(cataloguesPage as number) - 1}
        initialPageSize={initialPageSize}
        // className="mg-anlyses-table"
        loading={loading}
        isStale={isStale}
        namespace="catalogues-"
        dataCy="superStudyCataloguesTable"
      />
    </details>
  );
};

export default SuperStudyGenomeCataloguesTable;
