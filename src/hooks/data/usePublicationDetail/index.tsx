import UserContext from 'pages/Login/UserContext';
import { useContext } from 'react';

import {
  PublicationDetail,
  PublicationEuropePmcCore,
  PublicationEuropePmcAnnotations,
} from 'interfaces/index';
import useApiData from 'hooks/data/useApiData';
import axios from 'axios';

const usePublicationDetail = (pubmedId: number) => {
  const { config } = useContext(UserContext);

  const url = `${config.api_v2}publications/${pubmedId}`;

  const abstractGetter = () => {
    const europePmcUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/article/MED/${pubmedId}?format=json&resultType=core`;
    return axios.get<PublicationEuropePmcCore>(europePmcUrl);
  };

  return {
    ...useApiData<PublicationDetail>({ url }),
    abstractGetter,
  };
};

export default usePublicationDetail;

export const usePublicationAnnotations = (pubmedId: number) => {
  const { config } = useContext(UserContext);

  const url = `${config.api_v2}publications/${pubmedId}/annotations`;

  return useApiData<PublicationEuropePmcAnnotations>({ url });
};
