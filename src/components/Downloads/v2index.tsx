import React, { useContext, useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { MGnifyDatum } from 'hooks/data/useData';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

type DownloadsProps = {};

const Downloads: React.FC<DownloadsProps> = ({}) => {
  const { overviewData } = useContext(AnalysisContext);
  const downloads = overviewData?.downloads;
  console.log('downloads from here ', downloads);
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'long_description',
      },
      // TODO: check if compression is still a thing
      // {
      //   Header: 'Compression',
      //   accessor: 'compression',
      //   Cell: ({ cell }) => {
      //     return cell.value ? 'Yes' : '-';
      //   },
      // },
      {
        Header: 'Format',
        accessor: 'file_type',
      },
      {
        Header: 'Action',
        accessor: 'url',
        Cell: ({ cell }) => (
          <a
            href={cell.value}
            className="vf-button vf-button--link"
            style={{ whiteSpace: 'nowrap' }}
            download
          >
            <span className="icon icon-common icon-download" /> Download
          </a>
        ),
      },
    ],
    []
  );

  // if (loading) return <Loading size="large" />;
  // if (error) return <FetchError error={error} />;
  // if (!downloads) return <Loading />;

  const categories = {};

  downloads.forEach((download) => {
    if (!categories[download.download_type as string]) {
      categories[download.download_type as string] = [];
    }
    categories[download.download_type as string].push(download);
  });

  return (
    <div className="vf-stock">
      {Object.entries(categories).map(([category, downloadsList]) => (
        <section key={category}>
          <EMGTable
            cols={columns}
            data={downloadsList as Array<MGnifyDatum>}
            Title={category}
            loading={false}
            showPagination={false}
          />
          <hr />
        </section>
      ))}
    </div>
  );
};

export default Downloads;