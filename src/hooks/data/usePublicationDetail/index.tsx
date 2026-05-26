import {
  PublicationDetail,
  PublicationEuropePmcCore,
  PublicationEuropePmcAnnotations,
} from '@/interfaces';
import useMgnifyResourceDetail from 'hooks/data/useMgnifyResourceDetail';
import axios from 'axios';

const usePublicationDetail = (pubmedId: number) => {
  const abstractGetter = () => {
    const europePmcUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/article/MED/${pubmedId}?format=json&resultType=core`;
    return axios.get<PublicationEuropePmcCore>(europePmcUrl);
  };

  return {
    ...useMgnifyResourceDetail<PublicationDetail>('publications', pubmedId),
    abstractGetter,
  };
};

export default usePublicationDetail;

export const usePublicationAnnotations = (pubmedId: number) => {
  return useMgnifyResourceDetail<PublicationEuropePmcAnnotations>(
    'publications',
    `${pubmedId}/annotations`
  );
};
