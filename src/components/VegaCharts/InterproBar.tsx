import React, { useContext, useState } from 'react';
import Loading from 'components/UI/Loading';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

import { VegaLite, VisualizationSpec } from 'react-vega';
import config from 'src/utils/config';

const InterProBar: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const isAssembly = overviewData.attributes['experiment-type'] === 'assembly';
  const prefix = isAssembly ? 'Contigs' : 'Reads';

  const [isLoading, setIsLoading] = useState(true);

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    height: 125,
    width: 'container',
    title: 'Sequence feature summary',
    data: {
      url: `${config.api}analyses/${overviewData.id}`,
      format: { type: 'json', property: 'data.attributes.analysis-summary' },
    },
    transform: [
      {
        calculate: `datum.key === 'Reads with predicted CDS' ? '${prefix} with predicted CDS' :
        datum.key === 'Reads with predicted RNA' ? '${prefix} with predicted RNA' :
        datum.key === 'Reads with InterProScan match' ? '${prefix} with InterProScan match' :
        datum.key === 'Predicted CDS' ? 'Predicted CDS' :
        datum.key === 'Predicted CDS with InterProScan match' ? 'Predicted CDS with InterProScan match' :
        null`,
        as: 'description',
      },
      { calculate: 'datum.value', as: 'count' },
      {
        filter: 'datum.description !== null',
      },
    ],
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'count',
        type: 'quantitative',
        scale: {
          type: 'log',
          base: 2,
        },
        axis: {
          title: 'Count (note the logarithmic scale)',
          tickCount: 10,
          format: '.2s',
        },
      },
      y: {
        field: 'description',
        type: 'nominal',
        axis: { title: null },
        sort: [
          `${prefix} with predicted CDS`,
          `${prefix} with predicted RNA`,
          `${prefix} with InterProScan match`,
          'Predicted CDS',
          'Predicted CDS with InterProScan match',
        ],
      },
      tooltip: [
        { field: 'description', type: 'nominal', title: 'Description' },
        { field: 'count', type: 'quantitative', title: 'Count', format: ',' },
      ],
      fill: {
        condition: {
          test: { param: 'hover', empty: false },
          value: '#1EA6E0',
        },
        value: '#058DC7',
      },
    },
    params: [
      {
        name: 'hover',
        select: { type: 'point', on: 'mouseover', clear: 'mouseout' },
      },
    ],
    config: {
      view: {
        stroke: 'transparent',
      },
      axis: {
        ticks: false,
        domain: false,
        tickColor: '#ccc',
        labelColor: '#666',
        titleColor: '#666',
        labelFontSize: 11,
        titleFontSize: 12,
        titleFontWeight: 'normal',
        labelPadding: 15,
        labelLimit: 0,
      },
      tooltipFormat: {
        numberFormat: '.2s',
      },
      title: { fontSize: 18, font: 'Lucida Grande', fontWeight: 'normal' },
      scale: { bandPaddingInner: 0.5 },
    },
  };

  const handleChartLoaded = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Loading size="large" />}
      <VegaLite
        spec={spec}
        style={{ width: '100%' }}
        onNewView={handleChartLoaded}
      />
    </>
  );
};

export default InterProBar;
