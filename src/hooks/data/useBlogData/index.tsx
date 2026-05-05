import { useContext, useEffect, useState } from 'react';
import { BlogResponse } from '@/hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
import { isNil } from 'lodash-es';
import axios from 'axios';
import { useBoolean } from 'react-use';

interface BlogDataResponse {
  data: BlogResponse;
  error?: any;
  loading: boolean;
}

const useBlogData: (resource: string) => BlogDataResponse = (resource) => {
  const { config } = useContext(UserContext);
  const [isLoading, setIsLoading] = useBoolean(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState<BlogResponse>({});

  useEffect(() => {
    if (isNil(resource)) return;
    axios
      .get(`${config.blog}${resource}`)
      .then((response) => {
        setData(response.data);
        setIsLoading(false);
        setError(null);
      })
      .catch((axiosError) => setError(axiosError))
      .finally(() => setIsLoading(false));
  }, [config.blog, resource, setIsLoading]);

  return { data, error, loading: isLoading } as BlogDataResponse;
};

export default useBlogData;
