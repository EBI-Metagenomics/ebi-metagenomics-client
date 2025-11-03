import React, { useContext, useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { ResponseFormat, TSVResponse } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

addExportMenu(Highcharts);

type ContigsHistogramProps = {
  summaryData: {
    [key: string]: string;
  };
};
const ContigsHistogram: React.FC<ContigsHistogramProps> = ({ summaryData }) => {
  const { overviewData } = useContext(AnalysisContext);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/seq-length`,
    {},
    {},
    ResponseFormat.TSV
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const histData = (data as unknown as TSVResponse).map(([x, y]) => [
    Number(x),
    Number(y),
  ]);
  const lengthMax = Math.max(...histData.map(([x]) => x));

  const isAssembly =
    overviewData?.attributes &&
    overviewData.attributes['experiment-type'] === 'assembly';
  const unit = isAssembly ? 'contigs' : 'reads';
  const capUnit = isAssembly ? 'Contigs' : 'Reads';

  const options = {
    chart: {
      marginLeft: 78,
      style: {
        fontFamily: 'Helvetica',
      },
      zoomType: 'x',
    },
    title: {
      text: `${capUnit} length histogram`,
      style: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    // TODO: Form wha I can see isFromSubset is not in use anymore.
    // Remove this code if after confirming
    // subtitle: {
    //     text: ((chartOptions['isFromSubset'])
    //         ? 'A subset of the sequences was used to generate this chart -'
    //         : '') + 'Click and drag in the plot area to zoom in'
    // },
    yAxis: {
      title: { text: `Number of ${unit}` },
    },
    xAxis: {
      min: 0,
      max: 100 * (Math.floor(lengthMax / 100) + 1),
      plotBands:
        summaryData === null
          ? []
          : [
              {
                // visualize the standard deviation
                from:
                  Number(summaryData.average_length) -
                  Number(summaryData.standard_deviation_length),
                to:
                  Number(summaryData.average_length) +
                  Number(summaryData.standard_deviation_length),
                color: 'rgba(128, 128, 128, .2)',
                label: {
                  text: `Standard Deviation<br/>\u00B1${Number(
                    summaryData.standard_deviation_length
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
        data: histData,
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
      containerProps={{ id: 'reads-length-hist' }}
    />
  );
};

export default ContigsHistogram;
