import React, { useContext, useMemo } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import Tooltip from 'components/UI/Tooltip';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';

import './style.css';

import ArrowForLink from 'components/UI/ArrowForLink';
import CursorPagination from 'components/UI/EMGTable/CursorPagination';

type ContigFeatureProps = {
  annotationType: string;
  present: boolean;
};

const ContigFeatureFlag: React.FC<ContigFeatureProps> = ({
  annotationType,
  present,
}) => {
  let color;
  const letter = annotationType[0].toUpperCase();
  switch (annotationType) {
    case 'cog':
      color = '#3b6fb6';
      break;
    case 'kegg':
      color = '#18974c';
      break;
    case 'pfam':
      color = '#193f90';
      break;
    case 'interpro':
      color = '#734595';
      break;
    case 'go':
      color = '#f49e17';
      break;
    case 'antismash':
      color = '#b65417';
      break;
    default:
      color = '#8d8f8e';
  }
  if (!present) {
    color += '55';
  }
  const tooltip = `${
    present ? 'Has' : 'Does’t have'
  } ${annotationType} annotations`;
  return (
    <Tooltip content={tooltip}>
      <div
        className="emg-contig-feature-flag vf-text vf-text-body--4"
        style={{ borderColor: color, color }}
      >
        {letter}
      </div>
    </Tooltip>
  );
};

const ContigsTable: React.FC = () => {
  const { contigsQueryData, setQueryParameters, queryParameters } =
    useContext(ContigsQueryContext);
  const { data, loading, error } = contigsQueryData || {};

  const contigsColumns = useMemo(() => {
    return [
      {
        id: 'contig_id',
        Header: 'Name',
        accessor: (contig) => contig.attributes['contig-id'],
        Cell: ({ cell }) => (
          <button
            className="vf-button vf-button--link vf-button--sm contig-id-button"
            type="button"
            onClick={() =>
              setQueryParameters({
                ...queryParameters,
                selectedContig: cell.value,
              })
            }
          >
            {cell.value}
            <ArrowForLink />
          </button>
        ),
      },
      {
        id: 'length',
        Header: 'Length (bp)',
        accessor: (contig) => contig.attributes.length,
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'coverage',
        Header: 'Coverage',
        accessor: (contig) => contig.attributes.coverage,
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'features',
        Header: 'Features',
        accessor: (contig) => contig.attributes,
        Cell: ({ cell }) => {
          const flags = Object.entries(cell.value)
            .filter(([key]) => key.startsWith('has-'))
            .map(([key, value]) => (
              <ContigFeatureFlag
                key={key}
                annotationType={key.substring(4)}
                present={!!value}
              />
            ));
          return <div className="emg-contig-feature-flags">{flags}</div>;
        },
      },
    ];
  }, [queryParameters, setQueryParameters]);

  if (loading && !data) return <Loading size="large" />;
  if (error || !data) return <FetchError error={error} />;

  return (
    <div>
      <EMGTable
        cols={contigsColumns}
        data={data}
        showPagination={false}
        title={() => (
          <>
            Assembly Contigs
            <span className="mg-number">{data.meta.pagination.count}</span>
          </>
        )}
        initialPage={0}
        className="mg-contigs-table"
        namespace="contigs_"
        loading={loading}
      />
      <CursorPagination
        paginationLinks={data.links}
        handleCursor={(cursor) =>
          setQueryParameters({ ...queryParameters, contigsPageCursor: cursor })
        }
      />
    </div>
  );
};

export default ContigsTable;
