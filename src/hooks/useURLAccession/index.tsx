import { useLocation } from 'react-router-dom';

const useURLAccession = (): string | undefined => {
  const location = useLocation();
  const parts = location.pathname.split('/');
  return parts?.[parts.length - 1];
};

export default useURLAccession;
