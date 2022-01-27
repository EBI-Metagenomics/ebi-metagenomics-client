import React, { useRef, useContext } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import AnalysisContext from 'pages/Analysis/AnalysisContext';

addExportMenu(Highcharts);

type QualityControlProps = {
  summaryData: {
    [key: string]: string;
  } | null;
};
const QualityControlChart: React.FC<QualityControlProps> = ({
  summaryData,
}) => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const isAssembly = analysisData.attributes['experiment-type'] === 'assembly';

  const unit = isAssembly ? 'contigs' : 'reads';
  const capUnit = isAssembly ? 'Contigs' : 'Reads';

  const remaining = [0, 0, 0, 0, 0];
  const filtered = [0, 0, 0, 0, 0];
  const subsampled = [0, 0, 0, 0, 0];

  const analysisSummary = {};
  (
    (analysisData.attributes?.['analysis-summary'] as {
      key: string;
      value: string;
    }[]) || []
  ).forEach(({ key, value }) => {
    analysisSummary[key] = value;
  });

  if (summaryData) subsampled[4] = Number(summaryData.sequence_count);
  remaining[0] = Number(analysisSummary['Submitted nucleotide sequences']);
  remaining[1] = Number(
    analysisSummary['Nucleotide sequences after format-specific filtering']
  );
  remaining[2] = Number(
    analysisSummary['Nucleotide sequences after length filtering']
  );
  remaining[3] = Number(
    analysisSummary['Nucleotide sequences after undetermined bases filtering']
  );
  filtered[2] = remaining[1] - remaining[2];
  filtered[1] = remaining[0] - remaining[1];
  if (summaryData) filtered[4] = remaining[3] - remaining[4] - subsampled[4];

  const options = {
    chart: {
      type: 'bar',
      height: 240,
    },
    title: {
      text: `Number of sequence ${unit} per QC step`,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count',
      },
    },
    xAxis: {
      categories: [
        `Initial ${unit}`,
        'Trimming',
        'Length filtering',
        'Ambiguous base filtering',
        `${capUnit} subsampled for QC analysis`,
      ],
    },
    plotOptions: {
      series: {
        stacking: 'normal',
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: `${capUnit} filtered out`,
        data: filtered,
        color: '#CCCCD3',
      },
      {
        name: `${capUnit} remaining`,
        data: remaining,
        color: '#058DC7',
      },
      {
        name: `${capUnit} after sampling`,
        data: subsampled,
        color: '#8dc7c7',
      },
    ],
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
};

export default QualityControlChart;
