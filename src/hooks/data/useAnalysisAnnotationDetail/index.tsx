import UserContext from 'pages/Login/UserContext';
import { useContext, useMemo } from 'react';
import { AnalysisDetailWithAnnotations } from 'interfaces';
import { KeyValue } from 'hooks/data/useData';
import useApiData from 'hooks/data/useApiData';

const useAnalysisAnnotationDetail = (id: string, parameters: KeyValue = {}) => {
  const { config } = useContext(UserContext);

  const queryString = Object.entries(parameters)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  const url = `${config.api_v2}analyses/${id}/annotations${
    queryString ? `?${queryString}` : ''
  }`;

  const transformResponse = useMemo(() => {
    return (data: AnalysisDetailWithAnnotations) => {
      const lsuTotal =
        data.annotations?.taxonomies?.lsu?.reduce(
          (sum, item) => sum + (item.count || 0),
          0
        ) ?? 0;

      const ssuTotal =
        data.annotations?.taxonomies?.ssu?.reduce(
          (sum, item) => sum + (item.count || 0),
          0
        ) ?? 0;

      const itsOneDbTotal =
        data.annotations?.taxonomies?.its_one_db?.reduce(
          (sum, item) => sum + (item.count || 0),
          0
        ) ?? 0;

      const itsUniteTotal =
        data.annotations?.taxonomies?.unite?.reduce(
          (sum, item) => sum + (item.count || 0),
          0
        ) ?? 0;

      return {
        ...data,
        taxonomy_lsu_count: lsuTotal,
        taxonomy_ssu_count: ssuTotal,
        its_one_db_count: itsOneDbTotal,
        its_unite_count: itsUniteTotal,
      };
    };
  }, []);

  return useApiData<AnalysisDetailWithAnnotations>({
    url,
    transformResponse,
  });
};

export default useAnalysisAnnotationDetail;
