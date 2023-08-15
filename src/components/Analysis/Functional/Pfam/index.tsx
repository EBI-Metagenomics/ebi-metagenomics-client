import React, { useContext } from 'react';
import VerticalBarChart from 'src/components/VegaCharts/VerticalBar';
import AnalysisContext from 'src/pages/Analysis/AnalysisContext';
import PfamTable from './Table';
import BarChart from './BarChart';

const PfamTab: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const accession = `analyses/${overviewData.id}/pfam-entries`;
  return (
    <div className="vf-stack">
      <BarChart />

      <VerticalBarChart
        ChartTitle="Top Pfam Entries"
        accession={accession}
        tooltipKey1="Pfam Entry"
        tooltipVal1="description"
        tooltipKey3="Count"
      />
      <PfamTable />
    </div>
  );
};

export default PfamTab;
