import React, { useContext, useState } from 'react';
import Loading from 'components/UI/Loading';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

import { VegaLite, VisualizationSpec } from 'react-vega';
import config from 'src/utils/config';

const NucleotideHistogram: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [isLoading, setIsLoading] = useState(true);

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    height: 300,
    width: 'container',
    title: {
      text: 'Nucleotide position histogram',
      fontSize: 16,
      fontWeight: 'bold',
    },
    data: {
      url: `${config.api}analyses/${overviewData.id}/nucleotide-distribution`,
      format: { type: 'tsv' },
    },
    transform: [
      { fold: ['A', 'T', 'C', 'G', 'N'] },
      {
        calculate: "{'A':4, 'T':3, 'C':2, 'G':1, 'N':0}[datum.key]",
        as: 'order',
      },
      { calculate: 'datum.pos * 1', as: 'pos' },
    ],
    encoding: {
      x: {
        field: 'pos',
        type: 'quantitative',
        scale: { domain: [1, 500] },
      },
      tooltip: [
        { field: 'pos', title: 'Position' },
        { field: 'A', type: 'quantitative' },
        { field: 'T', type: 'quantitative' },
        { field: 'C', type: 'quantitative' },
        { field: 'G', type: 'quantitative' },
        { field: 'N', type: 'quantitative' },
      ],
    },
    layer: [
      {
        mark: { type: 'area', line: {} },
        params: [
          {
            name: 'nuc',
            select: { type: 'point', fields: ['key'] },
            bind: 'legend',
          },
        ],
        transform: [{ filter: { param: 'nuc', empty: true } }],
        encoding: {
          x: {
            field: 'pos',
            type: 'quantitative',
            axis: { labelAngle: -20, tickCount: 56 },
          },
          y: {
            field: 'value',
            type: 'quantitative',
            stack: 'zero',
            scale: { domain: [0, 100] },
            axis: { tickCount: 4, grid: true },
          },
          color: {
            scale: {
              domain: ['A', 'T', 'C', 'G', 'N'],
              range: [
                'rgb(16, 150, 24)',
                'rgb(220, 57, 18)',
                'rgb(51, 102, 204)',
                'rgb(255, 153, 0)',
                'rgb(138, 65, 23)',
              ],
            },
            field: 'key',
            type: 'ordinal',
            title: 'Shift+Click for nucleotide multi-selection',
          },
          order: { field: 'order', type: 'ordinal' },
          opacity: { value: 0.7 },
        },
      },
      {
        mark: 'rule',
        params: [
          {
            name: 'hover',
            select: { type: 'point', on: 'mousemove', nearest: true },
          },
          {
            name: 'zoom',
            bind: 'scales',
            select: {
              type: 'interval',
              encodings: ['x'],
              zoom: 'wheel!',
              mark: { fill: '#111', fillOpacity: 0.5, stroke: '#595959' },
            },
          },
        ],
        encoding: {
          color: {
            condition: { param: 'hover', empty: false, value: '#595959' },
            value: 'transparent',
          },
        },
      },
    ],
    config: {
      view: { stroke: 'transparent' },
      axis: {
        grid: false,
        title: null,
        domain: false,
        tickColor: '#ccc',
        labelColor: '#666',
        labelFontSize: 12,
        titleFontSize: 14,
        titleFontWeight: 'normal',
      },
      legend: {
        labelFontSize: 14,
        labelFontWeight: 'bold',
        labelFont: 'Lucida Grande',
        orient: 'bottom',
        titleFontSize: 9,
        titleFontWeight: 'lighter',
      },
      title: { fontSize: 20, font: 'Lucida Grande', fontWeight: 'normal' },
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

export default NucleotideHistogram;
