import React, { useEffect, useState } from 'react';
import 'mgnify-sourmash-component';

import { useQueryParametersState } from 'hooks/useQueryParamState';
import useInterval from 'hooks/useInterval';
import useMgnifySourmashStatus from 'hooks/data/useMgnifySourmashStatus';
// import SearchStorage from 'utils/SearchStorage';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import SourmashResultsTable from './Table';

const INTERVAL_TIME = 1000;
const COUNT_TO = 5;
type SourmashResultsProps = {
  catalogueID: string;
  addToStorage: (jobID: string) => void;
};

const SourmashResults: React.FC<SourmashResultsProps> = ({
  catalogueID,
  addToStorage,
}) => {
  const [queryParameters, setQueryParameters] = useQueryParametersState({
    job_id: '',
  });
  const [count, setCount] = useState(-1);
  const [shouldCheck, setShouldCheck] = useState(false);
  const [jobRetrieved, setJobRetrieved] = useState(false);
  const [job, setJob] = useState(null);

  useInterval(() => {
    if (!queryParameters.job_id || jobRetrieved) return;
    if (count % COUNT_TO === 0) {
      setShouldCheck(true);
    }
    setCount((c) => c + 1);
  }, INTERVAL_TIME);
  const { data, error, loading } = useMgnifySourmashStatus(
    shouldCheck && !jobRetrieved ? `status` : '',
    catalogueID,
    queryParameters.job_id as string
  );
  useEffect(() => {
    if (!loading && !error && data) {
      const results = data?.data as Record<string, Array<{ status: string }>>;
      // Got the status of the job
      if (
        !(results?.signatures || []).some((s) =>
          ['PENDING', 'IN_QUEUE', 'RUNNING'].includes(s.status)
        )
      ) {
        setJobRetrieved(true);
        addToStorage(queryParameters.job_id as string);
      }
      setJob(data.data);
      setCount(0);
      setShouldCheck(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, loading]);

  useEffect(() => {
    setJob(null);
    setShouldCheck(true);
    setJobRetrieved(false);
    setCount(-1);
  }, [queryParameters.job_id]);

  const handleNewSearch = (): void => {
    setQueryParameters({
      ...queryParameters,
      job_id: '',
    });
  };
  if (!queryParameters.job_id) return null;
  return (
    <section>
      <div className="vf-stack">
        <div>
          <h4>Search Results</h4>
          <div>
            {jobRetrieved && <p>✅ Here are the results of your Job.</p>}
            {!loading && error && <FetchError error={error} />}
            {!jobRetrieved && !error && (
              <p>🔎 Getting the results of your Job</p>
            )}
          </div>
          <h5>Job Information</h5>
          <dl className="vf-list vf-list--definition">
            <dt>Job ID</dt>
            <dd>{queryParameters.job_id}</dd>
            <dt>Status</dt>
            <dd>
              <span>{jobRetrieved ? 'FINISH' : 'Retrieving'}</span>{' '}
              {loading && <Loading size="small" />}{' '}
              {!jobRetrieved && !loading && (
                <span>Checking status in {COUNT_TO - (count % COUNT_TO)}</span>
              )}
            </dd>
            <dt>Link</dt>
            <dd id="results-link">
              <a href={window.location.href}>{window.location.href}</a>
              {jobRetrieved &&
                job?.signatures.some(({ status }) => status === 'SUCCESS') && (
                  <a
                    className="vf-button vf-button--sm"
                    download={`${job.group_id}.tgz`}
                    href={job.results_url}
                  >
                    <span className="icon icon-common icon-download" />
                    Download all Results [.tgz]
                  </a>
                )}
            </dd>
            {job && (
              <>
                <dt>Processed Files</dt>
                <dd>
                  <SourmashResultsTable
                    results={job.signatures}
                    loading={loading}
                  />
                </dd>
              </>
            )}
          </dl>
        </div>
        <div className="columns text-center">
          <button
            type="button"
            className="vf-button vf-button--sm"
            onClick={handleNewSearch}
          >
            Start a new search
          </button>
        </div>
      </div>
    </section>
  );
};

export default SourmashResults;
