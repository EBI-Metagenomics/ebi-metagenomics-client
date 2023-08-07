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
      <h3>Vega</h3>
      <VerticalBarChart
        ChartTitle="Pfam Entries vs Matches"
        accession={accession}
        tooltipKey="Pfam Entry"
      />
      <PfamTable />
    </div>
  );
};

export default PfamTab;
