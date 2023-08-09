import React, { useContext, useRef, useState } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';

type QualityControlProps = {
  summaryData: {
    [key: string]: string;
  } | null;
};

const QCChart: React.FC<QualityControlProps> = ({ summaryData }) => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const isAssembly = analysisData.attributes['experiment-type'] === 'assembly';
  const unit = isAssembly ? 'contigs' : 'reads';
  const capUnit = isAssembly ? 'Contigs' : 'Reads';

  const remaining = [0, 0, 0, 0, 0];
  const filtered = [0, 0, 0, 0, 0];
  const subsampled = [0, 0, 0, 0, 0];

  const analysisSummary = {};
  (
    (analysisData.attributes?.['analysis-summary'] as {
      key: string;
      value: string;
    }[]) || []
  ).forEach(({ key, value }) => {
    analysisSummary[key] = value;
  });

  if (summaryData) subsampled[4] = Number(summaryData.sequence_count);
  remaining[0] = Number(analysisSummary['Submitted nucleotide sequences']);
  remaining[1] = Number(
    analysisSummary['Nucleotide sequences after format-specific filtering']
  );
  remaining[2] = Number(
    analysisSummary['Nucleotide sequences after length filtering']
  );
  remaining[3] = Number(
    analysisSummary['Nucleotide sequences after undetermined bases filtering']
  );
  filtered[2] = remaining[1] - remaining[2];
  filtered[1] = remaining[0] - remaining[1];
  if (summaryData) filtered[4] = remaining[3] - remaining[4] - subsampled[4];
  const [isLoading, setIsLoading] = useState(true);

  const steps = [
    `Initial ${unit}`,
    'Trimming',
    'Length filtering',
    'Ambiguous base filtering',
    `${capUnit} subsampled for QC analysis`,
  ];

  const DataArray = [];
  for (let index = 0; index < 5; index++) {
    const stepObject = {
      name: steps[index],
      Remaining: remaining[index],
      Filtered: filtered[index],
      Subsampled: subsampled[index],
      sno: index,
    };
    DataArray.push(stepObject);
  }

  const spec: VisualizationSpec = {
    data: {
      values: DataArray,
    },
    title: 'Number of sequence contigs per QC step',
    width: 'container',
    params: [
      {
        name: 'hover',
        select: { type: 'point', fields: ['name'], on: 'mouseover' },
      },
    ],
    mark: 'bar',
    encoding: {
      tooltip: [
        { field: 'name', type: 'nominal', title: 'QC step' },
        { field: 'field', type: 'nominal', title: 'Type' },
        { field: 'value', type: 'quantitative', title: 'Count', format: ',' },
      ],
      y: {
        field: 'name',
        type: 'nominal',
        title: null,
        sort: {
          field: 'sno',
        },
      },
      x: {
        stack: true,
        field: 'value',
        type: 'quantitative',
        title: 'Count',
        axis: {
          format: 's',
        },
      },
      color: {
        field: 'field',
        type: 'nominal',
        scale: {
          range: ['#ccccd3', '#058dc7', '#8dc7c7'],
        },
      },
      opacity: {
        condition: {
          test: { param: 'hover', empty: false },
          value: 0.7,
        },
        value: 1,
      },
    },
    transform: [
      { fold: ['Remaining', 'Filtered', 'Subsampled'], as: ['field', 'value'] },
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
      legend: {
        orient: 'bottom',
        title: null,
        labelFontSize: 13,
        labelFontWeight: 'bold',
        symbolType: 'circle',
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
export default QCChart;
