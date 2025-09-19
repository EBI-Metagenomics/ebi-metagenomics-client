import useURLAccession from '@/hooks/useURLAccession';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnaDerivedObject } from 'interfaces';

const useCanonicalAccessionRedirect = (
  data: MGnifyResponseObj | EnaDerivedObject
) => {
  const urlAccession = useURLAccession();
  const navigate = useNavigate();
  const location = useLocation();

  const { pathname } = location;

  if (!data) return;
  if (!urlAccession) return;

  const dataAccession =
    (data as unknown as MGnifyResponseObj)?.data?.id ||
    (data as EnaDerivedObject).accession;

  if (
    dataAccession &&
    dataAccession.toUpperCase() !== urlAccession.toUpperCase()
  ) {
    navigate(pathname.replace(urlAccession, dataAccession));
  }
};

export default useCanonicalAccessionRedirect;
