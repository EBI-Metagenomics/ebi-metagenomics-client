import React from 'react';

import useMGnifyData from '@/hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

type SummaryProps = {
  accession: string;
};
type DownloadResponseType = {
  attributes: {
    'group-type': string;
    description: {
      label: string;
    };
  };
  relationships: {
    pipeline: {
      data: {
        id: string;
      };
    };
  };
  links: {
    self: string;
  };
};
const SummaryTab: React.FC<SummaryProps> = ({ accession }) => {
  const { data, loading, error } = useMGnifyData(
    `studies/${accession}/downloads`
  );
  const pipelines = {};
  ((data?.data as DownloadResponseType[]) || []).forEach((download) => {
    const pipeline = download?.relationships?.pipeline?.data?.id;
    const group = download?.attributes?.['group-type'];
    const label = download?.attributes?.description.label;
    const link = download?.links?.self;
    if (!pipelines[pipeline]) {
      pipelines[pipeline] = {};
    }
    if (!pipelines[pipeline][group]) {
      pipelines[pipeline][group] = [];
    }
    pipelines[pipeline][group].push({
      label,
      link,
    });
  });
  const orderedPipelines = Object.entries(pipelines).sort(
    ([a], [b]) => Number(b) - Number(a)
  );
  return (
    <section>
      <p>
        In this section you can download the different results matrix files
        summarising the study. Each downloadable file contains an aggregation of
        the analysis results from the individual study&apos;s runs. To visualise
        and download the analysis results for individual runs, please access
        their respective pages.
      </p>
      {loading && <Loading />}
      {error && <FetchError error={error} />}
      <ul className="vf-list">
        {orderedPipelines.map(([pipeline, groups]) => (
          <li key={pipeline} className="vf-list__item mg-list__item">
            <h4>Pipeline version: {pipeline}</h4>
            <ul className="vf-list">
              {Object.entries(groups).map(([group, links]) => (
                <li key={group} className="vf-list__item mg-list__item">
                  <h6>{group}</h6>
                  <ul className="vf-list">
                    {links.map(({ label, link }) => (
                      <li key={link} className="vf-list__item mg-list__item">
                        <a href={link} download>
                          <span className="icon icon-common icon-download" />{' '}
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <hr />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SummaryTab;
