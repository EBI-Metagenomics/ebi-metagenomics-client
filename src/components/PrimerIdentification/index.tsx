import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Dna, Info } from 'lucide-react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import './style.css';

const PrimerValidationDisplay = ({ downloadableFile, infoText }) => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

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

  const colorizeSequence = (sequence) => {
    return sequence.split('').map((nucleotide, index) => {
      let color;
      switch (nucleotide) {
        case 'A':
          color = '#2563eb'; // blue
          break;
        case 'T':
          color = '#db2777'; // pink
          break;
        case 'G':
          color = '#059669'; // green
          break;
        case 'C':
          color = '#d97706'; // amber
          break;
        default:
          // Special nucleotide codes like N, W, Y, H, V
          color = '#9333ea'; // purple
      }
      return (
        <span key={index} style={{ color }}>
          {nucleotide}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="loading-message">Loading primer validation data...</div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        Error loading primer data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-message">No primer validation data available.</div>
    );
  }

  const forwardPrimers = data.primers.filter(
    (primer) => primer.strand === 'fwd'
  );
  const reversePrimers = data.primers.filter(
    (primer) => primer.strand === 'rev'
  );

  return (
    <DetailedVisualisationCard
      ftpLink={downloadableFile.url}
      showZoomButton={false}
      title={downloadableFile?.alias || 'Primer Validation Summary'}
      subheading={data.id}
    >
      <div className="primer-header">
        <div className="primer-title">
          <Dna color="#3B6FB6" size={24} />
          <h4>Primers</h4>
        </div>
        <div className="primer-count">{data.primers.length} primers</div>
      </div>

      <div className="primer-sections">
        {forwardPrimers.length > 0 && (
          <div className="primer-section forward-section">
            <div className="section-header forward-header">
              <ArrowRight color="#3B6FB6" size={16} />
              <h5>Forward Primers ({forwardPrimers.length})</h5>
            </div>
            <div className="primer-list">
              {forwardPrimers.map((primer) => (
                <div
                  key={`${data.id}-${primer.name}`}
                  className="primer-card forward-card"
                >
                  <div className="primer-card-header">
                    <span className="primer-name">{primer.name}</span>
                    <div className="primer-badges">
                      <span
                        className={`custom-vf-badge ${
                          primer.identification_strategy === 'std'
                            ? 'custom-vf-badge--primary'
                            : 'custom-vf-badge--secondary'
                        }`}
                      >
                        {primer.identification_strategy}
                      </span>
                      <span className="custom-vf-badge custom-vf-badge--outline">
                        {primer.region}
                      </span>
                    </div>
                  </div>
                  <div className="primer-sequence">
                    {colorizeSequence(primer.sequence)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reversePrimers.length > 0 && (
          <div className="primer-section reverse-section">
            <div className="section-header reverse-header">
              <ArrowLeft color="#d63384" size={16} />
              <h5>Reverse Primers ({reversePrimers.length})</h5>
            </div>
            <div className="primer-list">
              {reversePrimers.map((primer) => (
                <div
                  key={`${data.id}-${primer.name}`}
                  className="primer-card reverse-card"
                >
                  <div className="primer-card-header">
                    <span className="primer-name">{primer.name}</span>
                    <div className="primer-badges">
                      <span
                        className={`custom-vf-badge ${
                          primer.identification_strategy === 'std'
                            ? 'custom-vf-badge--primary'
                            : 'custom-vf-badge--secondary'
                        }`}
                      >
                        {primer.identification_strategy}
                      </span>
                      <span className="custom-vf-badge custom-vf-badge--outline">
                        {primer.region}
                      </span>
                    </div>
                  </div>
                  <div className="primer-sequence">
                    {colorizeSequence(primer.sequence)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="legend-container">
        <div className="legend-header">
          <span>Legend</span>
          {infoText && (
            <div className="info-tooltip-container">
              <div
                className="info-icon"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
              >
                <Info size={16} color="#6b7280" />
              </div>
              {showInfoTooltip && (
                <div className="info-tooltip">{infoText}</div>
              )}
            </div>
          )}
        </div>
        <div className="legend-content">
          <div className="legend-section">
            <h6 className="legend-section-title">Primer Direction</h6>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-icon forward-icon">
                  <ArrowRight color="#3B6FB6" size={14} />
                </div>
                <span>Forward Primer</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon reverse-icon">
                  <ArrowLeft color="#d63384" size={14} />
                </div>
                <span>Reverse Primer</span>
              </div>
            </div>
          </div>

          <div className="legend-section">
            <h6 className="legend-section-title">Variable Region</h6>
            <div className="legend-items">
              <div className="legend-item">
                <span className="custom-vf-badge custom-vf-badge--outline">
                  V3
                </span>
                <span>16S rRNA Variable Region 3</span>
              </div>
              <div className="legend-item">
                <span className="custom-vf-badge custom-vf-badge--outline">
                  V4
                </span>
                <span>16S rRNA Variable Region 4</span>
              </div>
              <div className="legend-item">
                <span className="custom-vf-badge custom-vf-badge--outline">
                  V9
                </span>
                <span>18S rRNA Variable Region 9</span>
              </div>
            </div>
          </div>

          <div className="legend-section full-width">
            <h6 className="legend-section-title">Identification Strategies</h6>
            <div className="legend-items strategy-items">
              <div className="strategy-item">
                <div className="strategy-header">
                  <span className="custom-vf-badge custom-vf-badge--primary">
                    std
                  </span>
                  <span className="strategy-title">
                    Standard Identification
                  </span>
                </div>
                <p className="strategy-description">
                  Uses a curated database of known primers to identify the
                  primers used in sequencing. This method is more reliable for
                  common, well-documented primer sets.
                </p>
              </div>
              <div className="strategy-item">
                <div className="strategy-header">
                  <span className="custom-vf-badge custom-vf-badge--secondary">
                    auto
                  </span>
                  <span className="strategy-title">
                    Automatic Identification
                  </span>
                </div>
                <p className="strategy-description">
                  Uses de novo detection to identify primers directly from the
                  sequence data when standard primers are not found. This method
                  attempts to detect primer sequences at the beginning and end
                  of reads without prior knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailedVisualisationCard>
  );
};

export default PrimerValidationDisplay;
