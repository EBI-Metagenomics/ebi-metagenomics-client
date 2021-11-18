import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import TruncatedText from 'components/UI/TextTruncated';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';

const initialPageSize = 10;
const FlagshipTable: React.FC = () => {
  const accession = useURLAccession();
  const [queryParameters] = useQueryParametersState(
    {
      'flagship-page': 1,
      'flagship-page_size': initialPageSize,
      'flagship-order': '',
    },
    {
      'flagship-page': Number,
      'flagship-page_size': Number,
    }
  );
  const { data, loading, error, isStale } = useMGnifyData(
    `super-studies/${accession}/flagship-studies`,
    {
      page: queryParameters['flagship-page'] as number,
      ordering: queryParameters['flagship-order'] as string,
      page_size: queryParameters['flagship-page_size'] as number,
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

  return (
    <details>
      <summary>
        <b>Flagship Projects</b>
      </summary>
      <EMGTable
        cols={columns}
        data={data as MGnifyResponseList}
        initialPage={(queryParameters['flagship-page'] as number) - 1}
        initialPageSize={initialPageSize}
        className="mg-anlyses-table"
        loading={loading}
        isStale={isStale}
        namespace="flagship-"
      />
    </details>
  );
};

export default FlagshipTable;
