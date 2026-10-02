import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  type BranchwaterResult as SearchResult,
  downloadBranchwaterCSV,
  getCaniHistogram,
  getContainmentHistogram,
  getCountryColor,
  getScatterData,
  getTotalCountryCount,
  processBranchwaterResults,
} from 'utils/branchwater';
import { getPrefixedBranchwaterConfig } from 'components/Branchwater/common/queryParamConfig';
import BranchwaterLogo from 'images/branchwater_logo.png';
import InfoBanner from 'components/UI/InfoBanner';
import normaliseSourmashSignature from 'utils/normaliseSourmashSignature';
import validateBranchwaterSignature from 'utils/validateBranchwaterSignature';
import './style.css';

type SourmashEventDetail = {
  signatures: Record<string, string>;
  errors: Record<string, string>;
};

type SourmashErrorEventDetail = {
  filename: string;
  error: string;
};

const { withQueryParamProvider } = createSharedQueryParamContextForTable(
  'branchwaterDetailed',
  getPrefixedBranchwaterConfig('branchwaterDetailed'),
  25,
  '-containment'
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
  const sourmash = useRef<HTMLMgnifySourmashComponentElement>(null);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [, setSignatureErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isTableVisible, setIsTableVisible] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [signatureValidationError, setSignatureValidationError] = useState<
    string | null
  >(null);

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

  const [textQuery, setTextQuery] = useQueryParamState(
    'branchwaterDetailedQuery',
    ''
  );
  const [caniRange, setCaniRange] = useQueryParamState(
    'branchwaterDetailedCani',
    ''
  );
  const [containmentRange, setContainmentRange] = useQueryParamState(
    'branchwaterDetailedContainment',
    ''
  );
  const [locationParam, setLocationParam] = useQueryParamState(
    'branchwaterDetailedGeoLocNameCountryCalc',
    ''
  );
  const [organismParam, setOrganismParam] = useQueryParamState(
    'branchwaterDetailedOrganism',
    ''
  );
  const [assayTypeParam, setAssayTypeParam] = useQueryParamState(
    'branchwaterDetailedAssayType',
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

  useEffect(() => {
    let sourmashElement: HTMLMgnifySourmashComponentElement | null;

    const sketchedAll = (evt: Event): void => {
      const event = evt as CustomEvent<SourmashEventDetail>;
      setSignatures(event.detail.signatures);
      setSignatureErrors(event.detail.errors);
      const signatureEntries = Object.entries(event.detail.signatures);
      if (signatureEntries.length > 0) {
        const [filename, signature] = signatureEntries[0];
        setSelectedFileName(filename);
        const validation = validateBranchwaterSignature(signature);
        setSignatureValidationError(validation.valid ? null : validation.error);
      } else {
        const processingError = Object.entries(event.detail.errors)[0];
        setSelectedFileName(processingError?.[0] ?? null);
        setSignatureValidationError(
          processingError
            ? `The file could not be processed: ${processingError[1]}`
            : null
        );
      }
    };

    const sketchedError = (evt: Event): void => {
      const event = evt as CustomEvent<SourmashErrorEventDetail>;
      setSelectedFileName(event.detail.filename);
      setSignatureValidationError(
        `The file could not be processed: ${event.detail.error}`
      );
    };

    const changedFiles = (): void => {
      setSignatures({});
      setSignatureErrors({});
      setSearchResults([]);
      setSearchError(null);
      setSignatureValidationError(null);
      setSelectedFileName(null);
    };

    if (sourmash.current) {
      sourmashElement = sourmash.current;
      sourmashElement.ksize = 21;
      sourmashElement.addEventListener('sketchedall', sketchedAll);
      sourmashElement.addEventListener('sketchedError', sketchedError);
      sourmashElement.addEventListener('change', changedFiles);
    }
    return () => {
      if (sourmashElement) {
        sourmashElement.removeEventListener('sketchedall', sketchedAll);
        sourmashElement.removeEventListener('sketchedError', sketchedError);
        sourmashElement.removeEventListener('change', changedFiles);
      }
    };
  }, []);

  const handleSearchClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    if (Object.keys(signatures).length > 0) {
      const sigString = Object.values(signatures)[0];
      const validation = validateBranchwaterSignature(sigString);
      if (!validation.valid) {
        setSignatureValidationError(validation.error);
        return;
      }

      setSignatureValidationError(null);
      sourmash.current?.clear();
      setIsLoading(true);
      const normalisedSignature = normaliseSourmashSignature(
        sigString,
        'branchwater'
      );

      axios
        .post(
          `${config.api_branchwater}`,
          {
            signatures: normalisedSignature,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
            },
          }
        )
        .then((response) => {
          const { resultsArray } = processBranchwaterResults(response.data);
          setSearchResults(resultsArray);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          setSearchResults([]);
          setSearchError(err.message);
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

  const handlePageChange = (pageNumber: number): void => {
    setPageQP(pageNumber);
  };

  const downloadCSV = () => {
    downloadBranchwaterCSV(sortedResults);
  };

  const handleClearClick = (): void => {
    sourmash.current?.clear();
    setSignatures({});
    setSignatureErrors({});
    setSearchResults([]);
    setSelectedFileName(null);
    setSignatureValidationError(null);

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
    setDetailedOrder('-containment');
    setPageQP(1);
  };

  const handleExampleSubmit = () => {
    sourmash.current?.clear();
    setSignatures({});
    setSignatureErrors({});
    setSearchResults([]);
    setSelectedFileName(null);
    setSignatureValidationError(null);

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
        `${config.api_branchwater}/mags?accession=${selected.accession}&catalogue=${selected.catalogue}`
      )
      .then((response) => {
        const { resultsArray } = processBranchwaterResults(response.data);
        setSearchResults(resultsArray);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setSearchResults([]);
        setSearchError(err.message);
      });
  };

  return (
    <section className="vf-content mg-page-search">
      <div className="vf-sidebar vf-sidebar--end">
        <div className="vf-sidebar__inner">
          <div>
            <h2>Search for a genome within INSDC metagenomes</h2>
          </div>
          <div className="vf-flag vf-flag--middle vf-flag--200 vf-flag--reversed">
            <div className="vf-flag__body">
              <span className="vf-text-body vf-text-body--4">
                Powered by{' '}
                <a href="https://github.com/sourmash-bio/branchwater">
                  Branchwater
                </a>
                .
              </span>
            </div>
            <div className="vf-flag__media">
              <img
                src={BranchwaterLogo}
                style={{ height: '32px' }}
                alt="Branchwater logo"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="vf-u-margin__top--400">
        <details className="vf-details mg-branchwater-disclosure">
          <summary className="vf-details--summary">Instructions</summary>
          <div className="mg-branchwater-disclosure__content">
            <p className="vf-text-body vf-text-body--3">
              Use the Browse button below to select a sequence file (.fa,
              .fasta, .fna, .fq, .fastq, or .gz) or an uncompressed Sourmash
              signature file (.sig).
            </p>
            <p className="vf-text-body vf-text-body--3">
              If your FASTA file is larger than 10 MB, gzip it. If the gzipped
              file is larger than 20 MB, upload a Sourmash signature (.sig)
              instead.
            </p>
            <p className="vf-text-body vf-text-body--3">
              A .sig file must contain one Sourmash signature, either as a JSON
              object or a one-item array. It must include a DNA sketch with
              k-mer size 21, scaled 1000, seed 42, and hash function 0.murmur64.
              Other sketches are allowed.
            </p>
            <p className="vf-text-body vf-text-body--3">
              Sequence files are sketched in your browser. Existing .sig files
              are validated and sent without changing their sketch data.
            </p>
            <p className="vf-text-body vf-text-body--3">
              This search engine searches for the containment of a query genome
              sequence in over 1 million metagenomes available from INSDC
              archives as of {config.branchwaterDbDate}
            </p>
            <p className="vf-text-body vf-text-body--3">
              Sequences shorter than 10kb will rarely produce results. For
              better results, it is recommended to use sequences of lengths
              greater than 50kb. The Quality of the match to the uploaded genome
              is represented by the cANI score (calculated from containment).
              The relationship between cANI and taxonomic level of the match
              varies with the genome of interest. In general, matches are most
              robust to the genus taxonomic level and a cANI greater than 0.97
              often represents a species-level match.
            </p>
            <p className="vf-text-body vf-text-body--3">
              Notes: processing time depends on file size and your device; keep
              this tab open until the search completes.
            </p>
          </div>
        </details>
      </div>

      <div>
        <form className="vf-stack vf-stack--400">
          <div className="vf-form__item vf-stack">
            <mgnify-sourmash-component
              id="sourmash"
              ref={sourmash}
              ksize={21}
              accept-sigs
              aria-invalid={Boolean(signatureValidationError)}
              aria-describedby={
                signatureValidationError
                  ? 'branchwater-signature-error'
                  : undefined
              }
            />

            {selectedFileName && (
              <div className="vf-u-margin__top--200">
                <span className="vf-text-body vf-text-body--4">
                  Selected file: <strong>{selectedFileName}</strong>
                </span>
              </div>
            )}

            {signatureValidationError && (
              <p
                id="branchwater-signature-error"
                className="vf-form__helper vf-form__helper--error"
                role="alert"
                aria-live="assertive"
              >
                <strong>
                  {selectedFileName?.toLowerCase().endsWith('.sig')
                    ? 'Invalid .sig file:'
                    : 'File error:'}
                </strong>{' '}
                {signatureValidationError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                id="branchwater-search-button"
                type="button"
                className="vf-button vf-button--sm vf-button--primary mg-button vf-u-margin__top--400"
                onClick={handleSearchClick}
                disabled={
                  Object.keys(signatures).length === 0 ||
                  Boolean(signatureValidationError) ||
                  isLoading
                }
              >
                Search
              </button>
              <button
                id="clear-button-mag"
                type="button"
                className="vf-button vf-button--sm vf-button--tertiary vf-u-margin__top--400"
                onClick={handleClearClick}
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
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

        {searchError && (
          <InfoBanner
            type={'error'}
            title={`Error whilst searching: ${searchError}`}
          />
        )}

        <details className="vf-details mg-branchwater-disclosure" open={true}>
          <summary id="bw-example-panel" className="vf-details--summary">
            Try an example
          </summary>
          <div className="mg-branchwater-disclosure__content">
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
                    RUG705 sp. — Cow Rumen &nbsp;
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
                id="bw-examples-button"
                type="button"
                className="vf-button vf-button--sm vf-button--secondary"
                onClick={handleExampleSubmit}
                disabled={isLoading}
              >
                Use selected example
              </button>
            </div>
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
          queryParamPrefix="branchwaterDetailed"
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
