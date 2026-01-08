import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useQueryParamState, {
  createSharedQueryParamContextForTable,
} from '@/hooks/queryParamState/useQueryParamState';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';
import Results from 'pages/Branchwater/Results';
import Loading from 'components/UI/Loading';
import LoadingDots from 'components/UI/LoadingDots';
import config from 'utils/config';
import useBranchwaterResults, {
  type BranchwaterFilters,
} from 'components/Branchwater/common/useBranchwaterResults';
import {
  getContainmentHistogram,
  getCaniHistogram,
  getScatterData,
  getTotalCountryCount,
  getCountryColor,
  processBranchwaterResults,
  downloadBranchwaterCSV,
  type BranchwaterResult as SearchResult,
} from 'utils/branchwater';
import { branchwaterQueryParamConfig } from 'components/Branchwater/common/queryParamConfig';

const { withQueryParamProvider } = createSharedQueryParamContextForTable(
  'branchwater-detailed',
  branchwaterQueryParamConfig
);

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Branchwater = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // const [targetDatabase, setTargetDatabase] = useState<string>('MAGs');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isTableVisible, setIsTableVisible] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pagination state
  const [itemsPerPage] = useState<number>(25);

  const [selectedExample, setSelectedExample] = useState<
    'example-mag-1st' | 'example-mag-2nd' | 'example-mag-3rd'
  >('example-mag-1st');

  // Filtering state
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

  const [textQuery, setTextQuery] = useQueryParamState('query', '');
  const [caniRange, setCaniRange] = useQueryParamState('cani', '');
  const [containmentRange, setContainmentRange] = useQueryParamState(
    'containment',
    ''
  );
  const [locationParam, setLocationParam] = useQueryParamState(
    'geoLocNameCountryCalc',
    ''
  );
  const [organismParam, setOrganismParam] = useQueryParamState('organism', '');
  const [assayTypeParam, setAssayTypeParam] = useQueryParamState(
    'assayType',
    ''
  );

  const [, setPageQP] = useQueryParamState(
    'branchwaterDetailedPage',
    1,
    Number
  );
  const [, setDetailedOrder] = useQueryParamState(
    'branchwaterDetailedOrder',
    ''
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

  // TODO: bring back request button
  // const handleRequestAnalysis = (entry: SearchResult) => {
  //   const submitUrl = `https://www.ebi.ac.uk/metagenomics/submit?accession=${entry.acc}&bioproject=${entry.bioproject}`;
  //   window.open(submitUrl, '_blank');
  // };

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
  } = useBranchwaterResults<SearchResult>({
    items: searchResults,
    namespace: 'branchwaterDetailed',
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

  const totalCountryCount = useMemo(
    () => getTotalCountryCount(countryCounts),
    [countryCounts]
  );

  const [mapPinsLimit, setMapPinsLimit] = useState<number>(1000);
  const displayedMapSamples = useMemo(
    () => (Array.isArray(mapSamples) ? mapSamples.slice(0, mapPinsLimit) : []),
    [mapSamples, mapPinsLimit]
  );

  useEffect(() => {
    setMapPinsLimit(1000);
  }, [searchResults]);

  const handleSearchClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();

    if (uploadedFile) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('fasta', uploadedFile);
      axios
        .post('http://branchwater-dev.mgnify.org/gzipped', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: '*/*',
          },
        })
        .then((response) => {
          const { resultsArray } = processBranchwaterResults(response.data);
          setSearchResults(resultsArray);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setSearchResults([]);
        });
    }
  };

  const handleFilterChange = (
    field: keyof BranchwaterFilters,
    value: string
  ): void => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));

    // Update the corresponding query parameter
    switch (field) {
      case 'query':
        setTextQuery(value);
        break;
      case 'cani':
        setCaniRange(value);
        break;
      case 'containment':
        setContainmentRange(value);
        break;
      case 'geo_loc_name_country_calc':
        setLocationParam(value);
        break;
      case 'organism':
        setOrganismParam(value);
        break;
      case 'assay_type':
        setAssayTypeParam(value);
        break;
    }
  };

  const handleSortChange = (): void => {
    // handled by EMGTable through shared query params
  };

  // Handle page change
  const handlePageChange = (pageNumber: number): void => {
    setPageQP(pageNumber);
  };
  const downloadCSV = () => {
    downloadBranchwaterCSV(sortedResults);
  };

  const handleClearClick = (): void => {
    setUploadedFile(null);
    setSearchResults([]);

    // Clear query parameters
    setTextQuery('');
    setCaniRange('');
    setContainmentRange('');
    setLocationParam('');
    setOrganismParam('');
    setAssayTypeParam('');

    setFilters({
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
    setDetailedOrder('containment');
    setPageQP(1);
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleExampleSubmit = () => {
    setUploadedFile(null);
    setSearchResults([]);

    // Clear query parameters
    setTextQuery('');
    setCaniRange('');
    setContainmentRange('');
    setLocationParam('');
    setOrganismParam('');
    setAssayTypeParam('');

    setFilters({
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
    setDetailedOrder('containment');
    setPageQP(1);
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    setIsLoading(true);
    const examples = [
      {
        id: 'example-mag-1st',
        accession: 'MGYG000290005',
        catalogue: 'cow-rumen-v1-0-1',
      },
      {
        id: 'example-mag-2nd',
        accession: 'MGYG000518603',
        catalogue: 'barley-rhizosphere-v2-0',
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
        const { resultsArray } = processBranchwaterResults(response.data);
        setSearchResults(resultsArray);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setSearchResults([]);
      });
  };

  return (
    <section className="vf-content mg-page-search">
      <h2>Search for a genome within INSDC metagenomes</h2>
      <div className="vf-u-margin__top--400">
        <details className="vf-details">
          <summary className="vf-details--summary">Instructions</summary>
          <p className="vf-text-body vf-text-body--3">
            Use the Browse button below to select a file (.fasta, .fna, .gz,
            .sig)
          </p>
          <p className="vf-text-body vf-text-body--3">
            If your FASTA file is larger than 10MB, please gzip it. If your
            gzipped file is larger than 20MB, please upload a sketch (.sig
            file).
          </p>
          <p className="vf-text-body vf-text-body--3">
            The file is then sent to our servers for processing.
          </p>
          <p className="vf-text-body vf-text-body--3">
            This search engine searches for the containment of a query genome
            sequence in over 1 million metagenomes available from INSDC archives
            as of {config.branchwaterDbDate}
          </p>
          <p className="vf-text-body vf-text-body--3">
            Sequences shorter than 10kb will rarely produce results. For better
            results, it is recommended to use sequences of lengths greater than
            50kb. The Quality of the match to the uploaded genome is represented
            by the cANI score (calculated from containment). The relationship
            between cANI and taxonomic level of the match varies with the genome
            of interest. In general, matches are most robust to the genus
            taxonomic level and a cANI greater than 0.97 often represents a
            species-level match.
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
            <label className="vf-form__label" htmlFor="file-upload">
              Upload file
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".fasta,.fna,.gz,.sig"
              onChange={(e) =>
                setUploadedFile(e.target.files ? e.target.files[0] : null)
              }
              className="vf-form__input"
            />

            <button
              type="button"
              className="vf-button vf-button--sm vf-button--primary mg-button vf-u-margin__top--400"
              onClick={handleSearchClick}
              disabled={!uploadedFile || isLoading}
            >
              Search
            </button>
            <button
              id="clear-button-mag"
              type="button"
              className="vf-button vf-button--sm vf-button--tertiary"
              onClick={handleClearClick}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="vf-u-margin__top--400 vf-u-text-align--center">
            <Loading size="large" />
            <p className="vf-text-body vf-text-body--3">
              Performing search, this may take a few minutes
              <LoadingDots />
            </p>
          </div>
        )}

        <details
          className="vf-details"
          open={!isLoading && !searchResults.length}
        >
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
                  RUG705 sp — Cow Rumen &nbsp;
                  <a
                    className="vf-link"
                    href="https://www.ebi.ac.uk/metagenomics/genomes/MGYG000290005#overview"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MGYG000290005
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
                  Dyadobacter sp946482605— Barley Rhizosphere &nbsp;
                  <a
                    className="vf-link"
                    href="https://www.ebi.ac.uk/metagenomics/genomes/MGYG000518603#overview"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MGYG000518603
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
                  Salmonella enterica — Human Gut &nbsp;{' '}
                  <a
                    className="vf-link"
                    href="https://www.ebi.ac.uk/metagenomics/genomes/MGYG000002366#overview"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MGYG000002366
                  </a>
                </label>
              </div>
            </fieldset>
            <button
              type="button"
              className="vf-button vf-button--sm vf-button--secondary"
              onClick={handleExampleSubmit}
              disabled={isLoading}
            >
              Use selected example
            </button>
          </div>
        </details>
      </div>

      {searchResults.length > 0 && (
        <Results
          isLoading={isLoading}
          searchResults={searchResults}
          isTableVisible={isTableVisible}
          setIsTableVisible={setIsTableVisible}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortField={order.replace(/^-/, '')}
          sortDirection={order.startsWith('-') ? 'desc' : 'asc'}
          onSortChange={handleSortChange}
          order={order}
          processResults={processResults}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          countryCounts={countryCounts}
          mapSamples={mapSamples}
          displayedMapSamples={displayedMapSamples}
          setMapPinsLimit={setMapPinsLimit}
          totalCountryCount={totalCountryCount}
          getCountryColor={getCountryColor}
          downloadCSV={downloadCSV}
          queryParamPrefix=""
          containmentHistogram={containmentHistogram}
          caniHistogram={caniHistogram}
          visualizationData={visualizationData}
          scatterData={scatterData}
        />
      )}
    </section>
  );
};

export default withQueryParamProvider(Branchwater);
