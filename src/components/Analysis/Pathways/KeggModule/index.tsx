import React, { useContext } from 'react';
import AnalysisContext from 'src/pages/Analysis/AnalysisContext';
import VerticalBarChart from 'src/components/VegaCharts/VerticalBar';
import KeggTable from './Table';
import KeggBarChart from './BarChart';

const KOTab: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const accession = `analyses/${overviewData.id}/kegg-modules`;
  return (
    <div className="vf-stack">
      <KeggBarChart />

      <VerticalBarChart
        ChartTitle="KEGG Module Categories"
        accession={accession}
        tooltipKey="KEGG Module"
        tooltipVal="Completeness"
        y="completeness"
        maxSlider={250}
        titleY="Completeness (%)"
        lAngle={-65}
      />
      <KeggTable />
    </div>
  );
};

export default KOTab;
