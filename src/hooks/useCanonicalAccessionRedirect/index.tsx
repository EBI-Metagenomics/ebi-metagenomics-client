import useURLAccession from '@/hooks/useURLAccession';
import UserContext from '@/pages/Login/UserContext';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CanonicalAccessionResponse = {
  accession?: string;
};

const isMgnifyStudyAccession = (accession?: string): boolean =>
  Boolean(accession?.startsWith('MGYS'));

const useCanonicalAccessionRedirect = () => {
  const urlAccession = useURLAccession();
  const navigate = useNavigate();
  const { config } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!urlAccession || isMgnifyStudyAccession(urlAccession)) {
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();
    const canonicalAccessionUrl = `${
      config.api_v2
    }studies/insdc/${encodeURIComponent(urlAccession)}`;

    setLoading(true);

    const lookupCanonicalAccession = async () => {
      try {
        const response = await axios.get<CanonicalAccessionResponse>(
          canonicalAccessionUrl,
          { signal: abortController.signal }
        );
        const accession = response.data.accession;

        if (isMgnifyStudyAccession(accession)) {
          navigate(`/studies/${accession}`, { replace: true });
          return;
        }
      } catch {
        if (abortController.signal.aborted) return;
      }

      setLoading(false);
    };

    lookupCanonicalAccession();

    return () => {
      abortController.abort();
    };
  }, [config.api_v2, navigate, urlAccession]);

  return loading;
};

export default useCanonicalAccessionRedirect;
