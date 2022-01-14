import React, { useRef, useEffect, useContext, useState } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import AnalysisContext from 'src/pages/Analysis/AnalysisContext';
import useInterProMatchesProvider, {
  InterProCountType,
} from 'src/hooks/data/useInterProMatchesProvider';
import Loading from 'src/components/UI/Loading';
import { TAXONOMY_COLOURS } from 'src/utils/taxon';
import FetchError from 'src/components/UI/FetchError';
import { noop } from 'lodash-es';

type InterProMatchesChartProps = {
  selectedName?: string;
  onTotalChange?: (total: number) => void;
  onMatchesChange?: (total: InterProCountType[]) => void;
};
const InterProMatchesChart: React.FC<InterProMatchesChartProps> = ({
  selectedName = null,
  onTotalChange = noop,
  onMatchesChange = noop,
}) => {
  const { overviewData } = useContext(AnalysisContext);
  const { matches, total, loading, error, processed } =
    useInterProMatchesProvider(overviewData.id);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    if (matches) {
      const newTotal = matches.reduce((agg, { matches: m }) => agg + m, 0);
      setTotalCount(newTotal);
      onTotalChange(newTotal);
      onMatchesChange(matches);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);
  useEffect(() => {
    if (chartComponentRef.current && selectedName !== null) {
      let index = chartComponentRef.current.chart.series[0].data.findIndex(
        (e) => e.name === selectedName
      );
      chartComponentRef.current.chart.series[0].data.forEach((d) =>
        d.setState('')
      );
      if (index === -1 && selectedName.length)
        index = chartComponentRef.current.chart.series[0].data.length - 1;
      chartComponentRef.current.chart.series[0].data[index].setState('hover');
      chartComponentRef.current.chart.tooltip.refresh(
        chartComponentRef.current.chart.series[0].data[index]
      );
    }
  }, [selectedName]);
  if (loading && !matches?.length) return <Loading />;
  if (error) return <FetchError error={error} />;

  const options: Record<string, unknown> = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
    },
    title: {
      text: 'InterPro match summary',
    },
    subtitle: {
      text: `Total: ${totalCount} InterPro matches`,
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
        colors: TAXONOMY_COLOURS,
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'pCDS matched',
        colorByPoint: true,
        data: matches.map(({ name, matches: y }) => ({ name, y })),
      },
    ],
  };
  return (
    <>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
      />
      {processed < total && (
        <sup>
          * With {processed} out of {total} Interpro matches.
        </sup>
      )}
    </>
  );
};
export default InterProMatchesChart;
