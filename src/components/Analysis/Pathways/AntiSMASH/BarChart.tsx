import React, { useContext, useRef } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import useMGnifyData from 'hooks/data/useMGnifyData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { MGnifyDatum } from 'hooks/data/useData';

const AntiSMASHBarChart: React.FC = () => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const { overviewData } = useContext(AnalysisContext);
  const { data, loading, error } = useMGnifyData(
    `analyses/${overviewData.id}/antismash-gene-clusters`,
    {
      page_size: 10,
    }
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  const series = (data.data as MGnifyDatum[]).map((d) => d.attributes.count);
  const categories = (data.data as MGnifyDatum[]).map(
    (d) => d.attributes.accession
  );
  const categoriesDescriptions = (data.data as MGnifyDatum[]).reduce(
    (memo, d) => {
      // eslint-disable-next-line no-param-reassign
      memo[d.attributes.accession as string] = d.attributes.description;
      return memo;
    },
    {}
  );
  const options: Record<string, unknown> = {
    chart: {
      type: 'column',
      height: 400,
      zoomType: 'xy',
      renderTo: 'container',
    },
    title: {
      text: 'Top 10 antiSMASH gene clusters',
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of matches',
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
      /* eslint-disable react/no-this-in-sfc */
      formatter() {
        const description = categoriesDescriptions[this.key];
        let tooltip = `${this.series.name}<br/>Count: ${this.y}`;
        if (description) {
          tooltip += `<br/>antiSMASH gene cluster: ${description}`;
        }
        return tooltip;
      },
      /* eslint-enable react/no-this-in-sfc */
    },
    series: [
      {
        name: `Analysis ${overviewData.id}`,
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
export default AntiSMASHBarChart;
