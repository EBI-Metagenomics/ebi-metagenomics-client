import { Transform } from 'vega-lite/build/src/transform';

const ChartTransforms: Transform[] = [
  {
    filter: {
      field: 'key',
      oneOf: [
        'average_length',
        'standard_deviation_length',
        'average_gc_content',
        'standard_deviation_gc_content',
        'length_min',
        'length_max',
      ],
    },
  },
  { pivot: 'key', value: 'value' },
  {
    calculate: 'datum.average_length - datum.standard_deviation_length',
    as: 'lower_bound_seq-length',
  },
  {
    calculate: 'datum.average_length + datum.standard_deviation_length',
    as: 'upper_bound_seq-length',
  },
  {
    calculate: 'datum.average_gc_content - datum.standard_deviation_gc_content',
    as: 'lower_bound_gc-distribution',
  },
  {
    calculate: 'datum.average_gc_content + datum.standard_deviation_gc_content',
    as: 'upper_bound_gc-distribution',
  },
  { calculate: '100 - datum.average_gc_content', as: 'AT Content' },
  { calculate: 'datum.average_gc_content', as: 'GC Content' },
  {
    fold: ['GC Content', 'AT Content'],
    as: ['content_type', 'value'],
  },
];
export default ChartTransforms;
