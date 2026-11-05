import React, { useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import InfoBanner from 'components/UI/InfoBanner';
import { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import ROCrateBrowser from 'components/UI/ROCrateBrowser';
import { singularise } from '@/utils/strings';

type ExtraAnnotationsProps = {
  namespace: string;
};

const initialPageSize = 10;

const { useAnnotationsPage, useAnnotationsPageSize, withQueryParamProvider } =
  createSharedQueryParamContextForTable('annotations', {}, initialPageSize);

const ExtraAnnotations: React.FC<ExtraAnnotationsProps> = ({ namespace }) => {
  const singularNamespace = singularise(namespace);
  const accession = useURLAccession();
  const [annotationsPage] = useAnnotationsPage<number>();
  const [annotationsPageSize] = useAnnotationsPageSize<number>();

  const { data, isStale, error } = useMGnifyData(
    `${namespace}/${accession}/extra-annotations`,
    {
      page: annotationsPage,
      page_size: annotationsPageSize,
    }
  );

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'attributes.alias',
      },
      {
        header: 'Description',
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
          <>
            {cell.row.original.attributes.description.label ===
              'Analysis RO Crate' && (
              <ROCrateBrowser useButtonVariant crateUrl={cell.getValue()} />
            )}
            <a
              href={cell.getValue()}
              className="vf-button vf-button--sm vf-button--secondary"
              style={{ whiteSpace: 'nowrap' }}
              download
            >
              <span className="icon icon-common icon-download" /> Download
            </a>
          </>
        ),
      },
    ],
    []
  );

  const loading = !data;
  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  if (!(data.data as MGnifyDatum[]).length)
    return (
      <InfoBanner
        type="info"
        title={`The ${singularNamespace} has no additional annotations.`}
      />
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
      initialPage={(annotationsPage as number) - 1}
      initialPageSize={initialPageSize}
      className={`mg-${namespace}-table`}
      loading={loading}
      isStale={isStale}
      namespace="annotations"
      showPagination={showPagination}
    />
  );
};

export default withQueryParamProvider(ExtraAnnotations);
