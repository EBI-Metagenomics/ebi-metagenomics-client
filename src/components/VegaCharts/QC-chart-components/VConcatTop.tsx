import { NonNormalizedSpec } from 'vega-lite/build/src/spec';

const VConcatTop = (
  type: string,
  accession: string,
  api: string,
  XScaleDomainMin?: number,
  XScaleDomainMax?: number
): NonNormalizedSpec => {
  let ChartTitle: string;
  let Mean: string;
  // Conditional rendering of the chart title and the standard deviation and mean values
  if (type === 'seq-length') {
    ChartTitle = 'Contigs length histogram';
    Mean = 'average_length';
  } else {
    ChartTitle = 'Contigs GC distribution';
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
          offset: 15,
        },
        mark: {
          type: 'text',
          baseline: 'line-bottom',
          align: 'center',
          color: '#666',
          dy: -15,
        },
        encoding: {
          x: {
            field: Mean,
            type: 'quantitative',
          },
          y: {
            value: 0,
          },
          text: {
            value: 'Standard Deviation',
          },
        },
      },
      {
        mark: {
          type: 'text',
          baseline: 'bottom',
          align: 'center',
          color: '#666',
        },
        encoding: {
          x: {
            field: Mean,
            type: 'quantitative',
          },
          y: {
            value: 0,
          },
          text: {
            field: `std_dev_text_${type}`,
          },
        },
      },

      {
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
              field: `std_dev_text_${type}`,
              title: 'Standard Deviation',
            },
          ],
        },
      },

      {
        height: 340,
        width: 500,
        data: {
          url: `${api}${accession}/${type}`,
          format: {
            type: 'tsv',
          },
        },
        layer: [
          {
            mark: {
              type: 'area',
              color: '#058dc7',
              line: {
                color: '#058dc7',
                size: 2,
              },
            },
            encoding: {
              x: {
                field: 'key',
                type: 'quantitative',
                scale: {
                  domainMin: XScaleDomainMin,
                  domainMax: XScaleDomainMax,
                },
                axis: { grid: false, title: null, tickCount: 5, format: '.2s' },
              },
              y: {
                field: 'value',
                type: 'quantitative',
                axis: {
                  tickCount: 5,
                  title: 'Number of Contigs',
                },
              },
            },
          },
          {
            mark: {
              type: 'rule',
              color: '#595959',
            },
            encoding: {
              x: {
                field: 'key',
                type: 'quantitative',
              },
              opacity: {
                condition: {
                  param: 'hover',
                  empty: false,
                  value: 1,
                },
                value: 0,
              },
              tooltip: [
                {
                  field: 'key',
                  type: 'quantitative',
                  title:
                    type === 'seq-length'
                      ? 'Sequence Length'
                      : 'GC Content (%)',
                },
                { field: 'value', title: 'Contigs' },
              ],
            },
            params: [
              {
                name: 'hover',
                select: {
                  type: 'point',
                  on: 'mousemove',
                  clear: 'mouseout',
                  nearest: true,
                },
              },
            ],
          },
        ],
      },
      {
        mark: {
          type: 'rule',
          color: 'red',
          size: 2,
        },
        encoding: {
          x: {
            field: Mean,
            type: 'quantitative',
          },
          tooltip: [
            {
              field: Mean,
              title: 'Mean',
              format: '.2f',
            },
          ],
        },
      },
    ],
  };
};

export default VConcatTop;

// {
//   title: {
//     text: ChartTitle,
//     font: 'Lucida Grande',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   mark: {
//     type: 'errorband',
//     opacity: 0.1,
//     color: '#808080',
//   },
//   encoding: {
//     x: {
//       field: `lower_bound_${type}`,
//       type: 'quantitative',
//     },
//     x2: { field: `upper_bound_${type}` },
//     tooltip: [
//       {
//         field: standardDeviation,
//         title: 'Standard Deviation (±)',
//         format: '.2f',
//       },
//       {
//         field: Mean,
//         title: 'Mean',
//         format: '.2f',
//       },
//     ],
//   },
// },
// {
//   height: 340,
//   width: 500,
//   data: {
//     url: `${api}${accession}/${type}`,
//     format: { type: 'tsv' },
//   },
//   mark: { type: 'area', color: '#058dc7', line: { color: '#058dc7' } },
//   encoding: {
//     x: {
//       field: 'key',
//       type: 'quantitative',
//       scale: { domainMin: XScaleDomainMin, domainMax: XScaleDomainMax },
//       axis: { grid: false, title: null, tickCount: 5, format: '.2s' },
//     },
//     y: {
//       field: 'value',
//       type: 'quantitative',
//       axis: { tickCount: 5, title: 'Number of Contigs' },
//     },

//     tooltip: [
//       {
//         field: 'key',
//         type: 'quantitative',
//         title:
//           type === 'seq-length' ? 'Sequence Length' : 'GC Content (%)',
//       },
//       { field: 'value', title: 'Contigs' },
//     ],
//   },
// },
