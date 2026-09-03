import React, { useEffect, useMemo, useState } from 'react';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useApiData from '@/hooks/data/useApiData';
import { getBiomeIcon } from '@/utils/biomes';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { GenomeCatalogue, GenomeCatalogueList } from '@/interfaces';
import BiomeSelector from 'components/UI/BiomeSelector';
import { some } from 'lodash-es';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import config from 'utils/config';
import { sortByOrder } from '@/utils/sorting';
import './style.css';

const formatCatalogueType = (catalogueType: string) =>
  catalogueType ? catalogueType[0].toUpperCase() + catalogueType.slice(1) : '';

const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString() : '';

const CatalogueCards: React.FC<{ catalogues: GenomeCatalogue[] }> = ({
  catalogues,
}) => (
  <div className="mg-catalogue-cards">
    {catalogues.map((catalogue) => (
      <article className="mg-catalogue-card" key={catalogue.catalogue_id}>
        <div className="mg-catalogue-card__biome">
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(
              catalogue.biome?.lineage || ''
            )}`}
          />
          {catalogue.catalogue_biome_label}
        </div>
        <Link
          className="mg-catalogue-card__name"
          to={`/genome-catalogues/${catalogue.catalogue_id}`}
        >
          {catalogue.name}
        </Link>
        <span className="mg-catalogue-card__id">{catalogue.catalogue_id}</span>
        <dl className="mg-catalogue-card__stats">
          <div>
            <dt>Type</dt>
            <dd>{formatCatalogueType(catalogue.catalogue_type)}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{catalogue.version}</dd>
          </div>
          <div>
            <dt>Species</dt>
            <dd>{catalogue.genome_count}</dd>
          </div>
          <div>
            <dt>Genomes</dt>
            <dd>{catalogue.unclustered_genome_count ?? '-'}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDate(catalogue.updated_at)}</dd>
          </div>
        </dl>
      </article>
    ))}
  </div>
);

const { usePage, useBiome, useOrder, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseGenomesByCatalogue: React.FC = () => {
  const [page] = usePage<number>();
  const [hasData, setHasData] = useState(false);
  const [biome] = useBiome<string>();
  const [order] = useOrder<string>();
  const {
    data: apiData,
    loading,
    stale: isStale,
    download,
  } = useApiData<{ count: number; items: any[] }>({
    url: `${config.api_v2}genomes/catalogues/`,
  });
  // Apply biome filtering client-side and adapt to PaginatedList shape expected by EMGTable
  const genomeCataloguesList: GenomeCatalogueList | null = useMemo(() => {
    if (!apiData) return null;
    const filteredItems = biome
      ? apiData.items.filter((item) =>
          item?.biome?.lineage?.startsWith?.(biome)
        )
      : apiData.items;
    const sortedItems = sortByOrder(filteredItems, order);
    return {
      count: sortedItems.length,
      items: sortedItems,
    } as GenomeCatalogueList;
  }, [apiData, biome, order]);

  const columns = React.useMemo(
    () => [
      {
        id: 'catalogue-biome-label',
        Header: 'Biome',
        accessor: (catalogue: any) => catalogue?.catalogue_biome_label,
        Cell: ({ cell }) => (
          <span className="mg-catalogue-biome__value">
            <span
              className={`biome_icon icon_xs ${getBiomeIcon(
                cell.row.original?.biome?.lineage || ''
              )}`}
            />
            {cell.value || ''}
          </span>
        ),
        disableSortBy: true,
        className: 'mg-catalogue-biome',
      },

      {
        id: 'catalogue-type',
        Header: 'Type',
        accessor: (catalogue: any) => catalogue?.catalogue_type,
        Cell: ({ cell }) => formatCatalogueType(cell.value),
        aggregate: (catTypes) => catTypes,
        className: 'mg-catalogue-type',
      },
      {
        id: 'catalogue_id',
        Header: 'Catalogue ID',
        accessor: 'catalogue_id',
        Cell: ({ cell }) =>
          cell.value ? (
            <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
          ) : (
            ''
          ),
        className: 'mg-catalogue-id',
      },
      {
        Header: 'Catalogue',
        accessor: 'name',
        Cell: ({ cell }) => (
          <>
            <span>{cell.value}</span>
            <span className="mg-catalogue-name__metadata">
              {formatCatalogueType(cell.row.original?.catalogue_type)} · v
              {cell.row.original?.version}
            </span>
          </>
        ),
        className: 'mg-catalogue-name',
      },
      {
        Header: 'Version',
        accessor: 'version',
        disableSortBy: true,
        className: 'mg-catalogue-version',
      },
      {
        Header: 'Species',
        accessor: 'genome_count',
        className: 'mg-catalogue-species',
      },
      {
        Header: 'Genomes',
        accessor: 'unclustered_genome_count',
        className: 'mg-catalogue-genomes',
      },
      {
        id: 'last_update',
        Header: 'Updated',
        accessor: 'updated_at',
        Cell: ({ cell }) => <>{formatDate(cell.value)}</>,
        className: 'mg-catalogue-updated',
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
        <>
          <EMGTable
            cols={columns}
            data={genomeCataloguesList as GenomeCatalogueList}
            initialPage={(page as number) - 1}
            sortable
            loading={loading}
            isStale={isStale}
            onDownloadRequested={download}
            toolbarOutsideTable
            className="mg-catalogues-table"
          />
          <CatalogueCards catalogues={genomeCataloguesList.items} />
        </>
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseGenomesByCatalogue);
