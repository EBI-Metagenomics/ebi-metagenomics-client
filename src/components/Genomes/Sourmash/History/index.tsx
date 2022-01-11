import React from 'react';
import { useQueryParametersState } from 'hooks/useQueryParamState';

type HistoryProps = {
  jobs: Map<string, { time: number }>;
  removeFromStorage: (jobID: string) => void;
};

const SourmashHistory: React.FC<HistoryProps> = ({
  jobs,
  removeFromStorage,
}) => {
  const [queryParameters, setQueryParameters] = useQueryParametersState({
    job_id: '',
  });
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
                {Array.from(jobs.keys()).map((jobID) => (
                  <li key={jobID}>
                    <button
                      type="button"
                      className="vf-button vf-button--link mg-button-as-link"
                      onClick={() =>
                        setQueryParameters({
                          ...queryParameters,
                          job_id: jobID,
                        })
                      }
                    >
                      {jobID}
                    </button>
                    <button
                      type="button"
                      className="vf-button--outline vf-button--sm "
                      onClick={() => {
                        removeFromStorage(jobID);
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
