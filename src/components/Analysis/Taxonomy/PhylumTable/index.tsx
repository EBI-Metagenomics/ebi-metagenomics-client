import React from 'react';

import EMGTable from 'components/UI/EMGTable';
import { useQueryParametersState } from 'src/hooks/useQueryParamState';
import { TaxDatum } from '../PhylumCharts';

const sortFunction = (order) => (a: TaxDatum, b: TaxDatum) => {
  switch (order) {
    case 'i':
    case 'y':
    case 'percentage':
      return Number(a[order]) - Number(b[order]);
    case '-i':
    case '-y':
    case '-percentage':
      return Number(b[order.slice(1)]) - Number(a[order.slice(1)]);
    case 'name':
      return b.name >= a.name ? -1 : 1;
    case '-name':
      return a.name >= b.name ? -1 : 1;
    case 'lineage':
      return b.lineage[0] >= a.lineage[0] ? -1 : 1;
    case '-lineage':
      return a.lineage[0] >= b.lineage[0] ? -1 : 1;
    default:
      return 0;
  }
};

type PhylumTableProps = {
  clusteredData: Array<TaxDatum>;
};
const PhylumTable: React.FC<PhylumTableProps> = ({ clusteredData }) => {
  const [{ order }] = useQueryParametersState({ order: '' });

  const columns = [
    {
      Header: '',
      accessor: 'i',
    },
    {
      id: 'name',
      Header: 'Phylum',
      accessor: (x) => x,
      Cell: ({ cell }) => (
        <>
          <div
            style={{
              width: '1rem',
              height: '1rem',
              display: 'inline-block',
              backgroundColor: cell.value.color,
              verticalAlign: 'sub',
            }}
          >
            &nbsp;
          </div>{' '}
          {cell.value.name}
        </>
      ),
    },
    {
      id: 'lineage',
      Header: 'Domain',
      accessor: 'lineage[0]',
    },
    {
      Header: 'Unique OTUs',
      accessor: 'y',
    },
    {
      Header: '%',
      accessor: 'percentage',
    },
  ];
  return (
    <EMGTable
      cols={columns}
      data={clusteredData.sort(sortFunction(order))}
      initialPageSize={100}
      className="mg-anlyses-table"
      showPagination={false}
      sortable
    />
  );
};

export default PhylumTable;