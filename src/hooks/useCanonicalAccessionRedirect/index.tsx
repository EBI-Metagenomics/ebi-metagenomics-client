import useURLAccession from '@/hooks/useURLAccession';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import { useNavigate } from 'react-router-dom';
import { EnaDerivedObject } from 'interfaces/index';

const useCanonicalAccessionRedirect = (
  data: MGnifyResponseObj | EnaDerivedObject
) => {
  const urlAccession = useURLAccession();
  const navigate = useNavigate();

  if (!data) return;
  if (!urlAccession) return;

  const dataAccession =
    (data as unknown as MGnifyResponseObj)?.data?.id ||
    (data as EnaDerivedObject).accession;

  if (
    dataAccession &&
    dataAccession.toUpperCase() !== urlAccession.toUpperCase()
  ) {
    navigate(window.location.pathname.replace(urlAccession, dataAccession));
  }
};

export default useCanonicalAccessionRedirect;
