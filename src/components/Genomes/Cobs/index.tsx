import React, { useState, useRef, useEffect } from 'react';
import 'textarea-sequence/dist/textarea-sequence';

import ExtLink from 'components/UI/ExtLink';
import Tooltip from 'components/UI/Tooltip';

import InfoBanner from 'components/UI/InfoBanner';
import FileUploaderButton from 'components/UI/FileUploaderButton';
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
  catalogueName: string;
  catalogueID: string;
};
const CobsSearch: React.FC<CobsProps> = ({ catalogueName, catalogueID }) => {
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
  return (
    <section id="genome-search">
      <section>
        <h3>Search DNA fragments in the {catalogueName} catalogue</h3>
        <p>
          This is a{' '}
          <ExtLink href="https://arxiv.org/abs/1905.09624">COBS-based</ExtLink>{' '}
          search engine designed to query short sequence fragments (50-5,000 bp
          in length) against representative genomes from the catalogue.
        </p>
      </section>
      <section>
        <div>
          <h5>Enter a sequence</h5>
          <p>You can use any of these methods to enter your sequence:</p>
          <ul>
            <li>Paste in your sequence in the area below.</li>
            <li>
              <label
                htmlFor="sequence"
                id="example-seq"
                style={{ cursor: 'pointer' }}
              >
                Use the{' '}
                <button
                  type="button"
                  className="vf-button vf-button--link mg-button-as-link"
                  onClick={handleExampleClick}
                >
                  example.
                </button>
              </label>
            </li>
            <li>
              <label htmlFor="fasta-file" style={{ cursor: 'pointer' }}>
                Upload a fasta file{' '}
                <FileUploaderButton
                  onChange={handleFileLoad}
                  accept=".fasta, .fna, .ffn, .frn, .fa, .txt"
                />
              </label>
            </li>
          </ul>
        </div>

        <section>
          <div />
          <div>
            <textarea-sequence
              id="textareaID"
              height="10em"
              min-sequence-length={MIN_BASES}
              single="true"
              ref={textareaSeq}
              className="mg-sequence"
              disable-header-check
            />
          </div>
          <div className="row">
            <label htmlFor="threshold">
              <Tooltip
                content={`The minimum proportion of K-mers from the query that must be
              matched (default: ${KMERS_DEFAULT})`}
              >
                <sup>
                  <span className="icon icon-common icon-info" />
                </sup>
              </Tooltip>{' '}
              Threshold:
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
                <p>
                  The sequence above has the following errors and can&apos;t be
                  submitted.
                </p>
                <ul>
                  {errors.tooShort && (
                    <li>
                      The sequence has to have at least {MIN_BASES} nucleotides
                    </li>
                  )}
                  {errors.hasInvalidCharacters && (
                    <li>The sequence has invalid characters</li>
                  )}
                  {errors.multipleSequences && (
                    <li>
                      There are multiple sequences and only 1 is supported
                    </li>
                  )}
                </ul>
              </div>
            </InfoBanner>
          )}
          <div className="mg-right">
            {!valid && (
              <button
                type="button"
                className="vf-button vf-button--sm vf-button--tertiary mg-button"
                onClick={handleCleanup}
              >
                CleanUp Sequence
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
            cataloguesFilter={catalogueID}
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
