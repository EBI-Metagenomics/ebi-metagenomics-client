import React, { useContext } from 'react';
import VerticalBarChart from 'src/components/VegaCharts/VerticalBar';
import AnalysisContext from 'src/pages/Analysis/AnalysisContext';
import KOTable from './Table';
import KOBarChart from './BarChart';

const PfamTab: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const accession = `analyses/${overviewData.id}/kegg-orthologs`;
  return (
    <div className="vf-stack">
      <KOBarChart />
      <h3>Vega</h3>
      <VerticalBarChart
        ChartTitle="KO Entries vs Matches"
        accession={accession}
        tooltipKey="KEGG Class"
      />
      <KOTable />
    </div>
  );
};

export default PfamTab;
