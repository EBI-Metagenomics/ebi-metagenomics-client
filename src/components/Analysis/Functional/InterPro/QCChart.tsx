import React, { useRef, useContext } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';

import HighchartsReact from 'highcharts-react-official';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

addExportMenu(Highcharts);

/**
 * Get the series for a category.
 * This method will check if the series contains "contigs" or "reads".
 * Falling back to "reads" if "contigs" is missingg in seqData && isAssembly
 */
function getSeriesCategory(
  seqData: { key: string; value: string }[],
  category: string
) {
  let series = seqData?.find(({ key }) => key === category);
  if (series !== undefined) {
    return series.value;
  }
  series = seqData?.find(({ key }) => key === `Contigs${category}`);
  if (series !== undefined) {
    return series.value;
  }
  series = seqData?.find(({ key }) => key === `Reads${category}`);
  if (series !== undefined) {
    return series.value;
  }
  return 0;
}

const InterProQCChart: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const isAssembly = overviewData.attributes['experiment-type'] === 'assembly';
  const seqData = overviewData.attributes['analysis-summary'];
  // TODO: remove mapping when https://www.ebi.ac.uk/panda/jira/browse/EMG-1672
  const categories = [
    ' with predicted CDS',
    ' with predicted RNA',
    ' with InterProScan match',
    'Predicted CDS',
    'Predicted CDS with InterProScan match',
  ];
  const series = [
    getSeriesCategory(seqData, categories[0]),
    getSeriesCategory(seqData, categories[1]),
    getSeriesCategory(seqData, categories[2]),
    getSeriesCategory(seqData, categories[3]),
    getSeriesCategory(seqData, categories[4]),
  ].map(Number);
  const prefix = isAssembly ? 'Contigs' : 'Reads';
  categories[0] = prefix + categories[0];
  categories[1] = prefix + categories[1];
  categories[2] = prefix + categories[2];

  const options: Record<string, unknown> = {
    chart: {
      type: 'bar',
      height: 240,
    },
    title: {
      text: 'Sequence feature summary',
    },
    yAxis: {
      type: 'logarithmic',
      title: {
        text: 'Count (note the logarithmic scale)',
      },
    },
    xAxis: {
      categories,
    },
    plotOptions: {
      series: {
        stacking: 'normal',
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b>',
    },
    series: [
      {
        data: series,
        color: '#058dc7',
      },
    ],
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      containerProps={{ id: 'seqfeat-chart' }}
    />
  );
};
export default InterProQCChart;
