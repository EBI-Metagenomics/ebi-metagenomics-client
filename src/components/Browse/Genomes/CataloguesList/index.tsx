import React, { useEffect, useMemo, useState } from 'react';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import useApiData from '@/hooks/data/useApiData';
import { getBiomeIcon } from '@/utils/biomes';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { PaginatedList } from '@/interfaces';
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
  } = useApiData<{ count: number; items: any[] }>({
    url: `${config.api_v2}/genomes/catalogues/`,
  });

  // Apply biome filtering client-side and adapt to PaginatedList shape expected by EMGTable
  const genomesList: PaginatedList | null = useMemo(() => {
    if (!apiData) return null;
    const filteredItems = biome
      ? apiData.items.filter((item) =>
          item?.biome?.lineage?.startsWith?.(biome)
        )
      : apiData.items;
    return {
      count: filteredItems.length,
      items: filteredItems,
    } as PaginatedList;
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
    setHasData(!!genomesList);
  }, [genomesList]);

  const isBiomeCatalogued = (lineage) => {
    if (!apiData?.items) return true;
    return some(apiData.items, (catalogue: any) =>
      catalogue?.biome?.lineage?.startsWith?.(lineage)
    );
  };

  const handleDownloadCsv = () => {
    if (!genomesList?.items?.length) return;

    const headers = [
      'Biome',
      'Type',
      'Catalogue ID',
      'Catalogue name',
      'Catalogue version',
      'Species count',
      'Total genomes count',
      'Last Updated',
    ];

    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = (genomesList.items as any[]).map((item) => [
      item?.catalogue_biome_label ?? '',
      item?.catalogue_type
        ? String(item.catalogue_type).slice(0, 1).toUpperCase() +
          String(item.catalogue_type).slice(1)
        : '',
      item?.catalogue_id ?? '',
      item?.name ?? '',
      item?.version ?? '',
      item?.genome_count ?? '',
      item?.unclustered_genome_count ?? '',
      item?.updated_at ? new Date(item.updated_at).toISOString() : '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const ts = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `genome-catalogues-${ts}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          data={genomesList as PaginatedList}
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          onDownloadRequested={handleDownloadCsv}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(BrowseGenomesByCatalogue);
