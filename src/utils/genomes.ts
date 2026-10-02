export const getGenomeUrl = (
  accession: string,
  catalogueId?: string | null
): string => {
  const query = catalogueId
    ? `?${new URLSearchParams({ catalogue: catalogueId }).toString()}`
    : '';
  return `/genomes/${accession}${query}`;
};
