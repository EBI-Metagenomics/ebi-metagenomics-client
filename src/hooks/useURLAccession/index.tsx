import { useParams } from 'react-router-dom';

const useURLAccession = (): string | undefined => {
  const { accession } = useParams<{ accession: string }>();
  if (accession) return accession;

  // fallback to last part of route, for legacy compatibility. TODO remove
  let fallback = window?.location?.pathname ?? '';
  if (fallback.trim().endsWith('/')) fallback = fallback.trim().slice(0, -1);
  const parts = fallback.split('/');
  return parts?.[parts.length - 1];
};

export default useURLAccession;
