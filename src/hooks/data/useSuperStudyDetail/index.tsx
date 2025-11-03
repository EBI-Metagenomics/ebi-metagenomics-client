import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { SuperStudyDetail } from 'interfaces/index';
import useApiData from 'hooks/data/useApiData';

const useSuperStudyDetail = (slug: string | undefined) => {
  const { config } = useContext(UserContext);

  const url = slug && `${config.api_v2}super-studies/${slug}`;

  return useApiData<SuperStudyDetail>({
    url,
  });
};

export default useSuperStudyDetail;
