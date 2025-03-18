import React from 'react';

type AsvMarkerData = {
  marker_gene: string;
  amplified_region: string;
  asv_count: number;
  read_count: number;
};
const AsvMarkerGeneTable: React.FC<{
  asvAmplifiedRegions: AsvMarkerData[];
  maxAsvReadCount: number;
  handleViewClick: (analysisType: string, markerType: string) => void;
}> = ({ asvAmplifiedRegions, maxAsvReadCount, handleViewClick }) => {
  return (
    <>
      <h3 className="marker-table-heading">ASV Marker Genes</h3>
      <table className="vf-table marker-gene-table">
        <thead className="vf-table__header">
          <tr className="vf-table__row">
            <th className="vf-table__heading" scope="col">
              Marker Gene
            </th>
            <th className="vf-table__heading" scope="col">
              Amplified Region
            </th>
            <th className="vf-table__heading" scope="col">
              ASV Count
            </th>
            <th className="vf-table__heading" scope="col">
              Read Count
            </th>
            <th className="vf-table__heading" scope="col">
              View
            </th>
          </tr>
        </thead>
        <tbody className="vf-table__body">
          {asvAmplifiedRegions.map((region) => (
            <tr
              key={`${region.marker_gene}-${region.amplified_region}`}
              className={`vf-table__row ${
                region.read_count === maxAsvReadCount
                  ? 'majority-marker-row'
                  : ''
              }`}
            >
              <td className="vf-table__cell">
                <div className="marker-name-container">
                  {region.marker_gene}
                  {region.read_count === maxAsvReadCount && (
                    <span
                      className="majority-marker-badge"
                      title="Majority Marker"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </td>
              <td className="vf-table__cell">
                {region.amplified_region || (
                  <span className="na-value">N/A</span>
                )}
              </td>
              <td className="vf-table__cell">
                <span className="read-count-value">
                  {region.asv_count.toLocaleString()}
                </span>
              </td>
              <td className="vf-table__cell">
                <div className="read-count-container">
                  <span className="read-count-value">
                    {region.read_count.toLocaleString()}
                  </span>
                  {region.read_count > 0 && (
                    <div className="read-count-bar-container">
                      <div
                        className="read-count-bar-background"
                        style={{
                          width: `${Math.min(
                            100,
                            (region.read_count / maxAsvReadCount) * 100
                          )}%`,
                        }}
                      >
                        <div
                          className={`stacked-bar-segment ${
                            region.marker_gene.includes('16S')
                              ? 'bacteria-bar'
                              : region.marker_gene.includes('18S')
                              ? 'eukarya-bar'
                              : 'its-bar'
                          }`}
                          style={{ width: '100%' }}
                          title={`${
                            region.marker_gene
                          }: ${region.read_count.toLocaleString()} reads`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
              <td className="vf-table__cell view-buttons-cell">
                {region.read_count > 0 ? (
                  <button
                    type="button"
                    className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
                    onClick={() => handleViewClick('asv', region.marker_gene)}
                  >
                    <span
                      className="icon icon-common icon-check-circle"
                      style={{ color: '#dcfce7' }}
                    />
                    <span className="vf-button__text">View</span>
                  </button>
                ) : (
                  <div className="not-available">
                    <span
                      className="icon icon-common icon-minus-circle"
                      style={{ color: 'grey' }}
                    />
                    <span className="vf-button__text">Not calculated</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AsvMarkerGeneTable;
