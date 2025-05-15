import { useMemo } from 'react';
import * as Highcharts from 'highcharts';

import { TAXONOMY_COLOURS } from '@/utils/taxon';

type DefaultConfigType = {
  columns: {
    Header: string;
    accessor: string;
  }[];
  options: Highcharts.Options;
};

const useGenomeDefaultConfig = (): DefaultConfigType => {
  const columns = useMemo(
    () => [
      {
        Header: 'COG ID',
        accessor: 'attributes.name',
      },
      {
        Header: 'Description',
        accessor: 'attributes.description',
      },
      {
        Header: 'Genome Count',
        accessor: 'attributes.genome-count',
      },
      {
        Header: 'Pan-genome count',
        accessor: 'attributes.pangenome-count',
      },
    ],
    []
  );

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 400,
      zoomType: 'xy',
      renderTo: 'container',
    },
    // subtitle: {
    //   text: `Total: ${total} Genome COG matches - Drag to zoom in/out`,
    // },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of matches',
      },
    },
    // xAxis: {
    //   categories,
    // },
    plotOptions: {
      series: {
        stacking: 'normal',
      },
      column: {
        allowPointSelect: true,
        cursor: 'pointer',
        colors: TAXONOMY_COLOURS,
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
    },
    // tooltip: {
    //   formatter() {
    //     const description = categoriesDescriptions[this.key];
    //     let tooltip = this.series.name + '<br/>Count: ' + this.y;
    //     if (description) {
    //       tooltip += '<br />COG: ' + description;
    //     }
    //     return tooltip;
    //   },
    // },
    // series: [
    //   {
    //     name: 'Genome',
    //     type: 'column',
    //     data: genomeSeries.slice(0, 10),
    //     colors: TAXONOMY_COLOURS,
    //     stack: 'genome',
    //   },
    // ],
  };
  return { columns, options };
};

export default useGenomeDefaultConfig;
