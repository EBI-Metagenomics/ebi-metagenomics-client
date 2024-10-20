import React, { useRef, useContext } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

addExportMenu(Highcharts);

type QualityControlProps = {
  summaryData: {
    [key: string]: string;
  } | null;
};
const QualityControlChart: React.FC<QualityControlProps> = ({
}) => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const isAssembly = analysisData.experiment_type === 'assembly';

  const unit = isAssembly ? 'contigs' : 'reads';
  const capUnit = isAssembly ? 'Contigs' : 'Reads';

  const remaining = [10, 20, 40, 50, 304];
  const filtered = [30, 40, 304, 30, 50];
  const subsampled = [450, 320, 430, 40, 40];

  const analysisSummary = {};
  (
    (analysisData.attributes?.['analysis-summary'] as {
      key: string;
      value: string;
    }[]) || []
  ).forEach(({ key, value }) => {
    analysisSummary[key] = value;
  });

  // console.log('V2 summary', summaryData);

  const summaryData = {
    total_reads_before_filtering: '16763944',
    total_reads_after_filtering: '16034314',
  };

  // if (summaryData) subsampled[4] = Number(summaryData.sequence_count);
  remaining[0] = Number(summaryData.total_reads_before_filtering);
  remaining[1] = Number(summaryData.total_reads_after_filtering);
  remaining[2] = Number(summaryData.total_reads_after_filtering);
  remaining[3] = Number(summaryData.total_reads_after_filtering);
  remaining[4] = Number(summaryData.total_reads_after_filtering);
  filtered[2] = Number(summaryData.total_reads_after_filtering);
  filtered[1] = Number(summaryData.total_reads_after_filtering);
  // // remaining[2] = Number(
  //   analysisSummary['Nucleotide sequences after length filtering']
  // );
  // remaining[3] = Number(
  //   analysisSummary['Nucleotide sequences after undetermined bases filtering']
  // );
  // filtered[2] = remaining[1] - remaining[2];
  // filtered[1] = remaining[0] - remaining[1];
  // if (summaryData) filtered[4] = remaining[3] - remaining[4] - subsampled[4];

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
        'Total reads before filtering',
        'Total reads after filtering',
        'Total reads after filtering',
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
        name: 'Total reads before filtering',
        data: summaryData.total_reads_before_filtering,
        color: '#CCCCD3',
      },
      {
        name: 'Total reads after filtering',
        data: summaryData.total_reads_after_filtering,
        color: '#058DC7',
      },
    ],
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      containerProps={{ id: 'qc-step-chart' }}
    />
  );
};

export default QualityControlChart;
