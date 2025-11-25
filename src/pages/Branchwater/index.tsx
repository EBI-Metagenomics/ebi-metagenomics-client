import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import Plot from 'react-plotly.js';
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
import Results from 'pages/Branchwater/Resutls.tsx';

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
        // eslint-disable-next-line no-restricted-globals
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
      <h2>Genome against INSDC metagenomes</h2>
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
            <strong>Branchwater</strong> then compares these signatures against
            over 1,161,119 metagenomes and also assocaites the relevant metadata
            to the results.
          </p>
          <p className="vf-text-body vf-text-body--3">
            Sequences shorter than 10kb will rarely produce results. Quality of
            the match to the uploaded genome is represented by the cANI score
            (calculated from containment). The relationship between cANI and
            taxonomic level of the match varies with the genome of interest. In
            general, matches are most robust to the genus taxonomic level and a
            cANI greater than 0.97 often represents a species-level match.
          </p>
          <p className="vf-text-body vf-text-body--3">
            Notes: processing time depends on file size and your device; keep
            this tab open until the search completes.
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
              <legend className="vf-form__legend">Choose an organism</legend>
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
        <Results
          isLoading={isLoading}
          searchResults={searchResults}
          isTableVisible={isTableVisible}
          setIsTableVisible={setIsTableVisible}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          processResults={processResults}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
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
      )}
    </section>
  );
};

export default Branchwater;
