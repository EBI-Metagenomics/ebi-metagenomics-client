import React from 'react';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

type HistoryProps = {
  jobs: Map<string, { time: number }>;
  removeFromStorage: (jobID: string) => void;
};

const SourmashHistory: React.FC<HistoryProps> = ({
  jobs,
  removeFromStorage,
}) => {
  const [, setJobId] = useQueryParamState('job_id', '');
  return (
    <section>
      <details>
        <summary>Search History</summary>
        <div>
          <div className="genome-search-history">
            {jobs.size === 0 ? (
              <div
                className="vf-box vf-box-theme--primary vf-box--easy"
                style={{
                  backgroundColor: '#d1e3f6',
                }}
              >
                <h3 className="vf-box__heading">
                  <span className="icon icon-common icon-exclamation-triangle" />{' '}
                  No search history found
                </h3>
                <p className="vf-box__text">
                  Search jobs are stored in your web browser, so if you open
                  this website in a different browser or computer, or clear your
                  browser history, you won’t see old searches.
                </p>
              </div>
            ) : (
              <ul>
                {Array.from(jobs.keys()).map((j) => (
                  <li key={j}>
                    <button
                      type="button"
                      className="vf-button vf-button--link mg-button-as-link"
                      onClick={() => setJobId(j)}
                    >
                      {j}
                    </button>
                    <button
                      type="button"
                      className="vf-button--outline vf-button--sm "
                      onClick={() => {
                        removeFromStorage(j);
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="vf-text-body vf-text-body--4">
            Results are only kept in our servers for 30 days.
          </p>
        </div>
      </details>
    </section>
  );
};
export default SourmashHistory;
