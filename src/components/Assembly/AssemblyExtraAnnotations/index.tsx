import React, { useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import InfoBanner from 'src/components/UI/InfoBanner';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const initialPageSize = 10;

const AssemblyExtraAnnotations: React.FC = () => {
  const accession = useURLAccession();
  const [assemblyAnnotationsPage] = useQueryParamState(
    'assembly-annotations-page',
    1,
    Number
  );
  const [assemblyAnnotationsPageSize] = useQueryParamState(
    'assembly-annotations-page_size',
    initialPageSize,
    Number
  );
  const { data, loading, isStale, error } = useMGnifyData(
    `assemblies/${accession}/extra-annotations`,
    {
      page: assemblyAnnotationsPage,
      page_size: assemblyAnnotationsPageSize,
    }
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'attributes.alias',
      },
      {
        Header: 'Description',
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

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;
  if (!(data.data as MGnifyDatum[]).length)
    return (
      <InfoBanner type="info" title="Assembly has no additional annotations." />
    );
  const showPagination = (data.meta?.pagination?.count || 1) > initialPageSize;

  return (
    <EMGTable
      Title={
        <div>
          Downloads
          <span className="mg-number">{data.meta?.pagination?.count || 1}</span>
        </div>
      }
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(assemblyAnnotationsPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-assembly-table"
      loading={loading}
      isStale={isStale}
      namespace="assembly-annotations-"
      showPagination={showPagination}
    />
  );
};

export default AssemblyExtraAnnotations;
