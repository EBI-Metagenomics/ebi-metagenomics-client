import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import useApiData from '@/hooks/data/useApiData';
import { ViralCatalogue } from '@/interfaces';
import UserContext from 'pages/Login/UserContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

const Viruses: React.FC = () => {
  const { config } = useContext(UserContext);
  const { data, loading, error } = useApiData<ViralCatalogue>({
    url: `${config.api_v2}viruses/catalogues/latest`,
  });
  if (error) return <FetchError error={error} />;
  if (loading || !data) return <Loading />;
  return <Navigate to={`/viruses/${data.catalogue_id}`} replace />;
};
export default Viruses;
