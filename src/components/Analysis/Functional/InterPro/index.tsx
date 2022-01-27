import React, { useContext, useState } from 'react';
import { Row } from 'react-table';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';
import EMGTable from 'components/UI/EMGTable';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { TAXONOMY_COLOURS } from 'utils/taxon';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import ExtLink from 'components/UI/ExtLink';
import InterProMatchesChart from './InterProMatchesChart';
import InterProQCChart from './QCChart';

const PAGE_SIZE = 25;
const InterPro: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [total, setTotal] = useState(-1);
  const [colorMap, setColorMap] = useState(new Map());
  const [selectedName, setSelectedName] = useState(null);
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      page_size: PAGE_SIZE,
      order: '',
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const { data, loading, error, isStale } = useMGnifyData(
    `analyses/${overviewData.id}/interpro-identifiers`,
    {
      page: queryParameters.page as number,
      ordering: queryParameters.order as string,
      page_size: queryParameters.page_size as number,
    }
  );
  const columns = [
    {
      id: 'color',
      Header: '',
      accessor: 'attributes.accession',
      Cell: ({ cell }) => (
        <div
          style={{
            width: '1rem',
            height: '1rem',
            display: 'inline-block',
            backgroundColor:
              colorMap.get(cell.value) || TAXONOMY_COLOURS.slice(-1)[0],
            verticalAlign: 'sub',
            border: '1px solid white',
          }}
        >
          &nbsp;
        </div>
      ),
    },
    {
      id: 'name',
      Header: 'Entry name',
      accessor: 'attributes.description',
    },
    {
      id: 'accession',
      Header: 'ID',
      accessor: 'attributes.accession',
      Cell: ({ cell }) => (
        <ExtLink
          href={`http://www.ebi.ac.uk/interpro/entry/interpro/${cell.value}`}
        >
          {cell.value}
        </ExtLink>
      ),
    },
    {
      Header: 'pCDS matched',
      accessor: 'attributes.count',
    },
    {
      id: 'percentage',
      Header: '%',
      accessor: 'attributes.count',
      Cell: ({ cell }) =>
        total === -1 ? (
          <Loading size="small" />
        ) : (
          ((100 * cell.value) / total).toFixed(2)
        ),
    },
  ];
  const handleMouseEnterRow = (row: Row): void =>
    setSelectedName(row.values.name);
  const handleMouseLeaveRow = (): void => setSelectedName(null);
  return (
    <div className="vf-stack">
      <div>
        <InterProQCChart />
      </div>
      <h5>InterPro match summary</h5>
      <div className="vf-grid mg-grid-30-70">
        <div>
          <InterProMatchesChart
            selectedName={selectedName}
            onTotalChange={(newTotal) => setTotal(newTotal)}
            onMatchesChange={(matches) => {
              setColorMap(
                new Map(
                  matches.map(({ accession }, i) => [
                    accession,
                    TAXONOMY_COLOURS[i],
                  ])
                )
              );
            }}
          />
        </div>
        {loading && !isStale && <Loading />}
        {!loading && error && <FetchError error={error} />}
        {data && !error && (
          <EMGTable
            cols={columns}
            data={data}
            initialPageSize={PAGE_SIZE}
            initialPage={(queryParameters.page as number) - 1}
            className="mg-anlyses-table"
            loading={loading}
            isStale={isStale}
            onMouseEnterRow={handleMouseEnterRow}
            onMouseLeaveRow={handleMouseLeaveRow}
            showPagination
          />
        )}
      </div>
    </div>
  );
};

export default InterPro;
