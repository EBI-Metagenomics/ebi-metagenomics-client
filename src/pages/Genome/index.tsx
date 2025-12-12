import React, { Suspense, lazy, useState, useMemo, useCallback } from 'react';
import axios from 'axios';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import Overview from 'components/Genomes/Overview';
import Downloads from 'components/Downloads';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import { cleanTaxLineage } from '@/utils/taxon';
import Breadcrumbs from 'components/Nav/Breadcrumbs';

import type { BranchwaterFilters } from 'components/Branchwater/common/useBranchwaterResults';
import Results from 'pages/Branchwater/Results';

// Lazy-loaded pages
const GenomeBrowser = lazy(() => import('components/Genomes/Browser'));
const COGAnalysis = lazy(() => import('components/Genomes/COGAnalysis'));
const KEGGClassAnalysis = lazy(
  () => import('components/Genomes/KEGGClassAnalysis')
);
const KEGGModulesAnalysis = lazy(
  () => import('components/Genomes/KEGGModulesAnalysis')
);

// Navigation tabs
const tabs = [
  { label: 'Overview', to: '#overview' },
  { label: 'Browse genome', to: '#genome-browser' },
  { label: 'COG analysis', to: '#cog-analysis' },
  { label: 'KEGG class analysis', to: '#kegg-class-analysis' },
  { label: 'KEGG module analysis', to: '#kegg-module-analysis' },
  { label: 'Presence in Metagenomes', to: '#metagenome-search' },
  { label: 'Downloads', to: '#downloads' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();

  // ---------------------------------------------------------------------------
  // 1) FETCH GENOME METADATA (MGnify API)
  // ---------------------------------------------------------------------------
  const { data, loading, error } = useMGnifyData(`genomes/${accession}`);

  // ---------------------------------------------------------------------------
  // 2) LOCAL TYPES
  // ---------------------------------------------------------------------------
  type BranchwaterResult = {
    acc: string;
    assay_type: string;
    bioproject: string;
    cANI: number | string;
    containment: number | string;
    geo_loc_name_country_calc: string;
    organism: string;
    lat_lon?: string;
    [key: string]: unknown;
  };

  // ---------------------------------------------------------------------------
  // 3) SEARCH STATE
  // ---------------------------------------------------------------------------
  const [searchResults, setSearchResults] = useState<BranchwaterResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ---------------------------------------------------------------------------
  // 4) FILTER STATE
  // ---------------------------------------------------------------------------
  const [filters, setFilters] = useState<BranchwaterFilters>({
    acc: '',
    assay_type: '',
    bioproject: '',
    collection_date_sam: '',
    containment: '',
    geo_loc_name_country_calc: '',
    organism: '',
  });

  const onFilterChange = useCallback(
    (field: keyof BranchwaterFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 5) SORT STATE
  // ---------------------------------------------------------------------------
  // Default sorting for Branchwater results: containment descending
  const [sortField, setSortField] = useState('containment');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const onSortChange = useCallback(
    (field: string) => {
      setCurrentPage(1);
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // ---------------------------------------------------------------------------
  // 6) PAGINATION
  // ---------------------------------------------------------------------------
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------------------------------------------------------------------
  // 7) TABLE VISIBILITY
  // ---------------------------------------------------------------------------
  const [isTableVisible, setIsTableVisible] = useState(false);

  // ---------------------------------------------------------------------------
  // 8) FILTERING
  // ---------------------------------------------------------------------------
  const filteredResults = useMemo(() => {
    return searchResults.filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const v = row[key] ?? '';
        return String(v).toLowerCase().includes(value.toLowerCase());
      })
    );
  }, [searchResults, filters]);

  // ---------------------------------------------------------------------------
  // 9) SORTING
  // ---------------------------------------------------------------------------
  const sortedResults = useMemo(() => {
    if (!sortField) return filteredResults;
    return [...filteredResults].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];

      const an = Number(av);
      const bn = Number(bv);

      if (!isNaN(an) && !isNaN(bn)) {
        return sortDirection === 'asc' ? an - bn : bn - an;
      }
      return sortDirection === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filteredResults, sortField, sortDirection]);

  // ---------------------------------------------------------------------------
  // 10) PAGINATED RESULTS (processResults API for <Results />)
  // ---------------------------------------------------------------------------
  const processResults = useCallback(() => {
    const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedResults = sortedResults.slice(start, start + itemsPerPage);
    return {
      filteredResults,
      sortedResults,
      paginatedResults,
      totalPages,
    };
  }, [sortedResults, filteredResults, currentPage]);

  // ---------------------------------------------------------------------------
  // 11) MAP + GEO PROCESSING
  // ---------------------------------------------------------------------------
  const [mapPinsLimit, setMapPinsLimit] = useState(1000);

  const mapSamples = useMemo(() => {
    return filteredResults
      .map((r) => {
        if (!r.lat_lon) return null;

        const match = String(r.lat_lon).match(
          /^(\d+(?:\.\d+)?)\s*([NS])[, ]+(\d+(?:\.\d+)?)\s*([EW])$/i
        );
        if (!match) return null;

        const [, latStr, ns, lonStr, ew] = match;
        const lat = Number(latStr) * (ns === 'S' ? -1 : 1);
        const lon = Number(lonStr) * (ew === 'W' ? -1 : 1);

        return {
          id: r.acc,
          attributes: {
            latitude: lat,
            longitude: lon,
            organism: r.organism || 'Unknown',
            assay_type: r.assay_type || 'Unknown',
            country: r.geo_loc_name_country_calc || 'Unknown',
          },
        };
      })
      .filter(Boolean) as any[];
  }, [filteredResults]);

  const displayedMapSamples = useMemo(
    () => mapSamples.slice(0, mapPinsLimit),
    [mapSamples, mapPinsLimit]
  );

  const countryCounts = useMemo(() => {
    return filteredResults.reduce((acc, r) => {
      const c = r.geo_loc_name_country_calc || 'Unknown';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredResults]);

  const totalCountryCount = useMemo(
    () => Object.values(countryCounts).reduce((a, b) => a + b, 0),
    [countryCounts]
  );

  const getCountryColor = useCallback((count: number, max: number) => {
    const ratio = count / max;
    if (ratio > 0.8) return '#BD0026';
    if (ratio > 0.6) return '#E31A1C';
    if (ratio > 0.4) return '#FC4E2A';
    if (ratio > 0.2) return '#FD8D3C';
    return '#FEB24C';
  }, []);

  // ---------------------------------------------------------------------------
  // 12) HISTOGRAM
  // ---------------------------------------------------------------------------
  const containmentHistogram = useMemo(() => {
    const bins = new Array(10).fill(0);
    filteredResults.forEach((r) => {
      const c = Number(r.containment);
      if (!isNaN(c)) {
        const i = Math.min(Math.floor(c * 10), 9);
        bins[i] += 1;
      }
    });
    return {
      binsDesc: bins.map((_, i) => `${i / 10}-${(i + 1) / 10}`),
      countsDesc: bins,
    };
  }, [filteredResults]);

  // ---------------------------------------------------------------------------
  // 13) SCATTER (cANI vs containment)
  // ---------------------------------------------------------------------------
  const scatterData = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const texts: string[] = [];
    const colors: string[] = [];

    filteredResults.forEach((r) => {
      const c = Number(r.containment);
      const a = Number(r.cANI);

      if (!isNaN(c) && !isNaN(a)) {
        xs.push(c);
        ys.push(a);
        texts.push(r.acc);
        colors.push(r.assay_type === 'WGS' ? '#ff6384' : '#36a2eb');
      }
    });

    return { xs, ys, texts, colors };
  }, [filteredResults]);

  // ---------------------------------------------------------------------------
  // 14) CSV EXPORT
  // ---------------------------------------------------------------------------
  const downloadCSV = useCallback(() => {
    const rows = sortedResults;
    const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

    const header = keys.join(',');
    const body = rows
      .map((r) =>
        keys.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([`${header}\n${body}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedResults]);

  // ---------------------------------------------------------------------------
  // 15) VISUALIZATION PLACEHOLDER
  // ---------------------------------------------------------------------------
  const visualizationData = useMemo(
    () => ({
      histogramData: [],
      barPlotData: [],
    }),
    []
  );

  // ---------------------------------------------------------------------------
  // 16) HANDLE SEARCH BUTTON
  // ---------------------------------------------------------------------------
  const handleMetagenomeSearch = useCallback(() => {
    if (!data) return;

    const { data: genomeData } = data as MGnifyResponseObj;
    const relatedCatalogue = genomeData.relationships.catalogue as {
      data: { id: string };
    };

    setIsSearching(true);

    axios
      .post<BranchwaterResult[]>(
        `http://branchwater-dev.mgnify.org/mags?accession=${accession}&catalogue=${relatedCatalogue.data.id}`
      )
      .then(({ data }) => {
        setSearchResults(data);
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  }, [data, accession]);

  // ---------------------------------------------------------------------------
  // 17) ONLY NOW DO WE HANDLE EARLY RETURNS (AFTER ALL HOOKS)
  // ---------------------------------------------------------------------------
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const { data: genomeData } = data as MGnifyResponseObj;
  const relatedCatalogue = genomeData.relationships.catalogue as {
    data: { id: string };
  };

  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Genomes', url: '/browse/genomes' },
    {
      label: relatedCatalogue.data.id,
      url: `/genome-catalogues/${relatedCatalogue.data.id}`,
    },
    { label: accession },
  ];

  // ---------------------------------------------------------------------------
  // 18) RENDER
  // ---------------------------------------------------------------------------
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Genome {accession}</h2>

      <p>
        <b>Type:</b> {genomeData.attributes.type}
      </p>
      <p>
        <b>Taxonomic lineage:</b>{' '}
        {cleanTaxLineage(
          genomeData.attributes['taxon-lineage'] as string,
          ' > '
        )}
      </p>

      <Tabs tabs={tabs} />

      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          {/* Overview */}
          <RouteForHash hash="#overview" isDefault>
            <Overview data={genomeData} />
          </RouteForHash>

          {/* Genome browser */}
          <RouteForHash hash="#genome-browser">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeBrowser />
            </Suspense>
          </RouteForHash>

          {/* COG analysis */}
          <RouteForHash hash="#cog-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <COGAnalysis />
            </Suspense>
          </RouteForHash>

          {/* KEGG class */}
          <RouteForHash hash="#kegg-class-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <KEGGClassAnalysis />
            </Suspense>
          </RouteForHash>

          {/* KEGG module */}
          <RouteForHash hash="#kegg-module-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <KEGGModulesAnalysis />
            </Suspense>
          </RouteForHash>

          {/* Metagenome search */}
          <RouteForHash hash="#metagenome-search">
            <div className="vf-stack vf-stack--400">
              <h3>Branchwater</h3>
              <p>Identify genome appearance across INSDC metagenomes</p>

              <button
                type="button"
                className="vf-button vf-button--primary"
                onClick={handleMetagenomeSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Click to Search'}
              </button>

              {isSearching && (
                <div className="vf-u-padding__top--400">
                  <Loading size="small" />
                  <p>Searching for similar metagenomes...</p>
                </div>
              )}

              {sortedResults.length > 0 && (
                <div className="vf-u-padding__top--600">
                  <Results
                    isLoading={isSearching}
                    searchResults={sortedResults}
                    isTableVisible={isTableVisible}
                    setIsTableVisible={setIsTableVisible}
                    filters={filters}
                    onFilterChange={onFilterChange}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={onSortChange}
                    processResults={processResults}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    countryCounts={countryCounts}
                    mapSamples={mapSamples}
                    displayedMapSamples={displayedMapSamples}
                    setMapPinsLimit={setMapPinsLimit}
                    totalCountryCount={totalCountryCount}
                    getCountryColor={getCountryColor}
                    downloadCSV={downloadCSV}
                    containmentHistogram={containmentHistogram}
                    visualizationData={visualizationData}
                    scatterData={scatterData}
                  />
                </div>
              )}
            </div>
          </RouteForHash>

          {/* Downloads */}
          <RouteForHash hash="#downloads">
            <Downloads endpoint="genomes" accession={accession || ''} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
