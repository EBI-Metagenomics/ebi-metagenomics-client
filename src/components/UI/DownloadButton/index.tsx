import React from 'react';
import protectedAxios from 'utils/protectedAxios';
import { AxiosResponse } from 'axios';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

type DownloadButtonProps = {
  downloadLink: string;
};
const DownloadButton: React.FC<DownloadButtonProps> = ({ downloadLink }) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [downloadError, setDownloadError] = React.useState<any | null>(null);
  const downloadFile = () => {
    setLoading(true);
    protectedAxios
      .get<Blob>(downloadLink, {
        responseType: 'blob',
      })
      .then((response: AxiosResponse<Blob>) => {
        const blob = new Blob([response.data], {
          type: response.headers['content-type'],
        });
        const url = URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = url;
        const filename = downloadLink.split('/').pop();
        a.download = filename;
        const body: any = document.getElementsByTagName('body')[0];
        body.appendChild(a);
        a.click();
        body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setLoading(false);
      })
      .catch((error) => {
        setDownloadError(error);
        setLoading(false);
      });
  };
  if (loading) return <Loading size="small" />;
  if (downloadError) {
    const errorInstance = {
      status: downloadError.response?.status,
      response: downloadError.response,
      type: 0,
      error: downloadError.message,
    };
    return <FetchError error={errorInstance} />;
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      href="#"
      className="vf-button vf-button--secondary vf-button--sm"
      style={{ whiteSpace: 'nowrap', marginBottom: '8px' }}
      download
      onClick={(event) => {
        event.preventDefault();
        downloadFile();
      }}
    >
      <span className="icon icon-common icon-download" /> Download
    </a>
  );
};
export default DownloadButton;
