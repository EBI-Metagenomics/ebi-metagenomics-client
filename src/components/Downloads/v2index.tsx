import React, { useContext, useMemo } from 'react';

import EMGTable from 'components/UI/EMGTable';
import { MGnifyDatum } from 'hooks/data/useData';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

interface DownloadsProps {
  downloads?: Array<MGnifyDatum>;
}

const Downloads: React.FC<DownloadsProps> = ({ downloads: propDownloads }) => {
  const { overviewData } = useContext(AnalysisContext);
  const downloads = propDownloads ?? overviewData?.downloads;
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'long_description',
      },
      {
        Header: 'Format',
        accessor: 'file_type',
      },
      {
        Header: 'Acffetion',
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
  const categories = {};

  downloads?.forEach((download) => {
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
