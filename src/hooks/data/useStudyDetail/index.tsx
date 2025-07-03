import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import { StudyDetail } from 'interfaces';
import useApiData from 'hooks/data/useApiData';

const useStudyDetail = (accession: string) => {
  const { config } = useContext(UserContext);

  const url = `${config.api_v2}studies/${accession}`;

  return useApiData<StudyDetail>({
    url,
  });
};

export default useStudyDetail;
