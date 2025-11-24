import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import Plot from 'react-plotly.js';
import CobsSearch from 'components/Genomes/Cobs';
import SourmashSearch from 'components/Genomes/Sourmash';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import CANIFilter from 'components/Search/Filter/CANI';
import TextSearch from 'components/Search/Filter/Text';
import LocalMultipleOptionFilter from 'components/Branchwater/LocalMultipleOptionFilter';
import axios from 'axios';
import DetailedResultsTable from './DetailedResultsTable';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define interfaces for the component
interface SearchResult {
  acc?: string;
  assay_type?: string;
  bioproject?: string;
  biosample_link?: string;
  cANI?: number | string;
  collection_date_sam?: string;
  containment?: number | string;
  geo_loc_name_country_calc?: string;
  organism?: string;
  lat_lon?: [number, number];
  // Allow other dynamic properties that may appear in search results
  [key: string]:
    | string
    | number
    | boolean
    | [number, number]
    | null
    | undefined;
}

interface MapSample {
  id: string;
  attributes: {
    latitude: number;
    longitude: number;
    organism: string;
    assay_type: string;
    country: string;
  };
}

// Minimal Plotly trace shape to avoid relying on external types while being type-safe
type PlotTrace = Record<string, unknown>;

interface VisualizationData {
  barPlotData: PlotTrace[];
  histogramData: PlotTrace[];
  mapData: PlotTrace[];
  stringKeys: string[];
}

interface Filters {
  acc: string;
  assay_type: string;
  bioproject: string;
  // cANI: string;
  collection_date_sam: string;
  containment: string;
  geo_loc_name_country_calc: string;
  organism: string;
}

interface Signature {
  [key: string]: unknown;
}

const Branchwater = () => {
  const [showMgnifySourmash, setShowMgnifySourmash] = useState<boolean>(false);
  const [, setUploadedFile] = useState<File | null>(null);
  // const [targetDatabase, setTargetDatabase] = useState<string>('MAGs');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>(
    {}
  );

  const [,] = useQueryParamState('location_name', '');

  const [isTableVisible, setIsTableVisible] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(25);

  // Sorting state (legacy/local)
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Read ordering from EMGTable's sortable integration via query param
  const [detailedOrder] = useQueryParamState('branchwater-detailed-order', '');

  const [activeTab, setActiveTab] = useState('vf-tabs__section--1');
  const [selectedExample, setSelectedExample] = useState<
    'example-mag-1st' | 'example-mag-2nd' | 'example-mag-3rd'
  >('example-mag-1st');

  // Filtering state
  const [filters, setFilters] = useState<Filters>({
    acc: '',
    assay_type: '',
    bioproject: '',
    // cANI: '',
    collection_date_sam: '',
    containment: '',
    geo_loc_name_country_calc: '',
    organism: '',
  });

  const sourmash = useRef<HTMLMgnifySourmashComponentElement | null>(null);
  const [signature, setSignature] = useState<Signature | null>(null);

  // State for visualizations
  const [visualizationData, setVisualizationData] =
    useState<VisualizationData | null>(null);

  // State for map samples
  const [mapSamples, setMapSamples] = useState<MapSample[]>([]);

  // Global text query (from generic TextSearch component)
  const [textQuery] = useQueryParamState('query', '');

  // cANI range from query param (format: "min,max")
  const [caniRange] = useQueryParamState('cani', '');

  const parseLatLon = useCallback((raw: unknown): [number, number] | null => {
    if (raw == null) return null;
    if (Array.isArray(raw)) {
      const [lat, lon] = raw;
      const latNum = Number(lat);
      const lonNum = Number(lon);
      return Number.isFinite(latNum) && Number.isFinite(lonNum)
        ? [latNum, lonNum]
        : null;
    }
    let s = String(raw).trim();
    if (!s || s === 'NP') return null;
    // strip quotes then uppercase
    s = s
      .replace(/^"+|"+$/g, '')
      .trim()
      .toUpperCase();

    // invalid markers
    const bad = ['MISSING', 'NOT APPLICABLE', 'NA', 'N/A', 'NULL', 'NONE'];
    if (bad.includes(s)) return null;

    // Examples we want: "39.5886 N 20.1382 E", "12 N 32 W", "54.1883 N 7.9000 E"
    // Allow commas or spaces between the pairs.
    const re =
      /^\s*([0-9]+(?:\.[0-9]+)?)\s*([NS])[\s,]+([0-9]+(?:\.[0-9]+)?)\s*([EW])\s*$/i;
    const m = s.match(re);
    if (!m) return null;

    const lat = parseFloat(m[1]) * (m[2] === 'S' ? -1 : 1);
    const lon = parseFloat(m[3]) * (m[4] === 'W' ? -1 : 1);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

    return [lat, lon];
  }, []);

  // Helper function to convert search results to map samples with valid lat/lng

  const convertToMapSamples = useCallback(
    (data: SearchResult[]): MapSample[] => {
      if (!Array.isArray(data)) return [];

      return data
        .map((item) => {
          // Skip missing/placeholder accessions
          if (!item.acc || item.acc === 'NP') return null;

          const coords = parseLatLon(item.lat_lon);
          if (!coords) return null;

          const [lat, lng] = coords;

          // Clean up country label: hide NP/uncalculated
          const countryRaw = (item.geo_loc_name_country_calc || '').trim();
          const country =
            !countryRaw ||
            ['np', 'uncalculated'].includes(countryRaw.toLowerCase())
              ? 'Unspecified'
              : countryRaw;

          const organism = item.organism || 'Unknown organism';

          return {
            id: item.acc,
            attributes: {
              latitude: lat,
              longitude: lng,
              assay_type: item.assay_type,
              organism,
              country,
            },
          } as MapSample;
        })
        .filter(Boolean) as MapSample[];
    },
    [parseLatLon]
  );

  const getCountryCountsFromResults = useCallback((results: SearchResult[]) => {
    const countsByCountry: Record<string, number> = {};

    results.forEach((item) => {
      if (
        item.geo_loc_name_country_calc &&
        item.geo_loc_name_country_calc !== 'NP'
      ) {
        const country = item.geo_loc_name_country_calc;
        countsByCountry[country] = (countsByCountry[country] || 0) + 1;
      }
    });

    return countsByCountry;
  }, []);

  const countUniqueValuesAndOccurrences = useCallback(
    (valueList: string[]): { uniqueValues: string[]; countVal: number[] } => {
      // Single-pass frequency map to avoid O(n^2) behavior
      const counts = new Map<string, number>();
      valueList.forEach((item) => {
        const key = String(item ?? '');
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      const uniqueValues = Array.from(counts.keys());
      const countVal = uniqueValues.map((k) => counts.get(k) as number);
      return { uniqueValues, countVal };
    },
    []
  );

  const getCountryColor = useCallback((count: number, maxCount: number) => {
    if (count === 0) return '#FFEDA0';

    const intensity = count / maxCount;

    if (intensity > 0.8) return '#BD0026';
    if (intensity > 0.6) return '#E31A1C';
    if (intensity > 0.4) return '#FC4E2A';
    if (intensity > 0.2) return '#FD8D3C';
    return '#FEB24C';
  }, []);

  const createPlotData = useCallback(
    (stringKeys: string[], stringValues: string[][]): PlotTrace[] => {
      const plotData: PlotTrace[] = [];
      const plotColor = 'rgba(100, 200, 102, 1)';

      for (let i = 0; i < stringKeys.length; i++) {
        const visible = i === 0;
        const { uniqueValues, countVal } = countUniqueValuesAndOccurrences(
          stringValues[i]
        );
        plotData.push({
          x: uniqueValues,
          y: countVal,
          type: 'bar',
          width: 0.2,
          marker: {
            color: 'rgba(100, 200, 102, 0.7)',
            line: {
              color: plotColor,
              width: 1,
            },
          },
          name: stringKeys[i],
          visible,
        });
      }

      return plotData;
    },
    [countUniqueValuesAndOccurrences]
  );

  const prepareVisualizationData = useCallback(
    (data: SearchResult[]): VisualizationData | null => {
      if (!data || data.length === 0) return null;

      // Use the union of keys across all rows (not just the first row)
      const commonKeys = Array.from(new Set(data.flatMap(Object.keys)));

      // Build a columnar array (values[kIndex] -> array of values for that key)
      const values: Record<string | number, unknown>[][] = commonKeys.map((k) =>
        data.map((row) => row[k])
      );

      // ----- Categorical bar plots: only include true string-like cols, skip IDs/links/coords
      const stringKeys: string[] = [];
      const stringValues: string[][] = [];

      for (let i = 0; i < values.length; i++) {
        const key = commonKeys[i];
        if (['acc', 'biosample_link', 'lat_lon'].includes(key)) continue;

        const col = values[i];
        // Treat null/undefined as empty strings for the "every" check
        const isAllStrings = col.every((v) => v == null);
        if (isAllStrings) {
          stringKeys.push(key);
          stringValues.push(col.map((v) => (v == null ? '' : String(v))));
        }
      }

      const barPlotData = createPlotData(stringKeys, stringValues);

      // ----- Histograms (containment, cANI): coerce to numbers and filter NaN
      const numCol = (idx: number) =>
        idx === -1
          ? []
          : (values[idx]
              .map((v) => Number(v))
              .filter((n) => Number.isFinite(n)) as number[]);

      const containmentIndex = commonKeys.indexOf('containment');
      const cANIIndex = commonKeys.indexOf('cANI');

      const hist: Record<string, unknown>[] = [];

      if (containmentIndex !== -1) {
        const xs = numCol(containmentIndex);
        if (xs.length) {
          hist.push({
            x: xs,
            type: 'histogram',
            autobinx: false,
            xbins: { size: 0.1 },
            name: 'containment',
            visible: true,
            marker: {
              color: 'rgba(100, 200, 102, 0.7)',
              line: { color: 'rgba(100, 200, 102, 1)', width: 1 },
            },
          });
        }
      }

      if (cANIIndex !== -1) {
        const xs = numCol(cANIIndex);
        if (xs.length) {
          hist.push({
            x: xs,
            type: 'histogram',
            autobinx: false,
            xbins: { size: 0.02 },
            name: 'cANI',
            visible: hist.length === 0, // show if only one
            // visible: hist.length === 0 ? true : false, // show if only one
            marker: {
              color: 'rgba(100, 200, 102, 0.7)',
              line: { color: 'rgba(100, 200, 102, 1)', width: 1 },
            },
          });
        }
      }

      // ----- Map data: choropleth by country (skip NP/uncalculated)
      const countryIndex = commonKeys.indexOf('geo_loc_name_country_calc');
      let countryMap: Record<string, unknown> = {};

      if (countryIndex !== -1) {
        const cleanedCountries = values[countryIndex]
          .map((v) => (v == null ? '' : String(v).trim()))
          .filter((v) => {
            const lc = v.toLowerCase();
            return v && lc !== 'np' && lc !== 'uncalculated';
          });

        const uniqueCountryCounts =
          countUniqueValuesAndOccurrences(cleanedCountries);
        if (uniqueCountryCounts.uniqueValues.length > 0) {
          const countryData = uniqueCountryCounts.uniqueValues.map(
            (country, i) => ({
              country,
              count: uniqueCountryCounts.countVal[i],
            })
          );

          countryMap = {
            name: 'geo_loc_name_country_calc',
            type: 'choropleth',
            locationmode: 'country names',
            locations: countryData.map((d) => d.country),
            z: countryData.map((d) => d.count),
            text: countryData.map((d) => `${d.country}: ${d.count}`),
            autocolorscale: true,
            marker: { line: { color: 'rgb(255,255,255)', width: 2 } },
          };
        }
      }

      // ----- Map data: scattergeo from lat_lon using parseLatLon
      const latLonIndex = commonKeys.indexOf('lat_lon');
      let latLonMap: Record<string, unknown> = {};

      if (latLonIndex !== -1) {
        const latLonData = values[latLonIndex]
          .map((raw, i) => {
            const coords = parseLatLon(raw);
            const acc = data[i]?.acc;
            if (!coords || !acc || acc === 'NP') return null;
            return [coords[0], coords[1], acc] as [number, number, string];
          })
          .filter(Boolean) as [number, number, string][];

        if (latLonData.length > 0) {
          latLonMap = {
            name: 'lat_lon',
            type: 'scattergeo',
            mode: 'markers',
            marker: { color: 'rgba(100, 200, 102, 1)' },
            lat: latLonData.map((t) => t[0]),
            lon: latLonData.map((t) => t[1]),
            text: latLonData.map((t) => `acc: ${t[2]}`),
          };
        }
      }

      return {
        barPlotData,
        histogramData: hist,
        mapData: [countryMap, latLonMap].filter(
          (obj) => obj && Object.keys(obj).length > 0
        ),
        stringKeys,
      };
    },
    [createPlotData, parseLatLon, countUniqueValuesAndOccurrences]
  );

  // TODO: bring back request button
  // const handleRequestAnalysis = (entry: SearchResult) => {
  //   const submitUrl = `https://www.ebi.ac.uk/metagenomics/submit?accession=${entry.acc}&bioproject=${entry.bioproject}`;
  //   window.open(submitUrl, '_blank');
  // };

  const [locationFilter] = useQueryParamState('geo_loc_name_country_calc', '');
  const [organismFilter] = useQueryParamState('organism', '');
  const [assayTypeFilter] = useQueryParamState('assay_type', '');

  // Update getFilteredResults to include faceted filters
  const getFilteredResults = useCallback((): SearchResult[] => {
    if (!Array.isArray(searchResults)) {
      return [];
    }

    const globalQuery = (textQuery || '').toString().trim().toLowerCase();

    return searchResults.filter((item) => {
      // Apply global text query across common fields (if provided)
      if (globalQuery) {
        const haystack = [
          item.acc,
          item.assay_type,
          item.bioproject,
          item.collection_date_sam,
          item.geo_loc_name_country_calc,
          item.organism,
        ]
          .map((v) => (v == null ? '' : String(v).toLowerCase()))
          .join(' ');
        if (!haystack.includes(globalQuery)) return false;
      }

      // Apply text-based field-specific filters first
      const matchesTextFilters = Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        const itemValue = String(item[key] || '').toLowerCase();
        const filterValue = filters[key].toLowerCase();
        return itemValue.includes(filterValue);
      });
      if (!matchesTextFilters) return false;

      // Apply faceted filters from query params
      if (locationFilter) {
        const selectedLocations = locationFilter.split(',').filter(Boolean);
        if (
          selectedLocations.length > 0 &&
          !selectedLocations.includes(item.geo_loc_name_country_calc)
        ) {
          return false;
        }
      }

      if (organismFilter) {
        const selectedOrganisms = organismFilter.split(',').filter(Boolean);
        if (
          selectedOrganisms.length > 0 &&
          !selectedOrganisms.includes(item.organism)
        ) {
          return false;
        }
      }

      if (assayTypeFilter) {
        const selectedTypes = assayTypeFilter.split(',').filter(Boolean);
        if (
          selectedTypes.length > 0 &&
          !selectedTypes.includes(item.assay_type)
        ) {
          return false;
        }
      }

      // Apply cANI numeric range filter
      if (caniRange) {
        const [minStr, maxStr] = caniRange.split(',');
        const min = Number(minStr);
        const max = Number(maxStr);

        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          const val = item.cANI;
          const num = typeof val === 'number' ? val : Number(val);

          if (Number.isNaN(num)) return false;

          const EPSILON = 0.0001;
          if (num < min - EPSILON || num > max + EPSILON) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    searchResults,
    filters,
    caniRange,
    locationFilter,
    organismFilter,
    assayTypeFilter,
    textQuery,
  ]);

  // Apply sorting to filtered results
  const getSortedResults = useCallback(
    (filteredResults: SearchResult[]): SearchResult[] => {
      // Prefer ordering from EMGTable's sortable query param if present
      const orderStr = typeof detailedOrder === 'string' ? detailedOrder : '';
      const effectiveField = orderStr ? orderStr.replace(/^-/, '') : sortField;
      let effectiveDirection: 'asc' | 'desc' = sortDirection;
      if (orderStr) {
        effectiveDirection = orderStr.startsWith('-') ? 'desc' : 'asc';
      }

      if (!effectiveField) return filteredResults;

      return [...filteredResults].sort((a, b) => {
        const aValue = a[effectiveField] ?? '';
        const bValue = b[effectiveField] ?? '';

        // Handle numeric values

        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return effectiveDirection === 'asc'
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        // Handle string values (including dates treated as strings)
        const comparison = String(aValue).localeCompare(String(bValue));
        return effectiveDirection === 'asc' ? comparison : -comparison;
      });
    },
    [detailedOrder, sortDirection, sortField]
  );

  // Get paginated results (memoized to keep stable identity for hooks deps)
  const getPaginatedResults = useCallback(
    (sortedResults: SearchResult[]): SearchResult[] => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedResults.slice(startIndex, startIndex + itemsPerPage);
    },
    [currentPage, itemsPerPage]
  );

  // Calculate total pages (memoized to keep stable identity for hooks deps)
  const getTotalPages = useCallback(
    (filteredResults: SearchResult[]): number => {
      return Math.ceil(filteredResults.length / itemsPerPage);
    },
    [itemsPerPage]
  );

  // Memoized processed results to avoid recomputation on every render
  const processedResults = useMemo(() => {
    const filteredResults = getFilteredResults();
    const sortedResults = getSortedResults(filteredResults);
    const paginatedResults = getPaginatedResults(sortedResults);
    const totalPages = getTotalPages(filteredResults);
    return { filteredResults, sortedResults, paginatedResults, totalPages };
  }, [
    getFilteredResults,
    getPaginatedResults,
    getSortedResults,
    getTotalPages,
  ]);

  // Keep existing API for children expecting a function
  const processResults = useCallback(
    () => processedResults,
    [processedResults]
  );

  // Containment histogram bins/counts memoized
  const containmentHistogram = useMemo(() => {
    const binsAsc = Array.from(
      { length: 10 },
      (_, i) => `${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}`
    );
    const countsAsc = new Array(10).fill(0) as number[];
    searchResults.forEach((searchResult) => {
      if (typeof searchResult.containment === 'number') {
        const idx = Math.min(Math.floor(searchResult.containment * 10), 9);
        countsAsc[idx]++;
      }
    });
    return {
      binsDesc: [...binsAsc].reverse(),
      countsDesc: [...countsAsc].reverse(),
    };
  }, [searchResults]);

  // Scatter plot data: single pass + downsampling, memoized
  const scatterData = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const texts: string[] = [];
    const colors: string[] = [];
    searchResults.forEach((result) => {
      const hasNums =
        typeof result.containment === 'number' &&
        typeof result.cANI === 'number';
      if (hasNums) {
        xs.push(result.containment as number);
        ys.push(result.cANI as number);
        texts.push(
          `${result.acc}\nCountry: ${
            result.geo_loc_name_country_calc || 'Unknown'
          }\nOrganism: ${result.organism || 'Unknown'}`
        );
        colors.push(
          result.assay_type === 'WGS'
            ? 'rgba(255, 99, 132, 0.8)'
            : 'rgba(54, 162, 235, 0.8)'
        );
      }
    });
    const MAX_POINTS = 20000;
    if (xs.length <= MAX_POINTS) {
      return { xs, ys, texts, colors, sampled: false, total: xs.length };
    }
    // Downsample by deterministic stride to keep distribution without RNG
    const stride = Math.ceil(xs.length / MAX_POINTS);
    const sxs: number[] = [];
    const sys: number[] = [];
    const stexts: string[] = [];
    const scols: string[] = [];
    for (let i = 0; i < xs.length; i += stride) {
      sxs.push(xs[i]);
      sys.push(ys[i]);
      stexts.push(texts[i]);
      scols.push(colors[i]);
    }
    return {
      xs: sxs,
      ys: sys,
      texts: stexts,
      colors: scols,
      sampled: true,
      total: xs.length,
    };
  }, [searchResults]);

  // Country totals memoized for stats table
  const totalCountryCount = useMemo(
    () => Object.values(countryCounts).reduce((sum, c) => sum + c, 0),
    [countryCounts]
  );

  // Limit number of map pins rendered; allow progressive loading
  const [mapPinsLimit, setMapPinsLimit] = useState<number>(1000);
  const displayedMapSamples = useMemo(
    () => (Array.isArray(mapSamples) ? mapSamples.slice(0, mapPinsLimit) : []),
    [mapSamples, mapPinsLimit]
  );

  // Reset pin limit when new samples arrive
  useEffect(() => {
    setMapPinsLimit(1000);
  }, [searchResults]);

  const handleSearchClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    setShowMgnifySourmash(true);

    if (signature) {
      setIsLoading(true);
      axios
        .post(
          'http://branchwater-dev.mgnify.org/',
          // 'https://branchwater.jgi.doe.gov/',
          {
            // signatures: signature,
            signatures: JSON.stringify(signature[0]),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
            },
          }
        )
        .then((response) => {
          const resultsArray = Array.isArray(response.data)
            ? (response.data as SearchResult[])
            : [];
          setSearchResults(resultsArray);

          const vizData = prepareVisualizationData(resultsArray);
          setVisualizationData(vizData);
          const mapData = convertToMapSamples(resultsArray);
          setMapSamples(mapData);

          const counts = getCountryCountsFromResults(resultsArray);
          setCountryCounts(counts);

          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setVisualizationData(null);
          setMapSamples([]);
          setCountryCounts({});
        });
    }
  };

  // Updated useEffect for handling search results
  useEffect(() => {
    if (searchResults.length > 0) {
      const filteredResults = getFilteredResults();
      const vizData = prepareVisualizationData(filteredResults);
      setVisualizationData(vizData);

      // Convert filtered results to map samples
      const mapData = convertToMapSamples(filteredResults);
      setMapSamples(mapData);
    } else {
      setMapSamples([]);
    }
  }, [
    filters,
    getFilteredResults,
    prepareVisualizationData,
    searchResults,
    convertToMapSamples,
  ]);

  useEffect(() => {
    const handleSketched = (evt: CustomEvent): void => {
      evt.preventDefault();
      const sig = JSON.parse(evt.detail.signature);
      setSignature(sig);
    };

    document.addEventListener('sketched', handleSketched as EventListener);

    return () => {
      document.removeEventListener('sketched', handleSketched as EventListener);
    };
  }, [signature]);

  useEffect(() => {
    if (searchResults.length > 0) {
      const filteredResults = getFilteredResults();
      const vizData = prepareVisualizationData(filteredResults);
      setVisualizationData(vizData);

      // Convert filtered results to map samples
      const mapData = convertToMapSamples(filteredResults);
      setMapSamples(mapData);

      // Calculate country counts for heatmap
      const counts = getCountryCountsFromResults(filteredResults);
      setCountryCounts(counts);
    } else {
      // Clear data when no search results
      setMapSamples([]);
      setCountryCounts({});
    }
  }, [
    filters,
    getFilteredResults,
    prepareVisualizationData,
    searchResults,
    convertToMapSamples,
    getCountryCountsFromResults,
  ]);

  // Handle filter change
  const handleFilterChange = (field: keyof Filters, value: string): void => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sort change
  const handleSortChange = (field: string): void => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Process results for display
  // Replaced by memoized `processedResults` + `processResults` wrapper above

  // Export helpers: build CSV and trigger download using current processed results
  const downloadCSV = () => {
    const { sortedResults } = processResults();
    if (!sortedResults || sortedResults.length === 0) return;

    // Prefer a known set of columns first, then append any additional keys found
    const preferredOrder = [
      'acc',
      'assay_type',
      'bioproject',
      'biosample_link',
      'cANI',
      'collection_date_sam',
      'containment',
      'geo_loc_name_country_calc',
      'organism',
    ];

    const allKeys = new Set<string>();
    sortedResults.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));

    // Ensure lat_lon is exported as string
    const remaining = Array.from(allKeys).filter(
      (k) => !preferredOrder.includes(k)
    );
    const columns = [...preferredOrder, ...remaining];

    const escape = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      let s: string;
      if (Array.isArray(val)) {
        s = val.join(';');
      } else if (typeof val === 'object') {
        s = JSON.stringify(val);
      } else {
        s = String(val);
      }
      // Escape double quotes by doubling them and wrap in quotes if needed
      const needsQuotes = /[",\n]/.test(s);
      s = s.replace(/"/g, '""');
      return needsQuotes ? `"${s}"` : s;
    };

    const header = columns.map((c) => escape(c)).join(',');
    const rows = sortedResults.map((row) =>
      columns
        .map((col) => {
          const v = row[col];
          if (col === 'lat_lon' && Array.isArray(v)) return escape(v.join(','));
          return escape(v);
        })
        .join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    const ts = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}_${String(
      date.getHours()
    ).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
    a.href = url;
    a.download = `branchwater_results_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearClick = (): void => {
    setShowMgnifySourmash(false);
    setUploadedFile(null);
    setSearchResults([]);
    setSignature(null);
    setVisualizationData(null);
    setMapSamples([]);
    setFilters({
      acc: '',
      assay_type: '',
      bioproject: '',
      // cANI: '',
      collection_date_sam: '',
      containment: '',
      geo_loc_name_country_calc: '',
      organism: '',
    });
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
  };

  const handleExampleSubmit = () => {
    setShowMgnifySourmash(false);
    setUploadedFile(null);
    setSearchResults([]);
    setSignature(null);
    setVisualizationData(null);
    setMapSamples([]);
    setFilters({
      acc: '',
      assay_type: '',
      bioproject: '',
      // cANI: '',
      collection_date_sam: '',
      containment: '',
      geo_loc_name_country_calc: '',
      organism: '',
    });
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    setShowMgnifySourmash(true);
    setIsLoading(true);
    const examples = [
      {
        id: 'example-mag-1st',
        accession: 'MGYG000304400',
        catalogue: 'sheep-rumen-v1-0',
      },
      {
        id: 'example-mag-2nd',
        accession: 'MGYG000485384',
        catalogue: 'marine-v2-0',
      },
      {
        id: 'example-mag-3rd',
        accession: 'MGYG000001346',
        catalogue: 'human-gut-v2-0-2',
      },
    ];
    const selected = examples.find((example) => {
      return example.id === selectedExample;
    });
    axios
      .post(
        `http://branchwater-dev.mgnify.org/mags?accession=${selected.accession}&catalogue=${selected.catalogue}`
      )
      .then((response) => {
        const resultsArray = Array.isArray(response.data)
          ? (response.data as SearchResult[])
          : [];
        setSearchResults(resultsArray);

        const vizData = prepareVisualizationData(resultsArray);
        setVisualizationData(vizData);
        const mapData = convertToMapSamples(resultsArray);
        setMapSamples(mapData);

        const counts = getCountryCountsFromResults(resultsArray);
        setCountryCounts(counts);

        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setVisualizationData(null);
        setMapSamples([]);
        setCountryCounts({});
      });
  };

  return (
    <section className="vf-content mg-page-search">
      <div className="vf-tabs">
        <ul className="vf-tabs__list">
          <li className="vf-tabs__item">
            <a
              className={`vf-tabs__link ${
                activeTab === 'vf-tabs__section--1' ? 'is-active' : ''
              }`}
              href="#vf-tabs__section--1"
              onClick={(e) => handleTabClick(e, 'vf-tabs__section--1')}
            >
              Gene Search
            </a>
          </li>
          <li className="vf-tabs__item">
            <a
              className={`vf-tabs__link ${
                activeTab === 'vf-tabs__section--2' ? 'is-active' : ''
              }`}
              href="#vf-tabs__section--2"
              onClick={(e) => handleTabClick(e, 'vf-tabs__section--2')}
            >
              MAG Search
            </a>
          </li>
          <li className="vf-tabs__item">
            <a
              className={`vf-tabs__link ${
                activeTab === 'vf-tabs__section--3' ? 'is-active' : ''
              }`}
              href="#vf-tabs__section--3"
              onClick={(e) => handleTabClick(e, 'vf-tabs__section--3')}
            >
              Metagenome Search
            </a>
          </li>
        </ul>
      </div>

      <div className="vf-tabs-content">
        <section
          className="vf-tabs__section"
          id="vf-tabs__section--1"
          style={{
            display: activeTab === 'vf-tabs__section--1' ? 'block' : 'none',
          }}
        >
          <h2>Search by Gene</h2>
          <p>
            <CobsSearch />
          </p>
        </section>
        <section
          className="vf-tabs__section"
          id="vf-tabs__section--2"
          style={{
            display: activeTab === 'vf-tabs__section--2' ? 'block' : 'none',
          }}
        >
          <h2>Search by Mags</h2>
          <p>
            <SourmashSearch />
          </p>
        </section>
        <section
          className="vf-tabs__section"
          id="vf-tabs__section--3"
          style={{
            display: activeTab === 'vf-tabs__section--3' ? 'block' : 'none',
          }}
        >
          <h2>Search Metagenomes</h2>
          <div className="vf-u-margin__top--400">
            <details className="vf-details">
              <summary className="vf-details--summary">Instructions</summary>
              <p className="vf-text-body vf-text-body--3">
                Use the Browse button below to select a FastA file
              </p>
              <p className="vf-text-body vf-text-body--3">
                <strong>Sourmash</strong> runs in your browser to create compact
                signatures which are then sent to our servers.
              </p>
              <p className="vf-text-body vf-text-body--3">
                <strong>Branchwater</strong> then compares these signatures
                against over 1,161,119 metagenomes and also assocaites the
                relevant metadata to the results.
              </p>
              <p className="vf-text-body vf-text-body--3">
                Sequences shorter than 10kb will rarely produce results. Quality
                of the match to the uploaded genome is represented by the cANI
                score (calculated from containment). The relationship between
                cANI and taxonomic level of the match varies with the genome of
                interest. In general, matches are most robust to the genus
                taxonomic level and a cANI greater than 0.97 often represents a
                species-level match.
              </p>
              <p className="vf-text-body vf-text-body--3">
                Notes: processing time depends on file size and your device;
                keep this tab open until the search completes.
              </p>
            </details>
          </div>

          <div>
            <form className="vf-stack vf-stack--400">
              <div className="vf-form__item vf-stack">
                <mgnify-sourmash-component
                  id="sourmash"
                  ref={sourmash}
                  ksize={21}
                />

                {/* TODO:  Confirm if this is still necessary, seeing as there is already a MAG search tab */}

                {/* <fieldset className="vf-form__fieldset vf-stack vf-stack--400"> */}
                {/*  <legend className="vf-form__legend"> */}
                {/*    Select target database */}
                {/*  </legend> */}

                {/*  <div className="vf-form__item vf-form__item--radio"> */}
                {/*    <input */}
                {/*      type="radio" */}
                {/*      name="targetDatabase" */}
                {/*      value="MAGs" */}
                {/*      id="target-db-mags" */}
                {/*      className="vf-form__radio" */}
                {/*      checked={targetDatabase === 'MAGs'} */}
                {/*      onChange={() => setTargetDatabase('MAGs')} */}
                {/*    /> */}
                {/*    <label htmlFor="target-db-mags" className="vf-form__label"> */}
                {/*      MAGs */}
                {/*    </label> */}
                {/*  </div> */}

                {/*  <div className="vf-form__item vf-form__item--radio"> */}
                {/*    <input */}
                {/*      type="radio" */}
                {/*      name="targetDatabase" */}
                {/*      value="Metagenomes" */}
                {/*      id="target-db-metagenomes" */}
                {/*      className="vf-form__radio" */}
                {/*      checked={targetDatabase === 'Metagenomes'} */}
                {/*      onChange={() => setTargetDatabase('Metagenomes')} */}
                {/*    /> */}
                {/*    <label */}
                {/*      htmlFor="target-db-metagenomes" */}
                {/*      className="vf-form__label" */}
                {/*    > */}
                {/*      Metagenomes */}
                {/*    </label> */}
                {/*  </div> */}
                {/* </fieldset> */}

                <button
                  type="button"
                  className="vf-button vf-button--sm vf-button--primary mg-button vf-u-margin__top--400"
                  onClick={handleSearchClick}
                >
                  Search
                </button>
                <button
                  id="clear-button-mag"
                  type="button"
                  className="vf-button vf-button--sm vf-button--tertiary"
                  onClick={handleClearClick}
                >
                  Clear
                </button>
              </div>
            </form>

            <details className="vf-details">
              <summary className="vf-details--summary">Try an example</summary>
              <div className="vf-u-margin__top--200">
                <fieldset className="vf-form__fieldset">
                  <legend className="vf-form__legend">
                    Choose an organism
                  </legend>
                  <div className="vf-form__item vf-form__item--radio">
                    <input
                      className="vf-form__radio"
                      type="radio"
                      id="example-mag-1st"
                      name="exampleMag1st"
                      value="example-mag-1st"
                      checked={selectedExample === 'example-mag-1st'}
                      onChange={() => setSelectedExample('example-mag-1st')}
                    />
                    <label className="vf-form__label" htmlFor="example-mag-1st">
                      Sodaliphilus sp900320055 — Sheep Rumen &nbsp;
                      <a
                        className="vf-link"
                        href="https://www.ebi.ac.uk/metagenomics/genomes/MGYG000304400#overview"
                        target="_blank"
                        rel="noreferrer"
                      >
                        MGYG000304400
                      </a>
                    </label>
                  </div>
                  <div className="vf-form__item vf-form__item--radio">
                    <input
                      className="vf-form__radio"
                      type="radio"
                      id="example-mag-2nd"
                      name="exampleMag2nd"
                      value="example-mag-2nd"
                      checked={selectedExample === 'example-mag-2nd'}
                      onChange={() => setSelectedExample('example-mag-2nd')}
                    />
                    <label className="vf-form__label" htmlFor="example-mag-2nd">
                      Rhizobiaceae BOKV01— Marine &nbsp;
                      <a
                        className="vf-link"
                        href="https://www.ebi.ac.uk/metagenomics/genomes/MGYG000485384#overview"
                        target="_blank"
                        rel="noreferrer"
                      >
                        MGYG000485384
                      </a>
                    </label>
                  </div>
                  <div className="vf-form__item vf-form__item--radio">
                    <input
                      className="vf-form__radio"
                      type="radio"
                      id="example-mag-3rd"
                      name="exampleMag3rd"
                      value="metagenome"
                      checked={selectedExample === 'example-mag-3rd'}
                      onChange={() => setSelectedExample('example-mag-3rd')}
                    />
                    <label className="vf-form__label" htmlFor="example-mag-3rd">
                      Peptostreptococcaceae — Human Gut &nbsp;{' '}
                      <a
                        className="vf-link"
                        href="https://www.ebi.ac.uk/metagenomics/genomes/MGYG000001346#overview"
                        target="_blank"
                        rel="noreferrer"
                      >
                        MGYG000001346
                      </a>
                    </label>
                  </div>
                </fieldset>
                <button
                  type="button"
                  className="vf-button vf-button--sm vf-button--secondary"
                  onClick={handleExampleSubmit}
                >
                  Use selected example
                </button>
              </div>
            </details>
          </div>

          {showMgnifySourmash && (
            <>
              <svg
                className="vf-icon-sprite vf-icon-sprite--tables"
                style={{ display: 'none' }}
              >
                <defs>
                  <g id="vf-table-sortable--up">
                    <path
                      xmlns="http://www.w3.org/2000/svg"
                      d="M17.485,5.062,12.707.284a1.031,1.031,0,0,0-1.415,0L6.515,
                      5.062a1,1,0,0,0,.707,1.707H10.25a.25.25,0,0,1,
                      .25.25V22.492a1.5,1.5,0,1,0,3,0V7.019a.249.249,0,0,1,.25-.25h3.028a1,1,0,0,0,.707-1.707Z"
                    />
                  </g>
                  <g id="vf-table-sortable--down">
                    <path
                      xmlns="http://www.w3.org/2000/svg"
                      d="M17.7,17.838a1,1,0,0,0-.924-.617H13.75a.249.249,0,0,
                      1-.25-.25V1.5a1.5,1.5,0,0,0-3,0V16.971a.25.25,0,0,
                      1-.25.25H7.222a1,1,0,0,0-.707,1.707l4.777,4.778a1,1,0,0,0,1.415,0l4.778-4.778A1,1,0,0,0,17.7,17.838Z"
                    />
                  </g>
                  <g id="vf-table-sortable">
                    <path
                      xmlns="http://www.w3.org/2000/svg"
                      d="M9,19a1,1,0,0,0-.707,1.707l3,
                      3a1,1,0,0,0,1.414,0l3-3A1,1,0,0,0,15,19H13.5a.25.25,0,
                      0,1-.25-.25V5.249A.25.25,0,0,1,13.5,5H15a1,1,0,0,0,
                      .707-1.707l-3-3a1,1,0,0,0-1.414,0l-3,3A1,1,0,0,0,9,5h1.5a.25.25,0,0,1,.25.25v13.5a.25.25,0,0,1-.25.25Z"
                    />
                  </g>
                </defs>
              </svg>
              {isLoading && (
                <div className="vf-u-padding__top--800">
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '2px dashed #dee2e6',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '18px',
                        color: '#6c757d',
                        marginBottom: '10px',
                      }}
                    >
                      🔍 Searching metagenomes...
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#868e96',
                      }}
                    >
                      This may take a few moments
                    </div>
                  </div>
                </div>
              )}
              {!isLoading &&
                (searchResults.length > 0 ? (
                  <div className="vf-u-padding__top--600">
                    {/* Results Summary Header */}
                    <div
                      style={{
                        backgroundColor: '#e8f5e8',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #28a745',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', color: '#155724' }}>
                            🎯 Search Complete: {searchResults.length} matches
                            found
                          </h3>
                          <p style={{ margin: 0, color: '#155724' }}>
                            Found{' '}
                            {
                              searchResults.filter(
                                (r) => r.assay_type === 'WGS'
                              ).length
                            }{' '}
                            samples with assemblies •
                            {Object.keys(countryCounts).length} countries •
                            Average containment:{' '}
                            {searchResults.length > 0
                              ? (
                                  searchResults
                                    .filter(
                                      (r) => typeof r.containment === 'number'
                                    )
                                    .reduce(
                                      (sum, r) => sum + Number(r.containment),
                                      0
                                    ) /
                                  searchResults.filter(
                                    (r) => typeof r.containment === 'number'
                                  ).length
                                ).toFixed(3)
                              : '0.000'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            className="vf-button vf-button--primary vf-button--sm"
                            onClick={() => setIsTableVisible(!isTableVisible)}
                          >
                            {isTableVisible
                              ? '📊 Hide Details'
                              : '📋 View Details'}
                          </button>
                          <button
                            type="button"
                            className="vf-button vf-button--secondary vf-button--sm"
                            onClick={downloadCSV}
                            disabled={!processedResults.sortedResults.length}
                            title={
                              processedResults.sortedResults.length
                                ? 'Download current results as CSV'
                                : 'No results to download'
                            }
                          >
                            ⬇️ Download CSV
                          </button>
                        </div>
                      </div>
                    </div>

                    <TextSearch />

                    <section className="vf-grid mg-grid-search vf-u-padding__top--400">
                      <div className="vf-stack vf-stack--800">
                        <CANIFilter />

                        <LocalMultipleOptionFilter
                          facetName="geo_loc_name_country_calc"
                          header="Location"
                          data={searchResults}
                          includeTextFilter
                        />

                        <LocalMultipleOptionFilter
                          facetName="organism"
                          header="Organism"
                          data={searchResults}
                          includeTextFilter
                        />

                        <LocalMultipleOptionFilter
                          facetName="assay_type"
                          header="Assay Type"
                          data={searchResults}
                        />
                      </div>
                      <section>
                        <DetailedResultsTable
                          isOpen={isTableVisible}
                          onToggleOpen={() =>
                            setIsTableVisible(!isTableVisible)
                          }
                          filters={filters}
                          onFilterChange={handleFilterChange}
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSortChange={handleSortChange}
                          processResults={processResults}
                          currentPage={currentPage}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </section>
                    </section>
                  </div>
                ) : (
                  <div className="vf-u-padding__top--800">
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '60px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '2px dashed #dee2e6',
                      }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                        🔍
                      </div>
                      <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>
                        No search results found
                      </h3>
                      <p style={{ color: '#868e96', marginBottom: '20px' }}>
                        Try uploading a different file or adjusting your search
                        parameters
                      </p>
                      <button
                        type="button"
                        className="vf-button vf-button--primary"
                        onClick={() => window.location.reload()}
                      >
                        🔄 Start New Search
                      </button>
                    </div>
                  </div>
                ))}

              {visualizationData && (
                <div className="vf-u-padding__top--800">
                  <h2 className="vf-text vf-text-heading--2">
                    Results Dashboard
                  </h2>

                  {/* Quick Stats Summary */}
                  <div className="vf-u-padding__bottom--600">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#f8f9fa',
                          padding: '20px',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #dee2e6',
                        }}
                      >
                        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                          Total Matches
                        </h4>
                        <div
                          style={{
                            fontSize: '2em',
                            fontWeight: 'bold',
                            color: '#28a745',
                          }}
                        >
                          {searchResults.length}
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#f8f9fa',
                          padding: '20px',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #dee2e6',
                        }}
                      >
                        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                          Unique Countries
                        </h4>
                        <div
                          style={{
                            fontSize: '2em',
                            fontWeight: 'bold',
                            color: '#17a2b8',
                          }}
                        >
                          {Object.keys(countryCounts).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {mapSamples && mapSamples.length > 0 && (
                    <div className="vf-u-padding__top--400">
                      <h4 className="vf-text vf-text-heading--4">
                        Geographic Distribution
                      </h4>

                      {/* Country counts summary */}
                      {Object.keys(countryCounts).length > 0 && (
                        <div className="vf-u-padding__bottom--400">
                          <p className="vf-text vf-text--body">
                            <strong>Samples by Country:</strong>
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '10px',
                              marginBottom: '15px',
                              maxHeight: '100px',
                              overflowY: 'auto',
                            }}
                          >
                            {Object.entries(countryCounts)
                              .sort(([, a], [, b]) => b - a)
                              .map(([country, count]) => {
                                const maxCount = Math.max(
                                  ...Object.values(countryCounts)
                                );
                                const color = getCountryColor(count, maxCount);
                                return (
                                  <span
                                    key={country}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: color,
                                      color:
                                        count > maxCount * 0.6
                                          ? 'white'
                                          : 'black',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {country}: {count}
                                  </span>
                                );
                              })}
                          </div>

                          {/* Legend */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '12px',
                            }}
                          >
                            <span>Heat intensity:</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[
                                '#FFEDA0',
                                '#FEB24C',
                                '#FD8D3C',
                                '#FC4E2A',
                                '#E31A1C',
                                '#BD0026',
                              ].map((color) => (
                                <div
                                  key={color}
                                  style={{
                                    width: '20px',
                                    height: '12px',
                                    backgroundColor: color,
                                    border: '1px solid #ccc',
                                  }}
                                />
                              ))}
                            </div>
                            <span>Low → High</span>
                          </div>
                        </div>
                      )}

                      <div style={{ width: '100%', height: '500px' }}>
                        {/* Pin capping controls */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            Showing{' '}
                            {displayedMapSamples.length.toLocaleString()} of{' '}
                            {mapSamples.length.toLocaleString()} pins
                          </div>
                          {displayedMapSamples.length < mapSamples.length && (
                            <button
                              type="button"
                              className="vf-button vf-button--secondary vf-button--sm"
                              onClick={() =>
                                setMapPinsLimit((prev) =>
                                  Math.min(prev + 1000, mapSamples.length)
                                )
                              }
                            >
                              Load more pins (+1,000)
                            </button>
                          )}
                        </div>
                        <MapContainer
                          center={[20, 0]}
                          zoom={2}
                          style={{ width: '100%', height: '100%' }}
                          scrollWheelZoom
                        >
                          <TileLayer
                            attribution="Tiles &copy; Esri — Source: Esri, DeLorme,
                            NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri
                            Japan, METI, Esri China (Hong Kong),
                            Esri (Thailand), TomTom, 2012"
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                          />

                          {/* Individual sample markers (capped) */}
                          {displayedMapSamples.map((sample) => (
                            <Marker
                              key={sample.id}
                              position={[
                                sample.attributes.latitude,
                                sample.attributes.longitude,
                              ]}
                            >
                              <Popup>
                                <div>
                                  <strong>ID:</strong> {sample.id}
                                  <br />
                                  <strong>Country:</strong>{' '}
                                  {sample.attributes.country}
                                  <br />
                                  <strong>Coordinates:</strong>{' '}
                                  {sample.attributes.latitude},{' '}
                                  {sample.attributes.longitude}
                                  <br />
                                  <strong>Metagenome:</strong>{' '}
                                  {sample.attributes.organism}
                                  <br />
                                  <strong>Assay type:</strong>{' '}
                                  {sample.attributes.assay_type}
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>

                      {/* Additional country statistics */}
                      {Object.keys(countryCounts).length > 0 && (
                        <div className="vf-u-padding__top--400">
                          <details>
                            <summary
                              style={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Country Statistics (
                              {Object.keys(countryCounts).length} countries)
                            </summary>
                            <div style={{ marginTop: '10px' }}>
                              <table className="vf-table vf-table--compact">
                                <thead>
                                  <tr>
                                    <th>Country</th>
                                    <th>Sample Count</th>
                                    <th>Percentage</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(countryCounts)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([country, count]) => {
                                      const percentage = (
                                        (count / totalCountryCount) *
                                        100
                                      ).toFixed(1);
                                      return (
                                        <tr key={country}>
                                          <td>{country}</td>
                                          <td>{count}</td>
                                          <td>{percentage}%</td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enhanced Containment Distribution */}
                  <div className="vf-u-padding__top--400">
                    <h3 className="vf-text vf-text-heading--3">
                      Containment Score Distribution
                      <div
                        id="containmentBinsDiv"
                        style={{ width: '100%', height: '400px' }}
                      >
                        <Plot
                          data={[
                            {
                              x: containmentHistogram.binsDesc,
                              y: containmentHistogram.countsDesc,
                              type: 'bar',
                              marker: {
                                color: 'rgba(54, 162, 235, 0.7)',
                                line: {
                                  color: 'rgba(54, 162, 235, 1)',
                                  width: 1,
                                },
                              },
                              name: 'Containment Distribution',
                              hovertemplate:
                                '%{x}<br>count=%{y}<extra></extra>',
                            },
                          ]}
                          layout={{
                            title:
                              'Distribution of Containment Scores (0.1 bin ranges)',
                            xaxis: {
                              title: 'Containment Score Range (high → low)',
                              tickangle: -45,
                              // ensure Plotly keeps our descending order
                              categoryorder: 'array',
                              categoryarray: containmentHistogram.binsDesc,
                            },
                            yaxis: { title: 'Count' },
                            bargap: 0.1,
                          }}
                          config={{
                            scrollZoom: true,
                            displaylogo: false,
                            responsive: true,
                          }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </h3>
                  </div>

                  {/* Enhanced Biome/Organism Distribution */}
                  <div className="vf-u-padding__top--400">
                    <h3 className="vf-text vf-text-heading--3">
                      Sample Type Distribution
                      <small
                        style={{
                          fontWeight: 'normal',
                          color: '#6c757d',
                          marginLeft: '10px',
                        }}
                      >
                        (Showing biome/organism metadata)
                      </small>
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                      }}
                    >
                      {/* Assay Type Distribution */}
                      <div>
                        <h4>Assay Types</h4>
                        <Plot
                          data={[
                            {
                              x: (() => {
                                const assayCounts = {};
                                searchResults.forEach((r) => {
                                  const type = r.assay_type || 'Unknown';
                                  assayCounts[type] =
                                    (assayCounts[type] || 0) + 1;
                                });
                                return Object.keys(assayCounts);
                              })(),
                              y: (() => {
                                const assayCounts = {};
                                searchResults.forEach((r) => {
                                  const type = r.assay_type || 'Unknown';
                                  assayCounts[type] =
                                    (assayCounts[type] || 0) + 1;
                                });
                                return Object.values(assayCounts);
                              })(),
                              type: 'bar',
                              marker: { color: 'rgba(255, 99, 132, 0.7)' },
                            },
                          ]}
                          layout={{
                            height: 300,
                            xaxis: { title: 'Assay Type' },
                            yaxis: { title: 'Count' },
                            margin: { t: 30, b: 60, l: 60, r: 30 },
                          }}
                          config={{ displaylogo: false, responsive: true }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Organism Distribution */}
                  <div>
                    <h4>Top Organisms/Biomes</h4>
                    <Plot
                      data={[
                        {
                          x: (() => {
                            const orgCounts = {};
                            searchResults.forEach((r) => {
                              const org = r.organism || 'Unknown';
                              orgCounts[org] = (orgCounts[org] || 0) + 1;
                            });
                            return Object.entries(orgCounts)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 10)
                              .map(([org]) =>
                                org.length > 20
                                  ? `${org.substring(0, 17)}...`
                                  : org
                              );
                          })(),
                          y: (() => {
                            const orgCounts = {};
                            searchResults.forEach((r) => {
                              const org = r.organism || 'Unknown';
                              orgCounts[org] = (orgCounts[org] || 0) + 1;
                            });
                            return Object.entries(orgCounts)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 10)
                              .map(([, count]) => count);
                          })(),
                          type: 'bar',
                          marker: { color: 'rgba(75, 192, 192, 0.7)' },
                        },
                      ]}
                      layout={{
                        height: 300,
                        xaxis: {
                          title: 'Organism/Biome',
                          tickangle: -45,
                        },
                        yaxis: { title: 'Count' },
                        margin: { t: 30, b: 100, l: 60, r: 30 },
                      }}
                      config={{ displaylogo: false, responsive: true }}
                    />
                  </div>

                  {/* NEW: ANI vs Containment Scatter Plot */}
                  <div className="vf-u-padding__top--400">
                    <h3 className="vf-text vf-text-heading--3">
                      Quality Assessment: cANI vs Containment
                      <small
                        style={{
                          fontWeight: 'normal',
                          color: '#6c757d',
                          marginLeft: '10px',
                        }}
                      >
                        (Higher values indicate better matches)
                      </small>
                    </h3>
                    <div
                      id="scatterDiv"
                      style={{ width: '100%', height: '520px' }}
                    >
                      {scatterData.sampled && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#6c757d',
                            marginBottom: '6px',
                          }}
                        >
                          Showing a sampled subset of{' '}
                          {scatterData.xs.length.toLocaleString()} points out of{' '}
                          {scatterData.total.toLocaleString()} to keep the UI
                          responsive.
                        </div>
                      )}
                      <Plot
                        data={[
                          {
                            x: scatterData.xs,
                            y: scatterData.ys,
                            mode: 'markers',
                            type: 'scatter',
                            text: scatterData.texts.map((t) =>
                              t.replace(/\n/g, '<br>')
                            ),
                            hovertemplate:
                              '%{text}<br>Containment: %{x:.3f}<br>cANI: %{y:.3f}<extra></extra>',
                            marker: {
                              size: 8,
                              color: scatterData.colors,
                              line: { width: 1, color: 'white' },
                            },
                          },
                        ]}
                        layout={{
                          title: 'Match Quality: cANI vs Containment Score',
                          xaxis: { title: 'Containment Score', range: [0, 1] },
                          yaxis: {
                            title:
                              'cANI (calculated Average Nucleotide Identity)',
                            range: [0.8, 1],
                          },
                          annotations: [
                            {
                              x: 0.7,
                              y: 0.95,
                              text: 'Higher quality matches',
                              showarrow: true,
                              arrowhead: 2,
                              arrowsize: 1,
                              arrowwidth: 2,
                              arrowcolor: '#636363',
                              ax: -30,
                              ay: -30,
                            },
                          ],
                        }}
                        config={{
                          scrollZoom: true,
                          displaylogo: false,
                          responsive: true,
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  {/* MGnify Promotion Section */}
                  <div className="vf-u-padding__top--600">
                    <div
                      style={{
                        backgroundColor: '#e3f2fd',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #2196f3',
                      }}
                    >
                      <h3
                        className="vf-text vf-text-heading--3"
                        style={{ color: '#1976d2', marginTop: 0 }}
                      >
                        Explore Further with MGnify
                      </h3>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '20px',
                        }}
                      >
                        <div>
                          <h4 style={{ color: '#1976d2' }}>
                            Available Assemblies
                          </h4>
                          <p>
                            <strong>
                              {
                                searchResults.filter(
                                  (r) => r.assay_type === 'WGS'
                                ).length
                              }
                            </strong>{' '}
                            of your matches have assembled genomes available for
                            detailed analysis.
                          </p>
                          <button
                            type="button"
                            className="vf-button vf-button--primary vf-button--sm"
                            onClick={() =>
                              window.open(
                                'https://www.ebi.ac.uk/metagenomics/',
                                '_blank'
                              )
                            }
                          >
                            View in MGnify
                          </button>
                        </div>

                        <div>
                          <h4 style={{ color: '#1976d2' }}>Request Assembly</h4>
                          <p>
                            For samples without assemblies, you can request
                            assembly analysis through MGnify &apos s pipeline.
                          </p>
                          <button
                            type="button"
                            className="vf-button vf-button--secondary vf-button--sm"
                            onClick={() =>
                              window.open(
                                'https://www.ebi.ac.uk/metagenomics/submit',
                                '_blank'
                              )
                            }
                          >
                            Request Analysis
                          </button>
                        </div>

                        <div>
                          <h4 style={{ color: '#1976d2' }}>
                            Raw Read Analysis
                          </h4>
                          <p>
                            Access comprehensive taxonomic and functional
                            analysis results for all your matched samples.
                          </p>
                          <button
                            type="button"
                            className="vf-button vf-button--tertiary vf-button--sm"
                            onClick={() =>
                              window.open(
                                'https://www.ebi.ac.uk/metagenomics/browse',
                                '_blank'
                              )
                            }
                          >
                            Browse Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced original visualizations with improvements */}
                  <div className="vf-u-padding__top--400">
                    <h3 className="vf-text vf-text-heading--3">
                      Detailed Score Distributions
                    </h3>
                    <div
                      id="contDiv"
                      style={{ width: '100%', height: '400px' }}
                    >
                      <Plot
                        data={visualizationData.histogramData}
                        layout={{
                          bargap: 0.05,
                          bargroupgap: 0.2,
                          title: 'Match similarity scores (detailed view)',
                          xaxis: { title: 'Score' },
                          yaxis: { title: 'Frequency' },
                          updatemenus: [
                            {
                              x: 0.05,
                              y: 1.2,
                              xanchor: 'left',
                              yanchor: 'top',
                              buttons: [
                                {
                                  method: 'update',
                                  args: [{ visible: [true, false] }],
                                  label: 'containment',
                                },
                                {
                                  method: 'update',
                                  args: [{ visible: [false, true] }],
                                  label: 'cANI',
                                },
                              ],
                              direction: 'down',
                              showactive: true,
                            },
                          ],
                        }}
                        config={{
                          scrollZoom: true,
                          displaylogo: false,
                          responsive: true,
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visualization components */}
              {visualizationData && (
                <div className="vf-u-padding__top--800">
                  <h2 className="vf-text vf-text-heading--2">Visualizations</h2>

                  {/* Containment Histogram */}
                  <div className="vf-u-padding__top--400">
                    <h3 className="vf-text vf-text-heading--3">
                      Match Similarity Scores
                    </h3>
                    <div
                      id="contDiv"
                      style={{ width: '100%', height: '400px' }}
                    >
                      <Plot
                        data={visualizationData.histogramData}
                        layout={{
                          bargap: 0.05,
                          bargroupgap: 0.2,
                          title: 'Match similarity scores',
                          xaxis: { title: 'Score' },
                          yaxis: { title: 'Frequency' },
                          updatemenus: [
                            {
                              x: 0.05,
                              y: 1.2,
                              xanchor: 'left',
                              yanchor: 'top',
                              buttons: [
                                {
                                  method: 'update',
                                  args: [{ visible: [true, false] }],
                                  label: 'containment',
                                },
                                {
                                  method: 'update',
                                  args: [{ visible: [false, true] }],
                                  label: 'cANI',
                                },
                              ],
                              direction: 'down',
                              showactive: true,
                            },
                          ],
                        }}
                        config={{
                          scrollZoom: true,
                          displaylogo: false,
                          responsive: true,
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Categorical Bar Plots */}
                  {visualizationData.barPlotData &&
                    visualizationData.barPlotData.length > 0 && (
                      <div className="vf-u-padding__top--400">
                        <h3 className="vf-text vf-text-heading--3">
                          Categorical Metadata
                        </h3>
                        <div
                          id="barDiv"
                          style={{ width: '100%', height: '400px' }}
                        >
                          <Plot
                            data={visualizationData.barPlotData}
                            layout={{
                              bargap: 0.05,
                              bargroupgap: 0.2,
                              title: 'Summary counts of categorical metadata',
                              xaxis: { automargin: true, title: 'Category' },
                              yaxis: { automargin: true, title: 'Counts' },
                              updatemenus: [
                                {
                                  x: 0.05,
                                  y: 1.2,
                                  xanchor: 'left',
                                  yanchor: 'top',
                                  buttons: visualizationData.stringKeys.map(
                                    (key, i) => ({
                                      method: 'update',
                                      args: [
                                        {
                                          visible:
                                            visualizationData.stringKeys.map(
                                              (_, idx) => idx === i
                                            ),
                                        },
                                      ],
                                      label: key,
                                    })
                                  ),
                                  direction: 'down',
                                  showactive: true,
                                },
                              ],
                            }}
                            config={{
                              scrollZoom: true,
                              displaylogo: false,
                              responsive: true,
                            }}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </section>
  );
};

export default Branchwater;
