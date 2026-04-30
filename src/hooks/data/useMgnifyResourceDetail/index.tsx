import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import useApiData from 'hooks/data/useApiData';

const useMgnifyResourceDetail = <T,>(resource: string, id: string | number) => {
  const { config } = useContext(UserContext);

  const url = `${config.api_v2}${resource}/${id}`;

  return useApiData<T>({
    url,
  });
};

export default useMgnifyResourceDetail;
