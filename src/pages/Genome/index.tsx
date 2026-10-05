import React, {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import Overview from 'components/Genomes/Overview';
import Downloads from 'components/Downloads/v2index';
import useApiData from '@/hooks/data/useApiData';
import useURLAccession from '@/hooks/useURLAccession';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import UserContext from 'pages/Login/UserContext';
import { GenomeApiResponse, GenomeDetailWithAnnotations } from '@/interfaces';

import useBranchwaterResults, {
  type BranchwaterFilters,
} from 'components/Branchwater/common/useBranchwaterResults';
import useQueryParamState, {
  createSharedQueryParamContextForTable,
} from '@/hooks/queryParamState/useQueryParamState';
import Results from 'pages/Branchwater/Results';
import {
  type BranchwaterResult,
  downloadBranchwaterCSV,
  getCaniHistogram,
  getContainmentHistogram,
  getCountryColor,
  getScatterData,
} from 'utils/branchwater';
import { getPrefixedBranchwaterConfig } from 'components/Branchwater/common/queryParamConfig';

const { withQueryParamProvider } = createSharedQueryParamContextForTable(
  'genomeBranchwaterDetailed',
  getPrefixedBranchwaterConfig('genomeBranchwaterDetailed'),
  25,
  '-containment'
);

const GenomeBrowser = lazy(() => import('components/Genomes/ContigViewer'));
const GenomeGenericAnalysis = lazy(
  () => import('components/Genomes/Annotations')
);
const GenomeKeggAnalysis = lazy(
  () => import('components/Genomes/KeggAnalysis')
);
const GenomeAmrAnalysis = lazy(() => import('components/Genomes/AmrAnalysis'));
const GenomePathofactAnalysis = lazy(
  () => import('components/Genomes/PathofactAnalysis')
);

const tabs = [
  { label: 'Overview', to: '#overview' },
  { label: 'Browse genome', to: '#genome-browser' },
  { label: 'COG', to: '#cog-analysis' },
  { label: 'KEGG', to: '#kegg' },
  { label: 'AMR', to: '#amr' },
  { label: 'PathoFact', to: '#pathofact' },
  { label: 'Presence in metagenomes', to: '#metagenome-search' },
  { label: 'Downloads', to: '#downloads' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();
  const [searchParams] = useSearchParams();
  const catalogue = searchParams.get('catalogue');
  const catalogueQuery = catalogue
    ? `?${new URLSearchParams({ catalogue_id: catalogue }).toString()}`
    : '';
  const { config } = useContext(UserContext);

  const { data, loading, error } = useApiData<GenomeApiResponse>({
    url: accession
      ? `${config.api_v2}genomes/${accession}${catalogueQuery}`
      : null,
  });

  const genomeAnnotationsData = useApiData<GenomeDetailWithAnnotations>({
    url: accession
      ? `${config.api_v2}genomes/${accession}/annotations${catalogueQuery}`
      : null,
  });

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

  const [textQuery] = useQueryParamState<string>(
    'genomeBranchwaterDetailedQuery'
  );
  const [caniRange] = useQueryParamState<string>(
    'genomeBranchwaterDetailedCani'
  );
  const [containmentRange] = useQueryParamState<string>(
    'genomeBranchwaterDetailedContainment'
  );
  const [locationParam] = useQueryParamState<string>(
    'genomeBranchwaterDetailedGeoLocNameCountryCalc'
  );
  const [organismParam] = useQueryParamState<string>(
    'genomeBranchwaterDetailedOrganism'
  );
  const [assayTypeParam] = useQueryParamState<string>(
    'genomeBranchwaterDetailedAssayType'
  );

  const [, setPageQP] = useQueryParamState<number>(
    'genomeBranchwaterDetailedPage'
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

    let catalogueId = data.catalogue?.catalogue_id || data.catalogue_id;

    if (!catalogueId && (data as any).data) {
      const genomeData = (data as any).data;
      catalogueId = genomeData.relationships?.catalogue?.data?.id;
    }

    setIsSearching(true);

    axios
      .post<BranchwaterResult[]>(
        `${config.api_branchwater}/mags?accession=${accession}&catalogue=${catalogueId}`
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

  const catalogueId = data.catalogue?.catalogue_id || data.catalogue_id;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    {
      label: 'Genomes',
      url: '/browse/genomes',
    },
    {
      label: catalogueId,
      url: `/genome-catalogues/${catalogueId}`,
    },
    { label: accession ?? '' },
  ];

  if (!accession) return null;

  const amrDownload = data.downloads?.find(
    (download) =>
      download.file_type === 'tsv' &&
      [download.alias, download.short_description, download.url].some((value) =>
        value
          ?.replace(/[\s_-]/g, '')
          .toLowerCase()
          .includes('amrfinderplus')
      )
  );
  const pathofactDownload = data.downloads?.find(
    (download) =>
      download.file_type === 'tsv' &&
      [download.alias, download.short_description, download.url].some((value) =>
        value
          ?.replace(/[\s_-]/g, '')
          .toLowerCase()
          .includes('pathofact')
      )
  );
  const genomeTabs = tabs.filter(
    (tab) =>
      (tab.to !== '#amr' || amrDownload) &&
      (tab.to !== '#pathofact' || pathofactDownload)
  );

  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Genome {accession}</h2>
      <p>
        <b>Type:</b> {data.type}
      </p>
      {/*TODO: Put back when taxon lineage is  made available on endpoint*/}
      {/*<p>*/}
      {/*  <b>Taxonomic lineage:</b>{' '}*/}
      {/*  {cleanTaxLineage(*/}
      {/*    data.biome?.lineage || '',*/}
      {/*    ' > '*/}
      {/*  )}*/}
      {/*</p>*/}
      <Tabs tabs={genomeTabs} preservedQueryParameters={['catalogue']} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="#overview" isDefault>
            <Overview data={data} />
          </RouteForHash>
          <RouteForHash hash="#genome-browser">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeBrowser
                accession={accession}
                downloads={data.downloads ?? []}
              />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#cog-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeGenericAnalysis
                items={genomeAnnotationsData.data?.annotations.cog_categories}
                chartTitle="Top 10 COG categories"
                subtitleSuffix="Genome COG matches"
                tooltipEntityLabel="COG"
                tableType="cog"
                tableTitlePrefix="COG categories"
                labelAccessor={(d: any) => String(d.name)}
                dataCy="genome-cog-analysis"
              />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#kegg">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeKeggAnalysis
                annotations={genomeAnnotationsData.data?.annotations}
                downloads={data.downloads ?? []}
              />
            </Suspense>
          </RouteForHash>
          {amrDownload && (
            <RouteForHash hash="#amr">
              <Suspense fallback={<Loading size="large" />}>
                <GenomeAmrAnalysis download={amrDownload} />
              </Suspense>
            </RouteForHash>
          )}
          {pathofactDownload && (
            <RouteForHash hash="#pathofact">
              <Suspense fallback={<Loading size="large" />}>
                <GenomePathofactAnalysis download={pathofactDownload} />
              </Suspense>
            </RouteForHash>
          )}
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
                    onFilterChange={(field, value) =>
                      onFilterChange(field as keyof BranchwaterFilters, value)
                    }
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
            <Downloads downloads={data.downloads} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default withQueryParamProvider(GenomePage);
