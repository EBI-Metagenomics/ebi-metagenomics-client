import React from 'react';
import 'mgnify-sourmash-component';
import SourmashLogo from 'images/sourmash_logo.png';
import InfoBanner from 'components/UI/InfoBanner';
import useSearchStorage from 'hooks/useSearchStorage';
import SourmashHistory from './History';
import SourmashForm from './Form';
import SourmashResults from './Results';

type SourmashProps = {
  catalogueName: string;
  catalogueID: string;
};

const SourmashSearch: React.FC<SourmashProps> = ({
  catalogueName,
  catalogueID,
}) => {
  const { jobs, addToStorage, removeFromStorage } = useSearchStorage(
    `sourmashJobs-${catalogueID}`
  );
  return (
    <section id="genome-search-mag">
      <section className="vf-stack">
        <div style={{ width: '100%', textAlign: 'right' }}>
          Powered by <a href="https://sourmash.readthedocs.io/">Sourmash</a>.
          <img
            src={SourmashLogo}
            style={{ height: '2em' }}
            alt="Sourmash logo"
          />
        </div>

        <h3>Search MAG files in the {catalogueName} catalogue</h3>
        <p>
          Compare your MAG file or your MAG collection against this catalog to
          see if they are novel.
          <br />
        </p>
        <InfoBanner>
          <details className="mg-sourmash-readmore">
            <summary>Instructions</summary>
            <p>
              Use the browse button below to upload either a single FastA file,
              or multiple files by holding [ctrl] or [shift] while clicking in
              the file explorer. Alternatively you can select a whole directory
              of files using the directory mode (select this option below the
              Browse button). In this mode, the tool will process all FastA
              files in the selected directory, however it will not descend into
              subdirectories.
            </p>
            <p>
              Your files are not uploaded into our servers. Rather, Sourmash
              generates a signature of your file(s) in your browser, and
              compares this against our MAG catalogue.
            </p>
            <p>
              Successful searches create a CSV result file for each signature
              submitted. These are compiled into a TGZ allowing you to fetch all
              your results in one click. These result files are only stored in
              our servers for 30 days, so please be sure to download them before
              they expire.
            </p>
          </details>
        </InfoBanner>
        <SourmashForm catalogueID={catalogueID} />
        <SourmashResults
          catalogueID={catalogueID}
          addToStorage={addToStorage}
        />
        <SourmashHistory jobs={jobs} removeFromStorage={removeFromStorage} />
      </section>
    </section>
  );
};

export default SourmashSearch;
