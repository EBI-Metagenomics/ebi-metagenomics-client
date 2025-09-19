import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom DNA helix icon for markers
const createDNAIcon = (color = '#2563eb', size = 'medium') => {
  const sizes = {
    small: { width: 20, height: 30, fontSize: 10 },
    medium: { width: 25, height: 35, fontSize: 12 },
    large: { width: 30, height: 40, fontSize: 14 },
  };

  const { width, height, fontSize } = sizes[size];

  return L.divIcon({
    className: 'custom-dna-marker',
    html: `
      <div style="
        width: ${width}px;
        height: ${height}px;
        background: linear-gradient(135deg, ${color}dd, ${color}aa);
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3), 0 0 0 2px ${color}33;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transform: rotate(-45deg);
        transition: all 0.3s ease;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: ${fontSize}px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">🧬</div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color}dd;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
        "></div>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
};

// Biome color mapping for different assay types
const getBiomeColor = (biomeType) => {
  const biomeColors = {
    WGS: '#059669', // Emerald for whole genome sequencing
    metagenome: '#0891b2', // Cyan for metagenomes
    amplicon: '#7c3aed', // Purple for amplicon
    metatranscriptome: '#dc2626', // Red for metatranscriptome
    unknown: '#6b7280', // Gray for unknown
    default: '#2563eb', // Blue default
  };

  return biomeColors[biomeType?.toLowerCase()] || biomeColors.default;
};

// Mock sample data with enhanced properties
const mockMapSamples = [
  {
    id: 'ERR868490',
    attributes: {
      latitude: 51.5074,
      longitude: -0.1278,
      'sample-desc': 'Marine metagenome from North Sea coastal waters',
      organism: 'marine metagenome',
      ecosystem: 'Marine',
      temperature: '15°C',
      salinity: '35 PSU',
      depth: '5m',
    },
    relationships: {
      biome: { data: { id: 'metagenome' } },
    },
    metrics: {
      containment: 0.85,
      cANI: 0.92,
      reads: '2.3M',
    },
  },
  {
    id: 'ERR1726685',
    attributes: {
      latitude: 48.8566,
      longitude: 2.3522,
      'sample-desc': 'Soil microbiome from temperate forest ecosystem',
      organism: 'soil metagenome',
      ecosystem: 'Terrestrial',
      temperature: '12°C',
      pH: '6.8',
      depth: '10cm',
    },
    relationships: {
      biome: { data: { id: 'WGS' } },
    },
    metrics: {
      containment: 0.78,
      cANI: 0.88,
      reads: '1.8M',
    },
  },
  {
    id: 'ERR2845123',
    attributes: {
      latitude: 40.7128,
      longitude: -74.006,
      'sample-desc': 'Urban wastewater treatment plant microbiome',
      organism: 'wastewater metagenome',
      ecosystem: 'Engineered',
      temperature: '18°C',
      pH: '7.2',
      depth: 'surface',
    },
    relationships: {
      biome: { data: { id: 'metatranscriptome' } },
    },
    metrics: {
      containment: 0.91,
      cANI: 0.95,
      reads: '3.1M',
    },
  },
  {
    id: 'ERR3456789',
    attributes: {
      latitude: -33.8688,
      longitude: 151.2093,
      'sample-desc': 'Coral reef microbiome from Great Barrier Reef',
      organism: 'coral microbiome',
      ecosystem: 'Marine',
      temperature: '24°C',
      salinity: '34 PSU',
      depth: '15m',
    },
    relationships: {
      biome: { data: { id: 'amplicon' } },
    },
    metrics: {
      containment: 0.73,
      cANI: 0.86,
      reads: '1.2M',
    },
  },
  {
    id: 'ERR4567890',
    attributes: {
      latitude: 64.1466,
      longitude: -21.9426,
      'sample-desc': 'Arctic permafrost microbiome',
      organism: 'permafrost metagenome',
      ecosystem: 'Terrestrial',
      temperature: '-2°C',
      pH: '5.9',
      depth: '50cm',
    },
    relationships: {
      biome: { data: { id: 'metagenome' } },
    },
    metrics: {
      containment: 0.67,
      cANI: 0.82,
      reads: '950K',
    },
  },
];

const EnhancedLifeSciencesMap = () => {
  const mapRef = useRef();

  // Custom map styles
  const mapStyles = `
    .leaflet-container {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .custom-dna-marker:hover > div {
      transform: scale(1.1) rotate(-45deg);
    }
    
    .leaflet-popup-content-wrapper {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .leaflet-popup-content {
      margin: 16px;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .leaflet-popup-tip {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
    
    .sample-popup {
      min-width: 280px;
    }
    
    .sample-header {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 12px;
      margin: -16px -16px 12px -16px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .sample-id {
      font-weight: 700;
      font-size: 16px;
    }
    
    .biome-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .sample-description {
      color: #374151;
      font-style: italic;
      margin-bottom: 12px;
      padding: 8px;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    
    .sample-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .sample-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .field-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .field-value {
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
    }
    
    .metrics-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 12px;
    }
    
    .metrics-title {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    
    .metric-item {
      text-align: center;
      padding: 6px;
      background: #f1f5f9;
      border-radius: 6px;
    }
    
    .metric-value {
      font-size: 14px;
      font-weight: 700;
      color: #3b82f6;
    }
    
    .metric-label {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    
    .ecosystem-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
    
    .marine { background-color: #0891b2; }
    .terrestrial { background-color: #059669; }
    .engineered { background-color: #7c3aed; }
    .unknown { background-color: #6b7280; }
  `;

  useEffect(() => {
    // Inject custom styles
    const styleSheet = document.createElement('style');
    styleSheet.innerText = mapStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const createPopupContent = (sample) => {
    const biomeColor = getBiomeColor(sample.relationships.biome.data.id);
    const ecosystemClass =
      sample.attributes.ecosystem?.toLowerCase() || 'unknown';

    return `
      <div class="sample-popup">
        <div class="sample-header" style="background: linear-gradient(135deg, ${biomeColor}, ${biomeColor}dd);">
          <span class="sample-id">${sample.id}</span>
          <span class="biome-badge">${sample.relationships.biome.data.id}</span>
        </div>
        
        <div class="sample-description">
          ${sample.attributes['sample-desc']}
        </div>
        
        <div class="sample-grid">
          <div class="sample-field">
            <span class="field-label">Organism</span>
            <span class="field-value">${sample.attributes.organism}</span>
          </div>
          <div class="sample-field">
            <span class="field-label">Ecosystem</span>
            <span class="field-value">
              <span class="ecosystem-indicator ${ecosystemClass}"></span>
              ${sample.attributes.ecosystem}
            </span>
          </div>
          <div class="sample-field">
            <span class="field-label">Temperature</span>
            <span class="field-value">${
              sample.attributes.temperature || 'N/A'
            }</span>
          </div>
          <div class="sample-field">
            <span class="field-label">${
              sample.attributes.salinity ? 'Salinity' : 'pH'
            }</span>
            <span class="field-value">${
              sample.attributes.salinity || sample.attributes.pH || 'N/A'
            }</span>
          </div>
        </div>
        
        <div class="metrics-section">
          <div class="metrics-title">
            📊 Similarity Metrics
          </div>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-value">${sample.metrics.containment}</div>
              <div class="metric-label">Containment</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${sample.metrics.cANI}</div>
              <div class="metric-label">cANI</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${sample.metrics.reads}</div>
              <div class="metric-label">Reads</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Custom tile layer with scientific color scheme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Metagenome Analysis Platform'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="custom-tiles"
        />

        {mockMapSamples.map((sample) => {
          const biomeColor = getBiomeColor(sample.relationships.biome.data.id);
          const markerSize =
            sample.metrics.containment > 0.8
              ? 'large'
              : sample.metrics.containment > 0.7
              ? 'medium'
              : 'small';

          return (
            <Marker
              key={sample.id}
              position={[
                sample.attributes.latitude,
                sample.attributes.longitude,
              ]}
              icon={createDNAIcon(biomeColor, markerSize)}
            >
              <Popup
                closeButton={true}
                autoClose={false}
                closeOnEscapeKey={true}
                className="custom-popup"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: createPopupContent(sample),
                  }}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '12px',
          zIndex: 1000,
        }}
      >
        <div
          style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}
        >
          🧬 Assay Types
        </div>
        {Object.entries({
          Metagenome: '#0891b2',
          WGS: '#059669',
          Amplicon: '#7c3aed',
          Metatranscriptome: '#dc2626',
        }).map(([type, color]) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: color,
              }}
            ></div>
            <span style={{ color: '#6b7280' }}>{type}</span>
          </div>
        ))}
        <div
          style={{
            fontSize: '10px',
            color: '#9ca3af',
            marginTop: '8px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '6px',
          }}
        >
          Marker size reflects containment score
        </div>
      </div>
    </div>
  );
};

export default EnhancedLifeSciencesMap;
