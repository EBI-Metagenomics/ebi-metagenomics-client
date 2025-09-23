import React, { useRef, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import { TAXONOMY_COLOURS } from '@/utils/taxon';

import { TaxDatum } from '..';

addExportMenu(Highcharts);

/**
 * Sum data by parameter
 */
function sumData(data: { y: number }[]): number {
  let sum = 0;
  data.forEach((e) => {
    sum += e.y;
  });
  return sum;
}
/**
 * Reformat data into multiple series
 */
function transformData(
  data: Array<{ name: string; y: number }>
): Array<{ name: string; data: [number]; color: string }> {
  let i = 0;
  const maxColorIndex = TAXONOMY_COLOURS.length - 1;
  return data.map((e) => ({
    name: e.name,
    data: [e.y],
    color: TAXONOMY_COLOURS[Math.min(i++, maxColorIndex)],
  }));
}

type StackedColumnChartProps = {
  clusteredData: Array<TaxDatum>;
  title: string;
  showLegend?: boolean;
  selectedValue?: number | null;
  sequencesType?: string;
};

const StackedColumnChart: React.FC<StackedColumnChartProps> = ({
  clusteredData,
  title,
  selectedValue = null,
  showLegend = false,
  sequencesType = 'reads',
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  useEffect(() => {
    if (chartComponentRef.current && selectedValue !== null) {
      const index = selectedValue as number;

      chartComponentRef.current.chart.series[0].data.forEach((d) =>
        d.setState('')
      );
      if (index < chartComponentRef.current.chart.series.length) {
        chartComponentRef.current.chart.series[index].data[0].setState('hover');
        chartComponentRef.current.chart.tooltip.refresh(
          chartComponentRef.current.chart.series[index].data[0]
        );
      }
    }
  }, [selectedValue]);

  const dataSummary = transformData(clusteredData);
  const sum = sumData(clusteredData);
  const options: Record<string, unknown> = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'column',
    },
    title: {
      text: title,
    },
    subtitle: {
      text: `Total: ${sum} ${sequencesType}`,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      formatter() {
        const perc = (100 * this.y) / sum;
        return (
          `${this.series.name}<br/>` +
          `<b>${this.y}</b> ${sequencesType} (${perc.toFixed(2)}%)`
        );
      },
    },
    plotOptions: {
      series: {
        stacking: 'percent',
        dataLabels: {
          enabled: true,
        },
      },
    },
    yAxis: {
      min: 0,
      max: 100,
    },
    xAxis: {
      title: {
        text: null,
        enabled: false,
      },
      labels: {
        enabled: false,
      },
    },
    legend: {
      enabled: false,
    },
    series: dataSummary,
  };

  if (showLegend) {
    options.legend = {
      title: {
        text: 'Click to hide',
      },
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',

      labelFormatter() {
        if (this.name.length > 15) {
          return `${this.name.slice(0, 15)}...`;
        }
        return this.name;
      },
    };
  }
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
};

export default StackedColumnChart;
