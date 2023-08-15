import React, { useContext } from 'react';
import VerticalBarChart from 'src/components/VegaCharts/VerticalBar';
import AnalysisContext from 'src/pages/Analysis/AnalysisContext';
import AntiSMASHTable from './Table';
import AntiSMASHBarChart from './BarChart';

const KOTab: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const accession = `analyses/${overviewData.id}/antismash-gene-clusters`;
  return (
    <div className="vf-stack">
      <AntiSMASHBarChart />
      <VerticalBarChart
        ChartTitle="Top AntiSMASH gene clusters"
        accession={accession}
        tooltipKey1="AntiSMASH gene cluster"
        tooltipVal1="description"
        tooltipKey2="Count"
        tooltipVal2="count"
        lAngle={0}
      />
      <AntiSMASHTable />
    </div>
  );
};

export default KOTab;
