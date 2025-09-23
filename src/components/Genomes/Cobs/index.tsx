import React, { useContext, useEffect, useRef, useState } from 'react';
import 'textarea-sequence/dist/textarea-sequence';

import Tooltip from 'components/UI/Tooltip';

import InfoBanner from 'components/UI/InfoBanner';
import FileUploaderButton from 'components/UI/FileUploaderButton';
import CataloguePicker from 'components/Genomes/CrossCatalogueSearchCataloguePicker';

import { toast } from 'react-toastify';
import axios from 'axios';
import UserContext from 'pages/Login/UserContext';
import CobsResults from './Results';
import './style.css';

const KMERS_DEFAULT = 0.4;
const MIN_BASES = 50;

type CobsProps = {
  catalogueName?: string;
  catalogueID?: string;
};

const CobsSearch: React.FC<CobsProps> = ({ catalogueName, catalogueID }) => {
  const { config } = useContext(UserContext);
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

  const [selectedCatalogues, setSelectedCatalogues] = useState<string[]>([]);

  const setSequence = (seq: string): void => {
    textareaSeq.current.quill.setText(seq);
  };

  const getAccessionFromCataloguesFirstGenome = async (): Promise<string> => {
    const genomeCatalogueSlug = catalogueID || selectedCatalogues[0];
    const url = `${config.api}genome-catalogues/${genomeCatalogueSlug}/genomes?page=1&ordering=accession&page_size=1`;
    try {
      const response = await axios.get(url);
      return response.data.data[0].attributes.accession;
    } catch {
      return '';
    }
  };

  const getSequenceCharsFromFastaFile = async (
    fastaUrl: string
  ): Promise<string> => {
    try {
      const headersConfig = {
        headers: {
          Range: 'bytes=0-499',
        },
      };

      const response = await axios.get(fastaUrl, headersConfig);
      const { data } = response;
      return data.substring(0, 500);
    } catch {
      return '';
    }
  };

  const buildExampleSequence = async () => {
    const myAccession = await getAccessionFromCataloguesFirstGenome();
    const fastaUrl = `${config.api}genomes/${myAccession}/downloads/${myAccession}.fna`;
    const firstFiftySequenceChars = await getSequenceCharsFromFastaFile(
      fastaUrl
    );
    textareaSeq.current.quill.setText(firstFiftySequenceChars);
  };

  const handleExampleClick = (): void => {
    buildExampleSequence();
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
      <div />
      <div className="vf-sidebar vf-sidebar--end">
        <div className="vf-sidebar__inner">
          <div>
            {isSingleCatalogue && (
              <h3>Search DNA fragments in the {catalogueName} catalogue</h3>
            )}
            {!isSingleCatalogue && (
              <h3>Search DNA fragments across catalogues</h3>
            )}
          </div>
          <div className="vf-flag vf-flag--middle vf-flag--200 vf-flag--reversed">
            <div className="vf-flag__body">
              <span className="vf-text-body vf-text-body--4">
                Powered by{' '}
                <a href="https://github.com/iqbal-lab-org/cobs">COBS</a>.
              </span>
            </div>
            <div className="vf-flag__media" />
          </div>
        </div>
      </div>
      <section>
        <p className="vf-text-body vf-text-body--3">
          This search engine is designed to query short sequence fragments
          (50-5,000 bp in length) against representative genomes from the
          catalogue
          {!isSingleCatalogue && 's'}.
        </p>
      </section>
      <CataloguePicker
        onChange={setSelectedCatalogues}
        singleCatalogue={catalogueID}
      />
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
              Threshold:{' '}
              <Tooltip
                content={`The minimum proportion of K-mers from the query that must be
              matched (default: ${KMERS_DEFAULT})`}
              >
                <span className="icon icon-common icon-info" />
              </Tooltip>
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
                </p>
                <ul>
                  {errors.tooShort && (
                    <li className="vf-text-body vf-text-body--3">
                      The sequence has to have at least {MIN_BASES} nucleotides
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
            cataloguesFilter={selectedCatalogues}
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
