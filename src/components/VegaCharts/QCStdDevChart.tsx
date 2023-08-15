import React, { useState } from 'react';
import Loading from 'components/UI/Loading';

import { VegaLite, VisualizationSpec } from 'react-vega';
import config from 'src/utils/config';
import { NonNormalizedSpec } from 'vega-lite/build/src/spec';
import VConcatBottom from './QC-chart-components/VConcatBottom';
import ChartTransforms from './QC-chart-components/transforms';
import VConcatTop from './QC-chart-components/VConcatTop';

interface QCStdDevProps {
  accession: string;
  type: string;
}

const QCStdDevChart: React.FC<QCStdDevProps> = ({ accession, type }) => {
  const [isLoading, setIsLoading] = useState(true);

  // let VConcatBottom: NonNormalizedSpec | null = null;
  let XScaleDomainMin: number;
  let XScaleDomainMax: number;
  // Conditional rendering of the Bottom Chart -> Seq length, GC distribution charts
  if (type === 'seq-length') {
    XScaleDomainMin = 0;
  } else if (type === 'gc-distribution') {
    XScaleDomainMin = 0;
    XScaleDomainMax = 100;
  }

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',

    data: {
      name: 'summaryData',
      url: `${config.api}${accession}/summary`,
      format: { type: 'tsv' },
    },
    // Moved tranforms and vconcat charts to QC-chart-components for better readability
    transform: ChartTransforms,
    vconcat: [
      VConcatTop(type, accession, config.api, XScaleDomainMin, XScaleDomainMax),
      VConcatBottom(type),
    ],
    config: {
      view: { stroke: 'transparent' },
      axis: {
        domain: false,
        tickColor: '#ccc',
        labelColor: '#666',
        titleColor: '#666',
        labelFontSize: 11,

        titleFontSize: 12,
        titleFontWeight: 'normal',
        titlePadding: 10,
      },

      legend: {
        orient: 'bottom',
        title: null,
        labelFontSize: 13,
        labelFontWeight: 'bold',
        symbolType: 'circle',
      },
      scale: { bandPaddingInner: 0.1 },
    },
  };

  const handleChartLoaded = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Loading size="large" />}
      <h3>Vega</h3>
      <VegaLite
        spec={spec}
        style={{ width: '100%' }}
        onNewView={handleChartLoaded}
      />
    </>
  );
};

export default QCStdDevChart;
