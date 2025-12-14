import React, { useRef, useState, useEffect } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useMgnifySourmashSearch from '@/hooks/data/useMgnifySourmashSearch';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import CataloguePicker from 'components/Genomes/CrossCatalogueSearchCataloguePicker';

type SourmashFormProps = {
  catalogueID?: string;
};
const SourmashForm: React.FC<SourmashFormProps> = ({ catalogueID }) => {
  const sourmash = useRef<HTMLMgnifySourmashComponentElement | null>(null);
  const [jobId, setJobId] = useQueryParamState('job_id', '');
  const [shouldSearch, setShouldSearch] = useState(false);
  const [selectedCatalogues, setSelectedCatalogues] = useState<string[]>(
    catalogueID ? [catalogueID] : []
  );

  const [{ signatures, errors }, setSourmashState] = useState({
    signatures: null,
    errors: null,
  });
  const { data, error, loading } = useMgnifySourmashSearch(
    shouldSearch ? 'gather' : '',
    selectedCatalogues,
    signatures || {}
  );

  useEffect(() => {
    let sourmashElement: {
      addEventListener: (
        arg0: string,
        arg1: (event: { detail: { signatures: any; errors: any } }) => void
      ) => void;
      removeEventListener: (
        arg0: string,
        arg1: (event: { detail: { signatures: any; errors: any } }) => void
      ) => void;
    };
    const sketchedAll = (event: {
      detail: { signatures: any; errors: any };
    }): void => {
      setSourmashState({
        signatures: event.detail.signatures,
        errors: event.detail.errors,
      });
    };
    const changedFiles = (): void => {
      setSourmashState({
        signatures: null,
        errors: null,
      });
    };
    if (sourmash.current) {
      sourmashElement = sourmash.current;
      sourmashElement.addEventListener('sketchedall', sketchedAll);
      sourmashElement.addEventListener('change', changedFiles);
    }
    return () => {
      if (sourmashElement) {
        sourmashElement.removeEventListener('sketchedall', sketchedAll);
        sourmashElement.removeEventListener('change', changedFiles);
      }
    };
  }, [sourmash.current]);

  useEffect(() => {
    if (!loading && !error && data) {
      // The signatures were succesfully sent and now we have job_id
      setJobId((data.data as Record<string, string>).job_id);
      setShouldSearch(false);
    }
  }, [data, error, loading]);

  const handleSearch = (): void => {
    setShouldSearch(true);
  };

  const handleClear = (): void => {
    sourmash.current?.clear();
    setShouldSearch(false);
    setSourmashState({
      signatures: null,
      errors: null,
    });
  };
  if (jobId) {
    return null;
  }
  return (
    <section id="search-mag-section" className="vf-stack vf-stack--600">
      <CataloguePicker
        onChange={setSelectedCatalogues}
        singleCatalogue={catalogueID}
      />
      <div>
        <h5>Select your files</h5>
        <mgnify-sourmash-component
          id="sourmash"
          ref={sourmash}
          show_directory_checkbox
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          id="search-button-mag"
          type="button"
          className="vf-button vf-button--sm vf-button--primary mg-button"
          disabled={
            Object.keys(signatures || {})?.length === 0 ||
            Object.keys(errors || {}).length > 0
          }
          onClick={handleSearch}
        >
          Search
        </button>
        <button
          id="clear-button-mag"
          type="button"
          className="vf-button vf-button--sm vf-button--tertiary"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
      {loading && <Loading />}
      {!loading && error && <FetchError error={error} />}
    </section>
  );
};

export default SourmashForm;
