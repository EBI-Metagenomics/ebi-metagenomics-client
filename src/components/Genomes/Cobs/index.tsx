import React, { useState, useRef, useEffect, useMemo } from 'react';
import 'textarea-sequence/dist/textarea-sequence';

import ExtLink from 'components/UI/ExtLink';
import Tooltip from 'components/UI/Tooltip';

import InfoBanner from 'components/UI/InfoBanner';
import FileUploaderButton from 'components/UI/FileUploaderButton';
import Select, { MultiValue } from 'react-select';
import { toast } from 'react-toastify';

import {
  reactSelectStyles,
  reactSelectTheme,
} from 'styles/react-select-styles';
import useMGnifyData from 'hooks/data/useMGnifyData';

import { MGnifyResponseList } from 'hooks/data/useData';

import CobsResults from './Results';
import example1 from './examples/human-gut-v2-0.txt';
import example2 from './examples/marine-v1-0.txt';
import example3 from './examples/cow-rumen-v1-0.txt';
import example4 from './examples/human-oral-v1-0.txt';
import './style.css';

const KMERS_DEFAULT = 0.4;
const MIN_BASES = 50;

const examples = {
  'human-gut-v2-0': example1,
  'marine-v1-0': example2,
  'rumen-v1-0': example3,
  'human-oral-v1-0': example4,
};

type CobsProps = {
  catalogueName?: string;
  catalogueID?: string;
};

type SelectOptions = MultiValue<{ value: string; label: string }>;

const CobsSearch: React.FC<CobsProps> = ({ catalogueName, catalogueID }) => {
  const isSingleCatalogue = !!catalogueID;
  const textareaSeq = useRef(null);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [kmers, setKmers] = useState(KMERS_DEFAULT);
  const [errors, setErrors] = useState<{
    tooShort?: boolean;
    multipleSequences?: boolean;
    hasInvalidCharacters?: boolean;
  }>({});
  const [valid, setValid] = useState(false);
  useEffect(() => {
    textareaSeq.current.addEventListener('error-change', (e) => {
      setErrors(e.detail.errors);
      setValid(textareaSeq.current.quill.valid);
    });
  }, []);

  const { data: cataloguesList, loading: loadingCataloguesList } =
    useMGnifyData('genome-catalogues');

  const catalogueOptions = useMemo(() => {
    if (!cataloguesList) return [];
    return (cataloguesList as MGnifyResponseList).data.map((catalogue) => ({
      label: catalogue.attributes.name,
      value: catalogue.id,
    }));
  }, [cataloguesList]);

  const [selectedCatalogues, setSelectedCatalogues] = useState<SelectOptions>(
    []
  );

  useEffect(() => {
    if (selectedCatalogues.length) return;
    if (isSingleCatalogue)
      setSelectedCatalogues([{ label: catalogueName, value: catalogueID }]);
    else if (catalogueOptions)
      setSelectedCatalogues(catalogueOptions as SelectOptions);
  }, [
    catalogueID,
    catalogueName,
    catalogueOptions,
    isSingleCatalogue,
    selectedCatalogues,
  ]);

  const setSequence = (seq: string): void => {
    textareaSeq.current.quill.setText(seq);
  };

  const handleExampleClick = (): void => {
    if (catalogueID in examples) setSequence(examples[catalogueID]);
    else setSequence(example1);
  };

  const handleKmersChange = (event): void => {
    setKmers(Math.min(1, Math.max(0, Number(event.target.value))));
  };
  const handleClear = (): void => {
    setSequence('');
    setKmers(KMERS_DEFAULT);
    setShouldSearch(false);
  };

  const handleFileLoad = (event): void => {
    const { files } = event.target;
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      () => setSequence(reader.result as string),
      false
    );

    if (files && files.length) {
      reader.readAsText(files[0]);
    }
  };

  const handleCleanup = (): void => {
    textareaSeq.current.cleanUp();
  };

  const sayPasted = () =>
    toast.success('Pasted your clipboard into textarea', {
      position: 'bottom-left',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  return (
    <section id="genome-search" className="vf-stack vf-stack--400">
      <section>
        {isSingleCatalogue && (
          <h3>Search DNA fragments in the {catalogueName} catalogue</h3>
        )}
        {!isSingleCatalogue && <h3>Search DNA fragments across catalogues</h3>}
        <p className="vf-text-body vf-text-body--3">
          This is a{' '}
          <ExtLink href="https://arxiv.org/abs/1905.09624">COBS-based</ExtLink>{' '}
          search engine designed to query short sequence fragments (50-5,000 bp
          in length) against representative genomes from the catalogue
          {!isSingleCatalogue && 's'}.
        </p>
      </section>
      {!isSingleCatalogue && (
        <section>
          <h5>Select catalogues to search against</h5>
          <Select
            theme={reactSelectTheme}
            styles={reactSelectStyles}
            placeholder="Select catalogues"
            value={selectedCatalogues}
            onChange={(options) => {
              setSelectedCatalogues(options);
            }}
            // formatOptionLabel={OptionLabel}
            isLoading={loadingCataloguesList}
            isSearchable
            name="biome"
            inputId="biome-select"
            isMulti
            options={catalogueOptions as SelectOptions}
          />
        </section>
      )}
      <section>
        <div>
          <h5>Enter a sequence</h5>
          <div className="vf-grid vf-grid__col-3">
            <button
              type="button"
              className="vf-button vf-button--sm vf-button--secondary"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard
                  .readText()
                  .then(setSequence)
                  .then(sayPasted);
              }}
            >
              Paste a sequence
            </button>
            <FileUploaderButton
              onChange={handleFileLoad}
              accept=".fasta, .fna, .ffn, .frn, .fa, .txt"
              buttonClassName="vf-button--secondary vf-button--sm"
            >
              Upload a FASTA
            </FileUploaderButton>
            <button
              type="button"
              className="vf-button vf-button--sm vf-button--secondary"
              onClick={handleExampleClick}
            >
              Use the example
            </button>
          </div>
        </div>

        <section className="vf-stack vf-stack--200">
          <div />
          <div>
            <textarea-sequence
              id="textareaID"
              alphabet="dna"
              height="10em"
              min-sequence-length={MIN_BASES}
              single="true"
              ref={textareaSeq}
              className="mg-sequence"
              disable-header-check="true"
            />
          </div>
          <div className="row">
            <label htmlFor="threshold">
              <Tooltip
                content={`The minimum proportion of K-mers from the query that must be
              matched (default: ${KMERS_DEFAULT})`}
              />
              Threshold: <span className="icon icon-common icon-info" />
            </label>{' '}
            <input
              id="threshold"
              name="threshold"
              type="number"
              min="0.1"
              max="1.0"
              value={kmers}
              step="0.1"
              onChange={handleKmersChange}
              className="vf-form__input mg-threshold"
            />
          </div>
          {!valid && (
            <InfoBanner>
              <div>
                <p className="vf-text-body vf-text-body--3">
                  The query can’t be submitted because:
                  <ul>
                    {errors.tooShort && (
                      <li className="vf-text-body vf-text-body--3">
                        The sequence has to have at least {MIN_BASES}{' '}
                        nucleotides
                      </li>
                    )}
                    {errors.hasInvalidCharacters && (
                      <li className="vf-text-body vf-text-body--3">
                        The sequence has invalid characters
                      </li>
                    )}
                    {errors.multipleSequences && (
                      <li className="vf-text-body vf-text-body--3">
                        There are multiple sequences and only 1 is supported
                      </li>
                    )}
                  </ul>
                </p>
              </div>
            </InfoBanner>
          )}
          <div />
          <div className="mg-right">
            {!valid && (
              <button
                type="button"
                className="vf-button vf-button--sm vf-button--tertiary mg-button"
                onClick={handleCleanup}
              >
                Clean sequence
              </button>
            )}
            {valid && (
              <button
                id="search-button"
                type="button"
                className="vf-button vf-button--sm vf-button--primary"
                onClick={() => setShouldSearch(true)}
              >
                Search
              </button>
            )}
            <button
              id="clear-button"
              type="button"
              className="vf-button vf-button--sm vf-button--tertiary"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </section>

        {shouldSearch && (
          <CobsResults
            sequence={textareaSeq.current.sequence}
            threshold={kmers}
            cataloguesFilter={selectedCatalogues.map((c) => c.value)}
          />
        )}

        <section>
          <div id="results-section" className="hidden">
            <div className="row">
              <div id="results-table" className="columns" />
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default CobsSearch;
