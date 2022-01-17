import React, { useRef, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import { TaxDatum } from '..';

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
 * Extend reference array of colours such that last colour is duplicated for
 * additional data point
 */
function duplicateLastColor(colours: string[], data: unknown[]): string[] {
  const newColours = [];
  let i = 0;
  while (i < data.length) {
    newColours.push(colours[Math.min(i, colours.length - 1)]);
    i += 1;
  }
  return newColours;
}

/**
 * Group all data after index n into single category
 */
function groupAfterN(clusteredData: TaxDatum[], n: number): TaxDatum[] {
  const top10 = clusteredData.slice(0, n);
  if (clusteredData.length > n) {
    const others = {
      name: 'Other',
      lineageA: [],
      lineage: [],
      y: 0,
      i: n + 1,
      color: 'grey',
    };
    clusteredData.slice(n).forEach((d) => {
      others.y += d.y;
      if (others.lineageA.indexOf(d.lineage[0]) === -1) {
        others.lineageA.push(d.lineage[0]);
      }
    });
    others.lineage = [others.lineageA.join(', ')];
    top10.push(others);
  }
  return top10;
}

type PieProps = {
  clusteredData: Array<TaxDatum>;
  title: string;
  showLegend?: boolean;
  showTotal?: boolean;
  selectedValue?: number | null;
};

const PieChart: React.FC<PieProps> = ({
  clusteredData,
  title,
  selectedValue = null,
  showLegend = false,
  showTotal = false,
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  useEffect(() => {
    if (chartComponentRef.current && selectedValue !== null) {
      const index = Math.min(
        selectedValue as number,
        chartComponentRef.current.chart.series[0].data.length - 1
      );
      chartComponentRef.current.chart.series[0].data.forEach((d) =>
        d.setState('')
      );
      chartComponentRef.current.chart.series[0].data[index].setState('hover');
      chartComponentRef.current.chart.tooltip.refresh(
        chartComponentRef.current.chart.series[0].data[index]
      );
    }
  }, [selectedValue]);
  const groupedData = groupAfterN(clusteredData, 10);
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
    tooltip: {
      pointFormat: '<b>{point.y}</b> {series.name} ({point.percentage:.2f}%)',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.2f} %',
          style: {
            color: 'black',
          },
        },
        colors: duplicateLastColor(TAXONOMY_COLOURS, groupedData),
        showInLegend: showLegend,
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'reads',
        colorByPoint: true,
        data: groupedData,
      },
    ],
  };
  if (showTotal) {
    options.subtitle = {
      text: `Total: ${sumData(clusteredData)} reads`,
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

export default PieChart;
