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

      <VerticalBarChart
        ChartTitle="Top KO Entries"
        accession={accession}
        tooltipKey1="KEGG Class"
        tooltipVal1="description"
        tooltipKey3="Count"
      />
      <KOTable />
    </div>
  );
};

export default PfamTab;
