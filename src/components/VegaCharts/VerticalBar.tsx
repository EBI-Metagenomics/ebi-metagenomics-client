import React, { useState } from 'react';
import Loading from 'components/UI/Loading';

import { VegaLite, VisualizationSpec } from 'react-vega';
import config from 'src/utils/config';

import './styles.css';

interface VerticalBarChartProps {
  ChartTitle: string;
  titleX?: string;
  titleY?: string;
  accession: string;
  tooltipVal?: string;
  tooltipKeyField?: string;
  tooltipKey: string;
  y?: string;
  x?: string;
  lAngle?: number;
  maxSlider?: number;
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  ChartTitle,
  titleX = null,
  titleY = 'Number of Matches',
  accession,
  tooltipVal = 'count',
  tooltipKeyField = 'description',
  tooltipKey,
  y = 'count',
  x = 'accession',
  lAngle = -20,
  maxSlider = 30,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    height: 300,
    width: 'container',
    title: ChartTitle,

    data: {
      url: `${config.api}${accession}`,
      format: { type: 'json', property: 'data' },
    },
    transform: [
      { calculate: 'datum.attributes.name', as: 'name' },
      { calculate: 'datum.attributes.accession', as: 'id' },
      { calculate: `datum.attributes['${x}']`, as: `${x}` },
      { calculate: `datum.attributes['${y}']`, as: `${y}` },
      { calculate: 'datum.attributes.description', as: 'description' },
      { window: [{ op: 'rank', as: 'rank' }] },
      { filter: 'datum.rank <= Input' },
    ],
    mark: 'bar',
    encoding: {
      x: {
        field: `${x}`,
        type: 'ordinal',
        sort: { field: `${y}`, order: 'descending' },
        axis: {
          labelBaseline: 'line-top',
          labelPadding: 15,
          labelAngle: lAngle,
          labelAlign: 'center',
          labelLimit: 23,
        },
        title: titleX,
      },
      y: {
        field: `${y}`,
        type: 'quantitative',
        axis: { title: titleY, tickCount: 4 },
      },
      tooltip: [
        { field: tooltipKeyField, title: tooltipKey },
        { field: `${y}`, title: tooltipVal },
      ],
      fill: {
        condition: {
          test: { param: 'hover', empty: false },
          value: '#95CEFF',
        },
        value: '#7cb5ec',
      },
    },
    params: [
      {
        name: 'hover',
        select: { type: 'point', on: 'mouseover', clear: 'mouseout' },
      },
      {
        name: 'Input',
        value: 10,
        bind: { input: 'range', min: 5, max: maxSlider, step: 1 },
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

        titleFontSize: 14,
        titleFontWeight: 'normal',
        titlePadding: 10,
      },
      legend: {
        labelFontSize: 12,
        titleFontSize: 14,
        titleFontWeight: 'normal',
      },
      title: { fontSize: 20, font: 'Lucida Grande', fontWeight: 'normal' },
      scale: { bandPaddingInner: 0.5 },
    },
  };
  console.log(spec.data);
  const handleLoaded = () => {
    setIsLoading(false);
    setIsLoaded(true);
  };

  return (
    <>
      {isLoading && <Loading size="large" />}
      <VegaLite
        spec={spec}
        style={{ width: '100%', height: '100%' }}
        onNewView={handleLoaded}
      />
      {isLoaded && (
        <style>
          {`
          .vega-bindings {
            display: block;
          }
        `}
        </style>
      )}
    </>
  );
};

export default VerticalBarChart;
