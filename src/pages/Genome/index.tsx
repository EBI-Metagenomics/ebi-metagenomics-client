import React, {
  Suspense,
  lazy,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
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

import useBranchwaterResults, {
  type BranchwaterFilters,
} from 'components/Branchwater/common/useBranchwaterResults';
import useQueryParamState, {
  createSharedQueryParamContextForTable,
} from '@/hooks/queryParamState/useQueryParamState';
import Results from 'pages/Branchwater/Results';
import {
  getContainmentHistogram,
  getCaniHistogram,
  getScatterData,
  getTotalCountryCount,
  getCountryColor,
  downloadBranchwaterCSV,
  type BranchwaterResult,
} from 'utils/branchwater';
import {
  branchwaterQueryParamConfig,
  getPrefixedBranchwaterConfig,
} from 'components/Branchwater/common/queryParamConfig';

const { withQueryParamProvider } = createSharedQueryParamContextForTable(
  'genomeBranchwaterDetailed',
  getPrefixedBranchwaterConfig('genomeBranchwaterDetailed')
);

const GenomeBrowser = lazy(() => import('components/Genomes/Browser'));
const COGAnalysis = lazy(() => import('components/Genomes/COGAnalysis'));
const KEGGClassAnalysis = lazy(
  () => import('components/Genomes/KEGGClassAnalysis')
);
const KEGGModulesAnalysis = lazy(
  () => import('components/Genomes/KEGGModulesAnalysis')
);

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

  const { data, loading, error } = useMGnifyData(`genomes/${accession}`);

  const [searchResults, setSearchResults] = useState<BranchwaterResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [filters, setFilters] = useState<BranchwaterFilters>({
    acc: '',
    assay_type: '',
    bioproject: '',
    collection_date_sam: '',
    containment: '',
    geo_loc_name_country_calc: '',
    organism: '',
    query: '',
    cani: '',
  });

  const [textQuery] = useQueryParamState('genomeBranchwaterDetailedQuery', '');
  const [caniRange] = useQueryParamState('genomeBranchwaterDetailedCani', '');
  const [containmentRange] = useQueryParamState(
    'genomeBranchwaterDetailedContainment',
    ''
  );
  const [locationParam] = useQueryParamState(
    'genomeBranchwaterDetailedGeoLocNameCountryCalc',
    ''
  );
  const [organismParam] = useQueryParamState(
    'genomeBranchwaterDetailedOrganism',
    ''
  );
  const [assayTypeParam] = useQueryParamState(
    'genomeBranchwaterDetailedAssayType',
    ''
  );

  const [, setPageQP] = useQueryParamState(
    'genomeBranchwaterDetailedPage',
    1,
    Number
  );

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: textQuery,
      cani: caniRange,
      containment: containmentRange,
      geo_loc_name_country_calc: locationParam,
      organism: organismParam,
      assay_type: assayTypeParam,
    }));
  }, [
    textQuery,
    caniRange,
    containmentRange,
    locationParam,
    organismParam,
    assayTypeParam,
  ]);

  const onFilterChange = useCallback(
    (field: keyof BranchwaterFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const onSortChange = useCallback(() => {
    // handled by EMGTable through shared query params
  }, []);

  const itemsPerPage = 25;
  const [isTableVisible, setIsTableVisible] = useState(false);

  const {
    filteredResults,
    sortedResults,
    paginatedResults,
    total,
    page,
    order,
    visualizationData,
    mapSamples,
    countryCounts,
  } = useBranchwaterResults<BranchwaterResult>({
    items: searchResults,
    namespace: 'genomeBranchwaterDetailed',
    pageSize: itemsPerPage,
    filters,
  });

  const processResults = useCallback(
    () => ({
      filteredResults,
      sortedResults,
      paginatedResults,
      totalPages: Math.ceil(total / itemsPerPage),
    }),
    [filteredResults, sortedResults, paginatedResults, total, itemsPerPage]
  );

  const [mapPinsLimit, setMapPinsLimit] = useState(1000);

  useEffect(() => {
    setMapPinsLimit(1000);
  }, [searchResults]);

  const displayedMapSamples = useMemo(
    () => (Array.isArray(mapSamples) ? mapSamples.slice(0, mapPinsLimit) : []),
    [mapSamples, mapPinsLimit]
  );

  const totalCountryCount = useMemo(
    () => getTotalCountryCount(countryCounts),
    [countryCounts]
  );

  const containmentHistogram = useMemo(
    () => getContainmentHistogram(searchResults),
    [searchResults]
  );

  const caniHistogram = useMemo(
    () => getCaniHistogram(searchResults),
    [searchResults]
  );

  const scatterData = useMemo(
    () => getScatterData(searchResults),
    [searchResults]
  );

  const downloadCSV = useCallback(() => {
    downloadBranchwaterCSV(sortedResults);
  }, [sortedResults]);

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
      .then((response) => {
        setSearchResults(response.data);
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  }, [data, accession]);

  const onPageChange = (p: number) => {
    setPageQP(p);
  };
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
              <p>
                Identify potential genome occurence across INSDC metagenomes
              </p>

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

              {searchResults.length > 0 && (
                <div className="vf-u-padding__top--600">
                  <Results
                    isLoading={isSearching}
                    searchResults={searchResults}
                    isTableVisible={isTableVisible}
                    setIsTableVisible={setIsTableVisible}
                    filters={filters}
                    onFilterChange={onFilterChange}
                    sortField={order.replace(/^-/, '')}
                    sortDirection={order.startsWith('-') ? 'desc' : 'asc'}
                    onSortChange={onSortChange}
                    order={order}
                    processResults={processResults}
                    currentPage={page}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    countryCounts={countryCounts}
                    mapSamples={mapSamples}
                    displayedMapSamples={displayedMapSamples}
                    setMapPinsLimit={setMapPinsLimit}
                    totalCountryCount={totalCountryCount}
                    getCountryColor={getCountryColor}
                    downloadCSV={downloadCSV}
                    queryParamPrefix="genomeBranchwaterDetailed"
                    containmentHistogram={containmentHistogram}
                    caniHistogram={caniHistogram}
                    visualizationData={visualizationData}
                    scatterData={scatterData}
                  />
                </div>
              )}
            </div>
          </RouteForHash>

          <RouteForHash hash="#downloads">
            <Downloads endpoint="genomes" accession={accession || ''} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default withQueryParamProvider(GenomePage);
