import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import TruncatedText from 'components/UI/TextTruncated';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { getBiomeIcon } from 'utils/biomes';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const initialPageSize = 10;

type AssociatedStudiesProps = {
  rootEndpoint: string;
};
const AssociatedStudies: React.FC<AssociatedStudiesProps> = ({
  rootEndpoint,
}) => {
  const accession = useURLAccession();

  const [studiesPage] = useQueryParamState('studies-page', 1, Number);
  const [studiesPageSize] = useQueryParamState(
    'studies-page_size',
    initialPageSize,
    Number
  );
  const [studiesOrder] = useQueryParamState('studies-order', '');
  const { data, loading, error, isStale, downloadURL } = useMGnifyData(
    `${rootEndpoint}/${accession}/studies`,
    {
      page: studiesPage as number,
      ordering: studiesOrder as string,
      page_size: studiesPageSize as number,
    }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;
  if (!(data.data as MGnifyDatum[]).length) return null;

  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (study) => study.relationships.biomes.data?.[0]?.id,
      Cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
          style={{ float: 'initial' }}
        />
      ),
      className: 'mg-biome',
    },
    {
      id: 'study',
      Header: 'Study accession',
      accessor: 'id',
      Cell: ({ cell }) => (
        <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Name',
      accessor: 'attributes.study-name',
    },
    {
      Header: 'Abstract',
      accessor: 'attributes.study-abstract',
      Cell: ({ cell }) => <TruncatedText text={(cell.value as string) || ''} />,
    },
    {
      Header: 'Samples Count',
      accessor: 'attributes.samples-count',
    },
    {
      id: 'last_update',
      Header: 'Last Updated',
      accessor: 'attributes.last-update',
      Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
    },
  ];
  const showPagination = (data.meta?.pagination?.count || 1) > initialPageSize;

  return (
    <EMGTable
      cols={columns}
      data={data as MGnifyResponseList}
      initialPage={(studiesPage as number) - 1}
      initialPageSize={initialPageSize}
      className="mg-studies-table"
      loading={loading}
      isStale={isStale}
      namespace="studies-"
      showPagination={showPagination}
      downloadURL={downloadURL}
    />
  );
};

export default AssociatedStudies;
