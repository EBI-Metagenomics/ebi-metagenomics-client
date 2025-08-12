import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import CobsSearch from 'components/Genomes/Cobs';
import SourmashSearch from 'components/Genomes/Sourmash';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
  [key: string]: any; // For other properties that might be in the search results
}

interface MapSample {
  id: string;
  attributes: {
    latitude: number;
    longitude: number;
    'sample-desc': string;
  };
  relationships: {
    biome: {
      data: {
        id: string;
      };
    };
  };
}

interface VisualizationData {
  barPlotData: any[];
  histogramData: any[];
  mapData: any[];
  stringKeys: string[];
}

interface Filters {
  acc: string;
  assay_type: string;
  bioproject: string;
  cANI: string;
  collection_date_sam: string;
  containment: string;
  geo_loc_name_country_calc: string;
  organism: string;
}

interface Signature {
  [key: string]: any;
}

const Branchwater = () => {
  const [showMgnifySourmash, setShowMgnifySourmash] = useState<boolean>(false);
  const [, setUploadedFile] = useState<File | null>(null);
  const [targetDatabase, setTargetDatabase] = useState<string>('MAGs');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>(
    {}
  );

  const [isTableVisible, setIsTableVisible] = useState<boolean>(false);

  // const [availableGeoData, setAvailableGeoData] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Sorting state
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [activeTab, setActiveTab] = useState('vf-tabs__section--1');

  // Filtering state
  const [filters, setFilters] = useState<Filters>({
    acc: '',
    assay_type: '',
    bioproject: '',
    cANI: '',
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

  // Mock data for testing the map
  const mockMapSamples: MapSample[] = [
    {
      id: 'sample_1',
      attributes: {
        latitude: 51.5074,
        longitude: -0.1278,
        'sample-desc': 'London Sample - Marine metagenome',
      },
      relationships: {
        biome: {
          data: {
            id: 'WGS',
          },
        },
      },
    },
    {
      id: 'sample_2',
      attributes: {
        latitude: 48.8566,
        longitude: 2.3522,
        'sample-desc': 'Paris Sample - Marine metagenome',
      },
      relationships: {
        biome: {
          data: {
            id: 'WGS',
          },
        },
      },
    },
    {
      id: 'sample_3',
      attributes: {
        latitude: 40.7128,
        longitude: -74.006,
        'sample-desc': 'New York Sample - Marine metagenome',
      },
      relationships: {
        biome: {
          data: {
            id: 'WGS',
          },
        },
      },
    },
  ];

  // Helper function to convert search results to map samples with valid lat/lng
  const convertToMapSamples = useCallback(
    (data: SearchResult[]): MapSample[] => {
      if (!data || !Array.isArray(data)) return [];

      return data
        .map((item, index) => {
          // Skip items without lat_lon data or with 'NP' values
          if (!item.lat_lon || item.lat_lon === 'NP') return null;

          try {
            let lat: number, lng: number;

            // Handle different lat_lon formats
            if (Array.isArray(item.lat_lon)) {
              // Format: [latitude, longitude]
              lat = parseFloat(item.lat_lon[0]);
              lng = parseFloat(item.lat_lon[1]);
            } else if (typeof item.lat_lon === 'string') {
              // Format: "40.7128N, 74.0060W" or similar
              const match = item.lat_lon.match(
                /([0-9.-]+)([NS]),?\s*([0-9.-]+)([EW])/
              );
              if (!match) return null;

              lat = parseFloat(match[1]) * (match[2] === 'S' ? -1 : 1);
              lng = parseFloat(match[3]) * (match[4] === 'W' ? -1 : 1);
            } else {
              return null;
            }

            // Validate coordinates
            if (
              isNaN(lat) ||
              isNaN(lng) ||
              lat < -90 ||
              lat > 90 ||
              lng < -180 ||
              lng > 180
            ) {
              return null;
            }

            // Return in MapSample format
            return {
              id: item.acc || `sample_${index}`,
              attributes: {
                latitude: lat,
                longitude: lng,
                'sample-desc': `${item.organism || 'Unknown organism'} - ${
                  item.geo_loc_name_country_calc || 'Unknown location'
                }`,
              },
              relationships: {
                biome: {
                  data: {
                    id: item.assay_type || 'unknown',
                  },
                },
              },
            };
          } catch (error) {
            console.error('Error parsing lat_lon:', item.lat_lon, error);
            return null;
          }
        })
        .filter(Boolean) as MapSample[]; // Remove null entries
    },
    []
  );

  const getCountryCountsFromResults = useCallback((results: SearchResult[]) => {
    const countryCounts: Record<string, number> = {};

    results.forEach((item) => {
      if (
        item.geo_loc_name_country_calc &&
        item.geo_loc_name_country_calc !== 'NP'
      ) {
        const country = item.geo_loc_name_country_calc;
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    return countryCounts;
  }, []);

  const getCountryColor = useCallback((count: number, maxCount: number) => {
    if (count === 0) return '#FFEDA0';

    const intensity = count / maxCount;

    if (intensity > 0.8) return '#BD0026';
    if (intensity > 0.6) return '#E31A1C';
    if (intensity > 0.4) return '#FC4E2A';
    if (intensity > 0.2) return '#FD8D3C';
    return '#FEB24C';
  }, []);

  const handleRequestAnalysis = (entry: SearchResult) => {
    // You can customize this URL based on your MGnify submission workflow
    const submitUrl = `https://www.ebi.ac.uk/metagenomics/submit?accession=${entry.acc}&bioproject=${entry.bioproject}`;
    window.open(submitUrl, '_blank');
  };

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
          {
            signatures: JSON.stringify(signature),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then((response) => {
          const resultsArray = Array.isArray(response.data)
            ? (response.data as SearchResult[])
            : [];
          setSearchResults(resultsArray);

          // Prepare visualization data
          const vizData = prepareVisualizationData(resultsArray);
          setVisualizationData(vizData);

          // Convert to map samples
          const mapData = convertToMapSamples(resultsArray);
          setMapSamples(mapData);

          // Calculate country counts for heatmap
          const counts = getCountryCountsFromResults(resultsArray);
          setCountryCounts(counts);

          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
          setIsLoading(false);
          setVisualizationData(null);
          setMapSamples([]);
          setCountryCounts({});
        });
    } else {
      console.log(
        'No signature available yet. Please upload and sketch a file first.'
      );
    }
  };

  const countUniqueValuesAndOccurrences = (
    valueList: any[]
  ): { uniqueValues: any[]; countVal: number[] } => {
    const counts: Record<string, number> = {};
    const uniqueValues = [...new Set(valueList)];

    for (let i = 0; i < uniqueValues.length; i++) {
      const val = uniqueValues[i];
      // Convert val to string to use as object key
      const key = String(val);
      counts[key] = valueList.filter((value) => value === val).length;
    }

    const countVal = uniqueValues.map((val) => counts[String(val)]);

    return {
      uniqueValues,
      countVal,
    };
  };

  const createPlotData = (
    stringKeys: string[],
    stringValues: any[][]
  ): any[] => {
    const plotData: any[] = [];
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
  };

  // Apply filters to search results
  const getFilteredResults = useCallback((): SearchResult[] => {
    // Ensure searchResults is an array before filtering
    if (!Array.isArray(searchResults)) {
      console.error('searchResults is not an array:', searchResults);
      return [];
    }

    return searchResults.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true; // Skip empty filters

        const itemValue = String(item[key] || '').toLowerCase();
        const filterValue = filters[key].toLowerCase();

        return itemValue.includes(filterValue);
      });
    });
  }, [searchResults, filters]);

  // Prepare data for visualizations
  const prepareVisualizationData = useCallback(
    (data: SearchResult[]): VisualizationData | null => {
      if (!data || data.length === 0) return null;

      const commonKeys = Object.keys(data[0]);
      const values: any[][] = Array.from(
        { length: commonKeys.length },
        () => []
      );

      commonKeys.forEach((key, j) => {
        values[j] = data.map((obj) => obj[key]);
      });

      // Filter string keys for bar plots
      const stringKeys: string[] = [];
      const stringValues: any[][] = [];

      for (let i = 0; i < values.length; i++) {
        if (
          values[i].every(
            (val) =>
              typeof val === 'string' &&
              commonKeys[i] !== 'acc' &&
              commonKeys[i] !== 'biosample_link'
          )
        ) {
          stringKeys.push(commonKeys[i]);
          stringValues.push(values[i]);
        }
      }

      // Create bar plot data
      const barPlotData = createPlotData(stringKeys, stringValues);

      // Create histogram data
      const containmentIndex = commonKeys.indexOf('containment');
      const cANIIndex = commonKeys.indexOf('cANI');

      const containmentHist: any = {
        x: values[containmentIndex],
        type: 'histogram',
        autobinx: false,
        xbins: { size: 0.1 },
        name: 'containment',
        visible: true,
        marker: {
          color: 'rgba(100, 200, 102, 0.7)',
          line: {
            color: 'rgba(100, 200, 102, 1)',
            width: 1,
          },
        },
      };

      const cANIHist: any = {
        x: values[cANIIndex],
        type: 'histogram',
        autobinx: false,
        xbins: { size: 0.02 },
        name: 'cANI',
        visible: false,
        marker: {
          color: 'rgba(100, 200, 102, 0.7)',
          line: {
            color: 'rgba(100, 200, 102, 1)',
            width: 1,
          },
        },
      };

      // Create map data
      let countryMap: Record<string, any> = {};
      let latLonMap: Record<string, any> = {};

      const countryIndex = commonKeys.indexOf('geo_loc_name_country_calc');
      const latLonIndex = commonKeys.indexOf('lat_lon');

      if (countryIndex !== -1) {
        const countryCounts = countUniqueValuesAndOccurrences(
          values[countryIndex]
        );
        const countryData = countryCounts.uniqueValues.map((country, index) => {
          return {
            country: country,
            count: countryCounts.countVal[index],
          };
        });

        countryMap = {
          name: 'geo_loc_name_country_calc',
          type: 'choropleth',
          locationmode: 'country names',
          locations: countryData.map((d) => d.country),
          z: countryData.map((d) => d.count),
          text: countryData.map((d) => `${d.country}: ${d.count}`),
          autocolorscale: true,
          marker: {
            line: {
              color: 'rgb(255,255,255)',
              width: 2,
            },
          },
        };
      }

      if (latLonIndex !== -1) {
        // Process lat_lon data
        const latLonData = values[latLonIndex]
          .map((item, index) => {
            if (item === 'NP') return null;

            // Try to parse lat_lon string
            try {
              const match = item.match(/([0-9.-]+)([NS]),\s*([0-9.-]+)([EW])/);
              if (match) {
                const lat = parseFloat(match[1]) * (match[2] === 'S' ? -1 : 1);
                const lon = parseFloat(match[3]) * (match[4] === 'W' ? -1 : 1);
                return [lat, lon, data[index].acc];
              }
              return null;
            } catch (e) {
              return null;
            }
          })
          .filter((item) => item !== null) as [number, number, string][];

        if (latLonData.length > 0) {
          latLonMap = {
            name: 'lat_lon',
            type: 'scattergeo',
            mode: 'markers',
            marker: {
              color: 'rgba(100, 200, 102, 1)',
            },
            lat: latLonData.map((item) => item[0]),
            lon: latLonData.map((item) => item[1]),
            text: latLonData.map((item) => `acc: ${item[2]}`),
          };
        }
      }

      return {
        barPlotData,
        histogramData: [containmentHist, cANIHist],
        mapData: [countryMap, latLonMap].filter(
          (item) => Object.keys(item).length > 0
        ),
        stringKeys,
      };
    },
    [createPlotData, countUniqueValuesAndOccurrences]
  );

  // Updated useEffect for handling search results
  useEffect(() => {
    if (searchResults.length > 0) {
      const filteredResults = getFilteredResults();
      const vizData = prepareVisualizationData(filteredResults);
      setVisualizationData(vizData);

      // Convert filtered results to map samples
      const mapData = convertToMapSamples(filteredResults);
      setMapSamples(mapData);

      // Set available geo data for other uses
      const availableGeoData = filteredResults.filter(
        (item) =>
          item.geo_loc_name_country_calc &&
          item.lat_lon &&
          item.lat_lon !== 'NP'
      );
      // setAvailableGeoData(availableGeoData);
    } else {
      // Clear data when no search results
      setMapSamples([]);
      // setAvailableGeoData([]);
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
      const sig = JSON.parse(evt.detail.signature)[0];

      setSignature(sig);
      // Removed automatic axios request - will only search when button is clicked

      // setIsButtonDisabled(false);
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

      // Set available geo data for other uses
      const availableGeoData = filteredResults.filter(
        (item) =>
          item.geo_loc_name_country_calc &&
          item.lat_lon &&
          item.lat_lon !== 'NP'
      );
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

  // useEffect(() => {
  //   if (searchResults.length > 0) {
  //     const filteredResults = getFilteredResults();
  //     const vizData = prepareVisualizationData(filteredResults);
  //     setVisualizationData(vizData);
  //
  //     // Update map samples
  //     const mapData = convertToMapSamples(filteredResults);
  //     setMapSamples(mapData);
  //
  //     // setMapSamples(mockMapSamples);
  //     // setMapSamples(availableGeoData);
  //   } else {
  //     // For development/testing: use mock data when no search results
  //     setMapSamples(mockMapSamples);
  //     // setMapSamples(availableGeoData);
  //   }
  // }, [
  //   filters,
  //   getFilteredResults,
  //   prepareVisualizationData,
  //   searchResults,
  //   mockMapSamples,
  // ]);

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

  // Apply sorting to filtered results
  const getSortedResults = (
    filteredResults: SearchResult[]
  ): SearchResult[] => {
    if (!sortField) return filteredResults;

    return [...filteredResults].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      // Handle numeric values
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortDirection === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      // Handle string values
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Get paginated results
  const getPaginatedResults = (
    sortedResults: SearchResult[]
  ): SearchResult[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedResults.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate total pages
  const getTotalPages = (filteredResults: SearchResult[]): number => {
    return Math.ceil(filteredResults.length / itemsPerPage);
  };

  // Process results for display
  const processResults = (): {
    filteredResults: SearchResult[];
    sortedResults: SearchResult[];
    paginatedResults: SearchResult[];
    totalPages: number;
  } => {
    const filteredResults = getFilteredResults();
    const sortedResults = getSortedResults(filteredResults);
    const paginatedResults = getPaginatedResults(sortedResults);
    const totalPages = getTotalPages(filteredResults);

    return {
      filteredResults,
      sortedResults,
      paginatedResults,
      totalPages,
    };
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
      cANI: '',
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

  return (
    <>
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
          <div>
            <div>
              <form className="vf-stack vf-stack--400">
                <div className="vf-form__item vf-stack">
                  <mgnify-sourmash-component
                    id="sourmash"
                    ref={sourmash}
                    ksize={21}
                    show_directory_checkbox={false}
                  />

                  <button
                    className="vf-button vf-button--sm vf-button--primary mg-button"
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
                        d="M17.485,5.062,12.707.284a1.031,1.031,0,0,0-1.415,0L6.515,5.062a1,1,0,0,0,.707,1.707H10.25a.25.25,0,0,1,.25.25V22.492a1.5,1.5,0,1,0,3,0V7.019a.249.249,0,0,1,.25-.25h3.028a1,1,0,0,0,.707-1.707Z"
                      />
                    </g>
                    <g id="vf-table-sortable--down">
                      <path
                        xmlns="http://www.w3.org/2000/svg"
                        d="M17.7,17.838a1,1,0,0,0-.924-.617H13.75a.249.249,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0V16.971a.25.25,0,0,1-.25.25H7.222a1,1,0,0,0-.707,1.707l4.777,4.778a1,1,0,0,0,1.415,0l4.778-4.778A1,1,0,0,0,17.7,17.838Z"
                      />
                    </g>
                    <g id="vf-table-sortable">
                      <path
                        xmlns="http://www.w3.org/2000/svg"
                        d="M9,19a1,1,0,0,0-.707,1.707l3,3a1,1,0,0,0,1.414,0l3-3A1,1,0,0,0,15,19H13.5a.25.25,0,0,1-.25-.25V5.249A.25.25,0,0,1,13.5,5H15a1,1,0,0,0,.707-1.707l-3-3a1,1,0,0,0-1.414,0l-3,3A1,1,0,0,0,9,5h1.5a.25.25,0,0,1,.25.25v13.5a.25.25,0,0,1-.25.25Z"
                      />
                    </g>
                  </defs>
                </svg>
                {/* eslint-disable-next-line no-nested-ternary */}
                {/*{isLoading ? (*/}
                {/*  <div className="vf-u-padding__top--800">*/}
                {/*    <p>Loading search results...</p>*/}
                {/*  </div>*/}
                {/*) : searchResults.length > 0 ? (*/}
                {/*  <>*/}
                {/*    <table className="vf-table">*/}
                {/*      <thead className="vf-table__header">*/}
                {/*        <tr className="vf-table__row">*/}
                {/*          /!* Filter inputs row *!/*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Accession"*/}
                {/*              value={filters.acc}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange('acc', e.target.value)*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Type"*/}
                {/*              value={filters.assay_type}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange('assay_type', e.target.value)*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Bioproject"*/}
                {/*              value={filters.bioproject}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange('bioproject', e.target.value)*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            /!* No filter for Biosample link *!/*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter cANI"*/}
                {/*              value={filters.cANI}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange('cANI', e.target.value)*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Date"*/}
                {/*              value={filters.collection_date_sam}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange(*/}
                {/*                  'collection_date_sam',*/}
                {/*                  e.target.value*/}
                {/*                )*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Containment"*/}
                {/*              value={filters.containment}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange(*/}
                {/*                  'containment',*/}
                {/*                  e.target.value*/}
                {/*                )*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Location"*/}
                {/*              value={filters.geo_loc_name_country_calc}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange(*/}
                {/*                  'geo_loc_name_country_calc',*/}
                {/*                  e.target.value*/}
                {/*                )*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            <input*/}
                {/*              type="text"*/}
                {/*              className="vf-form__input"*/}
                {/*              placeholder="Filter Organism"*/}
                {/*              value={filters.organism}*/}
                {/*              onChange={(e) =>*/}
                {/*                handleFilterChange('organism', e.target.value)*/}
                {/*              }*/}
                {/*            />*/}
                {/*          </th>*/}
                {/*        </tr>*/}
                {/*        <tr className="vf-table__row">*/}
                {/*          /!* Sortable column headers *!/*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() => handleSortChange('acc')}*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Accession*/}
                {/*            {sortField === 'acc' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() => handleSortChange('assay_type')}*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Type*/}
                {/*            {sortField === 'assay_type' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() => handleSortChange('bioproject')}*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Bioproject*/}
                {/*            {sortField === 'bioproject' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th className="vf-table__heading" scope="col">*/}
                {/*            Biosample*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() => handleSortChange('cANI')}*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            cANI*/}
                {/*            {sortField === 'cANI' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() =>*/}
                {/*              handleSortChange('collection_date_sam')*/}
                {/*            }*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Date*/}
                {/*            {sortField === 'collection_date_sam' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() => handleSortChange('containment')}*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Containment*/}
                {/*            {sortField === 'containment' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() =>*/}
                {/*              handleSortChange('geo_loc_name_country_calc')*/}
                {/*            }*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Location*/}
                {/*            {sortField === 'geo_loc_name_country_calc' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*          <th*/}
                {/*            className="vf-table__heading"*/}
                {/*            scope="col"*/}
                {/*            onClick={() => handleSortChange('organism')}*/}
                {/*            style={{ cursor: 'pointer' }}*/}
                {/*          >*/}
                {/*            Organism*/}
                {/*            {sortField === 'organism' && (*/}
                {/*              <svg*/}
                {/*                className="vf-icon"*/}
                {/*                aria-hidden="true"*/}
                {/*                xmlns="http://www.w3.org/2000/svg"*/}
                {/*                width="24"*/}
                {/*                height="24"*/}
                {/*              >*/}
                {/*                <use*/}
                {/*                  href={`#vf-table-sortable--${*/}
                {/*                    sortDirection === 'asc' ? 'up' : 'down'*/}
                {/*                  }`}*/}
                {/*                />*/}
                {/*              </svg>*/}
                {/*            )}*/}
                {/*          </th>*/}
                {/*        </tr>*/}
                {/*      </thead>*/}
                {/*      <tbody className="vf-table__body">*/}
                {/*        {processResults().paginatedResults.map(*/}
                {/*          (entry, index) => {*/}
                {/*            // Define URLs for first two results*/}
                {/*            const accessionLinks = [*/}
                {/*              'https://www.ebi.ac.uk/metagenomics/runs/ERR868490',*/}
                {/*              'https://www.ebi.ac.uk/metagenomics/runs/ERR1726685',*/}
                {/*            ];*/}

                {/*            return (*/}
                {/*              // eslint-disable-next-line react/no-array-index-key*/}
                {/*              <tr className="vf-table__row" key={index}>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {index < 2 ? (*/}
                {/*                    <a*/}
                {/*                      href={accessionLinks[index]}*/}
                {/*                      target="_blank"*/}
                {/*                      rel="noopener noreferrer"*/}
                {/*                      className="vf-link"*/}
                {/*                    >*/}
                {/*                      {entry.acc}*/}
                {/*                    </a>*/}
                {/*                  ) : (*/}
                {/*                    entry.acc*/}
                {/*                  )}*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {entry.assay_type}*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {entry.bioproject}*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  <a*/}
                {/*                    href={entry.biosample_link}*/}
                {/*                    target="_blank"*/}
                {/*                    rel="noopener noreferrer"*/}
                {/*                  >*/}
                {/*                    Link*/}
                {/*                  </a>*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">{entry.cANI}</td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {entry.collection_date_sam || 'NP'}*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {entry.containment}*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {entry.geo_loc_name_country_calc || 'NP'}*/}
                {/*                </td>*/}
                {/*                <td className="vf-table__cell">*/}
                {/*                  {entry.organism}*/}
                {/*                </td>*/}
                {/*              </tr>*/}
                {/*            );*/}
                {/*          }*/}
                {/*        )}*/}
                {/*      </tbody>*/}
                {/*    </table>*/}

                {/*    /!* Pagination *!/*/}
                {/*    {processResults().totalPages > 1 && (*/}
                {/*      <nav className="vf-pagination" aria-label="Pagination">*/}
                {/*        <ul className="vf-pagination__list">*/}
                {/*          <li*/}
                {/*            className={`vf-pagination__item vf-pagination__item--previous-page ${*/}
                {/*              currentPage === 1*/}
                {/*                ? 'vf-pagination__item--is-disabled'*/}
                {/*                : ''*/}
                {/*            }`}*/}
                {/*          >*/}
                {/*            <button*/}
                {/*              type="button"*/}
                {/*              className="vf-pagination__link"*/}
                {/*              onClick={() =>*/}
                {/*                currentPage > 1 &&*/}
                {/*                handlePageChange(currentPage - 1)*/}
                {/*              }*/}
                {/*            >*/}
                {/*              Previous*/}
                {/*              <span className="vf-u-sr-only"> page</span>*/}
                {/*            </button>*/}
                {/*          </li>*/}

                {/*          /!* First page *!/*/}
                {/*          {currentPage > 2 && (*/}
                {/*            <li className="vf-pagination__item">*/}
                {/*              <button*/}
                {/*                type="button"*/}
                {/*                className="vf-pagination__link"*/}
                {/*                onClick={() => handlePageChange(1)}*/}
                {/*              >*/}
                {/*                1<span className="vf-u-sr-only"> page</span>*/}
                {/*              </button>*/}
                {/*            </li>*/}
                {/*          )}*/}

                {/*          /!* Ellipsis if needed *!/*/}
                {/*          {currentPage > 3 && (*/}
                {/*            <li className="vf-pagination__item">*/}
                {/*              <span className="vf-pagination__label">...</span>*/}
                {/*            </li>*/}
                {/*          )}*/}

                {/*          /!* Previous page if not first *!/*/}
                {/*          {currentPage > 1 && (*/}
                {/*            <li className="vf-pagination__item">*/}
                {/*              <button*/}
                {/*                type="button"*/}
                {/*                className="vf-pagination__link"*/}
                {/*                onClick={() =>*/}
                {/*                  handlePageChange(currentPage - 1)*/}
                {/*                }*/}
                {/*              >*/}
                {/*                {currentPage - 1}*/}
                {/*                <span className="vf-u-sr-only"> page</span>*/}
                {/*              </button>*/}
                {/*            </li>*/}
                {/*          )}*/}

                {/*          /!* Current page *!/*/}
                {/*          <li className="vf-pagination__item vf-pagination__item--is-active">*/}
                {/*            <span*/}
                {/*              className="vf-pagination__label"*/}
                {/*              aria-current="page"*/}
                {/*            >*/}
                {/*              <span className="vf-u-sr-only">Page </span>*/}
                {/*              {currentPage}*/}
                {/*            </span>*/}
                {/*          </li>*/}

                {/*          /!* Next page if not last *!/*/}
                {/*          {currentPage < processResults().totalPages && (*/}
                {/*            <li className="vf-pagination__item">*/}
                {/*              <button*/}
                {/*                type="button"*/}
                {/*                className="vf-pagination__link"*/}
                {/*                onClick={() =>*/}
                {/*                  handlePageChange(currentPage + 1)*/}
                {/*                }*/}
                {/*              >*/}
                {/*                {currentPage + 1}*/}
                {/*                <span className="vf-u-sr-only"> page</span>*/}
                {/*              </button>*/}
                {/*            </li>*/}
                {/*          )}*/}

                {/*          /!* Ellipsis if needed *!/*/}
                {/*          {currentPage < processResults().totalPages - 2 && (*/}
                {/*            <li className="vf-pagination__item">*/}
                {/*              <span className="vf-pagination__label">...</span>*/}
                {/*            </li>*/}
                {/*          )}*/}

                {/*          /!* Last page *!/*/}
                {/*          {currentPage < processResults().totalPages - 1 && (*/}
                {/*            <li className="vf-pagination__item">*/}
                {/*              <button*/}
                {/*                type="button"*/}
                {/*                className="vf-pagination__link"*/}
                {/*                onClick={() =>*/}
                {/*                  handlePageChange(processResults().totalPages)*/}
                {/*                }*/}
                {/*              >*/}
                {/*                {processResults().totalPages}*/}
                {/*                <span className="vf-u-sr-only"> page</span>*/}
                {/*              </button>*/}
                {/*            </li>*/}
                {/*          )}*/}

                {/*          <li*/}
                {/*            className={`vf-pagination__item vf-pagination__item--next-page ${*/}
                {/*              currentPage === processResults().totalPages*/}
                {/*                ? 'vf-pagination__item--is-disabled'*/}
                {/*                : ''*/}
                {/*            }`}*/}
                {/*          >*/}
                {/*            <button*/}
                {/*              type="button"*/}
                {/*              className="vf-pagination__link"*/}
                {/*              onClick={() =>*/}
                {/*                currentPage < processResults().totalPages &&*/}
                {/*                handlePageChange(currentPage + 1)*/}
                {/*              }*/}
                {/*            >*/}
                {/*              Next<span className="vf-u-sr-only"> page</span>*/}
                {/*            </button>*/}
                {/*          </li>*/}
                {/*        </ul>*/}
                {/*      </nav>*/}
                {/*    )}*/}
                {/*  </>*/}
                {/*) : (*/}
                {/*  <div className="vf-u-padding__top--800">*/}
                {/*    <p>*/}
                {/*      No search results found. Please try a different search.*/}
                {/*    </p>*/}
                {/*  </div>*/}
                {/*)}*/}

                {isLoading ? (
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
                ) : searchResults.length > 0 ? (
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
                            className="vf-button vf-button--primary vf-button--sm"
                            onClick={() => setIsTableVisible(!isTableVisible)}
                          >
                            {isTableVisible
                              ? '📊 Hide Details'
                              : '📋 View Details'}
                          </button>
                          <button
                            className="vf-button vf-button--secondary vf-button--sm"
                            onClick={() =>
                              window.open(
                                'https://www.ebi.ac.uk/metagenomics/submit',
                                '_blank'
                              )
                            }
                          >
                            🔬 Export as TSV
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Detailed Table Section */}
                    <details
                      open={isTableVisible}
                      style={{ marginBottom: '30px' }}
                    >
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          marginBottom: '20px',
                          userSelect: 'none',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsTableVisible(!isTableVisible);
                        }}
                      >
                        📊 Detailed Results Table
                        <span
                          style={{
                            fontWeight: 'normal',
                            color: '#6c757d',
                            marginLeft: '10px',
                          }}
                        >
                          ({processResults().filteredResults.length} results •
                          Click to {isTableVisible ? 'collapse' : 'expand'})
                        </span>
                      </summary>

                      {isTableVisible && (
                        <div
                          style={{
                            backgroundColor: '#fff',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Enhanced Filter Section */}
                          <div
                            style={{
                              backgroundColor: '#f8f9fa',
                              padding: '20px',
                              borderBottom: '1px solid #dee2e6',
                            }}
                          >
                            <h4
                              style={{ margin: '0 0 15px 0', color: '#495057' }}
                            >
                              🔍 Filter Results
                            </h4>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px',
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#495057',
                                  }}
                                >
                                  Accession
                                </label>
                                <input
                                  type="text"
                                  className="vf-form__input"
                                  placeholder="Filter by accession..."
                                  value={filters.acc}
                                  onChange={(e) =>
                                    handleFilterChange('acc', e.target.value)
                                  }
                                  style={{ marginTop: '5px' }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#495057',
                                  }}
                                >
                                  Assay Type
                                </label>
                                <input
                                  type="text"
                                  className="vf-form__input"
                                  placeholder="WGS, WGA..."
                                  value={filters.assay_type}
                                  onChange={(e) =>
                                    handleFilterChange(
                                      'assay_type',
                                      e.target.value
                                    )
                                  }
                                  style={{ marginTop: '5px' }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#495057',
                                  }}
                                >
                                  Country/Location
                                </label>
                                <input
                                  type="text"
                                  className="vf-form__input"
                                  placeholder="Filter by country..."
                                  value={filters.geo_loc_name_country_calc}
                                  onChange={(e) =>
                                    handleFilterChange(
                                      'geo_loc_name_country_calc',
                                      e.target.value
                                    )
                                  }
                                  style={{ marginTop: '5px' }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#495057',
                                  }}
                                >
                                  Containment Score
                                </label>
                                <input
                                  type="text"
                                  className="vf-form__input"
                                  placeholder="Min containment..."
                                  value={filters.containment}
                                  onChange={(e) =>
                                    handleFilterChange(
                                      'containment',
                                      e.target.value
                                    )
                                  }
                                  style={{ marginTop: '5px' }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Table */}
                          <div style={{ overflowX: 'auto' }}>
                            <table className="vf-table" style={{ margin: 0 }}>
                              <thead className="vf-table__header">
                                <tr
                                  className="vf-table__row"
                                  style={{ backgroundColor: '#f1f3f4' }}
                                >
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '120px' }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                      }}
                                    >
                                      🔗 Accession
                                      <button
                                        onClick={() => handleSortChange('acc')}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '2px',
                                        }}
                                      >
                                        {sortField === 'acc'
                                          ? sortDirection === 'asc'
                                            ? '⬆️'
                                            : '⬇️'
                                          : '↕️'}
                                      </button>
                                    </div>
                                  </th>
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '80px' }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                      }}
                                    >
                                      🧬 Type
                                      <button
                                        onClick={() =>
                                          handleSortChange('assay_type')
                                        }
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '2px',
                                        }}
                                      >
                                        {sortField === 'assay_type'
                                          ? sortDirection === 'asc'
                                            ? '⬆️'
                                            : '⬇️'
                                          : '↕️'}
                                      </button>
                                    </div>
                                  </th>
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '100px' }}
                                  >
                                    📊 cANI
                                  </th>
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '100px' }}
                                  >
                                    📈 Containment
                                  </th>
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '120px' }}
                                  >
                                    🌍 Location
                                  </th>
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '120px' }}
                                  >
                                    🦠 Metagenome
                                  </th>
                                  {/*<th*/}
                                  {/*  className="vf-table__heading"*/}
                                  {/*  scope="col"*/}
                                  {/*  style={{ minWidth: '80px' }}*/}
                                  {/*>*/}
                                  {/*  📅 Date*/}
                                  {/*</th>*/}
                                  <th
                                    className="vf-table__heading"
                                    scope="col"
                                    style={{ minWidth: '120px' }}
                                  >
                                    ⚙️ Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="vf-table__body">
                                {processResults().paginatedResults.map(
                                  (entry, index) => {
                                    // Calculate actual index in the full dataset
                                    const actualIndex =
                                      (currentPage - 1) * itemsPerPage + index;

                                    return (
                                      <tr
                                        key={actualIndex}
                                        className="vf-table__row"
                                        style={{
                                          backgroundColor:
                                            actualIndex % 2 === 0
                                              ? '#fff'
                                              : '#f9f9f9',
                                          transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            '#e3f2fd';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            actualIndex % 2 === 0
                                              ? '#fff'
                                              : '#f9f9f9';
                                        }}
                                      >
                                        <td className="vf-table__cell">
                                          {actualIndex < 2 ? (
                                            <div>
                                              <a
                                                href={`https://www.ebi.ac.uk/metagenomics/runs/${entry.acc}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="vf-link"
                                                style={{ fontWeight: 'bold' }}
                                              >
                                                {entry.acc}
                                              </a>
                                              <div
                                                style={{
                                                  fontSize: '10px',
                                                  color: '#28a745',
                                                  fontWeight: 'bold',
                                                  marginTop: '2px',
                                                }}
                                              >
                                                ✅ Available in MGnify
                                              </div>
                                            </div>
                                          ) : (
                                            <span
                                              style={{
                                                fontFamily: 'monospace',
                                              }}
                                            >
                                              {entry.acc}
                                            </span>
                                          )}
                                        </td>
                                        <td className="vf-table__cell">
                                          <span
                                            style={{
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              fontSize: '12px',
                                              fontWeight: 'bold',
                                              backgroundColor:
                                                entry.assay_type === 'WGS'
                                                  ? '#d4edda'
                                                  : '#fff3cd',
                                              color:
                                                entry.assay_type === 'WGS'
                                                  ? '#155724'
                                                  : '#856404',
                                            }}
                                          >
                                            {entry.assay_type}
                                          </span>
                                        </td>
                                        <td className="vf-table__cell">
                                          <div
                                            style={{
                                              fontWeight: 'bold',
                                              color:
                                                typeof entry.cANI ===
                                                  'number' && entry.cANI > 0.95
                                                  ? '#28a745'
                                                  : '#6c757d',
                                            }}
                                          >
                                            {typeof entry.cANI === 'number'
                                              ? entry.cANI.toFixed(3)
                                              : entry.cANI}
                                          </div>
                                        </td>
                                        <td className="vf-table__cell">
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '5px',
                                            }}
                                          >
                                            <div
                                              style={{
                                                fontWeight: 'bold',
                                                color:
                                                  typeof entry.containment ===
                                                    'number' &&
                                                  entry.containment > 0.5
                                                    ? '#28a745'
                                                    : '#6c757d',
                                              }}
                                            >
                                              {typeof entry.containment ===
                                              'number'
                                                ? entry.containment.toFixed(3)
                                                : entry.containment}
                                            </div>
                                            {typeof entry.containment ===
                                              'number' &&
                                              entry.containment > 0.7 && (
                                                <span
                                                  style={{ fontSize: '12px' }}
                                                >
                                                  🔥
                                                </span>
                                              )}
                                          </div>
                                        </td>
                                        <td className="vf-table__cell">
                                          <div style={{ fontSize: '14px' }}>
                                            {entry.geo_loc_name_country_calc ===
                                            'uncalculated' ? (
                                              <span
                                                style={{
                                                  color: '#ffc107',
                                                  fontStyle: 'italic',
                                                }}
                                              >
                                                📍 Location pending
                                              </span>
                                            ) : (
                                              entry.geo_loc_name_country_calc ||
                                              '❓ Unknown'
                                            )}
                                          </div>
                                        </td>
                                        <td className="vf-table__cell">
                                          <div
                                            style={{
                                              fontSize: '14px',
                                              maxWidth: '150px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                            }}
                                            title={entry.organism}
                                          >
                                            {entry.organism ||
                                              '🦠 Unknown metagenome'}
                                          </div>
                                        </td>
                                        {/*<td className="vf-table__cell">*/}
                                        {/*  <div*/}
                                        {/*    style={{*/}
                                        {/*      fontSize: '12px',*/}
                                        {/*      color: '#6c757d',*/}
                                        {/*    }}*/}
                                        {/*  >*/}
                                        {/*    {entry.collection_date_sam ||*/}
                                        {/*      '📅 Not provided'}*/}
                                        {/*  </div>*/}
                                        {/*</td>*/}
                                        <td className="vf-table__cell">
                                          <div
                                            style={{
                                              display: 'flex',
                                              gap: '5px',
                                              flexWrap: 'wrap',
                                            }}
                                          >
                                            {actualIndex < 2 ? (
                                              <button
                                                className="vf-button vf-button--primary vf-button--xs"
                                                onClick={() =>
                                                  window.open(
                                                    `https://www.ebi.ac.uk/metagenomics/runs/${entry.acc}`,
                                                    '_blank'
                                                  )
                                                }
                                                title="View in MGnify"
                                              >
                                                👁️ View
                                              </button>
                                            ) : (
                                              <button
                                                className="vf-button vf-button--secondary vf-button--xs"
                                                onClick={() =>
                                                  handleRequestAnalysis(entry)
                                                }
                                                title="Request analysis in MGnify"
                                              >
                                                🔬 Request
                                              </button>
                                            )}
                                            <button
                                              className="vf-button vf-button--tertiary vf-button--xs"
                                              onClick={() =>
                                                window.open(
                                                  entry.biosample_link,
                                                  '_blank'
                                                )
                                              }
                                              title="View biosample"
                                            >
                                              🔗 Sample
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Enhanced Pagination */}
                          {processResults().totalPages > 1 && (
                            <div
                              style={{
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderTop: '1px solid #dee2e6',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'between',
                                  alignItems: 'center',
                                  gap: '20px',
                                }}
                              >
                                <div
                                  style={{ fontSize: '14px', color: '#6c757d' }}
                                >
                                  Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                  to{' '}
                                  {Math.min(
                                    currentPage * itemsPerPage,
                                    processResults().filteredResults.length
                                  )}{' '}
                                  of {processResults().filteredResults.length}{' '}
                                  results
                                </div>
                                <nav
                                  className="vf-pagination"
                                  aria-label="Pagination"
                                >
                                  <ul className="vf-pagination__list">
                                    <li
                                      className={`vf-pagination__item vf-pagination__item--previous-page ${
                                        currentPage === 1
                                          ? 'vf-pagination__item--is-disabled'
                                          : ''
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        className="vf-pagination__link"
                                        onClick={() =>
                                          currentPage > 1 &&
                                          handlePageChange(currentPage - 1)
                                        }
                                      >
                                        ⬅️ Previous
                                      </button>
                                    </li>

                                    {[
                                      ...Array(
                                        Math.min(5, processResults().totalPages)
                                      ),
                                    ].map((_, i) => {
                                      const pageNum =
                                        Math.max(1, currentPage - 2) + i;
                                      if (pageNum > processResults().totalPages)
                                        return null;

                                      return (
                                        <li
                                          key={pageNum}
                                          className={`vf-pagination__item ${
                                            pageNum === currentPage
                                              ? 'vf-pagination__item--is-active'
                                              : ''
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            className="vf-pagination__link"
                                            onClick={() =>
                                              handlePageChange(pageNum)
                                            }
                                          >
                                            {pageNum}
                                          </button>
                                        </li>
                                      );
                                    })}

                                    <li
                                      className={`vf-pagination__item vf-pagination__item--next-page ${
                                        currentPage ===
                                        processResults().totalPages
                                          ? 'vf-pagination__item--is-disabled'
                                          : ''
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        className="vf-pagination__link"
                                        onClick={() =>
                                          currentPage <
                                            processResults().totalPages &&
                                          handlePageChange(currentPage + 1)
                                        }
                                      >
                                        Next ➡️
                                      </button>
                                    </li>
                                  </ul>
                                </nav>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </details>
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
                        className="vf-button vf-button--primary"
                        onClick={() => window.location.reload()}
                      >
                        🔄 Start New Search
                      </button>
                    </div>
                  </div>
                )}

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
                          <h4
                            style={{ margin: '0 0 10px 0', color: '#495057' }}
                          >
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
                          <h4
                            style={{ margin: '0 0 10px 0', color: '#495057' }}
                          >
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

                        <div
                          style={{
                            backgroundColor: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: '1px solid #dee2e6',
                          }}
                        >
                          <h4
                            style={{ margin: '0 0 10px 0', color: '#495057' }}
                          >
                            Avg Containment
                          </h4>
                          <div
                            style={{
                              fontSize: '2em',
                              fontWeight: 'bold',
                              color: '#fd7e14',
                            }}
                          >
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
                          <h4
                            style={{ margin: '0 0 10px 0', color: '#495057' }}
                          >
                            With Assemblies
                          </h4>
                          <div
                            style={{
                              fontSize: '2em',
                              fontWeight: 'bold',
                              color: '#6f42c1',
                            }}
                          >
                            {
                              searchResults.filter(
                                (r) => r.assay_type === 'WGS'
                              ).length
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Containment Distribution */}
                    <div className="vf-u-padding__top--400">
                      <h3 className="vf-text vf-text-heading--3">
                        Containment Score Distribution
                        <small
                          style={{
                            fontWeight: 'normal',
                            color: '#6c757d',
                            marginLeft: '10px',
                          }}
                        >
                          (Binned in 0.1 ranges as requested)
                        </small>
                      </h3>
                      <div
                        id="containmentBinsDiv"
                        style={{ width: '100%', height: '400px' }}
                      >
                        <Plot
                          data={[
                            {
                              x: (() => {
                                // Create containment bins of 0.1 ranges
                                const bins = Array.from(
                                  { length: 10 },
                                  (_, i) =>
                                    `${(i / 10).toFixed(1)}-${(
                                      (i + 1) /
                                      10
                                    ).toFixed(1)}`
                                );
                                return bins;
                              })(),
                              y: (() => {
                                // Count values in each bin
                                const binCounts = new Array(10).fill(0);
                                searchResults.forEach((result) => {
                                  if (typeof result.containment === 'number') {
                                    const binIndex = Math.min(
                                      Math.floor(result.containment * 10),
                                      9
                                    );
                                    binCounts[binIndex]++;
                                  }
                                });
                                return binCounts;
                              })(),
                              type: 'bar',
                              marker: {
                                color: 'rgba(54, 162, 235, 0.7)',
                                line: {
                                  color: 'rgba(54, 162, 235, 1)',
                                  width: 1,
                                },
                              },
                              name: 'Containment Distribution',
                            },
                          ]}
                          layout={{
                            title:
                              'Distribution of Containment Scores (0.1 bin ranges)',
                            xaxis: {
                              title: 'Containment Score Range',
                              tickangle: -45,
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
                                    ? org.substring(0, 17) + '...'
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
                        style={{ width: '100%', height: '500px' }}
                      >
                        <Plot
                          data={[
                            {
                              x: searchResults
                                .filter(
                                  (r) =>
                                    typeof r.containment === 'number' &&
                                    typeof r.cANI === 'number'
                                )
                                .map((r) => r.containment),
                              y: searchResults
                                .filter(
                                  (r) =>
                                    typeof r.containment === 'number' &&
                                    typeof r.cANI === 'number'
                                )
                                .map((r) => r.cANI),
                              mode: 'markers',
                              type: 'scatter',
                              text: searchResults
                                .filter(
                                  (r) =>
                                    typeof r.containment === 'number' &&
                                    typeof r.cANI === 'number'
                                )
                                .map(
                                  (r) =>
                                    `${r.acc}<br>Country: ${
                                      r.geo_loc_name_country_calc || 'Unknown'
                                    }<br>Organism: ${r.organism || 'Unknown'}`
                                ),
                              hovertemplate:
                                '%{text}<br>Containment: %{x:.3f}<br>cANI: %{y:.3f}<extra></extra>',
                              marker: {
                                size: 8,
                                color: searchResults
                                  .filter(
                                    (r) =>
                                      typeof r.containment === 'number' &&
                                      typeof r.cANI === 'number'
                                  )
                                  .map((r) =>
                                    r.assay_type === 'WGS'
                                      ? 'rgba(255, 99, 132, 0.8)'
                                      : 'rgba(54, 162, 235, 0.8)'
                                  ),
                                line: { width: 1, color: 'white' },
                              },
                            },
                          ]}
                          layout={{
                            title: 'Match Quality: cANI vs Containment Score',
                            xaxis: {
                              title: 'Containment Score',
                              range: [0, 1],
                            },
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
                                {/*{*/}
                                {/*  searchResults.filter(*/}
                                {/*    (r) => r.assay_type === 'WGS'*/}
                                {/*  ).length*/}
                                {/*}*/}2
                              </strong>{' '}
                              of your matches have assembled genomes available
                              for detailed analysis.
                            </p>
                            <button
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
                            <h4 style={{ color: '#1976d2' }}>
                              Request Assembly
                            </h4>
                            <p>
                              For samples without assemblies, you can request
                              assembly analysis through MGnify's pipeline.
                            </p>
                            <button
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
                    <h2 className="vf-text vf-text-heading--2">
                      Visualizations
                    </h2>

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
                            ].map((color, index) => (
                              <div
                                key={index}
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
                      <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        style={{ width: '100%', height: '100%' }}
                        scrollWheelZoom
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Individual sample markers */}
                        {mapSamples.map((sample) => (
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
                                <strong>Description:</strong>{' '}
                                {sample.attributes['sample-desc']}
                                <br />
                                <strong>Biome:</strong>{' '}
                                {sample.relationships.biome.data.id}
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
                                    const total = Object.values(
                                      countryCounts
                                    ).reduce((sum, c) => sum + c, 0);
                                    const percentage = (
                                      (count / total) *
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
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Branchwater;
