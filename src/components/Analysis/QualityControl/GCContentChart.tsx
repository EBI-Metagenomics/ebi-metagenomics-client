import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

type GCContentChartProps = {
  summaryData: {
    [key: string]: string;
  };
};
const GCContentChart: React.FC<GCContentChartProps> = ({ summaryData }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options = {
    chart: {
      type: 'bar',
      marginTop: 0, // Keep all charts left aligned
      height: 150,
    },
    title: false,
    xAxis: {
      categories: ['Content'],
      title: { enabled: false },
      lineColor: '#595959',
      tickColor: '',
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { enabled: false },
      plotBands: [
        {
          // visualize the standard deviation
          from:
            Number(summaryData.average_gc_content) -
            Number(summaryData.standard_deviation_gc_content),
          to:
            Number(summaryData.average_gc_content) +
            Number(summaryData.standard_deviation_gc_content),
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
        name: 'GC content',
        pointPadding: 0.25,
        color: 'rgb(63, 114, 191)',
        tooltip: {
          /* eslint-disable react/no-this-in-sfc */
          pointFormatter() {
            return `<span style="color:${this.color}">\u25CF</span> ${
              this.series.name
            }: <b>${this.y.toFixed(2)}%</b><br/>`;
          },
          /* eslint-enable react/no-this-in-sfc */
        },
        data: [Number(summaryData.average_gc_content)],
      },
      {
        name: 'AT content',
        color: 'rgb(114, 63, 191)',
        pointPadding: 0.25,
        threshold: Number(summaryData.average_gc_content),
        tooltip: {
          /* eslint-disable react/no-this-in-sfc */
          pointFormatter() {
            const val = (100 - Number(summaryData.average_gc_content)).toFixed(
              2
            );
            // prettier-ignore
            return `
              <span style="color:${this.color}">\u25CF</span>
              ${this.series.name}: <b>${val}%</b>
              <br/>`;
          },
          /* eslint-enable react/no-this-in-sfc */
        },
        data: [100],
      },
    ],
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
      containerProps={{ className: 'reads-gc-barchart' }}
    />
  );
};

export default GCContentChart;
