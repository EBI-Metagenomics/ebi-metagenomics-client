import React, { useEffect, useMemo, useState } from 'react';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useApiData from '@/hooks/data/useApiData';
import { getBiomeIcon } from '@/utils/biomes';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { GenomeCatalogueList } from '@/interfaces';
import BiomeSelector from 'components/UI/BiomeSelector';
import { some } from 'lodash-es';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import config from 'utils/config';
const { usePage, useBiome, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseGenomesByCatalogue: React.FC = () => {
  const [page] = usePage<number>();
  const [hasData, setHasData] = useState(false);
  const [biome] = useBiome<string>();
  const {
    data: apiData,
    loading,
    stale: isStale,
    download,
  } = useApiData<{ count: number; items: any[] }>({
    url: `${config.api_v2}/genomes/catalogues/`,
  });
  // Apply biome filtering client-side and adapt to PaginatedList shape expected by EMGTable
  const genomeCataloguesList: GenomeCatalogueList | null = useMemo(() => {
    if (!apiData) return null;
    const filteredItems = biome
      ? apiData.items.filter((item) =>
          item?.biome?.lineage?.startsWith?.(biome)
        )
      : apiData.items;
    return {
      count: filteredItems.length,
      items: filteredItems,
    } as GenomeCatalogueList;
  }, [apiData, biome]);

  const columns = React.useMemo(
    () => [
      {
        id: 'catalogue-biome-label',
        Header: 'Biome',
        accessor: (catalogue: any) => catalogue?.catalogue_biome_label,
        Cell: ({ cell }) => cell?.value,
        disableSortBy: true,
        className: 'mg-biome',
      },
      {
        id: 'biome',
        Header: '',
        accessor: (catalogue: any) => catalogue?.catalogue_biome_label,
        Cell: ({ cell }) => (
          <>
            <span
              className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
              style={{ float: 'initial' }}
            />
          </>
        ),
        disableSortBy: true,
        className: 'mg-biome',
      },

      {
        id: 'catalogue-type',
        Header: 'Type',
        accessor: (catalogue: any) => catalogue?.catalogue_type,
        Cell: ({ cell }) => cell.value[0].toUpperCase() + cell.value.slice(1),
        aggregate: (catTypes) => catTypes,
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
        Cell: ({ cell }) => (
          <>{cell.value ? new Date(cell.value).toLocaleDateString() : ''}</>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!genomeCataloguesList);
  }, [genomeCataloguesList]);

  const isBiomeCatalogued = (lineage) => {
    if (!apiData?.items) return true;
    return some(apiData.items, (catalogue: any) =>
      catalogue?.biome?.lineage?.startsWith?.(lineage)
    );
  };

  if (!genomeCataloguesList && loading) return <Loading />;
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
          data={genomeCataloguesList as GenomeCatalogueList}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          onDownloadRequested={download}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseGenomesByCatalogue);
