import React, { useContext, useState } from 'react';
import Loading from 'components/UI/Loading';
import AnalysisContext from 'pages/Analysis/AnalysisContext';

import { VegaLite, VisualizationSpec } from 'react-vega';
import './styles.css';
import config from 'src/utils/config';

const GOBar: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      url: `${config.api}analyses/${overviewData.id}/go-slim`,
      format: { type: 'json', property: 'data' },
    },
    params: [
      {
        name: 'hover',
        select: { type: 'point', on: 'mouseover', clear: 'mouseout' },
      },
      {
        name: 'Input',
        value: 15,
        bind: { input: 'range', min: 10, max: 43, step: 1 },
      },
    ],
    transform: [
      { calculate: 'datum.attributes.lineage', as: 'lineage' },
      { calculate: 'datum.attributes.description', as: 'description' },
      { calculate: 'datum.attributes.count', as: 'annotations' },
    ],
    hconcat: [
      {
        title: 'Biological Process',
        height: 800,
        mark: {
          type: 'bar',
          tooltip: true,
        },
        encoding: {
          x: {
            field: 'annotations',
            type: 'quantitative',
          },
          y: {
            field: 'description',
            type: 'nominal',
            sort: '-x',
          },
          fill: {
            condition: {
              test: {
                param: 'hover',
                empty: false,
              },
              value: '#C4ECF4',
            },
            value: '#ABD3DB',
          },
        },
        transform: [
          {
            filter: "datum.lineage === 'biological_process'",
          },
          { window: [{ op: 'rank', as: 'rank' }] },
          { filter: 'datum.rank <= Input' },
        ],
      },
      {
        title: 'Molecular Function',
        height: 800,
        mark: { type: 'bar', tooltip: true },
        encoding: {
          x: { field: 'annotations', type: 'quantitative' },
          y: { field: 'description', type: 'nominal', sort: '-x' },
          fill: {
            condition: {
              test: { param: 'hover', empty: false },
              value: '#78aeae',
            },
            value: '#5f9595',
          },
        },
        transform: [
          { filter: "datum.lineage === 'molecular_function'" },
          { window: [{ op: 'rank', as: 'rank' }] },
          { filter: 'datum.rank <= Input' },
        ],
      },
      {
        title: 'Cellular Component',
        height: 800,
        mark: { type: 'bar', tooltip: true },
        encoding: {
          x: { field: 'annotations', type: 'quantitative' },
          y: { field: 'description', type: 'nominal', sort: '-x' },
          fill: {
            condition: {
              test: { param: 'hover', empty: false },
              value: '#f2ddd1',
            },
            value: '#d9c4b8',
          },
        },
        transform: [
          { filter: "datum.lineage === 'cellular_component'" },
          { window: [{ op: 'rank', as: 'rank' }] },
          { filter: 'datum.rank <= Input' },
        ],
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
        titlePadding: 5,
      },
      axisX: { orient: 'top', tickMinStep: 2000 },
      axisY: { title: null },
      title: {
        fontSize: 18,
        font: 'Lucida Grande',
        fontWeight: 'normal',
        offset: 10,
      },
      scale: { bandPaddingInner: 0.5 },
    },
  };

  const handleChartLoaded = () => {
    setIsLoading(false);
    setIsLoaded(true);
  };

  return (
    <>
      {isLoading && <Loading size="large" />}
      <VegaLite
        spec={spec}
        style={{ width: '100%' }}
        onNewView={handleChartLoaded}
      />
      {isLoaded && (
        <style>
          {`
          .vega-bindings {
            display: block;
            position: absolute;
            left: 0px;
            top: -15px;
          }
        `}
        </style>
      )}
    </>
  );
};

export default GOBar;
