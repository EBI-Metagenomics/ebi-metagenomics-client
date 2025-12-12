import { useContext } from 'react';
import useData, { DataResponse, BlogResponse } from '@/hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
import { isNil } from 'lodash-es';

interface BlogDataResponse extends DataResponse {
  data: BlogResponse;
}

const useBlogData: (resource: string) => BlogDataResponse = (resource) => {
  const { config } = useContext(UserContext);
  const data = useData(isNil(resource) ? null : `${config.blog}${resource}`);
  return data as BlogDataResponse;
};

export default useBlogData;
