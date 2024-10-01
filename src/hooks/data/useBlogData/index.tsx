import { useContext } from 'react';
import useData, { DataResponse, BlogResponse } from '@/hooks/data/useData';
import UserContext from '@/pages/Login/UserContext';

interface BlogDataResponse extends DataResponse {
  data: BlogResponse;
}

const useBlogData: (resource: string) => BlogDataResponse = (resource) => {
  const { config } = useContext(UserContext);
  const data = useData(
    [null, undefined].includes(resource) ? null : `${config.blog}${resource}`
  );
  return data as BlogDataResponse;
};

export default useBlogData;
