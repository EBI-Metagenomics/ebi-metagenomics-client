import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';

const initialPageSize = 10;
const RelatedTable: React.FC = () => {
  const accession = useURLAccession();
  const [queryParameters] = useQueryParametersState(
    {
      'related-page': 1,
      'related-page_size': initialPageSize,
      'related-order': '',
    },
    {
      'related-page': Number,
      'related-page_size': Number,
    }
  );
  const { data, loading, error, isStale } = useMGnifyData(
    `super-studies/${accession}/related-studies`,
    {
      page: queryParameters['related-page'] as number,
      ordering: queryParameters['related-order'] as string,
      page_size: queryParameters['related-page_size'] as number,
    }
  );
  if (loading && !isStale) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

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
  if (!(data?.data as unknown[])?.length) return null;
  return (
    <details>
      <summary>
        <b>Related Projects</b>
      </summary>
      <EMGTable
        cols={columns}
        data={data as MGnifyResponseList}
        initialPage={(queryParameters['related-page'] as number) - 1}
        initialPageSize={initialPageSize}
        className="mg-anlyses-table"
        loading={loading}
        isStale={isStale}
        namespace="related-"
      />
    </details>
  );
};

export default RelatedTable;
