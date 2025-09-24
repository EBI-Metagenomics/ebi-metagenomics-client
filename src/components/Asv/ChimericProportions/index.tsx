import React, { useState, useEffect } from 'react';

const ChimericProportions = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dada2Stats, setDada2Stats] = useState({
    initial_number_of_reads: 0,
    proportion_matched: 0,
    proportion_chimeric: 0,
    final_number_of_reads: 0,
  });

  const parseTsvFile = (tsvContent) => {
    const lines = tsvContent.trim().split('\n');
    const stats = {
      initial_number_of_reads: 0,
      proportion_matched: 0,
      proportion_chimeric: 0,
      final_number_of_reads: 0,
    };

    // TODO: DO away with nested loop and or if-elses
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('\t')) {
        const [key, value] = line.split('\t');
        const trimmedKey = key.trim();
        const numValue = parseFloat(value.trim());
        if (trimmedKey in stats && !Number.isNaN(numValue)) {
          stats[trimmedKey] = numValue;
        }
      } else if (i + 1 < lines.length) {
        const key = line;
        const value = parseFloat(lines[i + 1].trim());
        if (key in stats && !Number.isNaN(value)) {
          stats[key] = value;
          i++;
        }
      }
    }

    return stats;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const tsvContent = await response.text();
        const parsedStats = parseTsvFile(tsvContent);

        setDada2Stats(parsedStats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching or parsing TSV file:', err);
        setError(
          'Failed to load data. Please check the file URL and try again.'
        );
        setLoading(false);
      }
    };

    if (fileUrl) {
      fetchData();
    }
  }, [fileUrl]);

  const getChimericInfo = (proportion) => {
    const percent = proportion * 100;
    if (percent <= 25) {
      return {
        color: '#22c55e', // green-500
        bgColor: '#dcfce7', // green-100
        borderColor: '#86efac', // green-300
        message: "The proportion of chimeric reads is within what you'd expect",
      };
    }
    return {
      color: '#ef4444', // red-500
      bgColor: '#fee2e2', // red-100
      borderColor: '#fca5a5', // red-300
      message:
        "The proportion of chimeric reads is above what you'd expect - something might have gone wrong at the primer trimming stage",
    };
  };

  if (loading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const chimericValue = dada2Stats.proportion_chimeric;
  const chimericInfo = getChimericInfo(chimericValue);

  const readReductionPercent =
    dada2Stats.initial_number_of_reads > 0
      ? (
          ((dada2Stats.initial_number_of_reads -
            dada2Stats.final_number_of_reads) /
            dada2Stats.initial_number_of_reads) *
          100
        ).toFixed(1)
      : 0;

  const statsCards = [
    {
      label: 'Initial Reads',
      value: dada2Stats.initial_number_of_reads.toLocaleString(),
      description: 'Total number of initial reads',
    },
    {
      label: 'Final Reads',
      value: dada2Stats.final_number_of_reads.toLocaleString(),
      description: `${readReductionPercent}% reduction after processing`,
    },
    {
      label: 'Proportion Chimeric',
      value: `${(dada2Stats.proportion_chimeric * 100).toFixed(2)}%`,
      description: chimericInfo.message,
      color: chimericInfo.color,
      bgColor: chimericInfo.bgColor,
      borderColor: chimericInfo.borderColor,
      isChimeric: true,
    },
  ];

  const gaugePosition = Math.min(Math.max(chimericValue * 100, 0), 100);

  const getSrrId = (url) => {
    const matches = url.match(/SRR\d+/);
    return matches ? matches[0] : 'Sample';
  };

  const sampleId = getSrrId(fileUrl);

  return (
    <div className="space-y-6">
      <div className="vf-card__content | vf-stack vf-stack--400">
        <h3 className="vf-card__heading text-lg font-bold mb-2">
          Amplicon Sequencing Results - {sampleId}
        </h3>

        <div className="space-y-4">
          <div className="vf-grid vf-grid__col-2">
            {statsCards.map((stat) => (
              <article
                key={stat.label}
                className="vf-card vf-card--brand vf-card--bordered"
                style={
                  stat.isChimeric
                    ? {
                        borderColor: stat.borderColor,
                        backgroundColor: stat.bgColor,
                      }
                    : {}
                }
              >
                <div className="vf-card__content | vf-stack vf-stack--400">
                  <h3 className="vf-card__heading">{stat.label}</h3>
                  <p
                    className="vf-card__subheading"
                    style={stat.isChimeric ? { color: stat.color } : {}}
                  >
                    {stat.value}
                  </p>
                  <p className="vf-card__text">{stat.description}</p>
                </div>
              </article>
            ))}
          </div>

          <article
            className="vf-card vf-card--brand vf-card--bordered"
            style={{
              borderColor: chimericInfo.borderColor,
              backgroundColor: chimericInfo.bgColor,
            }}
          >
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">
                <span
                  className="vf-card__link"
                  style={{ color: chimericInfo.color }}
                >
                  Chimeric Reads Thresholds
                  <svg
                    aria-hidden="true"
                    className="vf-card__heading__icon | vf-icon vf-icon-arrow--inline-end"
                    width="1em"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0C5.376.008.008 5.376 0
                      12zm13.707-5.209l4.5 4.5a1 1 0 010 1.414l-4.5 4.5a1 1 0 01-1.414-1.414l2.366-2.367a.25.25 0
                      00-.177-.424H6a1 1 0 010-2h8.482a.25.25 0 00.177-.427l-2.366-2.368a1 1 0 011.414-1.414z"
                      fill="currentColor"
                      fillRule="nonzero"
                    />
                  </svg>
                </span>
              </h3>

              {/* Simple Threshold Gauge */}
              <div className="mt-3 mb-3">
                <div className="relative h-4 rounded-full overflow-hidden bg-gray-100">
                  {/* Colored segments */}
                  <div className="absolute inset-0 flex">
                    <div style={{ backgroundColor: '#86efac', width: '25%' }} />
                    <div style={{ backgroundColor: '#fca5a5', width: '75%' }} />
                  </div>

                  {/* Marker for current value */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-black"
                    style={{
                      left: `${gaugePosition}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>

                {/* Gauge labels */}
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-600">Expected (≤25%)</span>
                  <span className="text-right text-red-500">
                    High ({'>'}25%)
                  </span>
                </div>
              </div>

              <p className="vf-card__text">
                <div className="border rounded-md p-3 bg-white">
                  <h4 className="text-sm font-bold mb-2">Legend</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-2 w-8">
                          <div className="w-4 h-4 border-2 rounded bg-green-50 border-green-200" />
                        </td>
                        <td className="py-1 font-medium text-gray-700">
                          Expected
                        </td>
                        <td className="py-1 text-gray-600">≤ 25%</td>
                        <td className="py-1 text-gray-600">Normal range</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2">
                          <div className="w-4 h-4 border-2 rounded bg-red-50 border-red-200" />
                        </td>
                        <td className="py-1 font-medium text-gray-700">High</td>
                        <td className="py-1 text-gray-600">{'>'} 25%</td>
                        <td className="py-1 text-gray-600">
                          Check primer trimming
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="pt-2 pr-2">
                          <div
                            className="w-4 h-4 flex items-center justify-center"
                            style={{ color: chimericInfo.color }}
                          >
                            <span className="text-xs">▶</span>
                          </div>
                        </td>
                        <td
                          className="pt-2 font-medium"
                          style={{ color: chimericInfo.color }}
                        >
                          Current value: {(chimericValue * 100).toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ChimericProportions;
