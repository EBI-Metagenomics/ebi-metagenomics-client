import { NonNormalizedSpec } from 'vega-lite/build/src/spec';

const VConcatTop = (
  type: string,
  accession: string,
  api: string,
  XScaleDomainMin?: number,
  XScaleDomainMax?: number
): NonNormalizedSpec => {
  let ChartTitle: string;
  let standardDeviation: string;
  let Mean: string;
  // Conditional rendering of the chart title and the standard deviation and mean values
  if (type === 'seq-length') {
    ChartTitle = 'Contigs length histogram';
    standardDeviation = 'standard_deviation_length';
    Mean = 'average_length';
  } else {
    ChartTitle = 'Contigs GC distribution';
    standardDeviation = 'standard_deviation_gc_content';
    Mean = 'average_gc_content';
  }
  return {
    // Layering the error band(standard dev) and the histogram
    layer: [
      {
        title: {
          text: ChartTitle,
          font: 'Lucida Grande',
          fontSize: 16,
          fontWeight: 'bold',
        },
        mark: {
          type: 'errorband',
          opacity: 0.1,
          color: '#808080',
        },
        encoding: {
          x: {
            field: `lower_bound_${type}`,
            type: 'quantitative',
          },
          x2: { field: `upper_bound_${type}` },
          tooltip: [
            {
              field: standardDeviation,
              title: 'Standard Deviation (±)',
              format: '.2f',
            },
            {
              field: Mean,
              title: 'Mean',
              format: '.2f',
            },
          ],
        },
      },
      {
        height: 340,
        width: 500,
        data: {
          url: `${api}${accession}/${type}`,
          format: { type: 'tsv' },
        },
        mark: { type: 'area', color: '#058dc7', line: { color: '#058dc7' } },
        encoding: {
          x: {
            field: 'key',
            type: 'quantitative',
            scale: { domainMin: XScaleDomainMin, domainMax: XScaleDomainMax },
            axis: { grid: false, title: null, tickCount: 5, format: '.2s' },
          },
          y: {
            field: 'value',
            type: 'quantitative',
            axis: { tickCount: 5, title: 'Number of Contigs' },
          },

          tooltip: [
            { field: 'key', type: 'quantitative' },
            { field: 'value', title: 'Contigs' },
          ],
        },
      },
    ],
  };
};

export default VConcatTop;
