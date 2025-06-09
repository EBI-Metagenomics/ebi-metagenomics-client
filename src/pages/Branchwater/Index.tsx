import React, { useEffect, useRef, useState } from 'react';
import render from 'components/UI/SamplesMap/render';
import SamplesMap from 'components/UI/SamplesMap';
import { Wrapper } from '@googlemaps/react-wrapper';
import config from 'utils/config';
import 'mgnify-sourmash-component';
import axios from 'axios';

const sampleEntries = [
  {
    acc: 'ERR4172301',
    assay_type: 'OTHER',
    bioproject: 'PRJEB38431',
    biosample_link: 'https://www.ncbi.nlm.nih.gov',
    cANI: 0.9,
    collection_date: '2018-09-03',
    containment: 0.11,
    geo_loc_name_country: 'China',
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
    geo_loc_name_country: 'USA',
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
    geo_loc_name_country: 'Germany',
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
    geo_loc_name_country: 'Brazil',
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
    geo_loc_name_country: 'Australia',
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
  }, []);

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
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
          setIsLoading(false);
          // For testing, use sample data if the API call fails
          setSearchResults(sampleEntries);
        });
    } else {
      // If no signature yet, show a message or use sample data for testing
      console.log(
        'No signature available yet. Please upload and sketch a file first.'
      );
      // For testing purposes, we can use the sample data
      setSearchResults(sampleEntries);
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

  // Apply filters to search results
  const getFilteredResults = () => {
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
  };

  // Apply sorting to filtered results
  const getSortedResults = (filteredResults) => {
    if (!sortField) return filteredResults;

    return [...filteredResults].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      // Handle numeric values
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
            {/*<input id="file-upload" type="file" onChange={handleFileUpload} />*/}
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
          <Wrapper apiKey={config.googleMapsKey} render={render}>
            <div ref={ref} id="map" style={{ height: '100%' }} />
          </Wrapper>
        </>
      )}
    </div>
  );
};

export default Branchwater;
