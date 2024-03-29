import React, { useRef, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import { TAXONOMY_COLOURS } from 'utils/taxon';
import { TaxDatum } from '..';

addExportMenu(Highcharts);

const NUM_COLUMNS = 10;

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
type ColumnChartProps = {
  clusteredData: Array<TaxDatum>;
  title: string;
  showLegend?: boolean;
  showTotal?: boolean;
  selectedValue?: number | null;
  sequencesType?: string;
};

const ColumnChart: React.FC<ColumnChartProps> = ({
  clusteredData,
  title,
  selectedValue = null,
  showLegend = false,
  showTotal = false,
  sequencesType = 'reads',
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  useEffect(() => {
    if (chartComponentRef.current && selectedValue !== null) {
      const index = selectedValue as number;

      chartComponentRef.current.chart.series[0].data.forEach((d) =>
        d.setState('')
      );
      if (index < chartComponentRef.current.chart.series[0].data.length) {
        chartComponentRef.current.chart.series[0].data[index].setState('hover');
        chartComponentRef.current.chart.tooltip.refresh(
          chartComponentRef.current.chart.series[0].data[index]
        );
      }
    }
  }, [selectedValue]);

  const dataSummary = clusteredData.slice(0, NUM_COLUMNS);
  const categories = dataSummary.map((e) => e.name);
  const total = sumData(clusteredData);
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
    credits: {
      enabled: false,
    },
    series: [
      {
        colorByPoint: true,
        data: dataSummary,
        colors: TAXONOMY_COLOURS,
      },
    ],
    xAxis: {
      categories,
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of sequences',
        align: 'high',
      },
      labels: {
        overflow: 'justify',
      },
    },
    tooltip: {
      /* eslint-disable react/no-this-in-sfc */
      formatter() {
        const perc = (100 * this.y) / total;
        return `${this.x}<br/><b>${this.y}</b> ${sequencesType} (${perc.toFixed(
          2
        )}%)`;
      },
      /* eslint-enable react/no-this-in-sfc */
    },
    legend: {
      enabled: false,
    },
  };
  if (showTotal) {
    options.subtitle = {
      text: `Total: ${sumData(clusteredData)} ${sequencesType}`,
    };
  }

  if (showLegend) {
    options.legend = {
      title: {
        text: 'Click to hide',
      },
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      /* eslint-disable react/no-this-in-sfc */
      labelFormatter() {
        if (this.name.length > 15) {
          return `${this.name.slice(0, 15)}...`;
        }
        return this.name;
      },
      /* eslint-enable react/no-this-in-sfc */
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

export default ColumnChart;
