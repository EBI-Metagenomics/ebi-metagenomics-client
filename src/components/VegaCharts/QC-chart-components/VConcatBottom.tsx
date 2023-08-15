import { NonNormalizedSpec } from 'vega-lite/build/src/spec';

// eslint-disable-next-line consistent-return
const VConcatBottom = (type: string): NonNormalizedSpec => {
  if (type === 'seq-length') {
    return {
      width: 500,
      height: 80,
      data: {
        name: 'summaryData',
      },
      transform: [
        {
          filter: {
            field: 'key',
            oneOf: ['length_min', 'average_length', 'length_max'], // filter the data to only include the fields we want
          },
        },
        {
          // make the key more descriptive(used for labelling the bars)
          calculate:
            "if(datum.key == 'length_min', 'Minimum', datum.key == 'average_length' ? 'Average' : 'Maximum')",
          as: 'label',
        },
      ],
      // Bar chart for the sequence length (min, avg, max)
      mark: { type: 'bar', opacity: 0.9 },
      params: [
        {
          name: 'highlight',
          select: { type: 'point', on: 'mouseover', clear: 'mouseout' }, // bar highlight over hover functionality
        },
      ],
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
          scale: { range: ['#72bf3f', 'red', '#723fbf'] },
          legend: null,
        },
        opacity: {
          condition: {
            test: { param: 'highlight', empty: false },
            value: 1,
          },
        },
        tooltip: [
          { field: 'label', type: 'nominal', title: 'Description' },
          {
            field: 'value',
            type: 'quantitative',
            title: 'Count',
            format: ',.2f',
          },
        ],
      },
    };
  }
  if (type === 'gc-distribution') {
    return {
      layer: [
        // Layered chart for the bar chart and error band (GC Content % distribution)
        {
          width: 500,
          height: 30,
          mark: { type: 'bar', opacity: 1 },
          params: [
            {
              name: 'highlight',
              select: { type: 'point', on: 'mouseover', clear: 'mouseout' }, // bar highlight over hover functionality
            },
          ],
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
            opacity: {
              condition: {
                test: { param: 'highlight', empty: true },
                value: 0.9,
              },
            },
            order: { field: 'order', type: 'ordinal' },
            tooltip: [
              { field: 'content_type', title: 'Content Type' },
              { field: 'value', title: 'Percentage (%)', format: '.2f' },
            ],
          },
        },
        {
          mark: { type: 'errorband', opacity: 0.4, color: '#808080' },
          encoding: {
            x: {
              field: 'lower_bound_gc-distribution',
              type: 'quantitative',
              scale: { domain: [1, 100] },
              axis: { title: 'GC content (%)' },
            },
            x2: { field: 'upper_bound_gc-distribution' },

            tooltip: [
              {
                field: 'standard_deviation_gc_content',
                title: 'Standard Deviation (±)',
                format: '.2f',
              },
            ],
          },
        },
        {
          mark: {
            type: 'rule',
            color: 'red',
            size: 2,
          },
          encoding: {
            x: {
              field: 'average_gc_content',
              type: 'quantitative',
            },

            tooltip: [
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
  }
};

export default VConcatBottom;
