import React from 'react';
import 'mgnify-sourmash-component';
import SourmashLogo from 'images/sourmash_logo.png';
import useSearchStorage from '@/hooks/useSearchStorage';
import SourmashHistory from './History';
import SourmashForm from './Form';
import SourmashResults from './Results';
import { createSharedQueryParamContext } from 'hooks/queryParamState/useQueryParamState';
import SharedQueryParamsProvider, { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';

type SourmashProps = {
  catalogueName?: string;
  catalogueID?: string;
};

const SourmashSearch: React.FC<SourmashProps> = ({
  catalogueName,
  catalogueID,
}) => {
  const { jobs, addToStorage, removeFromStorage } = useSearchStorage(
    `sourmashJobs-${catalogueID || 'xcat'}`
  );
  const isSingleCatalogue = !!catalogueID;

  return (
    <section id="genome-search-mag">
      <section className="vf-stack">
        <div />
        <div className="vf-sidebar vf-sidebar--end">
          <div className="vf-sidebar__inner">
            <div>
              {isSingleCatalogue && (
                <h3>Search MAG files against the {catalogueName} catalogue</h3>
              )}
              {!isSingleCatalogue && (
                <h3>Search MAG files across catalogues</h3>
              )}
            </div>
            <div className="vf-flag vf-flag--middle vf-flag--200 vf-flag--reversed">
              <div className="vf-flag__body">
                <span className="vf-text-body vf-text-body--4">
                  Powered by{' '}
                  <a href="https://sourmash.readthedocs.io/">Sourmash</a>.
                </span>
              </div>
              <div className="vf-flag__media">
                <img
                  src={SourmashLogo}
                  style={{ height: '32px' }}
                  alt="Sourmash logo"
                />
              </div>
            </div>
          </div>
        </div>
        <p className="vf-text-body vf-text-body--3">
          Compare your MAG file or your MAG collection against MGnify’s
          catalogues to see if they are novel.
        </p>
        <details className="mg-sourmash-readmore">
          <summary>Instructions</summary>
          <p className="vf-text-body vf-text-body--3">
            Use the browse button below to upload either a single FastA file, or
            multiple files by holding [ctrl] or [shift] while clicking in the
            file explorer. Alternatively you can select a whole directory of
            files using the directory mode (select this option below the Browse
            button). In this mode, the tool will process all FastA files in the
            selected directory, however it will not descend into subdirectories.
          </p>
          <p className="vf-text-body vf-text-body--3">
            Your files are not uploaded into our servers. Rather, Sourmash
            generates a signature of your file(s) in your browser, and compares
            this against our MAG catalogue.
          </p>
          <p className="vf-text-body vf-text-body--3">
            Successful searches create a CSV result file for each signature
            submitted. These are compiled into a TGZ allowing you to fetch all
            your results in one click. These result files are only stored in our
            servers for 30 days, so please be sure to download them before they
            expire.
          </p>
        </details>
        <SharedQueryParamsProvider params={{jobId: SharedTextQueryParam("")}}>
          <SourmashForm catalogueID={catalogueID} />
          <SourmashResults addToStorage={addToStorage} />
          <SourmashHistory jobs={jobs} removeFromStorage={removeFromStorage} />
        </SharedQueryParamsProvider>
      </section>
    </section>
  );
};

export default SourmashSearch;
