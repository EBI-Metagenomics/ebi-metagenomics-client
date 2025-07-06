import { React, useEffect, useRef, useState, useCallback } from 'react';
import render from 'components/UI/SamplesMap/render';
import { Wrapper } from '@googlemaps/react-wrapper';
import config from 'utils/config';
// import 'mgnify-sourmash-component';
// import 'components/mgnify-sourmash-component-main/src';
import axios from 'axios';
import Plot from 'react-plotly.js';

const sampleEntries = [
  {
    acc: 'ERR4172301',
    assay_type: 'OTHER',
    bioproject: 'PRJEB38431',
    biosample_link: 'https://www.ncbi.nlm.nih.gov',
    cANI: 0.9,
    collection_date: '2018-09-03',
    containment: 0.11,
    geo_loc_name_country_calc: 'China',
    lat_lon: 'NP',
    organism: 'environmental sample',
  },
  {
    acc: 'ERR4172302',
    assay_type: 'RNA-Seq',
    bioproject: 'PRJEB38432',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172302',
    cANI: 0.8,
    collection_date: '2019-05-12',
    containment: 0.15,
    geo_loc_name_country_calc: 'USA',
    lat_lon: '37.7749N, 122.4194W',
    organism: 'Homo sapiens',
  },
  {
    acc: 'ERR4172303',
    assay_type: 'WGS',
    bioproject: 'PRJEB38433',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172303',
    cANI: 0.85,
    collection_date: '2020-11-25',
    containment: 0.2,
    geo_loc_name_country_calc: 'Germany',
    lat_lon: '52.5200N, 13.4050E',
    organism: 'Bacillus subtilis',
  },
  {
    acc: 'ERR4172304',
    assay_type: 'ChIP-Seq',
    bioproject: 'PRJEB38434',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172304',
    cANI: 0.95,
    collection_date: '2021-07-14',
    containment: 0.25,
    geo_loc_name_country_calc: 'Brazil',
    lat_lon: '14.2350S, 51.9253W',
    organism: 'Escherichia coli',
  },
  {
    acc: 'ERR4172305',
    assay_type: 'Metagenomics',
    bioproject: 'PRJEB38435',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172305',
    cANI: 0.75,
    collection_date: '2017-03-08',
    containment: 0.1,
    geo_loc_name_country_calc: 'Australia',
    lat_lon: '25.2744S, 133.7751E',
    organism: 'environmental sample',
  },
];

const Branchwater = () => {
  const ref = useRef();
  const [showMgnifySourmash, setShowMgnifySourmash] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [targetDatabase, setTargetDatabase] = useState('MAGs');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtering state
  const [filters, setFilters] = useState({
    acc: '',
    assay_type: '',
    bioproject: '',
    cANI: '',
    collection_date_sam: '',
    containment: '',
    geo_loc_name_country_calc: '',
    organism: '',
  });

  const sourmash = useRef(null);
  const [{ signatures, errors }, setSourmashState] = useState({
    signatures: null,
    errors: null,
  });
  const [signature, setSignature] = useState(null);

  // State for visualizations
  const [visualizationData, setVisualizationData] = useState(null);

  // Helper functions for visualizations
  const countUniqueValuesAndOccurrences = (valueList) => {
    const counts = {};
    const uniqueValues = [...new Set(valueList)];

    for (let i = 0; i < uniqueValues.length; i++) {
      const val = uniqueValues[i];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      counts[val] = valueList.filter((value) => value === val).length;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const countVal = uniqueValues.map((key) => counts[key]);

    return {
      uniqueValues,
      countVal,
    };
  };

  const createPlotData = (stringKeys, stringValues) => {
    const plotData = [];
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
  const getFilteredResults = useCallback(() => {
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
    (data) => {
      if (!data || data.length === 0) return null;

      const commonKeys = Object.keys(data[0]);
      const values = Array.from({ length: commonKeys.length }, () => []);

      commonKeys.forEach((key, j) => {
        values[j] = data.map((obj) => obj[key]);
      });

      // Filter string keys for bar plots
      let stringKeys = [];
      let stringValues = [];

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

      const containmentHist = {
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

      const cANIHist = {
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
      let countryMap = {};
      let latLonMap = {};

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
          .filter((item) => item !== null);

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

  useEffect(() => {
    const handleSketched = (evt) => {
      evt.preventDefault();
      console.log('we be sketching not concerning what no body wanna say');
      console.log('Sigs out here ', evt.detail.signature);
      const sig = JSON.parse(evt.detail.signature)[0];

      setSignature(sig);
      console.log('sig', sig);
      // Removed automatic axios request - will only search when button is clicked

      // setIsButtonDisabled(false);
    };

    document.addEventListener('sketched', handleSketched);

    return () => {
      document.removeEventListener('sketched', handleSketched);
    };
  }, [signature]);

  // Update visualization data when filtered results change
  useEffect(() => {
    if (searchResults.length > 0) {
      const filteredResults = getFilteredResults();
      const vizData = prepareVisualizationData(filteredResults);
      setVisualizationData(vizData);
    }
  }, [searchResults, getFilteredResults, prepareVisualizationData]);

  // useEffect(() => {
  //   console.log('sourmash.current', sourmash.current);
  //   let sourmashElement;
  //   const sketchedAll = (event): void => {
  //     console.log('sketched all');
  //     setSourmashState({
  //       signatures: event.detail.signatures,
  //       errors: event.detail.errors,
  //     });
  //   };
  //   const changedFiles = (): void => {
  //     console.log('changed files');
  //     setSourmashState({
  //       signatures: null,
  //       errors: null,
  //     });
  //   };
  //   // eslint-disable-next-line prefer-const
  //   sourmashElement = sourmash.current;
  //   sourmashElement.addEventListener('sketchedall', sketchedAll);
  //   sourmashElement.addEventListener('change', changedFiles);
  //   sourmashElement.addEventListener('sketched', changedFiles);
  //   // if (sourmash.current) {
  //   //   sourmashElement = sourmash.current;
  //   //   sourmashElement.addEventListener('sketchedall', sketchedAll);
  //   //   sourmashElement.addEventListener('change', changedFiles);
  //   //   sourmashElement.addEventListener('sketched', changedFiles);
  //   // }
  //   return () => {
  //     if (sourmashElement) {
  //       sourmashElement.removeEventListener('sketchedall', sketchedAll);
  //       sourmashElement.removeEventListener('change', changedFiles);
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [sourmash.current]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setShowMgnifySourmash(true);
    // if (file && file.name.endsWith('.fasta')) {
    //   setUploadedFile(file);
    // } else {
    //   alert('Please upload a valid FASTA file.');
    // }
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    setShowMgnifySourmash(true);
    console.log(`Searching in ${targetDatabase} database`);

    // If we already have a signature, trigger a search
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
          console.log('Search results:', response.data);
          // Ensure response.data is an array before setting it to searchResults
          const resultsArray = Array.isArray(response.data)
            ? response.data
            : [];
          setSearchResults(resultsArray);

          // Prepare visualization data
          const vizData = prepareVisualizationData(resultsArray);
          setVisualizationData(vizData);

          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
          setIsLoading(false);
          // For testing, use sample data if the API call fails
          setSearchResults(sampleEntries);

          // Prepare visualization data with sample entries
          const vizData = prepareVisualizationData(sampleEntries);
          setVisualizationData(vizData);
        });
    } else {
      // If no signature yet, show a message or use sample data for testing
      console.log(
        'No signature available yet. Please upload and sketch a file first.'
      );
      // // For testing purposes, we can use the sample data
      // setSearchResults(sampleEntries);
      //
      // // Prepare visualization data with sample entries
      // const vizData = prepareVisualizationData(sampleEntries);
      // setVisualizationData(vizData);
    }
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sort change
  const handleSortChange = (field) => {
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
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Apply sorting to filtered results
  const getSortedResults = (filteredResults) => {
    if (!sortField) return filteredResults;

    return [...filteredResults].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      // Handle numeric values
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(aValue) && !isNaN(bValue)) {
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
  const getPaginatedResults = (sortedResults) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedResults.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate total pages
  const getTotalPages = (filteredResults) => {
    return Math.ceil(filteredResults.length / itemsPerPage);
  };

  // Process results for display
  const processResults = () => {
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

  const handleClearClick = () => {
    setShowMgnifySourmash(false);
    setUploadedFile(null);
    setSearchResults([]);
    setSignature(null);
    setVisualizationData(null);
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

  return (
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

            <fieldset className="vf-form__fieldset vf-stack vf-stack--400">
              <legend className="vf-form__legend">
                Select target database
              </legend>

              <div className="vf-form__item vf-form__item--radio">
                <input
                  type="radio"
                  name="targetDatabase"
                  value="MAGs"
                  id="1"
                  className="vf-form__radio"
                  checked={targetDatabase === 'MAGs'}
                  onChange={() => setTargetDatabase('MAGs')}
                />
                <label htmlFor="1" className="vf-form__label">
                  MAGs
                </label>
              </div>

              <div className="vf-form__item vf-form__item--radio">
                <input
                  type="radio"
                  name="targetDatabase"
                  value="Metagenomes"
                  id="2"
                  className="vf-form__radio"
                  checked={targetDatabase === 'Metagenomes'}
                  onChange={() => setTargetDatabase('Metagenomes')}
                />
                <label htmlFor="2" className="vf-form__label">
                  Metagenomes
                </label>
              </div>

              {/* eslint-disable-next-line react/button-has-type */}
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
            </fieldset>
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
          {isLoading ? (
            <div className="vf-u-padding__top--800">
              <p>Loading search results...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <table className="vf-table">
                <thead className="vf-table__header">
                  <tr className="vf-table__row">
                    {/* Filter inputs row */}
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Accession"
                        value={filters.acc}
                        onChange={(e) =>
                          handleFilterChange('acc', e.target.value)
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Type"
                        value={filters.assay_type}
                        onChange={(e) =>
                          handleFilterChange('assay_type', e.target.value)
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Bioproject"
                        value={filters.bioproject}
                        onChange={(e) =>
                          handleFilterChange('bioproject', e.target.value)
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      {/* No filter for Biosample link */}
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter cANI"
                        value={filters.cANI}
                        onChange={(e) =>
                          handleFilterChange('cANI', e.target.value)
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Date"
                        value={filters.collection_date_sam}
                        onChange={(e) =>
                          handleFilterChange(
                            'collection_date_sam',
                            e.target.value
                          )
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Containment"
                        value={filters.containment}
                        onChange={(e) =>
                          handleFilterChange('containment', e.target.value)
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Location"
                        value={filters.geo_loc_name_country_calc}
                        onChange={(e) =>
                          handleFilterChange(
                            'geo_loc_name_country_calc',
                            e.target.value
                          )
                        }
                      />
                    </th>
                    <th className="vf-table__heading" scope="col">
                      <input
                        type="text"
                        className="vf-form__input"
                        placeholder="Filter Organism"
                        value={filters.organism}
                        onChange={(e) =>
                          handleFilterChange('organism', e.target.value)
                        }
                      />
                    </th>
                  </tr>
                  <tr className="vf-table__row">
                    {/* Sortable column headers */}
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('acc')}
                      style={{ cursor: 'pointer' }}
                    >
                      Accession
                      {sortField === 'acc' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('assay_type')}
                      style={{ cursor: 'pointer' }}
                    >
                      Type
                      {sortField === 'assay_type' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('bioproject')}
                      style={{ cursor: 'pointer' }}
                    >
                      Bioproject
                      {sortField === 'bioproject' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th className="vf-table__heading" scope="col">
                      Biosample
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('cANI')}
                      style={{ cursor: 'pointer' }}
                    >
                      cANI
                      {sortField === 'cANI' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('collection_date_sam')}
                      style={{ cursor: 'pointer' }}
                    >
                      Date
                      {sortField === 'collection_date_sam' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('containment')}
                      style={{ cursor: 'pointer' }}
                    >
                      Containment
                      {sortField === 'containment' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() =>
                        handleSortChange('geo_loc_name_country_calc')
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      Location
                      {sortField === 'geo_loc_name_country_calc' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                    <th
                      className="vf-table__heading"
                      scope="col"
                      onClick={() => handleSortChange('organism')}
                      style={{ cursor: 'pointer' }}
                    >
                      Organism
                      {sortField === 'organism' && (
                        <svg
                          className="vf-icon"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <use
                            href={`#vf-table-sortable--${
                              sortDirection === 'asc' ? 'up' : 'down'
                            }`}
                          />
                        </svg>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="vf-table__body">
                  {processResults().paginatedResults.map((entry, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <tr className="vf-table__row" key={index}>
                      <td className="vf-table__cell">{entry.acc}</td>
                      <td className="vf-table__cell">{entry.assay_type}</td>
                      <td className="vf-table__cell">{entry.bioproject}</td>
                      <td className="vf-table__cell">
                        <a
                          href={entry.biosample_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                      </td>
                      <td className="vf-table__cell">{entry.cANI}</td>
                      <td className="vf-table__cell">
                        {entry.collection_date_sam || 'NP'}
                      </td>
                      <td className="vf-table__cell">{entry.containment}</td>
                      <td className="vf-table__cell">
                        {entry.geo_loc_name_country_calc || 'NP'}
                      </td>
                      <td className="vf-table__cell">{entry.organism}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {processResults().totalPages > 1 && (
                <nav className="vf-pagination" aria-label="Pagination">
                  <ul className="vf-pagination__list">
                    <li
                      className={`vf-pagination__item vf-pagination__item--previous-page ${
                        currentPage === 1
                          ? 'vf-pagination__item--is-disabled'
                          : ''
                      }`}
                    >
                      <a
                        href="JavaScript:Void(0);"
                        className="vf-pagination__link"
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                      >
                        Previous<span className="vf-u-sr-only"> page</span>
                      </a>
                    </li>

                    {/* First page */}
                    {currentPage > 2 && (
                      <li className="vf-pagination__item">
                        <a
                          href="JavaScript:Void(0);"
                          className="vf-pagination__link"
                          onClick={() => handlePageChange(1)}
                        >
                          1<span className="vf-u-sr-only"> page</span>
                        </a>
                      </li>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage > 3 && (
                      <li className="vf-pagination__item">
                        <span className="vf-pagination__label">...</span>
                      </li>
                    )}

                    {/* Previous page if not first */}
                    {currentPage > 1 && (
                      <li className="vf-pagination__item">
                        <a
                          href="JavaScript:Void(0);"
                          className="vf-pagination__link"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          {currentPage - 1}
                          <span className="vf-u-sr-only"> page</span>
                        </a>
                      </li>
                    )}

                    {/* Current page */}
                    <li className="vf-pagination__item vf-pagination__item--is-active">
                      <span
                        className="vf-pagination__label"
                        aria-current="page"
                      >
                        <span className="vf-u-sr-only">Page </span>
                        {currentPage}
                      </span>
                    </li>

                    {/* Next page if not last */}
                    {currentPage < processResults().totalPages && (
                      <li className="vf-pagination__item">
                        <a
                          href="JavaScript:Void(0);"
                          className="vf-pagination__link"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          {currentPage + 1}
                          <span className="vf-u-sr-only"> page</span>
                        </a>
                      </li>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage < processResults().totalPages - 2 && (
                      <li className="vf-pagination__item">
                        <span className="vf-pagination__label">...</span>
                      </li>
                    )}

                    {/* Last page */}
                    {currentPage < processResults().totalPages - 1 && (
                      <li className="vf-pagination__item">
                        <a
                          href="JavaScript:Void(0);"
                          className="vf-pagination__link"
                          onClick={() =>
                            handlePageChange(processResults().totalPages)
                          }
                        >
                          {processResults().totalPages}
                          <span className="vf-u-sr-only"> page</span>
                        </a>
                      </li>
                    )}

                    <li
                      className={`vf-pagination__item vf-pagination__item--next-page ${
                        currentPage === processResults().totalPages
                          ? 'vf-pagination__item--is-disabled'
                          : ''
                      }`}
                    >
                      <a
                        href="JavaScript:Void(0);"
                        className="vf-pagination__link"
                        onClick={() =>
                          currentPage < processResults().totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                      >
                        Next<span className="vf-u-sr-only"> page</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="vf-u-padding__top--800">
              <p>No search results found. Please try a different search.</p>
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
                <div id="contDiv" style={{ width: '100%', height: '400px' }}>
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
                    <div id="barDiv" style={{ width: '100%', height: '400px' }}>
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
                                      visible: visualizationData.stringKeys.map(
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

              {/* Map Visualizations */}
              {visualizationData.mapData &&
                visualizationData.mapData.length > 0 && (
                  <div
                    className="vf-u-padding__top--400"
                    style={{ height: '600px' }}
                  >
                    <h3 className="vf-text vf-text-heading--3">
                      Geographic Distribution
                    </h3>
                    <div id="mapDiv" style={{ width: '100%', height: '500px' }}>
                      <Plot
                        data={visualizationData.mapData}
                        layout={{
                          title: 'Accession locations',
                          geo: {
                            scope: 'world',
                            showcountries: true,
                            countrycolor: 'rgb(255, 255, 255)',
                            countrywidth: 1,
                            showframe: false,
                            projection: {
                              type: 'robinson',
                            },
                            showland: true,
                            landcolor: 'rgb(250,250,250)',
                            subunitcolor: 'rgb(217,217,217)',
                          },
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

          <div className="vf-u-padding__top--800"></div>

          {/* Google Maps Component */}
          <Wrapper apiKey={config.googleMapsKey} render={render}>
            <div
              ref={ref}
              id="map"
              style={{ width: '100%', height: '500px' }}
            />
          </Wrapper>
        </>
      )}
    </div>
  );
};

export default Branchwater;
