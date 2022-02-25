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
        <summary>
          <h4 style={{ display: 'inline', cursor: 'pointer' }}>
            Search History
          </h4>
        </summary>
        <div>
          <p>Here is a list of previous searches in this catalog:</p>
          <div className="genome-search-history">
            {jobs.size === 0 ? (
              "We can't find any previous search jobs in this browser."
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
          <p className="small">
            <b>Notice</b>: Results are only kept in our servers for 30 days.
          </p>
        </div>
      </details>
    </section>
  );
};
export default SourmashHistory;
