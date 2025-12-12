import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import { TAXONOMY_COLOURS } from '@/utils/taxon';

addExportMenu(Highcharts);

type GOPieChartProps = {
  categories: Array<string>;
  series: Array<number>;
  title: string;
  total: number;
  containerId: string;
};
const GOPieChart: React.FC<GOPieChartProps> = ({
  categories,
  series,
  title,
  total,
  containerId,
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const pieSeries = categories.slice(0, 10).map((name, i) => ({
    name,
    y: series[i],
  }));
  const other = { name: 'Others', y: 0 };
  series.slice(10).forEach((v) => {
    other.y += v;
  });
  pieSeries.push(other);
  const options: Record<string, unknown> = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
    },
    title: {
      text: title,
    },
    subtitle: {
      text: `Total: ${total} annotations`,
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> {series.name} ({point.percentage:.2f}%)',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
        colors: TAXONOMY_COLOURS,
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'annotations',
        colorByPoint: true,
        data: pieSeries,
      },
    ],
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',

      labelFormatter() {
        // @ts-ignore
        if (this.name.length > 15) {
          // @ts-ignore
          return `${this.name.slice(0, 15)}...`;
        }
        // @ts-ignore
        return this.name;
      },
    },
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      containerProps={{ id: containerId }}
    />
  );
};
export default GOPieChart;
