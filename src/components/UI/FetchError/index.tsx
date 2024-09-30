import React from 'react';
import { ErrorFromFetch, ErrorTypes } from 'hooks/data/useData';

const refreshPage = (): void => {
  window.location.reload();
};

const getHumanReadableErrorMessages = (error: ErrorFromFetch): string => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const errorStatusCode = error.error.response?.status || error.error.code;
  switch (errorStatusCode) {
    case 404:
      return '404: The requested resource could not be found.';
    case 500:
      return '500: The server encountered an error.';
    default:
      return `${errorStatusCode}: An error occurred.`;
  }
};

const FetchError: React.FC<{ error: ErrorFromFetch }> = ({ error }) => {
  if (!error || error.type === ErrorTypes.NullURL) return null;
  return (
    <div
      className="vf-box vf-box-theme--primary vf-box--easy"
      style={{
        backgroundColor: 'lemonchiffon',
      }}
    >
      <h3 className="vf-box__heading">
        <span className="icon icon-common icon-exclamation-triangle" /> Error
        Fetching Data
      </h3>
      <p className="vf-box__text">
        {error?.type === ErrorTypes.FetchError &&
          `There were problems with the request. ${getHumanReadableErrorMessages(
            error
          )}`}
        {error?.type === ErrorTypes.NotOK &&
          `The response from the server was not OK [Status: ${error.status}].`}
        {error?.type === ErrorTypes.JSONError &&
          `The recovered resource didn't follow the expected format [${error.error}].`}
      </p>
      <details className="vf-details" open>
        <summary className="vf-details--summary">Advanced</summary>
        Request endpoint: {error.error.request.responseURL || error.error.config.url}
      </details>
      <div className="mg-right">
        <button
          type="button"
          className="vf-button vf-button--tertiary vf-button--sm "
          onClick={refreshPage}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default FetchError;
