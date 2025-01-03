import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

addExportMenu(Highcharts);

const QualityControlChart = ({ summaryData }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  // TODO: This is just a temporary measure until v6 amplicon data is available
  // i.e for now if the .total_bases is not available, we will use a default value
  // this is done just to convey the idea of how the chart will look like
  const data = {
    total_reads_before_filtering:
      summaryData.before_filtering?.total_bases || 16763944,
    total_reads_after_filtering:
      summaryData.after_filtering?.total_bases || 16034314,
  };

  const options = {
    chart: {
      type: 'bar',
      height: 240,
    },
    title: {
      text: 'Number of sequence reads per QC step',
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count',
      },
    },
    xAxis: {
      categories: ['Reads'],
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{y:,.0f}', // Format numbers with commas
        },
      },
      series: {
        stacking: null, // Changed from 'normal' to null since we don't want stacking
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'Total reads before filtering',
        data: [parseInt(data.total_reads_before_filtering, 10)],
        color: '#CCCCD3',
      },
      {
        name: 'Total reads after filtering',
        data: [parseInt(data.total_reads_after_filtering, 10)],
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
