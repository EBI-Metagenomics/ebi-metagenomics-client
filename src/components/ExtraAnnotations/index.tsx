import React, { useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import InfoBanner from 'src/components/UI/InfoBanner';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import ROCratePreview from 'components/IGV/ROCrateTrack';

type ExtraAnnotationsProps = {
  annotationsPageProp: string;
  annotationsPageSizeProp: string;
  namespace: string;
  entityName: string;
};

const initialPageSize = 10;

const ExtraAnnotations: React.FC<ExtraAnnotationsProps> = ({
  annotationsPageProp,
  annotationsPageSizeProp,
  namespace,
  entityName,
}) => {
  const accession = useURLAccession();
  // const accession = 'ERZ8153470';
  const [annotationsPage] = useQueryParamState(annotationsPageProp, 1, Number);
  const [annotationsPageSize] = useQueryParamState(
    annotationsPageSizeProp,
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
          <>
            {cell.row.original.attributes.description.label ===
              'Analysis RO Crate' && (
              <ROCratePreview
                crateUrl={cell.value}
                useButtonVariant
                specificCrateFolder={`motus_${accession}`}
              />
            )}
            <a
              href={cell.value}
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

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;
  if (!(data.data as MGnifyDatum[]).length)
    return (
      <InfoBanner
        type="info"
        title={`The ${entityName} has no additional annotations.`}
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
