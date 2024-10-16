import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import { TAXONOMY_COLOURS } from 'utils/taxon';

addExportMenu(Highcharts);

type GOBarChartProps = {
  categories: Array<string>;
  series: Array<number>;
  title: string;
  color: string;
  total: number;
  containerId: string;
};
const GOBarChart: React.FC<GOBarChartProps> = ({
  categories,
  series,
  title,
  total,
  color,
  containerId,
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const options: Record<string, unknown> = {
    chart: {
      type: 'bar',
      height: 800,
      zoomType: 'xy',
      renderTo: 'container',
    },
    title: {
      text: title,
    },
    subtitle: {
      text: `Total: ${total} annotations - Drag to zoom in/out`,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Annotations',
      },
    },
    xAxis: {
      categories,
    },
    plotOptions: {
      series: {
        stacking: 'normal',
      },
      bar: {
        allowPointSelect: true,
        cursor: 'pointer',
        colors: TAXONOMY_COLOURS,
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> {series.name}',
    },
    series: [
      {
        name: 'annotations',
        data: series,
        color,
      },
    ],
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
export default GOBarChart;
