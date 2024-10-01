import React, { ReactElement } from 'react';
import { Status } from '@googlemaps/react-wrapper';
import { ErrorTypes } from '@/hooks/data/useData';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <Loading />;
  if (status === Status.FAILURE)
    return (
      <FetchError
        error={{
          status: 200,
          type: ErrorTypes.OtherError,
          error: status,
        }}
      />
    );
  return null;
};

export default render;
