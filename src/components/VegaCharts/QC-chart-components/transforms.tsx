import { Transform } from 'vega-lite/build/src/transform';

const ChartTransforms: Transform[] = [
  {
    // Filter the data to only include the fields we want
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
  // Pivot the data
  { pivot: 'key', value: 'value' },
  // Calculate the lower and upper bounds for the standard deviation (sequence length and GC content)
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
  {
    calculate: "'± ' + datum.standard_deviation_gc_content",
    as: 'std_dev_text_gc-distribution',
  },
  {
    calculate: "'± ' + datum.standard_deviation_length",
    as: 'std_dev_text_seq-length',
  },
  // Calculate the AT and GC content
  { calculate: '100 - datum.average_gc_content', as: 'AT Content' },
  { calculate: 'datum.average_gc_content', as: 'GC Content' },
  {
    fold: ['GC Content', 'AT Content'], // fold the columns into a single column (for stacked bar chart)
    as: ['content_type', 'value'],
  },
];
export default ChartTransforms;
