import React, { useEffect, useState } from 'react';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import axios from 'axios';
import { ErrorTypes } from '@/hooks/data/useData';
import config, { ConfigType } from '@/utils/config';

interface KronaIframeProps {
  url: string;
  title: string;
  height?: string;
  width?: string;
  style?: React.CSSProperties;
  className?: string;
}

const KronaIframe: React.FC<KronaIframeProps> = ({
  url,
  title,
  height = '600px',
  width = '100%',
  style,
  className,
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    axios
      .get(url)
      .then((response) => {
        if (isMounted) {
          let modifiedHtml = response.data;
          if (typeof modifiedHtml === 'string') {
            const { kronaJsPath } = config as ConfigType;
            modifiedHtml = modifiedHtml.replace(
              /src="\/metagenomics\/js\/krona-2.0-customized.js"/g,
              `src="${kronaJsPath}"`
            );
            // Also handle cases where it might be slightly different or using single quotes
            modifiedHtml = modifiedHtml.replace(
              /src=['"]\/metagenomics\/js\/krona-2.0-customized.js['"]/g,
              `src="${kronaJsPath}"`
            );
          }
          setHtml(modifiedHtml);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError({
            type: ErrorTypes.FetchError,
            error: err,
          });
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;

  return (
    <iframe
      title={title}
      srcDoc={html || ''}
      width={width}
      height={height}
      style={{ border: 'none', ...style }}
      className={className}
    />
  );
};

export default KronaIframe;
