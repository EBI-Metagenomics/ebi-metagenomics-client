import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '24px',
    marginBottom: '16px',
  },
  chartContainer: {
    width: '100%',
    height: '500px',
    border: '1px solid #eaeaea',
    borderRadius: '4px',
  },
  note: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#666',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '500px',
  },
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '500px',
    color: '#e53e3e',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  button: {
    padding: '8px 16px',
    background: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

const AsvDistribution = ({ fileUrl }) => {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [visibleCount, setVisibleCount] = useState(25);

  const parseAsvTsvFile = (tsvContent) => {
    const lines = tsvContent.trim().split('\n');
    const asvData: { name: string; count: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const parts = line.split(/\s+/);

      // TODO: Do away with nested loop and or if-elses

      for (let j = 0; j < parts.length - 1; j += 2) {
        if (j + 1 < parts.length) {
          const asvId = parts[j];
          const count = parseInt(parts[j + 1], 10);

          if (!Number.isNaN(count)) {
            asvData.push({
              name: asvId,
              count,
            });
          }
        }
      }
    }
    return asvData.sort((a, b) => b.count - a.count);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!fileUrl) {
        setError('No file URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const tsvContent = await response.text();
        const parsedData = parseAsvTsvFile(tsvContent);

        if (parsedData.length === 0) {
          setError('No valid ASV data found in the file');
        } else {
          setData(parsedData);
          setError(undefined);
        }

        setLoading(false);
      } catch {
        setError(
          'Failed to load data. Please check the file URL and try again.'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [fileUrl]);

  const increaseVisible = () => {
    setVisibleCount(Math.min(visibleCount + 25, data.length));
  };

  const decreaseVisible = () => {
    setVisibleCount(Math.max(visibleCount - 25, 25));
  };

  if (loading) {
    return <div style={styles.loading}>Loading ASV data...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  const getSampleName = (url) => {
    const matches = url.match(/([^/]+)(?=\.\w+$)/);
    return matches ? matches[0] : 'Sample';
  };

  const sampleName = getSampleName(fileUrl);

  const maxVisible = Math.min(visibleCount, data.length);
  const visibleData = data.slice(0, maxVisible);

  return (
    <div style={styles.container}>
      <h2>
        Top {maxVisible} ASVs by Count - {sampleName}
      </h2>

      <div style={styles.controls}>
        <button
          type="button"
          style={{
            ...styles.button,
            opacity: visibleCount <= 25 ? 0.5 : 1,
            cursor: visibleCount <= 25 ? 'not-allowed' : 'pointer',
          }}
          onClick={decreaseVisible}
          disabled={visibleCount <= 25}
        >
          Show Fewer
        </button>
        <button
          type="button"
          style={{
            ...styles.button,
            opacity: visibleCount >= data.length ? 0.5 : 1,
            cursor: visibleCount >= data.length ? 'not-allowed' : 'pointer',
          }}
          onClick={increaseVisible}
          disabled={visibleCount >= data.length}
        >
          Show More
        </button>
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={visibleData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 80,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              scale="band"
              width={80}
              tick={{ fontSize: 10 }}
            />
            <Tooltip formatter={(value) => [`${value}`, 'Count']} />
            <Legend />
            <Bar
              dataKey="count"
              barSize={visibleCount > 50 ? 5 : 8}
              fill="#e0e0e0"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 6, fill: '#8884d8' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p style={styles.note}>
        Total ASVs: {data.length} | Showing top {maxVisible}
      </p>
    </div>
  );
};

export default AsvDistribution;
