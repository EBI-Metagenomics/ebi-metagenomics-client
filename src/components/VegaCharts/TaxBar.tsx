import React, { useState } from 'react';
import Loading from 'components/UI/Loading';

import { VegaLite, VisualizationSpec } from 'react-vega';
import { TaxDatum } from 'src/components/Analysis/Taxonomy/PhylumCharts';

interface TaxBarProps {
  ChartTitle: string;
  title: string;
  sequencesType?: string;
  clusteredData: Array<TaxDatum>;
}
const TaxBar: React.FC<TaxBarProps> = ({
  ChartTitle,
  clusteredData,
  sequencesType = 'reads',
  title,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const spec: VisualizationSpec = {
    title: ChartTitle,
    data: { values: clusteredData },
    height: 300,
    width: 'container',
    mark: 'bar',
    transform: [
      { calculate: "split(datum.name, ' ')", as: 'lablelName' },
      { calculate: 'datum.percentage / 100', as: 'percentage' },
    ],
    encoding: {
      x: {
        field: 'lablelName',
        sort: '-y',
        axis: {
          title: null,
          labelOverlap: false,
          labelAngle: 360,
          labelPadding: 7,
        },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        axis: {
          title: 'Number of sequences',
          tickCount: 4,
        },
      },
      color: { field: 'color', type: 'nominal', scale: null },
      opacity: {
        condition: {
          test: { param: 'hover', empty: false },
          value: 0.8,
        },
        value: 1,
      },
      tooltip: [
        { field: 'name', type: 'nominal', title: `${title}` },
        { field: 'y', type: 'quantitative', title: `${sequencesType}` },
        {
          field: 'percentage',
          type: 'quantitative',
          format: '.2%',
        },
      ],
    },
    params: [
      {
        name: 'hover',
        select: { type: 'point', on: 'mouseover', clear: 'mouseout' },
      },
    ],
    config: {
      view: { stroke: 'transparent' },
      axis: {
        domain: false,
        tickColor: '#ccc',
        labelColor: '#666',
        titleColor: '#666',
        labelFontSize: 12,
        titleFontSize: 12,
        titleFontWeight: 'normal',
        titlePadding: 10,
      },

      title: { fontSize: 20, font: 'Lucida Grande', fontWeight: 'normal' },
      scale: { bandPaddingInner: 0.5 },
    },
  };

  const handleLoaded = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Loading size="large" />}
      <h3>Vega</h3>
      <VegaLite
        spec={spec}
        style={{ width: '100%', height: '100%' }}
        onNewView={handleLoaded}
      />
    </>
  );
};

export default TaxBar;
