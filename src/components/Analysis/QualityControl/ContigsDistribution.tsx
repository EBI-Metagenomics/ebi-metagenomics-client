import React, { useContext, useRef } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { ResponseFormat, TSVResponse } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

type ContigsHistogramProps = {
  summaryData: {
    [key: string]: string;
  };
};
const ContigsDistribution: React.FC<ContigsHistogramProps> = ({
  summaryData,
}) => {
  const { overviewData } = useContext(AnalysisContext);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/gc-distribution`,
    {},
    {},
    ResponseFormat.TSV
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const distData = (data as unknown as TSVResponse).map(([x, y]) => [
    Number(x),
    Number(y),
  ]);

  const isAssembly = overviewData.attributes['experiment-type'] === 'assembly';
  const unit = isAssembly ? 'contigs' : 'reads';
  const capUnit = isAssembly ? 'Contigs' : 'Reads';

  const options = {
    chart: {
      style: {
        fontFamily: 'Helvetica',
      },
      zoomType: 'x',
    },
    title: {
      text: `${capUnit} GC distribution`,
      style: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    // subtitle: {
    //     text: ( (typeof chartOptions !== 'undefined' &&
    //         chartOptions['isFromSubset'])
    //         ? 'A subset of the sequences was used to generate this chart. - '
    //         : '') + 'Click and drag in the plot area to zoom in'
    // },
    yAxis: {
      title: { text: `Number of ${unit}` },
    },
    xAxis: {
      min: 0,
      max: 100,

      plotBands:
        summaryData === null
          ? []
          : [
              {
                // visualize the standard deviation
                from:
                  Number(summaryData.average_gc_content) -
                  Number(summaryData.standard_deviation_gc_content),
                to:
                  Number(summaryData.average_gc_content) +
                  Number(summaryData.standard_deviation_gc_content),
                color: 'rgba(128, 128, 128, .2)',
                borderColor: '#000000',
                label: {
                  text: `Standard Deviation<br/>\u00B1${Number(
                    summaryData.standard_deviation_gc_content
                  ).toFixed(2)}`,
                  style: {
                    color: '#666666',
                    fontSize: '0.8em',
                  },
                },
              },
            ],
    },
    series: [
      {
        name: capUnit,
        data: distData,
        color: '#058dc7', // (chartOptions['isFromSubset']) ? '#8dc7c7' : '#058dc7'
      },
    ],
    legend: { enabled: false },
    credits: false,
    navigation: {
      buttonOptions: {
        height: 32,
        width: 32,
        symbolX: 16,
        symbolY: 16,
        y: -10,
      },
    },
    // exporting: util.getExportingStructure(urlToFile)
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
};

export default ContigsDistribution;
