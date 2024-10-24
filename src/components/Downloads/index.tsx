import React, { useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';

type DownloadsProps = {
  endpoint: string;
  accession: string;
};
const Downloads: React.FC<DownloadsProps> = ({ endpoint, accession }) => {
  const { data, loading, error } = useMGnifyData(
    `${endpoint}/${accession}/downloads`,
    {
      page_size: 100,
    }
  );
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'attributes.description.description',
      },
      {
        Header: 'Compression',
        accessor: 'attributes.file-format.compression',
        Cell: ({ cell }) => (cell.value ? 'Yes' : '-'),
      },
      {
        Header: 'Format',
        accessor: 'attributes.file-format.name',
      },
      {
        Header: 'Action',
        accessor: 'links.self',
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
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const categories = {};

  (data as MGnifyResponseList).data.forEach((download) => {
    if (!categories[download.attributes['group-type'] as string]) {
      categories[download.attributes['group-type'] as string] = [];
    }
    categories[download.attributes['group-type'] as string].push(download);
  });
  return (
    <div className="vf-stock">
      {Object.entries(categories).map(([category, downloads]) => (
        <section key={category}>
          <EMGTable
            cols={columns}
            data={downloads as Array<MGnifyDatum>}
            Title={category}
            loading={loading}
            showPagination={false}
          />
          <hr />
        </section>
      ))}
    </div>
  );
};

export default Downloads;
