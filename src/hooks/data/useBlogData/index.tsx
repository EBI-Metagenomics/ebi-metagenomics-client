import useData, { DataResponse, BlogResponse } from 'hooks/data/useData';
import config from 'config.json';

interface BlogDataResponse extends DataResponse {
  data: BlogResponse;
}

const useBlogData: (resource: string) => BlogDataResponse = (resource) => {
  const data = useData(
    [null, undefined].includes(resource) ? null : `${config.blog}${resource}`
  );
  return data as BlogDataResponse;
};

export default useBlogData;
