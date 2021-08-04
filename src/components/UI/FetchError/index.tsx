import React from 'react';
import { ErrorFromFetch, ErrorTypes } from 'hooks/useMGnifyData';

const refreshPage = (): void => {
  window.location.reload();
};

const FetchError: React.FC<{ error: ErrorFromFetch }> = ({ error }) => {
  if (error.type === ErrorTypes.NullURL) return null;
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
          `There were problems with the request. [${error.error}]`}
        {error?.type === ErrorTypes.NotOK &&
          `The response from the server was not OK [Status: ${error.status}].`}
        {error?.type === ErrorTypes.JSONError &&
          `The recovered resource didn't follow the expected format [${error.error}].`}
      </p>
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
