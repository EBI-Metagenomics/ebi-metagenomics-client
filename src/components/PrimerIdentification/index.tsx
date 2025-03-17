import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Dna } from 'lucide-react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

const PrimerValidationDisplay = ({ downloadableFile }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!downloadableFile?.url) {
      setLoading(false);
      return;
    }

    fetch(downloadableFile.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData) => {
        const primerData = Array.isArray(jsonData) ? jsonData[0] : jsonData;
        if (!primerData) {
          throw new Error('No primer data available');
        }
        setData(primerData);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [downloadableFile]);

  const PrimerCard = ({ primer }) => {
    const isForward = primer.strand === 'fwd';
    const directionArrow = isForward ? (
      <ArrowRight color="#3B6FB6" size={20} />
    ) : (
      <ArrowLeft color="#d63384" size={20} />
    );

    const badgeClass =
      primer.identification_strategy === 'std'
        ? 'vf-badge--primary'
        : 'vf-badge--secondary';

    return (
      <div className="flex items-center gap-2 mb-4">
        {directionArrow}
        <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">{primer.name}</span>
            <div className="flex gap-2">
              <span className={`vf-badge ${badgeClass}`}>
                {primer.identification_strategy}
              </span>
              <span className="vf-badge vf-badge--outline">
                V{primer.region.slice(1)}
              </span>
            </div>
          </div>
          <code className="text-sm text-gray-600 block mt-1">
            {primer.sequence}
          </code>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-6">Loading primer validation data...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-500">
        Error loading primer data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-6">
        No primer validation data available.
      </div>
    );
  }

  return (
    <DetailedVisualisationCard
      ftpLink={downloadableFile.url}
      showZoomButton={false}
      title={downloadableFile?.alias || 'Primer Validation Summary'}
      subheading={data.id}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dna color="#3B6FB6" size={24} />
          <h4 className="text-lg font-medium">Primers</h4>
        </div>
        <span className="vf-badge vf-badge--outline">
          {data.primers.length} primers
        </span>
      </div>

      <div className="mt-4">
        {data.primers.map((primer, index) => (
          <div key={`${data.id}-${primer.name}-${index}`}>
            <PrimerCard primer={primer} />
            {index < data.primers.length - 1 && (
              <div className="border-b border-gray-200 my-4"></div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm font-medium mb-2 text-gray-700">Legend</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <ArrowRight color="#3B6FB6" size={16} />
            <span className="text-gray-600">Forward Primer</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeft color="#d63384" size={16} />
            <span className="text-gray-600">Reverse Primer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="vf-badge vf-badge--primary">std</span>
            <span className="text-gray-600">Standard Identification</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="vf-badge vf-badge--secondary">auto</span>
            <span className="text-gray-600">Automatic Identification</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vf-badge {
          display: inline-block;
          padding: 0.25em 0.6em;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          border-radius: 0.25rem;
        }

        .vf-badge--primary {
          background-color: #3b6fb6;
          color: white;
        }

        .vf-badge--secondary {
          background-color: #6c757d;
          color: white;
        }

        .vf-badge--outline {
          background-color: transparent;
          color: #3b6fb6;
          border: 1px solid #3b6fb6;
        }
      `}</style>
    </DetailedVisualisationCard>
  );
};

export default PrimerValidationDisplay;
