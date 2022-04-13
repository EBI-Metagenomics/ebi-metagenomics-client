import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

type SeqLengthChartProps = {
  summaryData: {
    [key: string]: string;
  };
};
const SeqLengthChart: React.FC<SeqLengthChartProps> = ({ summaryData }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options = {
    chart: {
      type: 'bar',
      marginTop: 0, // Keep all charts left aligned
      height: 120,
    },
    title: false,
    xAxis: {
      categories: ['Minimum', 'Average', 'Maximum'],
      title: { enabled: false },
      lineColor: '#595959',
      tickColor: '',
    },
    yAxis: {
      min: 0,
      max: 100 * (Math.floor(Number(summaryData.length_max) / 100) + 1),
      title: { text: 'Sequence length (bp)' },
      plotBands: [
        {
          // visualize the standard deviation
          from:
            Number(summaryData.average_length) -
            Number(summaryData.standard_deviation_length),
          to:
            summaryData.average_length +
            Number(summaryData.standard_deviation_length),
          color: 'rgba(128, 128, 128, .2)',
        },
      ],
    },
    plotOptions: {
      series: {
        grouping: false,
        shadow: false,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: 'Length',
        data: [
          {
            y: Number(summaryData.length_min),
            x: 0,
            color: 'rgb(114, 191, 63)',
          },
          {
            y: Number(summaryData.average_length),
            x: 1,
            color: 'rgb(63, 114, 191)',
          },
          {
            y: Number(summaryData.length_max),
            x: 2,
            color: 'rgb(114, 63, 191)',
          },
        ],
        pointPadding: -0.2,
        tooltip: {
          /* eslint-disable react/no-this-in-sfc */
          pointFormatter() {
            return `<span style="color:${this.color}">\u25CF</span> ${
              this.category
            }: <b>${this.y.toFixed(2)}</b><br/>`;
          },
          /* eslint-enable react/no-this-in-sfc */
        },
      },
    ],
    legend: { enabled: false },
    credits: false,
    navigation: {
      buttonOptions: {
        height: 32,
        width: 32,
        symbolX: 16,
        symbolY: 16,
        y: -10,
      },
    },
    exporting: { enabled: false },
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      containerProps={{ className: 'reads-length-barchart' }}
    />
  );
};

export default SeqLengthChart;
