import React from 'react';
import TextSearch from 'components/Search/Filter/Text';
import CANIFilter from 'components/Search/Filter/CANI';
import ContainmentFilter from 'components/Search/Filter/Containment';
import LocalMultipleOptionFilter from 'components/Branchwater/LocalMultipleOptionFilter';
import DetailedResultsTable from 'pages/Branchwater/DetailedResultsTable';
import Plot from 'react-plotly.js';
import InfoBanner from 'components/UI/InfoBanner';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import config from 'utils/config';
import './results.css';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CountryCounts {
  [key: string]: number;
}

interface MapSample {
  id: string;
  attributes: {
    latitude: number;
    longitude: number;
    organism: string;
    assay_type: string;
    country: string;
  };
}

interface ResultsProps {
  isLoading: boolean;
  searchResults: any[];

  // Table state
  isTableVisible: boolean;
  setIsTableVisible: (isVisible: boolean) => void;
  filters: any;
  onFilterChange: (field: string, value: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  processResults: () => {
    filteredResults: any[];
    sortedResults: any[];
    paginatedResults: any[];
    totalPages: number;
  };
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;

  countryCounts: CountryCounts;
  mapSamples: MapSample[];
  displayedMapSamples: MapSample[];
  setMapPinsLimit: React.Dispatch<React.SetStateAction<number>>;
  getCountryColor: (count: number, max: number) => string;

  downloadCSV: () => void;
  queryParamPrefix?: string;

  containmentHistogram: {
    binsDesc: string[];
    countsDesc: number[];
  };
  caniHistogram: {
    binsDesc: string[];
    countsDesc: number[];
  };

  visualizationData: any | null;
  scatterData: any;
}

const Results: React.FC<ResultsProps> = ({
  isLoading,
  searchResults,
  isTableVisible,
  setIsTableVisible,
  filters,
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
  processResults,
  currentPage,
  itemsPerPage,
  onPageChange,
  countryCounts,
  mapSamples,
  displayedMapSamples,
  setMapPinsLimit,
  getCountryColor,
  downloadCSV,
  queryParamPrefix = '',
  containmentHistogram,
  caniHistogram,
  visualizationData,
  scatterData,
}) => {
  const [showBanner, setShowBanner] = React.useState(true);
  const processedResults = React.useMemo(() => {
    if (isLoading || searchResults.length === 0) {
      return {
        filteredResults: [],
        sortedResults: [],
        paginatedResults: [],
        totalPages: 0,
      };
    }
    return processResults();
  }, [isLoading, searchResults.length, processResults]);
  const getProcessedResults = React.useCallback(
    () => processedResults,
    [processedResults]
  );
  const sortedCount = processedResults.sortedResults.length;
  if (isLoading) {
    return (
      <div className="vf-u-padding__top--800">
        <div className="loading-box">
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: '#6c757d',
                marginBottom: '10px',
              }}
            >
              🔍 Searching metagenomes...
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#868e96',
              }}
            >
              This may take a few moments
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && searchResults.length === 0) {
    return (
      <div className="vf-u-padding__top--800">
        <div className="no-results-box">
          <div className="no-results-icon">🔍</div>
          <h3>No search results found</h3>
          <p>
            Try uploading a different file or adjusting your search parameters.
          </p>
          <button
            type="button"
            className="vf-button vf-button--primary"
            onClick={() => window.location.reload()}
          >
            🔄 Start New Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showBanner && (
        <InfoBanner
          type="success"
          dismissible
          onDismiss={() => setShowBanner(false)}
        >
          <p className="vf-banner__text">
            This search engine searches for the containment of a query genome
            sequence in over 1 million metagenomes available from INSDC archives
            as of {config.branchwaterDbDate}
          </p>
        </InfoBanner>
      )}
      <div className="vf-u-padding__top--600 results-header">
        <div className="results-summary">
          <div>
            <h3> Search Complete: {searchResults.length} matches found</h3>
          </div>

          <div className="results-actions">
            <button
              type="button"
              className="vf-button vf-button--secondary vf-button--sm"
              onClick={downloadCSV}
              disabled={!sortedCount}
            >
              ⬇️ Download CSV
            </button>
          </div>
        </div>
      </div>

      <TextSearch
        queryParamKey={`${queryParamPrefix}query`.replace(/^-/, '')}
      />

      <section className="vf-grid mg-grid-search vf-u-padding__top--400">
        <div className="vf-stack vf-stack--800">
          <ContainmentFilter
            queryParamKey={`${queryParamPrefix}containment`.replace(/^-/, '')}
          />
          <CANIFilter
            queryParamKey={`${queryParamPrefix}cani`.replace(/^-/, '')}
          />

          <LocalMultipleOptionFilter
            facetName="geo_loc_name_country_calc"
            header="Location"
            data={processedResults.filteredResults}
            includeTextFilter
            filterValue={filters.geo_loc_name_country_calc}
            onFilterChange={(value) => onFilterChange('geo_loc_name_country_calc', value)}
          />

          <LocalMultipleOptionFilter
            facetName="organism"
            header="Organism"
            data={processedResults.filteredResults}
            includeTextFilter
            filterValue={filters.organism}
            onFilterChange={(value) => onFilterChange('organism', value)}
          />

          <LocalMultipleOptionFilter
            facetName="assay_type"
            header="Assay Type"
            data={processedResults.filteredResults}
            filterValue={filters.assay_type}
            onFilterChange={(value) => onFilterChange('assay_type', value)}
          />
        </div>

        <section>
          <DetailedResultsTable
            isOpen={isTableVisible}
            onToggleOpen={() => setIsTableVisible(!isTableVisible)}
            filters={filters}
            onFilterChange={onFilterChange}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            processResults={getProcessedResults}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </section>
      </section>

      {visualizationData && (
        <>
          <div className="vf-u-padding__top--800">
            <h2 className="vf-text vf-text-heading--2">Results Dashboard</h2>
          </div>

          {/* QUICK STATS */}
          <div className="vf-u-padding__bottom--600 dashboard-stats">
            <div className="dashboard-card">
              <h4>Total Matches</h4>
              <div className="dashboard-value">{searchResults.length}</div>
            </div>

            <div className="dashboard-card">
              <h4>Unique Countries</h4>
              <div className="dashboard-value">
                {Object.keys(countryCounts).length}
              </div>
            </div>
          </div>

          {mapSamples.length > 0 && (
            <div className="vf-u-padding__top--400">
              <h4>Geographic Distribution</h4>

              {Object.keys(countryCounts).length > 0 && (
                <div className="country-tag-box">
                  {Object.entries(countryCounts)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([country, count]) => {
                      const max = Math.max(...Object.values(countryCounts));
                      return (
                        <span
                          key={country}
                          className="country-pill"
                          style={{
                            backgroundColor: getCountryColor(count, max),
                            color: count > max * 0.6 ? 'white' : 'black',
                          }}
                        >
                          {country}: {count}
                        </span>
                      );
                    })}
                </div>
              )}

              <div style={{ width: '100%', height: '500px' }}>
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  minZoom={1.5}
                  scrollWheelZoom
                  style={{ height: '100%' }}
                >
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />

                  {displayedMapSamples.map((sample) => (
                    <Marker
                      key={sample.id}
                      position={[
                        sample.attributes.latitude,
                        sample.attributes.longitude,
                      ]}
                    >
                      <Popup>
                        <strong>ID:</strong> {sample.id}
                        <br />
                        <strong>Country:</strong> {sample.attributes.country}
                        <br />
                        <strong>Organism:</strong> {sample.attributes.organism}
                        <br />
                        <strong>Assay:</strong> {sample.attributes.assay_type}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                {displayedMapSamples.length < mapSamples.length && (
                  <button
                    className="vf-button vf-button--secondary vf-button--sm vf-u-margin__top--200"
                    onClick={() =>
                      setMapPinsLimit((prev) =>
                        Math.min(prev + 1000, mapSamples.length)
                      )
                    }
                  >
                    Load more pins (+1000)
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="vf-u-padding__top--400">
            <h3>Containment Score Distribution</h3>
            <Plot
              data={[
                {
                  x: containmentHistogram.binsDesc,
                  y: containmentHistogram.countsDesc,
                  type: 'bar',
                },
              ]}
              layout={{
                title: 'Containment Distribution',
                xaxis: { title: 'Bins' },
                yaxis: { title: 'Count' },
              }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>

          <div className="vf-u-padding__top--400">
            <h3>cANI Score Distribution</h3>
            <Plot
              data={[
                {
                  x: caniHistogram.binsDesc,
                  y: caniHistogram.countsDesc,
                  type: 'bar',
                },
              ]}
              layout={{
                title: 'cANI Distribution',
                xaxis: { title: 'Bins' },
                yaxis: { title: 'Count' },
              }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>

          <div className="vf-u-padding__top--400">
            <h3>Quality Assessment (cANI vs Containment)</h3>
            <Plot
              data={(() => {
                const WGS_COLOR = 'rgba(255, 99, 132, 0.8)';
                const OTHER_COLOR = 'rgba(54, 162, 235, 0.8)';

                const wgs = {
                  x: [] as number[],
                  y: [] as number[],
                  text: [] as string[],
                };
                const other = {
                  x: [] as number[],
                  y: [] as number[],
                  text: [] as string[],
                };

                if (
                  scatterData &&
                  Array.isArray(scatterData.xs) &&
                  Array.isArray(scatterData.ys) &&
                  Array.isArray(scatterData.texts) &&
                  Array.isArray(scatterData.colors)
                ) {
                  for (
                    let index = 0;
                    index < scatterData.xs.length;
                    index += 1
                  ) {
                    const color = scatterData.colors[index];
                    if (color === 'rgba(255, 99, 132, 0.8)') {
                      wgs.x.push(scatterData.xs[index]);
                      wgs.y.push(scatterData.ys[index]);
                      wgs.text.push(scatterData.texts[index]);
                    } else {
                      other.x.push(scatterData.xs[index]);
                      other.y.push(scatterData.ys[index]);
                      other.text.push(scatterData.texts[index]);
                    }
                  }
                }

                return [
                  {
                    name: 'WGS',
                    x: wgs.x,
                    y: wgs.y,
                    mode: 'markers',
                    type: 'scatter',
                    text: wgs.text,
                    marker: { size: 6, color: WGS_COLOR },
                  },
                  {
                    name: 'Other assay types',
                    x: other.x,
                    y: other.y,
                    mode: 'markers',
                    type: 'scatter',
                    text: other.text,
                    marker: { size: 6, color: OTHER_COLOR },
                  },
                ];
              })()}
              layout={{
                title: 'cANI vs Containment',
                xaxis: { title: 'Containment' },
                yaxis: { title: 'cANI' },
                showlegend: true,
              }}
              style={{ width: '100%', height: '450px' }}
            />
          </div>

          {visualizationData.barPlotData.length > 0 && (
            <div className="vf-u-padding__top--400">
              <h3>Categorical Metadata</h3>
              <Plot
                data={visualizationData.barPlotData}
                layout={{
                  title: 'Category Counts',
                }}
                style={{ width: '100%', height: '400px' }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Results;
