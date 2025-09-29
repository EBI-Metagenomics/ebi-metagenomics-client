import React, { useContext, useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyDatum } from '@/hooks/data/useData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

import { TAXONOMY_COLOURS } from '@/utils/taxon';

addExportMenu(Highcharts);

const PfamBarChart: React.FC = () => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const { overviewData } = useContext(AnalysisContext);
  const { data, loading, error } = useMGnifyData(
    overviewData?.id && `analyses/${overviewData.id}/kegg-modules`
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  const series = (data.data as MGnifyDatum[]).map(
    (d) => d.attributes.completeness
  );
  const categories = (data.data as MGnifyDatum[]).map(
    (d) => d.attributes.accession
  );
  const categoriesDescriptions = (data.data as MGnifyDatum[]).reduce<
    Record<string, string | undefined>
  >((memo, d) => {
    memo[String(d.attributes.accession)] = d.attributes.description as
      | string
      | undefined;
    return memo;
  }, {});
  const options: Record<string, unknown> = {
    chart: {
      type: 'column',
      height: 400,
      zoomType: 'xy',
      renderTo: 'container',
    },
    title: {
      text: 'KEGG module categories',
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Completeness (%)',
      },
      labels: {
        format: '{value} %',
      },
    },
    xAxis: {
      categories,
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
    tooltip: {
      formatter() {
        // @ts-ignore
        const description = categoriesDescriptions[this.key];
        // @ts-ignore
        let tooltip = `${this.series.name}<br/>Completeness: ${this.y}%`;
        if (description) {
          tooltip += `<br />KEGG Module: ${description}`;
        }
        return tooltip;
      },
    },
    series: [
      {
        name: `Analysis ${overviewData?.id}`,
        data: series,
        colors: TAXONOMY_COLOURS[1],
      },
    ],
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
};
export default PfamBarChart;
