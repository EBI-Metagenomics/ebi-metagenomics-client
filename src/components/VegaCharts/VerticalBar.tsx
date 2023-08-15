import React, { useState } from 'react';
import Loading from 'components/UI/Loading';

import { VegaLite, VisualizationSpec } from 'react-vega';
import config from 'src/utils/config';

import './styles.css'; // styles for the slider

// Props for the VerticalBarChart component
interface VerticalBarChartProps {
  ChartTitle: string;
  titleX?: string;
  titleY?: string;
  accession: string;
  tooltipKey1?: string;
  tooltipVal1?: string;
  tooltipKey2?: string;
  tooltipVal2?: string;
  tooltipKey3?: string;
  y?: string;
  x?: string;
  lAngle?: number;
  paddingLabel?: number;
  maxSlider?: number;
  sliderValue?: number;
  overlapLabels?: boolean;
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  ChartTitle,
  titleX = null,
  titleY = 'Number of Matches',
  accession,
  tooltipKey1 = null,
  tooltipKey2 = null,
  tooltipKey3 = 'Count',
  tooltipVal1 = null,
  tooltipVal2 = null,
  y = 'count',
  x = 'accession',
  lAngle = -20,
  paddingLabel = 5,
  maxSlider = 30,
  sliderValue = 10,
  overlapLabels = false,
}) => {
  const [isLoading, setIsLoading] = useState(true); // loading state for the Loading component
  const [isLoaded, setIsLoaded] = useState(false); // loaded state for the slider to appear after the chart is loaded

  // Vega-Lite spec contains the data, transforms(data wrangling), and encoding(visual graphics)
  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    height: 300,
    width: 'container',
    title: ChartTitle,

    data: {
      url: `${config.api}${accession}`, // data access via URL
      format: { type: 'json', property: 'data' }, // format of the data
    },
    transform: [
      // Filter the data to only include the fields we want, rename the fields
      { calculate: 'datum.attributes.name', as: 'name' },
      { calculate: 'datum.attributes.accession', as: 'id' },
      { calculate: `datum.attributes['${x}']`, as: `${x}` },
      { calculate: `datum.attributes['${y}']`, as: `${y}` },
      { calculate: 'datum.attributes.description', as: 'description' },
      { window: [{ op: 'rank', as: 'rank' }] }, // rank the data (sorts)
      { filter: 'datum.rank <= Input' }, // filter the data based on the slider input
    ],
    mark: 'bar', // type of mark
    // encoding for the visual graphics
    encoding: {
      // encode the x and y axis -> type of data, field, axis title, etc.
      x: {
        field: `${x}`,
        type: 'ordinal',
        sort: { field: `${y}`, order: 'descending' },
        axis: {
          labelBaseline: 'line-top',
          labelPadding: paddingLabel,
          labelAngle: lAngle,
          labelAlign: 'center',
          labelOverlap: overlapLabels,
          labelSeparation: 2,
        },
        title: titleX,
      },
      y: {
        field: `${y}`,
        type: 'quantitative',
        axis: { title: titleY, tickCount: 4 },
      },
      tooltip: [
        { field: tooltipVal1, title: tooltipKey1 }, // tooltip
        { field: tooltipVal2, title: tooltipKey2 },
        { field: `${y}`, title: tooltipKey3 },
      ],
      fill: {
        // color for the bar, changes color on hover
        condition: {
          test: { param: 'hover', empty: false },
          value: '#95CEFF',
        },
        value: '#7cb5ec',
      },
    },
    params: [
      {
        name: 'hover', // parameter for the hover selection
        select: { type: 'point', on: 'mouseover', clear: 'mouseout' },
      },
      {
        name: 'Input', // parameter for the slider
        value: sliderValue,
        bind: { input: 'range', min: 5, max: maxSlider, step: 1 },
      },
    ],

    // configuration for the visual graphics (axis, legend, title, etc.)
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

  const handleLoaded = () => {
    setIsLoading(false);
    setIsLoaded(true);
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
      {/* The slider is hidden until the chart is loaded */}
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
