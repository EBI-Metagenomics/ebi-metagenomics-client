import React from 'react';
import { Download } from 'interfaces/index';
import { flatMap, groupBy } from 'lodash-es';

type SummaryProps = {
  downloads: Download[];
};

const SummaryTab: React.FC<SummaryProps> = ({ downloads }) => {
  return (
    <section>
      <p>
        In this section you can download the different results matrix files
        summarising the study. Each downloadable file contains an aggregation of
        the analysis results from the individual study&apos;s runs. To visualise
        and download the analysis results for individual runs, please access
        their respective pages.
      </p>
      <ul className="vf-list">
        {flatMap(
          groupBy(downloads, (dl) => dl.download_group.split('.')[1]),
          (downloadsForPipeline, pipeline) => (
            <li key={pipeline} className="vf-list__item mg-list__item">
              <h4>Pipeline version: {pipeline}</h4>
              <ul className="vf-list">
                {downloadsForPipeline.map((download) => (
                  <li
                    key={download.alias}
                    className="vf-list__item mg-list__item"
                  >
                    <a href={download.url} download>
                      <span className="icon icon-common icon-download" />{' '}
                      {download.alias}
                    </a>
                    : <span>{download.short_description}</span>
                  </li>
                ))}
              </ul>
              <hr />
            </li>
          )
        )}
      </ul>
    </section>
  );
};

export default SummaryTab;
