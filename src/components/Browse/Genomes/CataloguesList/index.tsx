import React, { useEffect, useState } from 'react';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { getBiomeIcon } from '@/utils/biomes';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { MGnifyDatum, MGnifyResponseList } from '@/hooks/data/useData';
import BiomeSelector from 'components/UI/BiomeSelector';
import { some } from 'lodash-es';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';

const { usePage, usePageSize, useOrder, useBiome, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseGenomesByCatalogue: React.FC = () => {
  const [page] = usePage<number>();
  const [order] = useOrder<string>();
  const [pageSize] = usePageSize<number>();
  const [hasData, setHasData] = useState(false);
  const [biome] = useBiome<string>();
  const {
    data: genomesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('genome-catalogues', {
    page,
    ordering: order,
    page_size: pageSize,
    lineage: biome,
  });

  const { data: allCatalogues } = useMGnifyData('genome-catalogues', {
    page_size: 50,
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

  useEffect(() => {
    setHasData(!!genomesList);
  }, [genomesList]);

  const isBiomeCatalogued = (lineage) => {
    if (!allCatalogues.data) return true;
    return some(allCatalogues.data, (catalogue) => {
      return (catalogue as MGnifyDatum).relationships.biome.data.id.startsWith(
        lineage
      );
    });
  };

  if (!genomesList && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <p className="vf-text-body vf-text-body--3">
        Select a catalogue in the table to browse or search its genomes.
      </p>
      <BiomeSelector
        onSelect={async () => {
          await setHasData(false);
        }}
        lineageFilter={isBiomeCatalogued}
      />
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

export default withQueryParamProvider(BrowseGenomesByCatalogue);
