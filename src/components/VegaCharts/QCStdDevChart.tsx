import React, { useState } from 'react';
import Loading from 'components/UI/Loading';

import { VegaLite, VisualizationSpec } from 'react-vega';
import config from 'src/utils/config';
import { NonNormalizedSpec } from 'vega-lite/build/src/spec';
import {
  VConcat2ChartSeqLength,
  VConcat2ChartGCDistribution,
} from './QC-chart-components/VConcat2';
import VConcat1Chart from './QC-chart-components/VConcat1';
import ChartTransforms from './QC-chart-components/transforms';

interface QCStdDevProps {
  accession: string;
  type: string;
}

const QCStdDevChart: React.FC<QCStdDevProps> = ({ accession, type }) => {
  const [isLoading, setIsLoading] = useState(true);

  let VConcat2Chart: NonNormalizedSpec | null = null;
  let XScaleDomainMin;
  let XScaleDomainMax;
  if (type === 'seq-length') {
    XScaleDomainMin = 0;
    VConcat2Chart = VConcat2ChartSeqLength;
  } else if (type === 'gc-distribution') {
    XScaleDomainMin = 0;
    XScaleDomainMax = 100;
    VConcat2Chart = VConcat2ChartGCDistribution(type);
  }

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',

    data: {
      name: 'summaryData',
      url: `${config.api}${accession}/summary`,
      format: { type: 'tsv' },
    },

    transform: ChartTransforms,
    vconcat: [
      VConcat1Chart(
        type,
        accession,
        config.api,
        XScaleDomainMin,
        XScaleDomainMax
      ),
      VConcat2Chart,
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
        labelFontSize: 12,
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
