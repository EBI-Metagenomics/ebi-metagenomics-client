import { useState, useEffect } from 'react';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyDatum, ErrorFromFetch } from '@/hooks/data/useData';

type SampleProviderResponse = {
  samples: MGnifyDatum[];
  total: number | null;
  loading: boolean;
  error: ErrorFromFetch;
};
const useSamplesProvider = (
  study: string,
  limit?: number
): SampleProviderResponse => {
  const [page, setPage] = useState(1);
  const [samples, setSamples] = useState<MGnifyDatum[]>([]);
  const [total, setTotal] = useState(null);
  const { data, isStale, loading, error } = useMGnifyData('samples', {
    study_accession: study,
    page,
  });
  useEffect(() => {
    if (data?.data && !isStale && page === data?.meta?.pagination?.page) {
      const aggregatedSamples = [...samples, ...(data.data as MGnifyDatum[])];
      setSamples(aggregatedSamples);
      const totalInResponse = data?.meta?.pagination?.count;
      if (total !== totalInResponse && typeof totalInResponse === 'number') {
        setTotal(totalInResponse);
      }
      if (data?.links?.next && aggregatedSamples.length < limit) {
        setPage(page + 1);
      }
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [data, page, limit]);
  useEffect(() => {
    if (data?.links?.next && samples.length < limit) {
      setPage(page + 1);
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [limit]);

  return { samples, total, loading, error };
};

export default useSamplesProvider;
