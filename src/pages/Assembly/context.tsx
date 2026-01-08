import React, { createContext } from 'react';
export const V2AssemblyContext = createContext({
  assemblyData: null as {
    accession: string;
    run_accession?: React.ReactNode;
    genome_links: any[];
    sample_accession: string;
  } | null,
  loading: false as boolean,
  error: null as { error: unknown; type: any } | null,
  refetch: async () => {},
  genomeLinksLastUpdated: null as string | null,
});

export default V2AssemblyContext;
