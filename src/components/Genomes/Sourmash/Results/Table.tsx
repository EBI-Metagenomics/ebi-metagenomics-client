import React, { useMemo } from 'react';
import EMGTable from 'components/UI/EMGTable';
import { Link } from 'react-router-dom';

const emoji = {
  SUCCESS: '✅',
  FAILURE: '❌',
  IN_QUEUE: '🕛',
  NO_RESULTS: '🔸',
  RUNNING: '🏃🏻‍♀️',
};

type SourmashResultsTableProps = {
  results: Array<Record<string, unknown>>;
  loading: boolean;
};
const SourmashResultsTable: React.FC<SourmashResultsTableProps> = ({
  results,
  loading,
}) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Filename',
        accessor: 'filename',
      },
      {
        Header: 'Status',
        accessor: (r) => ({
          status: r.status,
          resultStatus: r.result?.status,
        }),
        Cell: ({ cell }) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {emoji[cell.value.resultStatus || cell.value.status]}{' '}
            {cell.value.resultStatus || cell.value.status}
          </span>
        ),
      },
      {
        id: 'match',
        Header: (
          <>
            Best Match
            <br />
            (% query covered)
          </>
        ),
        accessor: (x) => x,
        Cell: ({ cell }) => {
          if (
            cell.value.status === 'SUCCESS' &&
            cell.value.result?.status === 'NO_RESULTS'
          )
            return "We couldn't find any matches with your query";
          if (cell.value.status === 'IN_QUEUE')
            return `Position: ${cell.value.position_in_queue}`;
          if (
            cell.value.status === 'SUCCESS' &&
            cell.value.result?.status !== 'NO_RESULTS'
          )
            return (
              <span style={{ whiteSpace: 'nowrap' }}>
                <Link to={`/genomes/${cell.value.result.match}`}>
                  {cell.value.result.match}
                </Link>{' '}
                ({cell.value.result.p_query})
              </span>
            );

          return cell.value.reason || null;
        },
        colspan: (cell) =>
          cell.value.status === 'SUCCESS' &&
          cell.value.result?.status !== 'NO_RESULTS'
            ? 1
            : 3,
      },
      {
        Header: 'Total No. of matches',
        accessor: 'result.matches',
      },
      {
        Header: 'Download',
        accessor: (x) => x,
        Cell: ({ cell }) =>
          cell.value.status === 'SUCCESS' &&
          cell.value.result?.status !== 'NO_RESULTS' ? (
            <a
              download={`${cell.value.filename}.csv`}
              href={cell.value.results_url}
            >
              <span className="icon icon-fileformats icon-CSV" />
            </a>
          ) : null,
      },
    ],
    []
  );
  return (
    <EMGTable
      cols={columns}
      data={results.sort((s1, s2) => (s1.status < s2.status ? 1 : -1))}
      initialPageSize={100}
      className="mg-anlyses-table"
      loading={loading}
      showPagination={false}
    />
  );
};

export default SourmashResultsTable;
