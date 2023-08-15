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
        tooltipKey1="Class ID"
        tooltipVal1="id"
        tooltipKey2="KEGG Module"
        tooltipVal2="description"
        tooltipKey3="Completeness (%)"
        y="completeness"
        sliderValue={250}
        maxSlider={250}
        titleY="Completeness (%)"
        lAngle={-75}
        paddingLabel={30}
        overlapLabels
      />
      <KeggTable />
    </div>
  );
};

export default KOTab;
