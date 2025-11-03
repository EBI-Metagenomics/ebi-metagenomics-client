import { useState, useEffect } from 'react';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyDatum, ErrorFromFetch } from '@/hooks/data/useData';

export type InterProCountType = {
  accession?: string;
  name: string;
  matches: number;
};
type InterProMatchesProviderResponse = {
  matches: InterProCountType[];
  total: number;
  processed: number;
  loading: boolean;
  error?: ErrorFromFetch;
};
const useInterProMatchesProvider = (
  accession?: string,
  limit = Infinity
): InterProMatchesProviderResponse => {
  const [page, setPage] = useState(1);
  const [fetchedAllOrLimit, setFetchedAllOrLimit] = useState(false);
  const [matches, setMatches] = useState<Array<InterProCountType>>([]);
  const [processed, setProcessed] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const { data, isStale, loading, error } = useMGnifyData(
    accession && `analyses/${accession}/interpro-identifiers`,
    {
      page,
    }
  );
  useEffect(() => {
    if (data?.data && !isStale && page === data?.meta?.pagination?.page) {
      const other = matches.length
        ? matches.slice(-1)
        : [{ name: 'Others', matches: 0 }];

      const newMatches: InterProCountType[] = matches.length
        ? []
        : (data.data as MGnifyDatum[]).slice(0, 10).map(({ attributes }) => ({
            accession: attributes.accession as string,
            name: attributes.description as string,
            matches: attributes.count as number,
          }));
      other[0].matches += (data.data as MGnifyDatum[])
        .slice(matches.length ? 0 : 10)
        .reduce((agg, { attributes }) => agg + Number(attributes.count), 0);
      const aggregatedMatches = [
        ...matches.slice(0, -1),
        ...newMatches,
        ...other,
      ];
      setMatches(aggregatedMatches);
      setProcessed(processed + (data.data as MGnifyDatum[]).length);
      const totalInResponse = data?.meta?.pagination?.count;
      if (total !== totalInResponse && typeof totalInResponse === 'number') {
        setTotal(totalInResponse);
      }
      if (data?.links?.next && aggregatedMatches.length < limit) {
        setPage(page + 1);
        setFetchedAllOrLimit(false);
      } else {
        setFetchedAllOrLimit(true);
      }
    }
  }, [data, page, limit]);
  useEffect(() => {
    if (data?.links?.next && matches.length < limit) {
      setPage(page + 1);
    }
  }, [limit]);
  return {
    matches,
    processed,
    total,
    loading: loading || !fetchedAllOrLimit,
    error: error || undefined,
  };
};

export default useInterProMatchesProvider;
