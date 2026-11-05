export const getGenomeUrl = (
  accession: string,
  catalogueId?: string | null
): string => {
  const query = catalogueId
    ? `?${new URLSearchParams({ catalogue: catalogueId }).toString()}`
    : '';
  return `/genomes/${accession}${query}`;
};

export const formatCatalogueType = (catalogueType: string) =>
  catalogueType ? catalogueType[0].toUpperCase() + catalogueType.slice(1) : '';

export const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString() : '';

export const genomeBiomeGroupIcons: Record<string, string> = {
  Environmental: 'default_b',
  Engineered: 'engineered_b',
  'Human-associated': 'human_host_b',
  'Non-human host-associated': 'mammals_b',
};
