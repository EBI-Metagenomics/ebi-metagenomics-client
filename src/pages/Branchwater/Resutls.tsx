import React from 'react';
import TextSearch from 'components/Search/Filter/Text';
import CANIFilter from 'components/Search/Filter/CANI';
import LocalMultipleOptionFilter from 'components/Branchwater/LocalMultipleOptionFilter';
import DetailedResultsTable from 'pages/Branchwater/DetailedResultsTable';
import Plot from 'react-plotly.js';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import './results.css';

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
  setIsTableVisible: (v: boolean) => void;
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

  // Map + country stats
  countryCounts: CountryCounts;
  mapSamples: MapSample[];
  displayedMapSamples: MapSample[];
  setMapPinsLimit: React.Dispatch<React.SetStateAction<number>>;
  totalCountryCount: number;
  getCountryColor: (count: number, max: number) => string;

  // CSV download
  downloadCSV: () => void;

  // Histogram data
  containmentHistogram: {
    binsDesc: string[];
    countsDesc: number[];
  };

  // Visualization data
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
  totalCountryCount,
  getCountryColor,
  downloadCSV,
  containmentHistogram,
  visualizationData,
  scatterData,
}) => {
  /* ----------------------------------------------------------
      1. LOADING STATE
  ----------------------------------------------------------- */
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

  /* ----------------------------------------------------------
      2. NO RESULTS
  ----------------------------------------------------------- */
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

  /* ----------------------------------------------------------
      3. RESULTS SUMMARY + FILTERS + TABLE
  ----------------------------------------------------------- */
  const sortedCount = processResults().sortedResults.length;

  return (
    <>
      {/* HEADER */}
      <div className="vf-u-padding__top--600 results-header">
        <div className="results-summary">
          <div>
            <h3>🎯 Search Complete: {searchResults.length} matches found</h3>
            <p>
              Found {searchResults.filter((r) => r.assay_type === 'WGS').length}{' '}
              samples with assemblies • {Object.keys(countryCounts).length}{' '}
              countries • Average containment:{' '}
              {(
                searchResults
                  .filter((r) => typeof r.containment === 'number')
                  .reduce((sum, r) => sum + Number(r.containment), 0) /
                searchResults.filter((r) => typeof r.containment === 'number')
                  .length
              ).toFixed(3)}
            </p>
          </div>

          <div className="results-actions">
            <button
              type="button"
              className="vf-button vf-button--primary vf-button--sm"
              onClick={() => setIsTableVisible(!isTableVisible)}
            >
              {isTableVisible ? '📊 Hide Details' : '📋 View Details'}
            </button>

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

      {/* FILTERS + RESULTS TABLE */}
      <TextSearch />

      <section className="vf-grid mg-grid-search vf-u-padding__top--400">
        <div className="vf-stack vf-stack--800">
          <CANIFilter />

          <LocalMultipleOptionFilter
            facetName="geo_loc_name_country_calc"
            header="Location"
            data={searchResults}
            includeTextFilter
          />

          <LocalMultipleOptionFilter
            facetName="organism"
            header="Organism"
            data={searchResults}
            includeTextFilter
          />

          <LocalMultipleOptionFilter
            facetName="assay_type"
            header="Assay Type"
            data={searchResults}
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
            processResults={processResults}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </section>
      </section>

      {/* ----------------------------------------------------------
          4. FULL VISUALIZATION DASHBOARD
      ----------------------------------------------------------- */}

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

          {/* MAP */}
          {mapSamples.length > 0 && (
            <div className="vf-u-padding__top--400">
              <h4>Geographic Distribution</h4>

              {/* Country tags */}
              {Object.keys(countryCounts).length > 0 && (
                <div className="country-tag-box">
                  {Object.entries(countryCounts)
                    .sort(([, a], [, b]) => b - a)
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

              {/* Map */}
              <div style={{ width: '100%', height: '500px' }}>
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
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

                {/* Load more pins */}
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

          {/* CONTAINMENT HISTOGRAM */}
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

          {/* SCATTER (cANI vs Containment) */}
          <div className="vf-u-padding__top--400">
            <h3>Quality Assessment (cANI vs Containment)</h3>
            <Plot
              data={[
                {
                  x: scatterData.xs,
                  y: scatterData.ys,
                  mode: 'markers',
                  type: 'scatter',
                  text: scatterData.texts,
                  marker: { size: 6, color: scatterData.colors },
                },
              ]}
              layout={{
                title: 'cANI vs Containment',
                xaxis: { title: 'Containment' },
                yaxis: { title: 'cANI' },
              }}
              style={{ width: '100%', height: '450px' }}
            />
          </div>

          {/* FULL HISTOGRAMS + BAR PLOTS */}
          <div className="vf-u-padding__top--400">
            <h3>Detailed Score Distributions</h3>
            <Plot
              data={visualizationData.histogramData}
              layout={{
                title: 'Score Histograms',
              }}
              style={{ width: '100%', height: '400px' }}
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
