import { useEffect, useState } from 'react';
import { fetchText } from 'utils/fetch';

type Dada2Stats = {
  initial_number_of_reads: number | null;
  proportion_matched: number | null;
  proportion_chimeric: number | null;
  final_number_of_reads: number | null;
};

type ThresholdInfo = {
  color: string;
  message: string;
};

type SummaryCard = {
  label: string;
  value: string;
  description: string;
  color?: string;
};

const EMPTY_DADA2_STATS: Dada2Stats = {
  initial_number_of_reads: null,
  proportion_matched: null,
  proportion_chimeric: null,
  final_number_of_reads: null,
};

const STAT_KEY_MAPPING: Record<string, keyof Dada2Stats> = {
  initial_number_of_reads: 'initial_number_of_reads',
  initial_read_count: 'initial_number_of_reads',
  proportion_matched: 'proportion_matched',
  proportion_reads_matched: 'proportion_matched',
  proportion_chimeric: 'proportion_chimeric',
  proportion_reads_chimeric: 'proportion_chimeric',
  final_number_of_reads: 'final_number_of_reads',
  final_nonchimeric_read_count: 'final_number_of_reads',
};

const normalizeStatKey = (key: string): string =>
  key
    .trim()
    .toLowerCase()
    .replace(/[:\s-]+/g, '_');

const parseNumericValue = (value: string): number | null => {
  const parsedValue = parseFloat(value.trim());
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const formatCount = (value: number | null): string =>
  value === null ? 'N/A' : value.toLocaleString();

const formatPercent = (value: number | null): string =>
  value === null ? 'N/A' : `${(value * 100).toFixed(2)}%`;

const calculateReadReductionPercent = (
  initialReads: number | null,
  finalReads: number | null
): string | null => {
  if (initialReads === null || finalReads === null || initialReads <= 0) {
    return null;
  }

  return (((initialReads - finalReads) / initialReads) * 100).toFixed(1);
};

const deriveMatchedReadProportion = ({
  proportion_matched: proportionMatched,
  initial_number_of_reads: initialReads,
  final_number_of_reads: finalReads,
}: Dada2Stats): number | null => {
  if (proportionMatched !== null) {
    return proportionMatched;
  }

  if (initialReads === null || finalReads === null || initialReads <= 0) {
    return null;
  }

  return finalReads / initialReads;
};

const getStatusInfo = (
  proportion: number | null,
  thresholdPercent: number,
  goodWhenAtOrAbove: boolean,
  passingMessage: string,
  failingMessage: string
): ThresholdInfo => {
  if (proportion === null) {
    return {
      color: '#475569',
      message: 'This metric is not available in the current statistics file.',
    };
  }

  const percent = proportion * 100;
  const isPassing = goodWhenAtOrAbove
    ? percent >= thresholdPercent
    : percent <= thresholdPercent;

  return isPassing
    ? {
        color: '#22c55e',
        message: passingMessage,
      }
    : {
        color: '#ef4444',
        message: failingMessage,
      };
};

const ChimericProportions = ({ fileUrl }: { fileUrl: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dada2Stats, setDada2Stats] = useState<Dada2Stats>(EMPTY_DADA2_STATS);

  const parseTsvFile = (tsvContent: string): Dada2Stats => {
    const lines = tsvContent.trim().split('\n');
    const stats = { ...EMPTY_DADA2_STATS };

    // TODO: DO away with nested loop and or if-elses
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('\t')) {
        const [key, value] = line.split('\t');
        const normalizedKey = normalizeStatKey(key);
        const parsedValue = parseNumericValue(value);
        const mappedKey = STAT_KEY_MAPPING[normalizedKey];

        if (mappedKey && parsedValue !== null) {
          stats[mappedKey] = parsedValue;
        }
      } else if (i + 1 < lines.length) {
        const normalizedKey = normalizeStatKey(line);
        const parsedValue = parseNumericValue(lines[i + 1]);
        const mappedKey = STAT_KEY_MAPPING[normalizedKey];

        if (mappedKey && parsedValue !== null) {
          stats[mappedKey] = parsedValue;
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
        const tsvContent = await fetchText(
          fileUrl,
          {},
          'The statistics data file is empty or missing.'
        );
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

  if (loading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const chimericValue = dada2Stats.proportion_chimeric;
  const chimericInfo = getStatusInfo(
    chimericValue,
    25,
    false,
    "The proportion of chimeric reads is within what you'd expect",
    "The proportion of chimeric reads is above what you'd expect - something might have gone wrong at the primer trimming stage"
  );
  const matchedReadProportion = deriveMatchedReadProportion(dada2Stats);
  console.table(dada2Stats);
  const matchedReadInfo = getStatusInfo(
    matchedReadProportion,
    10,
    true,
    'At least 10% of the initial reads contain ASVs',
    'Less than 10% of the initial reads contain ASVs'
  );

  const readReductionPercent = calculateReadReductionPercent(
    dada2Stats.initial_number_of_reads,
    dada2Stats.final_number_of_reads
  );

  const statsCards: SummaryCard[] = [
    {
      label: 'Initial Reads',
      value: formatCount(dada2Stats.initial_number_of_reads),
      description: 'Total number of initial reads',
    },
    {
      label: 'Final Reads',
      value: formatCount(dada2Stats.final_number_of_reads),
      description: readReductionPercent
        ? `${readReductionPercent}% reduction after processing`
        : 'Number of non-chimeric reads retained after processing',
    },
    {
      label: 'Reads with ASVs',
      value: formatPercent(matchedReadProportion),
      description: matchedReadInfo.message,
      color: matchedReadInfo.color,
    },
    {
      label: 'Proportion Chimeric',
      value: formatPercent(dada2Stats.proportion_chimeric),
      description: chimericInfo.message,
      color: chimericInfo.color,
    },
  ];

  const gaugePosition =
    chimericValue === null
      ? null
      : Math.min(Math.max(chimericValue * 100, 0), 100);

  const getSrrId = (url: string): string => {
    const match = url.match(/(SRR\d+)_/);
    return match ? match[1] : 'Sample';
  };
  const sampleId = getSrrId(fileUrl);

  return (
    <div className="space-y-6">
      <div className="vf-card__content | vf-stack vf-stack--400">
        <h3 className="vf-card__heading text-lg font-bold mb-2">
          Amplicon Sequencing Results - {sampleId}
        </h3>

        <div className="vf-stack vf-stack--400">
          <div className="vf-grid vf-grid__col-2">
            {statsCards.map((stat) => (
              <article
                key={stat.label}
                className="vf-card vf-card--brand vf-card--bordered"
              >
                <div className="vf-card__content | vf-stack vf-stack--400">
                  <h3 className="vf-card__heading">{stat.label}</h3>
                  <p
                    className="vf-card__subheading"
                    style={stat.color ? { color: stat.color } : {}}
                  >
                    {stat.value}
                  </p>
                  <p className="vf-card__text">{stat.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="vf-stack vf-stack--400">
            <article className="vf-card">
              <div className="vf-card__content | vf-stack vf-stack--400">
                <h3 className="vf-card__heading">Chimeric Reads Thresholds</h3>

                {/* Simple Threshold Gauge */}
                <div className="mt-3 mb-3">
                  <div className="relative h-4 rounded-full overflow-hidden bg-gray-100">
                    {/* Colored segments */}
                    <div className="absolute inset-0 flex">
                      <div
                        style={{ backgroundColor: '#86efac', width: '25%' }}
                      />
                      <div
                        style={{ backgroundColor: '#fca5a5', width: '75%' }}
                      />
                    </div>

                    {/* Marker for current value */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-black"
                      style={{
                        display: gaugePosition === null ? 'none' : 'block',
                        left:
                          gaugePosition === null ? '0%' : `${gaugePosition}%`,
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

                <div className="vf-card__text">
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
                          <td className="py-1 font-medium text-gray-700">
                            High
                          </td>
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
                            Current value: {formatPercent(chimericValue)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChimericProportions;
