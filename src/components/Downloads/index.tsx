import React, { useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from '@/hooks/data/useData';

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
        header: 'Name',
        accessorKey: 'attributes.description.description',
      },
      {
        header: 'Compression',
        accessorKey: 'attributes.file-format.compression',
        cell: ({ cell }) => <>{cell.getValue() ? 'Yes' : '-'}</>,
      },
      {
        header: 'Format',
        accessorKey: 'attributes.file-format.name',
      },
      {
        header: 'Action',
        accessorKey: 'links.self',
        cell: ({ cell }) => (
          <a
            href={cell.getValue()}
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
