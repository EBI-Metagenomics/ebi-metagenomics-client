import useURLAccession from '@/hooks/useURLAccession';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import { useLocation, useNavigate } from 'react-router-dom';

const useCanonicalAccessionRedirect = (data: MGnifyResponseObj) => {
  const urlAccession = useURLAccession();
  const navigate = useNavigate();
  const location = useLocation();

  const { pathname } = location;

  if (!data) return;
  if (!urlAccession) return;

  const dataAccession = data.data.id;

  if (
    dataAccession &&
    dataAccession.toUpperCase() !== urlAccession.toUpperCase()
  ) {
    navigate(pathname.replace(urlAccession, dataAccession));
  }
};

export default useCanonicalAccessionRedirect;
