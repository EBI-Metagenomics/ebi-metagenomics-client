import React, { useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import InfoBanner from 'src/components/UI/InfoBanner';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import ROCrateBrowser from 'components/UI/ROCrateBrowser';

type ExtraAnnotationsProps = {
  namespace: string;
};

const initialPageSize = 10;

const singularise = (str: string) => {
  const lastTwoChars = str.slice(-2);
  const singularForm =
    lastTwoChars === 'es' ? `${str.slice(0, -2)}y` : str.slice(0, -1);
  return singularForm;
};

const ExtraAnnotations: React.FC<ExtraAnnotationsProps> = ({ namespace }) => {
  const singularNamespace = singularise(namespace);
  const accession = useURLAccession();
  const [annotationsPage] = useQueryParamState(
    `${singularNamespace}-annotations-page`,
    1,
    Number
  );
  const [annotationsPageSize] = useQueryParamState(
    `${singularNamespace}-annotations-page-size`,
    initialPageSize,
    Number
  );

  const { data, loading, isStale, error } = useMGnifyData(
    `${namespace}/${accession}/extra-annotations`,
    {
      page: annotationsPage,
      page_size: annotationsPageSize,
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
          <span className="vf-text-body vf-text-body--4">
            {cell.row.original.attributes.description.label ===
              'Analysis RO Crate' && (
              <ROCrateBrowser useButtonVariant crateUrl={cell.value} />
            )}
            <a
              href={cell.value}
              className="vf-button vf-button--sm vf-button--secondary"
              style={{ whiteSpace: 'nowrap' }}
              download
            >
              <span className="icon icon-common icon-download" /> Download
            </a>
          </span>
        ),
      },
    ],
    []
  );

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;
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
      namespace={namespace}
      showPagination={showPagination}
    />
  );
};

export default ExtraAnnotations;
