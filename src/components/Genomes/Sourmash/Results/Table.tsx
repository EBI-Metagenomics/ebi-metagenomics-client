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
  results: Array<Record<string, { status: any; [key: string]: any }>>;
  loading: boolean;
};
const SourmashResultsTable: React.FC<SourmashResultsTableProps> = ({
  results,
  loading,
}) => {
  const columns = useMemo(
    () => [
      {
        header: 'Filename',
        accessorKey: 'filename',
      },
      {
        header: 'Catalogue',
        accessorKey: 'catalogue',
        cell: ({ cell }) => {
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              <Link to={`/genome-catalogues/${cell.getValue()}`}>
                {cell.getValue()}
              </Link>
            </span>
          );
        },
      },
      {
        header: 'Status',
        accessorFn: (r) => ({
          status: r.status,
          resultStatus: r.result?.status,
        }),
        cell: ({ cell }) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {emoji[cell.getValue().resultStatus || cell.getValue().status]}{' '}
            {cell.getValue().resultStatus || cell.getValue().status}
          </span>
        ),
      },
      {
        id: 'match',
        header: () => (
          <>
            Best Match
            <br />
            (% query covered)
          </>
        ),
        accessorFn: (x) => x,
        cell: ({ cell }) => {
          if (
            cell.getValue().status === 'SUCCESS' &&
            cell.getValue().result?.status === 'NO_RESULTS'
          )
            return "We couldn't find any matches with your query";
          if (cell.getValue().status === 'IN_QUEUE')
            return `Position: ${cell.getValue().position_in_queue}`;
          if (
            cell.getValue().status === 'SUCCESS' &&
            cell.getValue().result?.status !== 'NO_RESULTS'
          )
            return (
              <span style={{ whiteSpace: 'nowrap' }}>
                <Link to={`/genomes/${cell.getValue().result.match}`}>
                  {cell.getValue().result.match}
                </Link>{' '}
                ({cell.getValue().result.p_query})
              </span>
            );

          return cell.getValue().reason || null;
        },
        meta: {
          colspan: (cell) =>
            cell.getValue().status === 'SUCCESS' &&
            cell.getValue().result?.status !== 'NO_RESULTS'
              ? 1
              : 3,
        },
      },
      {
        header: 'Total No. of matches',
        accessorKey: 'result.matches',
      },
      {
        id: 'download',
        header: 'Download',
        accessorFn: (x) => x,
        cell: ({ cell }) =>
          cell.getValue().status === 'SUCCESS' &&
          cell.getValue().result?.status !== 'NO_RESULTS' ? (
            <a
              download={`${cell.getValue().filename}.csv`}
              href={cell.getValue().results_url}
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
