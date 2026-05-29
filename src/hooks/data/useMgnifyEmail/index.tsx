import useData, { DataResponse, ResponseFormat } from '@/hooks/data/useData';
import { useCallback, useState } from 'react';

export type AnalysisRequest = {
  study_accession: string;
  request_type: string;
  analysis_type: string;
  comments?: string;
};

export interface AnalysisResponse extends DataResponse {
  data: {
    message: string;
  };
}

const useMgnifyEmail = (): {
  submit: (request: AnalysisRequest) => void;
  data: AnalysisResponse['data'] | null;
  loading: boolean;
  error: AnalysisResponse['error'];
} => {
  const [request, setRequest] = useState<AnalysisRequest | null>(null);
  const { data, loading, error } = useData(
    request ? '/my-data/request' : null,
    ResponseFormat.JSON,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  const submit = useCallback((req: AnalysisRequest) => {
    setRequest(req);
  }, []);

  return {
    submit,
    data: data as AnalysisResponse['data'] | null,
    loading,
    error,
  };
};

export default useMgnifyEmail;
