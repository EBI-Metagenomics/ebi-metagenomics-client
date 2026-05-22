import React, { createContext } from 'react';
import { ErrorFromFetch } from 'hooks/data/useData';
export const V2AssemblyContext = createContext({
  assemblyData: null as {
    accession: string;
    run_accession?: React.ReactNode;
    genome_links: any[];
    sample_accession: string;
  } | null,
  loading: false as boolean,
  error: null as ErrorFromFetch | null,
  refetch: async () => {},
  genomeLinksLastUpdated: null as string | null,
});

export default V2AssemblyContext;
