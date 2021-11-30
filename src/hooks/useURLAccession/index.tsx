import { useLocation } from 'react-router-dom';

const useURLAccession = (): string | undefined => {
  const location = useLocation();
  let { pathname } = location;
  if (pathname.trim().endsWith('/')) pathname = pathname.trim().slice(0, -1);
  const parts = pathname.split('/');
  return parts?.[parts.length - 1];
};

export default useURLAccession;
