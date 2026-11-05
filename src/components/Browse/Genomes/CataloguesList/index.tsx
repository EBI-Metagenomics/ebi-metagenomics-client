import React, { useEffect, useMemo, useState } from 'react';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useApiData from '@/hooks/data/useApiData';
import {
  getBiomeCategory,
  getBiomeIcon,
  getGenomeBiomeGroup,
} from '@/utils/biomes';
import { Link } from 'react-router-dom';
import { ColumnDef as Column } from '@tanstack/react-table';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import InnerCard from 'components/UI/InnerCard';
import { GenomeCatalogue, GenomeCatalogueList } from '@/interfaces';
import { countBy, groupBy, map } from 'lodash-es';
import { SharedTextQueryParam } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import config from 'utils/config';
import { sortByOrder } from '@/utils/sorting';
import './style.css';
import {
  formatCatalogueType,
  formatDate,
  genomeBiomeGroupIcons,
} from 'utils/genomes';

const CatalogueBiomeBrowser: React.FC<{
  catalogues: GenomeCatalogue[];
  selectedBiomeGroup: string;
  onSelect: (biomeGroup: string) => void;
}> = ({ catalogues, selectedBiomeGroup, onSelect }) => (
  <div className="mg-catalogue-biome-browser">
    {map(
      groupBy(catalogues, (catalogue) =>
        getGenomeBiomeGroup(catalogue.biome?.lineage || '')
      ),
      (biomeGroupCatalogues, biomeGroup) => {
        const counts = countBy(biomeGroupCatalogues, 'catalogue_type');
        const prokaryotes = counts.prokaryotes || 0;
        const eukaryotes = counts.eukaryotes || 0;
        const isActive =
          !!selectedBiomeGroup && selectedBiomeGroup === biomeGroup;

        return (
          <InnerCard
            key={biomeGroup}
            isActive={isActive}
            title={biomeGroup || 'Unknown biome'}
            icon={
              <span
                className={`biome_icon icon_xs ${
                  genomeBiomeGroupIcons[biomeGroup] || 'default_b'
                }`}
              />
            }
            label={
              <>
                <strong>
                  {biomeGroupCatalogues.length} catalogue
                  {biomeGroupCatalogues.length === 1 ? '' : 's'}
                </strong>
                <br />
                <small>
                  {prokaryotes} prokaryotic · {eukaryotes} eukaryotic
                </small>
              </>
            }
            to={() => onSelect(isActive ? '' : biomeGroup)}
          />
        );
      }
    )}
  </div>
);

const { useBiome, useOrder, withQueryParamProvider } =
  createSharedQueryParamContextForTable('', {
    biome: SharedTextQueryParam(''),
  });

const BrowseGenomesByCatalogue: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [biome, setBiome] = useBiome<string>();
  const [order] = useOrder<string>();
  const {
    data: apiData,
    loading,
    stale: isStale,
    download,
  } = useApiData<{ count: number; items: GenomeCatalogue[] }>({
    url: `${config.api_v2}genomes/catalogues/`,
  });
  // Apply biome filtering client-side and adapt to PaginatedList shape expected by EMGTable
  const genomeCataloguesList: GenomeCatalogueList | null = useMemo(() => {
    if (!apiData) return null;
    const filteredItems = biome
      ? apiData.items.filter(
          (item) =>
            getGenomeBiomeGroup(item?.biome?.lineage || '') === biome ||
            item?.biome?.lineage?.startsWith?.(biome)
        )
      : apiData.items;
    const sortedItems = sortByOrder(filteredItems, order);
    return {
      count: sortedItems.length,
      items: sortedItems,
    } as GenomeCatalogueList;
  }, [apiData, biome, order]);

  const columns = React.useMemo<Column<GenomeCatalogue, any>[]>(
    () => [
      {
        header: 'Catalogue',
        accessorKey: 'catalogue_id',
        cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.getValue()}`}>
            {formatCatalogueType(cell.row.original?.name)}
          </Link>
        ),
        meta: { className: 'mg-catalogue-name' },
      },
      {
        id: 'catalogue-biome-label',
        header: 'Biome',
        accessorFn: (catalogue) => catalogue.catalogue_biome_label,
        enableSorting: false,
        meta: { className: 'mg-catalogue-biome' },
      },
      {
        id: 'catalogue-biome-category',
        header: 'Biome category',
        accessorFn: (catalogue) => catalogue.biome.lineage,
        cell: ({ cell }) => (
          <span className="mg-catalogue-biome__value">
            <span
              className={`biome_icon icon_xs ${getBiomeIcon(
                cell.row.original?.biome?.lineage || ''
              )}`}
            />
            {getBiomeCategory(cell.getValue())}
          </span>
        ),
        enableSorting: false,
        meta: { className: 'mg-catalogue-biome' },
      },
      {
        id: 'catalogue-type',
        header: 'Type',
        accessorFn: (catalogue) => catalogue.catalogue_type,
        cell: ({ cell }) => <>{formatCatalogueType(cell.getValue())}</>,
        aggregate: (catTypes) => catTypes,
        meta: { className: 'mg-catalogue-type' },
      },

      {
        header: 'Version',
        accessorKey: 'version',
        enableSorting: false,
        meta: { className: 'mg-catalogue-version' },
      },
      {
        header: 'Species reps',
        accessorKey: 'genome_count',
        meta: { className: 'mg-catalogue-species' },
      },
      {
        header: 'Genomes',
        accessorKey: 'unclustered_genome_count',
        meta: { className: 'mg-catalogue-genomes' },
      },
      {
        id: 'last_update',
        header: 'Updated',
        accessorKey: 'updated_at',
        cell: ({ cell }) => <>{formatDate(cell.getValue())}</>,
        meta: { className: 'mg-catalogue-updated' },
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!genomeCataloguesList);
  }, [genomeCataloguesList]);

  if (!genomeCataloguesList && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <h2 className="vf-heading vf-heading--3">Browse by biome</h2>
      <div className="mg-catalogue-biome-intro">
        <p className="vf-text-body vf-text-body--3">
          Select a group to see its biomes in the table below. Select a
          catalogue to browse or search its genomes.
        </p>
        <button
          type="button"
          className={`vf-button vf-button--link mg-button-as-link mg-catalogue-biome-reset${
            biome ? '' : ' mg-catalogue-biome-reset--hidden'
          }`}
          disabled={!biome}
          onClick={() => {
            setBiome('');
          }}
        >
          Show all biomes
        </button>
      </div>
      <CatalogueBiomeBrowser
        catalogues={apiData?.items || []}
        selectedBiomeGroup={biome}
        onSelect={(biomeGroup) => {
          setBiome(biomeGroup);
        }}
      />
      {hasData && (
        <>
          <EMGTable
            cols={columns}
            data={genomeCataloguesList as GenomeCatalogueList}
            initialPage={1}
            sortable
            loading={loading}
            isStale={isStale}
            onDownloadRequested={download}
            toolbarOutsideTable
            className="mg-catalogues-table"
            showPagination={false}
          />
        </>
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseGenomesByCatalogue);
