import React, { useContext, useState } from 'react';
import { Row } from 'react-table';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import Loading from 'components/UI/Loading';
import ExtLink from 'components/UI/ExtLink';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import InterProTable from 'components/Analysis/Functional/InterPro/InterProTable';

const PAGE_SIZE = 25;
const InterPro: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const [total, setTotal] = useState(-1);
  const [colorMap, setColorMap] = useState(new Map());
  const [selectedName, setSelectedName] = useState(null);
  const [page] = useQueryParamState('page', 1, Number);
  const [pageSize] = useQueryParamState('page_size', PAGE_SIZE, Number);
  const [order] = useQueryParamState('order', '');
  const { data, loading, error, isStale } = useMGnifyData(
    `analyses/${analysisData.accession}/interpro_identifiers`,
    {
      page: page as number,
      ordering: order as string,
      page_size: pageSize as number,
    }
  );
  const columns = [
    {
      id: 'color',
      Header: '',
      accessor: 'accession',
      disableSortBy: true,
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
      accessor: 'description',
    },
    {
      id: 'accession',
      Header: 'ID',
      accessor: 'accession',
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
      accessor: 'count',
    },
    {
      id: 'percentage',
      Header: '%',
      accessor: 'count',
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
      <h5>InterPro match summary</h5>
      <DetailedVisualisationCard>
        <div className="vf-card__content | vf-stack vf-stack--400">
          <h3 className="vf-card__heading">InterPro QC Summary </h3>
          <p className="vf-card__subheading">Lorem Ipsum Delorim</p>
          <p className="vf-card__text">
            <InterProTable />
          </p>
        </div>
      </DetailedVisualisationCard>

      <div className="vf-grid mg-grid-30-70"></div>
    </div>
  );
};

export default InterPro;
