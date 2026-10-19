import { useMemo } from 'react';
import * as Highcharts from 'highcharts';

import { TAXONOMY_COLOURS } from '@/utils/taxon';

type DefaultConfigType = {
  columns: {
    header: string;
    accessorKey: string;
  }[];
  options: Highcharts.Options;
};

const useGenomeDefaultConfig = (): DefaultConfigType => {
  const columns = useMemo(
    () => [
      {
        header: 'COG ID',
        accessorKey: 'name',
      },
      {
        header: 'Genome Count',
        accessorKey: 'count',
      },
      {
        header: 'Description',
        accessorKey: 'description',
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
  };
  return { columns, options };
};

export default useGenomeDefaultConfig;
