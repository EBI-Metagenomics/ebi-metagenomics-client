import { NonNormalizedSpec } from 'vega-lite/build/src/spec';

const VConcat2ChartSeqLength: NonNormalizedSpec = {
  width: 500,
  height: 80,
  data: {
    name: 'summaryData',
  },
  transform: [
    {
      filter: {
        field: 'key',
        oneOf: ['length_min', 'average_length', 'length_max'],
      },
    },
    {
      calculate:
        "if(datum.key == 'length_min', 'Minimum', datum.key == 'average_length' ? 'Average' : 'Maximum')",
      as: 'label',
    },
  ],

  mark: { type: 'bar' },

  encoding: {
    y: {
      field: 'label',
      type: 'nominal',
      axis: {
        title: null,
      },
      sort: ['Minimum', 'Average', 'Maximum'],
    },
    x: {
      field: 'value',
      type: 'quantitative',
      axis: { tickCount: 5, format: '.2s', title: 'Sequence length (bp)' },
    },
    color: {
      field: 'label',
      sort: ['Minimum', 'Average', 'Maximum'],
      scale: { range: ['#72bf3f', '#3f72bf', '#723fbf'] },
      legend: null,
    },
    tooltip: [
      { field: 'label', type: 'nominal', title: 'Description' },
      { field: 'value', type: 'quantitative', title: 'Count', format: ',' },
    ],
  },
};

const VConcat2ChartGCDistribution = (type: string): NonNormalizedSpec => {
  return {
    layer: [
      {
        width: 500,
        height: 30,
        mark: { type: 'bar' },
        encoding: {
          x: {
            field: 'value',
            type: 'quantitative',
            stack: true,

            axis: { tickCount: 10 },
          },

          color: {
            field: 'content_type',
            sort: 'descending',
            scale: { range: ['#3f72bf', '#723fbf'] },
          },
          order: { field: 'order', type: 'ordinal' },
          tooltip: [
            { field: 'content_type', title: 'Content Type' },
            { field: 'value', title: 'Percentage (%)' },
          ],
        },
      },
      {
        mark: { type: 'errorband', opacity: 0.4, color: '#808080' },
        encoding: {
          x: {
            field: `lower_bound_${type}`,
            type: 'quantitative',
            scale: { domain: [1, 100] },
            axis: { title: 'GC content (%)' },
          },
          x2: { field: `upper_bound_${type}` },
          tooltip: [
            {
              field: 'standard_deviation_gc_content',
              title: 'Standard Deviation (±)',
              format: '.2f',
            },
            {
              field: 'average_gc_content',
              title: 'Mean',
              format: '.2f',
            },
          ],
        },
      },
    ],
  };
};

export { VConcat2ChartSeqLength, VConcat2ChartGCDistribution };
